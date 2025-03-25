const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Load environment variables from .env file
require('dotenv').config();

// Use environment variables for Strapi connection
const ADMIN_API_TOKEN = process.env.REAL_TOKEN;
const STRAPI_URL = process.env.REAL_URL;

// Validate required environment variables
if (!ADMIN_API_TOKEN || !STRAPI_URL) {
  console.error('Error: Missing required environment variables. Please check your .env file.');
  console.error('Required variables: TOKEN, URL');
  process.exit(1);
}

/**
 * Upload a single image to Strapi media library
 * 
 * @param {string} filePath - Path to the image file
 * @param {string} componentType - Optional component type for logging context
 * @returns {Object} - Uploaded file metadata from Strapi
 */
async function uploadImage(filePath, componentType = null) {
  try {
    const fileName = path.basename(filePath);
    const contextMsg = componentType ? `(${componentType})` : '';
    console.log(`Uploading image: ${fileName} ${contextMsg}`);
    
    // Create form data for the file upload
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    
    // Add the file to the form data with its original filename
    formData.append('files', fileStream, {
      filename: fileName,
      contentType: getContentType(fileName)
    });
    
    // Send the upload request to Strapi
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: formData,
    });

    // Read response text for better error handling
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Error uploading ${fileName}: Status ${response.status} ${response.statusText}`);
      console.error(`Response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    try {
      // Parse the JSON response
      const result = JSON.parse(responseText);
      console.log(`✅ Successfully uploaded ${fileName}`);
      return result[0]; // Strapi returns an array of uploaded files
    } catch (parseError) {
      console.error('Error parsing response:', parseError.message);
      console.error('Raw response:', responseText.substring(0, 500));
      throw new Error('Failed to parse upload response');
    }
  } catch (error) {
    console.error(`❌ Error uploading ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

/**
 * Get content type based on file extension
 * 
 * @param {string} fileName - File name to determine content type from
 * @returns {string} - MIME content type 
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Upload all images from a directory recursively with component context
 * 
 * @param {string} dirPath - Path to the directory to process
 * @param {Object} uploadedImages - Object to store uploaded image results
 * @returns {Object} - Updated uploadedImages object
 */
async function uploadImagesFromDir(dirPath, uploadedImages = {}) {
  console.log(`\nScanning directory: ${dirPath}`);
  
  try {
    const files = fs.readdirSync(dirPath);
    const componentType = path.basename(dirPath);
    
    // Count images in this directory
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext);
    });
    
    console.log(`Found ${imageFiles.length} images in ${componentType} directory`);
    
    // Process each file
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await uploadImagesFromDir(fullPath, uploadedImages);
      } else {
        // Check if file is an image based on extension
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext)) {
          try {
            // Upload the image with component context
            const uploadResult = await uploadImage(fullPath, componentType);
            
            // Generate multiple keys for flexible lookups
            
            // 1. Key based on relative path from the images directory
            const imagesBasePath = path.join(__dirname, 'images');
            const relativePath = path.relative(imagesBasePath, fullPath);
            uploadedImages[relativePath] = uploadResult;
            
            // 2. Key with just the filename for simpler lookup
            uploadedImages[file] = uploadResult;
            
            // 3. Key with componentType/filename format
            uploadedImages[`${componentType}/${file}`] = uploadResult;
            
            // 4. Special handling for numbered images (e.g., image1.jpg)
            const nameMatch = file.match(/^([a-zA-Z]+)(\d+)\.([a-zA-Z]+)$/);
            if (nameMatch) {
              const [_, prefix, number, _ext] = nameMatch;
              uploadedImages[`${componentType}_${prefix}${number}`] = uploadResult;
              uploadedImages[`${prefix}${number}`] = uploadResult;
            }
            
            console.log(`  - Stored with keys: ${relativePath}, ${file}, ${componentType}/${file}`);
          } catch (error) {
            console.error(`  - Failed to upload ${file}:`, error.message);
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
  console.log(`\n=== Starting image upload process ===`);
  console.log(`Source directory: ${imagesDir}`);
  console.log(`Target Strapi URL: ${STRAPI_URL}`);
  
  // Validate images directory
  if (!fs.existsSync(imagesDir)) {
    console.error(`\nError: Images directory ${imagesDir} does not exist. Please create it and add your images.`);
    process.exit(1);
  }
  
  try {
    // Create an object to store uploaded image data
    const uploadedImages = {};
    
    // List component directories
    const componentDirs = fs.readdirSync(imagesDir);
    console.log(`Found ${componentDirs.length} component directories: ${componentDirs.join(', ')}`);
    
    // Upload images from each component directory
    for (const dir of componentDirs) {
      const dirPath = path.join(imagesDir, dir);
      if (fs.statSync(dirPath).isDirectory()) {
        await uploadImagesFromDir(dirPath, uploadedImages);
      }
    }
    
    // Check results
    const uniqueImages = new Set();
    Object.values(uploadedImages).forEach(img => uniqueImages.add(img.id));
    
    if (uniqueImages.size === 0) {
      console.warn('\nNo images were uploaded. Check that your images directory contains image files.');
    } else {
      console.log(`\n✅ Successfully uploaded ${uniqueImages.size} unique images with ${Object.keys(uploadedImages).length} reference keys.`);
    }
    
    // Save the results to a file
    const outputFile = path.join(__dirname, 'uploaded_images.json');
    fs.writeFileSync(outputFile, JSON.stringify(uploadedImages, null, 2));
    
    console.log(`\n✅ Results saved to ${outputFile}`);
    console.log(`\nNext step: Run update_data_with_images.js to update your data.json file with these images.`);
  } catch (error) {
    console.error('\n❌ Upload process failed:', error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 