const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config({ path: '../.env' });

// Use environment variables
const ADMIN_API_TOKEN = process.env.TOKEN;
const STRAPI_URL = process.env.URL;

async function testImageUpload() {
  try {
    // Path to test image
    const testImagePath = path.join(__dirname, 'temp_images', 'test-blog-post.jpg');
    
    // Check if the image exists
    if (!fs.existsSync(testImagePath)) {
      console.error('Test image not found at:', testImagePath);
      console.error('Please run test_image_scrape.js first to download the test image');
      return;
    }
    
    console.log('Test image found, preparing upload...');
    
    // Create FormData instance
    const form = new FormData();
    
    // Open file as a stream
    const fileStream = fs.createReadStream(testImagePath);
    
    // Append file to form
    form.append('files', fileStream, {
      filename: 'test-blog-post.jpg',
      contentType: 'image/jpeg',
    });
    
    console.log('FormData created, sending request...');
    
    // Get FormData headers
    const formHeaders = form.getHeaders();
    
    // Upload to Strapi
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
        ...formHeaders
      },
      body: form,
    });
    
    // Handle response
    if (!response.ok) {
      const text = await response.text();
      console.error(`Upload failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${text}`);
    } else {
      const result = await response.json();
      console.log('Upload successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testImageUpload(); 