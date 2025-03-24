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
    const fileStream = fs.createReadStream(filePath);
    
    // Get filename from path
    const fileName = path.basename(filePath);
    
    // Add the file to the form data with its original filename
    formData.append('files', fileStream, {
      filename: fileName,
      contentType: getContentType(fileName)
    });
    
    console.log(`Sending request to ${STRAPI_URL}/api/upload with file: ${fileName}`);
    
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
        // Let form-data set its own content-type with boundary
      },
      body: formData,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Error response status: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`Image uploaded successfully. Response:`, JSON.stringify(result, null, 2).substring(0, 200) + '...');
      return result[0]; // Strapi returns an array of uploaded files
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse upload response');
    }
  } catch (error) {
    console.error(`Error uploading image ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Upload all images from a directory recursively
 */
async function uploadImagesFromDir(dirPath, uploadedImages = {}) {
  console.log(`Scanning directory: ${dirPath}`);
  
  try {
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
            
            // Add a simpler key with just the filename for easier lookup
            uploadedImages[file] = uploadResult;
            
            // Also add folder/filename format
            const parentFolder = path.basename(path.dirname(fullPath));
            uploadedImages[`${parentFolder}/${file}`] = uploadResult;
            
            console.log(`Stored image with keys: ${relativePath}, ${file}, ${parentFolder}/${file}`);
          } catch (error) {
            console.error(`Failed to upload ${fullPath}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
  
  return uploadedImages;
}

/**
 * Main function to upload all images and save the results to a file
 */
async function main() {
  const imagesDir = path.join(__dirname, 'images');
  console.log(`Uploading all images from ${imagesDir}`);
  
  if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Images directory ${imagesDir} does not exist. Please create it and add your images.`);
    process.exit(1);
  }
  
  try {
    // Create an object to store uploaded image data
    const uploadedImages = {};
    
    // Recursively upload all images
    await uploadImagesFromDir(imagesDir, uploadedImages);
    
    if (Object.keys(uploadedImages).length === 0) {
      console.warn('No images were uploaded. Check that your images directory contains image files.');
    } else {
      console.log(`Successfully uploaded ${Object.keys(uploadedImages).length / 3} images.`);
    }
    
    // Save the results to a file
    const outputFile = path.join(__dirname, 'uploaded_images.json');
    fs.writeFileSync(outputFile, JSON.stringify(uploadedImages, null, 2));
    
    console.log(`All images uploaded successfully! Results saved to ${outputFile}`);
  } catch (error) {
    console.error('Failed to upload images:', error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 