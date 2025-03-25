// Script to extract images from blog posts, upload them to Strapi, and update content references
require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');
const { Blob, File } = require('node:buffer');
const fs = require('fs');
const path = require('path');

// Environment variables
const STRAPI_URL = process.env.STRAPI_URL || '';
const API_TOKEN = process.env.ASTRO_APP_API_TOKEN || '';

if (!STRAPI_URL || !API_TOKEN) {
  console.error('Missing environment variables: STRAPI_URL and/or ASTRO_APP_API_TOKEN');
  process.exit(1);
}

// Helper function to download an image
async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return await response.buffer();
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

// Helper function to upload an image to Strapi
async function uploadImageToStrapi(imageBuffer, fileName, postId) {
  try {
    const formData = new FormData();
    
    // Create a file from the buffer
    formData.append('files', imageBuffer, {
      filename: fileName,
      contentType: 'image/jpeg', // Default to JPEG, could be determined from the file extension
    });
    
    formData.append('ref', 'api::post.post'); // Reference to blog post content type
    formData.append('refId', postId); // The post ID
    formData.append('field', 'images'); // The field name in the content type
    
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Uploaded image ${fileName} successfully`);
    return result[0]; // Return the first uploaded file info
  } catch (error) {
    console.error(`Error uploading image ${fileName}:`, error);
    return null;
  }
}

// Function to extract images from HTML content
function extractImagesFromHtml(html) {
  const imageRegex = /<img[^>]+class\s*=\s*["']w-full mb-6 md:mb-8["'][^>]*src\s*=\s*["']([^"']+)["'][^>]*>/g;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(html)) !== null) {
    const imgSrc = match[1];
    if (imgSrc && !imgSrc.includes(STRAPI_URL)) {
      images.push(imgSrc);
    }
  }
  
  return images;
}

// Function to update blog post content with new image URLs
async function updatePostContent(postId, imageMap) {
  if (Object.keys(imageMap).length === 0) {
    console.log(`No images to update for post ${postId}`);
    return;
  }
  
  try {
    // Get current post data
    const response = await fetch(`${STRAPI_URL}/api/posts/${postId}?populate=*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }
    
    const postData = await response.json();
    if (!postData.data) {
      throw new Error('Invalid post data structure');
    }
    
    // Update content with new image URLs
    // This implementation depends on your content structure
    // Below is a simplified example:
    const content = postData.data.Content;
    
    // Here you'd traverse the content structure and update image URLs
    // This is a placeholder - you'll need to adapt this to your actual content structure
    const updatedContent = content.map(block => {
      // Example: If it's an image block
      if (block.type === 'image' && block.url && imageMap[block.url]) {
        return {
          ...block,
          url: imageMap[block.url]
        };
      }
      return block;
    });
    
    // Update the post in Strapi
    const updateResponse = await fetch(`${STRAPI_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          Content: updatedContent
        }
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update post: ${updateResponse.statusText}`);
    }
    
    console.log(`Successfully updated content for post ${postId}`);
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
  }
}

// Main function to process all blog posts
async function processBlogPosts() {
  try {
    // Get all blog posts
    const response = await fetch(`${STRAPI_URL}/api/posts?populate=*&pagination[pageSize]=100`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid API response format');
    }
    
    const posts = result.data;
    console.log(`Found ${posts.length} blog posts to process`);
    
    // Process each post
    for (const post of posts) {
      const postId = post.id;
      
      // 1. Generate HTML content from the post's content blocks
      let htmlContent = '';
      if (post.Content && Array.isArray(post.Content)) {
        // This is simplified - you'll need to adapt this to your actual rendering logic
        htmlContent = post.Content.map(block => {
          if (block.type === 'paragraph') {
            return `<p>${block.children.map(child => child.text).join('')}</p>`;
          }
          return '';
        }).join('');
      }
      
      // 2. Extract image URLs
      const imageUrls = extractImagesFromHtml(htmlContent);
      if (imageUrls.length === 0) {
        console.log(`No images to process for post ${postId}`);
        continue;
      }
      
      console.log(`Found ${imageUrls.length} images in post ${postId}`);
      
      // 3. Process each image
      const imageMap = {};
      for (const imageUrl of imageUrls) {
        const fileName = path.basename(imageUrl) || `blog-image-${Date.now()}.jpg`;
        
        // Download the image
        const imageBuffer = await downloadImage(imageUrl);
        if (!imageBuffer) continue;
        
        // Upload to Strapi
        const uploadedImage = await uploadImageToStrapi(imageBuffer, fileName, postId);
        if (uploadedImage && uploadedImage.url) {
          imageMap[imageUrl] = `${STRAPI_URL}${uploadedImage.url}`;
          console.log(`Mapped ${imageUrl} -> ${STRAPI_URL}${uploadedImage.url}`);
        }
      }
      
      // 4. Update post content with new image URLs
      await updatePostContent(postId, imageMap);
    }
    
    console.log('All blog posts processed successfully');
  } catch (error) {
    console.error('Error processing blog posts:', error);
  }
}

// Run the main function
processBlogPosts()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error)); 