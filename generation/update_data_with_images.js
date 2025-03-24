const fs = require('fs');
const path = require('path');

// Load the uploaded images data
const uploadedImagesPath = path.join(__dirname, 'uploaded_images.json');
const dataJsonPath = path.join(__dirname, 'data.json');

// Check if uploaded_images.json exists
if (!fs.existsSync(uploadedImagesPath)) {
  console.error('Error: uploaded_images.json not found. Please run upload_images.js first.');
  process.exit(1);
}

// Check if data.json exists
if (!fs.existsSync(dataJsonPath)) {
  console.error('Error: data.json not found.');
  process.exit(1);
}

// Load the uploaded images and data.json files
const uploadedImages = JSON.parse(fs.readFileSync(uploadedImagesPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

console.log('Loaded uploaded images and data.json successfully.');

/**
 * Function to update image references in data.json with uploaded image URLs
 * This is a helper function that you can customize according to your data structure
 */
function updateDataWithImages(data, uploadedImages) {
  // Example: We'll look for keys that might contain images and update them
  // This is a simple demonstration - you may need to customize this based on your data structure
  
  // Helper function to recursively process objects
  function processObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => processObject(item));
      return;
    }
    
    // Handle objects
    for (const key in obj) {
      // Skip if not own property
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      
      const value = obj[key];
      
      // Process nested objects/arrays
      if (value && typeof value === 'object') {
        processObject(value);
        continue;
      }
      
      // Check if the key suggests it's an image (you can customize this pattern)
      if (
        key.toLowerCase().includes('img') || 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('background') ||
        key.toLowerCase().includes('avatar') ||
        key.toLowerCase().includes('photo')
      ) {
        // If the value is a string, it might be a relative path to an image
        if (typeof value === 'string' && value.length > 0) {
          // Look for a matching uploaded image
          const matchingImage = findMatchingImage(value, uploadedImages);
          
          if (matchingImage) {
            // If the parent is an object with a URL property, update the URL
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              if (obj[key].hasOwnProperty('url')) {
                obj[key].url = matchingImage.url;
                console.log(`Updated ${key}.url to ${matchingImage.url}`);
              }
            } else {
              // Otherwise, replace with an object containing URL and other image data
              obj[key] = {
                url: matchingImage.url,
                id: matchingImage.id,
                width: matchingImage.width,
                height: matchingImage.height,
                formats: matchingImage.formats
              };
              console.log(`Updated ${key} to use uploaded image URL: ${matchingImage.url}`);
            }
          }
        } else if (obj[key] === null) {
          // If it's a null value, try to find an image with a name that matches the key
          const keyBasedImage = findImageByKeyName(key, uploadedImages);
          
          if (keyBasedImage) {
            obj[key] = {
              url: keyBasedImage.url,
              id: keyBasedImage.id,
              width: keyBasedImage.width,
              height: keyBasedImage.height,
              formats: keyBasedImage.formats
            };
            console.log(`Updated null ${key} with matching image: ${keyBasedImage.url}`);
          }
        }
      }
    }
  }
  
  // Find an image that matches a string path or name
  function findMatchingImage(imagePath, uploadedImages) {
    // Remove leading './' if present
    if (imagePath.startsWith('./')) {
      imagePath = imagePath.substring(2);
    }
    
    // Try to find exact matches or basename matches
    for (const path in uploadedImages) {
      if (
        path === imagePath || 
        path.endsWith(`/${imagePath}`) || 
        path.includes(imagePath)
      ) {
        return uploadedImages[path];
      }
    }
    
    return null;
  }
  
  // Find an image based on the key name
  function findImageByKeyName(key, uploadedImages) {
    const keyLower = key.toLowerCase();
    
    // For keys like "img1", "img2", look for images in associated folders
    // This requires some domain knowledge of your structure
    
    // Extract base name (e.g., "img" from "img1")
    const baseName = keyLower.replace(/\d+$/, '');
    const folderGuesses = [baseName];
    
    // Add some common sections based on your folder structure
    if (keyLower.includes('hero')) folderGuesses.push('hero');
    if (keyLower.includes('about')) folderGuesses.push('about');
    if (keyLower.includes('service')) folderGuesses.push('services');
    if (keyLower.includes('team')) folderGuesses.push('team');
    
    // Try to find an image in the guessed folders
    for (const folder of folderGuesses) {
      for (const path in uploadedImages) {
        if (path.startsWith(`${folder}/`)) {
          // Extract number from key if it exists
          const matches = keyLower.match(/\d+$/);
          const number = matches ? parseInt(matches[0]) : null;
          
          // If we have a number, try to match it with the image filename
          if (number !== null) {
            const imageNumber = path.match(/\d+/);
            if (imageNumber && parseInt(imageNumber[0]) === number) {
              return uploadedImages[path];
            }
          } else {
            // If no number, just return the first image in the folder
            return uploadedImages[path];
          }
        }
      }
    }
    
    return null;
  }
  
  // Start processing the data
  processObject(data);
  return data;
}

// Update the data with image URLs
const updatedData = updateDataWithImages(data, uploadedImages);

// Save the updated data back to data.json
fs.writeFileSync(dataJsonPath, JSON.stringify(updatedData, null, 2));

console.log('Successfully updated data.json with image URLs.');
console.log('You can now run insert_data.js to upload the data to Strapi.'); 