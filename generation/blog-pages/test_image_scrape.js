const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Updated to use a URL from the blog_data.json
const testImageUrl = 'https://complete.testingweblink.com/uploads/Ankylosing_Spondilitis_2fad953644.jpg';
const slug = 'test-blog-post';

/**
 * Downloads and saves an image temporarily to upload to Strapi later
 */
async function downloadImage(imageUrl, slug) {
  try {
    // Make sure the URL is absolute
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `https://www.completechirocare.com.au${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    
    console.log(`Downloading image: ${fullImageUrl}`);
    
    // Create the directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp_images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Get the file extension from the URL
    const urlObj = new URL(fullImageUrl);
    const pathname = urlObj.pathname;
    const extension = path.extname(pathname) || '.jpg'; // Default to .jpg if no extension
    
    // Create a filename based on the slug, remove invalid characters
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');
    const fileName = `${sanitizedSlug}${extension}`;
    const filePath = path.join(tempDir, fileName);
    
    // Download the image
    const response = await axios({
      method: 'get',
      url: fullImageUrl,
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });
    
    // Determine the MIME type from the Content-Type header
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    
    // Verify we have image data
    if (!response.data || response.data.length === 0) {
      throw new Error('Downloaded image is empty');
    }
    
    // Log some information about the downloaded image
    console.log(`Downloaded image size: ${response.data.length} bytes`);
    console.log(`Image MIME type: ${mimeType}`);
    
    // Write the file directly
    fs.writeFileSync(filePath, Buffer.from(response.data));
    
    // Verify the file was written correctly
    const fileStats = fs.statSync(filePath);
    console.log(`Saved image file size: ${fileStats.size} bytes`);
    
    if (fileStats.size === 0) {
      throw new Error('Saved image file is empty');
    }
    
    console.log(`Image saved to: ${filePath}`);
    
    return {
      filePath,
      fileName,
      mimeType
    };
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
    }
    return null;
  }
}

// Run the test
(async () => {
  console.log('Starting image download test...');
  const result = await downloadImage(testImageUrl, slug);
  
  if (result) {
    console.log('Image downloaded successfully:');
    console.log(result);
    
    // Verify file exists and has content
    const exists = fs.existsSync(result.filePath);
    const size = exists ? fs.statSync(result.filePath).size : 0;
    
    console.log(`File exists: ${exists}`);
    console.log(`File size: ${size} bytes`);
  } else {
    console.error('Image download failed');
  }
})(); 