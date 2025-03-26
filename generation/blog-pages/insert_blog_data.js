const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
// Load environment variables from .env file
require("dotenv").config({ path: '../.env' });

// Use environment variables instead of hardcoded values
const ADMIN_API_TOKEN = process.env.REAL_TOKEN;
const STRAPI_URL = process.env.REAL_URL;

/**
 * Process data to make it Strapi-compatible
 * This function will clean up the data before sending it to Strapi
 */
function processDataForStrapi(data) {
  // Function to recursively process objects and arrays
  function processItem(item) {
    if (!item || typeof item !== 'object') return item;
    
    // Handle arrays
    if (Array.isArray(item)) {
      return item.map(processItem);
    }
    
    // Create a new object to hold the processed properties
    const processed = {};
    
    // Process each property
    for (const [key, value] of Object.entries(item)) {
      // Skip problematic keys
      if (key === 'id' && typeof value === 'number') {
        // Convert image reference to Strapi media format - just use the ID
        processed.id = value;
      } 
      // For image objects with url, id, etc.
      else if (value && typeof value === 'object' && !Array.isArray(value) && value.url && value.id) {
        processed[key] = value.id; // Just use the ID for the relationship
      } 
      // Skip these fields as they're processed separately
      else if (key === 'featuredImgSrc' || key === 'featuredImgInfo') {
        // Skip these keys, they're processed separately
      }
      // Let through FeaturedImgUrl if present
      else if (key === 'FeaturedImgUrl') {
        processed[key] = value; // Keep the URL as is
      }
      // For other objects or arrays, recursively process them
      else if (value && typeof value === 'object') {
        processed[key] = processItem(value);
      } 
      // For primitive values, copy them as-is
      else {
        processed[key] = value;
      }
    }
    
    return processed;
  }
  
  return processItem(data);
}

/**
 * Upload an image to Strapi Media Library
 * @param {Object} imageInfo - Information about the image to upload
 * @returns {Promise<number|null>} - ID of the uploaded media or null if upload failed
 */
async function uploadImageToStrapi(imageInfo) {
  try {
    if (!imageInfo || !imageInfo.filePath) {
      console.log('No image to upload');
      return null;
    }
    
    // Check if the file exists
    if (!fs.existsSync(imageInfo.filePath)) {
      console.error(`Image file not found: ${imageInfo.filePath}`);
      return null;
    }
    
    console.log(`Uploading image: ${imageInfo.fileName}`);
    
    // Read file as buffer instead of stream
    const fileBuffer = fs.readFileSync(imageInfo.filePath);
    const fileSize = fileBuffer.length;
    
    console.log(`File size: ${fileSize} bytes`);
    
    // Create a simple form data object
    const formData = new FormData();
    formData.append('files', fileBuffer, {
      filename: imageInfo.fileName,
      contentType: imageInfo.mimeType,
    });
    
    // Get upload URL
    const uploadUrl = `${STRAPI_URL}/api/upload`;
    console.log(`Uploading to: ${uploadUrl}`);
    
    try {
      // Use axios for consistent handling
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_API_TOKEN}`,
          ...formData.getHeaders()
        }
      });
      
      console.log('Upload response status:', response.status);
      
      if (response.status >= 200 && response.status < 300) {
        const uploadResult = response.data;
        if (Array.isArray(uploadResult) && uploadResult.length > 0) {
          console.log(`Image uploaded successfully with ID: ${uploadResult[0].id}`);
          return uploadResult[0].id;
        } else {
          console.error('Unexpected response format from upload API:', uploadResult);
          return null;
        }
      } else {
        console.error(`Failed to upload image: ${response.status}`);
        console.error(`Error details:`, response.data);
        return null;
      }
    } catch (uploadError) {
      console.error('Error during upload request:', uploadError.message);
      
      // Fallback to direct URL approach if needed
      if (imageInfo.featuredImgSrc) {
        console.log('Falling back to using direct URL reference:', imageInfo.featuredImgSrc);
        return imageInfo.featuredImgSrc;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error preparing image upload:', error.message);
    return null;
  }
}

/**
 * Check if a blog post with the given slug already exists
 * @param {string} slug - The slug to check
 * @returns {Promise<{exists: boolean, id: number|null}>} - Whether the blog post exists and its ID if it does
 */
async function checkBlogPostExists(slug) {
  try {
    console.log(`Checking if blog post with slug "${slug}" exists...`);
    
    // URL encode the slug to handle special characters
    const encodedSlug = encodeURIComponent(slug);
    const url = `${STRAPI_URL}/api/posts?filters[Slug][$eq]=${encodedSlug}`;
    
    console.log(`Querying: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      }
    });

    if (!response.ok) {
      console.error(`Error checking if blog post exists: ${response.status} ${response.statusText}`);
      return { exists: false, id: null };
    }

    const data = await response.json();
    console.log(`Found ${data.data ? data.data.length : 0} blog posts with slug "${slug}"`);
    
    if (data.data && data.data.length > 0) {
      const id = data.data[0].id;
      console.log(`Found existing blog post with ID: ${id}`);
      return { exists: true, id };
    }
    
    return { exists: false, id: null };
  } catch (error) {
    console.error("Error checking if blog post exists:", error);
    return { exists: false, id: null };
  }
}

/**
 * Create a new blog post in Strapi
 */
async function createBlogPost(postData) {
  // Process the data first
  const processedData = processDataForStrapi(postData);
  
  // Handle the featured image
  if (postData.featuredImgInfo) {
    // Try to upload the image
    const featuredImageId = await uploadImageToStrapi(postData.featuredImgInfo);
    
    if (featuredImageId) {
      // If it's a number, it's an ID from the media library
      if (typeof featuredImageId === 'number') {
        processedData.FeaturedImg = featuredImageId;
      } 
      // If it's a string, it might be a URL to directly use
      else if (typeof featuredImageId === 'string') {
        processedData.FeaturedImgUrl = featuredImageId;
      }
    } else if (postData.featuredImgSrc) {
      // If upload fails but we have the original URL, use that
      processedData.FeaturedImgUrl = postData.featuredImgSrc;
    }
  } else if (postData.featuredImgSrc) {
    // If no local image but we have the URL, use that
    processedData.FeaturedImgUrl = postData.featuredImgSrc;
  }
  
  try {
    console.log(`Creating new blog post with slug "${postData.Slug}"...`);
    
    const response = await fetch(`${STRAPI_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({ data: processedData }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Error response status: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      
      // If we get a duplicate error, let's try to find the existing blog post and update it
      if (response.status === 400 && responseText.includes("unique")) {
        console.log("Detected unique constraint error, falling back to update...");
        
        // Try to check if blog post exists again and get its ID
        const { exists, id } = await checkBlogPostExists(postData.Slug);
        
        if (exists && id) {
          return await updateBlogPost(id, postData);
        }
      }
      
      throw new Error(`Failed to create blog post: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`Blog post created successfully!`);
      return result;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Update an existing blog post in Strapi
 */
async function updateBlogPost(id, postData) {
  // Process the data first
  const processedData = processDataForStrapi(postData);
  
  // Handle the featured image
  if (postData.featuredImgInfo) {
    // Try to upload the image
    const featuredImageId = await uploadImageToStrapi(postData.featuredImgInfo);
    
    if (featuredImageId) {
      // If it's a number, it's an ID from the media library
      if (typeof featuredImageId === 'number') {
        processedData.FeaturedImg = featuredImageId;
      } 
      // If it's a string, it might be a URL to directly use
      else if (typeof featuredImageId === 'string') {
        processedData.FeaturedImgUrl = featuredImageId;
      }
    } else if (postData.featuredImgSrc) {
      // If upload fails but we have the original URL, use that
      processedData.FeaturedImgUrl = postData.featuredImgSrc;
    }
  } else if (postData.featuredImgSrc) {
    // If no local image but we have the URL, use that
    processedData.FeaturedImgUrl = postData.featuredImgSrc;
  }
  
  try {
    console.log(`Updating blog post with ID ${id}...`);
    
    const url = `${STRAPI_URL}/api/posts/${id}`;
    console.log(`Using URL: ${url}`);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({ data: processedData }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Error response status: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      throw new Error(`Failed to update blog post: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`Blog post updated successfully!`);
      return result;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Process a blog post - create or update as needed
 */
async function processBlogPost(postData) {
  try {
    // First, check if a blog post with this slug already exists
    const { exists, id } = await checkBlogPostExists(postData.Slug);
    
    if (exists && id) {
      // Skip updating existing blog post
      console.log(`Blog post with slug "${postData.Slug}" already exists. Skipping update as requested.`);
      return { skipped: true, slug: postData.Slug };
    } else {
      // Create a new blog post
      return await createBlogPost(postData);
    }
  } catch (error) {
    console.error(`Error processing blog post with slug "${postData.Slug}":`, error);
    throw error;
  }
}

/**
 * Process multiple blog posts
 */
async function processBlogPosts(posts) {
  console.log(`Processing ${posts.length} blog posts...`);
  const results = [];
  const skipped = [];
  
  for (const post of posts) {
    try {
      const result = await processBlogPost(post);
      if (result.skipped) {
        skipped.push(post.Slug);
      } else {
        results.push(result);
      }
    } catch (error) {
      console.error(`Failed to process blog post with slug "${post.Slug}". Continuing with next post.`);
      // Continue with other posts instead of stopping the whole process
    }
  }
  
  // We no longer clean up temporary images as requested
  // cleanupTempImages();
  
  console.log(`Skipped ${skipped.length} existing blog posts.`);
  return results;
}

/**
 * Main execution
 */
(async () => {
  try {
    // Read blog post data from JSON file
    console.log("Reading blog post data from blog_data.json...");
    const dataFilePath = "blog_data.json";
    
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Error: ${dataFilePath} does not exist. Make sure the file is in the correct location.`);
      process.exit(1);
    }
    
    const blogPostsToProcess = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    
    if (!Array.isArray(blogPostsToProcess)) {
      console.error("Error: blog_data.json should contain an array of blog post objects.");
      process.exit(1);
    }
    
    console.log(`Found ${blogPostsToProcess.length} blog posts to process.`);
    
    // Process the blog posts
    const results = await processBlogPosts(blogPostsToProcess);
    
    console.log(`Successfully created ${results.length} out of ${blogPostsToProcess.length} blog posts.`);
    
  } catch (error) {
    console.error("Failed to process blog posts:", error);
    process.exit(1);
  }
})();

// Export functions for testing
module.exports = {
  processBlogPost,
  uploadImageToStrapi
}; 