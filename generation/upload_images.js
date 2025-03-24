const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Load environment variables from .env file
require('dotenv').config();

// Use environment variables instead of hardcoded values
const ADMIN_API_TOKEN = process.env.TOKEN;
const STRAPI_URL = process.env.URL;

/**
 * Upload a single image to Strapi media library
 */
async function uploadImage(filePath) {
  try {
    console.log(`Uploading image: ${filePath}`);
    
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));
    
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload image: ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`);
    }

    const result = await response.json();
    console.log(`Image uploaded successfully: ${filePath}`);
    return result[0]; // Strapi returns an array of uploaded files
  } catch (error) {
    console.error(`Error uploading image ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Upload all images from a directory recursively
 */
async function uploadImagesFromDir(dirPath, uploadedImages = {}) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await uploadImagesFromDir(fullPath, uploadedImages);
    } else {
      // Check if file is an image based on extension
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
        try {
          const uploadResult = await uploadImage(fullPath);
          
          // Store the result with a key based on the relative path from the images directory
          const relativePath = path.relative(path.join(__dirname, 'images'), fullPath);
          uploadedImages[relativePath] = uploadResult;
        } catch (error) {
          console.error(`Failed to upload ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  return uploadedImages;
}

/**
 * Main function to upload all images and save the results to a file
 */
async function main() {
  const imagesDir = path.join(__dirname, 'images');
  console.log(`Uploading all images from ${imagesDir}`);
  
  try {
    // Create an object to store uploaded image data
    const uploadedImages = {};
    
    // Recursively upload all images
    await uploadImagesFromDir(imagesDir, uploadedImages);
    
    // Save the results to a file
    const outputFile = path.join(__dirname, 'uploaded_images.json');
    fs.writeFileSync(outputFile, JSON.stringify(uploadedImages, null, 2));
    
    console.log(`All images uploaded successfully! Results saved to ${outputFile}`);
  } catch (error) {
    console.error('Failed to upload images:', error.message);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 