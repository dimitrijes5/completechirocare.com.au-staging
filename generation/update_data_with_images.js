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
console.log(`Found ${Object.keys(uploadedImages).length} image entries in uploaded_images.json`);

// First, let's create a debug function to help us understand what's happening
function debugObject(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      debugObject(item, `${prefix}[${index}]`);
    });
    return;
  }
  
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const value = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    
    if (key.toLowerCase().includes('img') || 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('background') || 
        key.toLowerCase().includes('avatar') || 
        key.toLowerCase().includes('photo')) {
      console.log(`Found potential image field: ${fullPath}`, 
                  value === null ? 'null' : 
                  (typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : value));
    }
    
    if (value && typeof value === 'object') {
      debugObject(value, fullPath);
    }
  }
}

// Debug the data structure
console.log('Analyzing data.json structure for image fields:');
debugObject(data);

// Debug available uploaded images
console.log('\nAvailable uploaded image keys:');
const imageKeys = Object.keys(uploadedImages);
console.log(imageKeys.slice(0, 10).join('\n') + (imageKeys.length > 10 ? `\n...and ${imageKeys.length - 10} more` : ''));

/**
 * Function to update image references in data.json with uploaded image URLs
 */
function updateDataWithImages(data, uploadedImages) {
  let updateCount = 0;
  
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
      
      // Check if the key suggests it's an image and current value is a string or null
      if ((key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('background') || 
          key.toLowerCase().includes('avatar') || 
          key.toLowerCase().includes('photo')) && 
          (typeof value === 'string' || value === null)) {
        
        // Handle existing url object
        if (typeof obj[key] === 'object' && obj[key] !== null && obj[key].url) {
          const urlValue = obj[key].url;
          if (typeof urlValue === 'string' && urlValue.startsWith('/')) {
            // This looks like a relative path, try to find a match
            const pathWithoutLeadingSlash = urlValue.substring(1);
            const matchingImage = findMatchingImage(pathWithoutLeadingSlash, uploadedImages);
            
            if (matchingImage) {
              obj[key].url = matchingImage.url;
              console.log(`Updated ${key}.url from ${urlValue} to ${matchingImage.url}`);
              updateCount++;
            }
          }
        } 
        // Handle string path
        else if (typeof value === 'string' && value.length > 0) {
          // Look for a matching uploaded image
          const matchingImage = findMatchingImage(value, uploadedImages);
          
          if (matchingImage) {
            // Replace with an object containing URL and other image data
            obj[key] = {
              url: matchingImage.url,
              id: matchingImage.id,
              width: matchingImage.width,
              height: matchingImage.height,
              formats: matchingImage.formats
            };
            console.log(`Updated ${key} string value to use uploaded image URL: ${matchingImage.url}`);
            updateCount++;
          }
        } 
        // Handle null value
        else if (value === null) {
          // Try to find an image with a name that matches the key
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
            updateCount++;
          }
        }
      }
    }
  }
  
  // Find an image that matches a string path or name
  function findMatchingImage(searchPath, uploadedImages) {
    // Remove leading './' if present
    if (searchPath.startsWith('./')) {
      searchPath = searchPath.substring(2);
    }
    
    // Remove leading '/' if present
    if (searchPath.startsWith('/')) {
      searchPath = searchPath.substring(1);
    }
    
    console.log(`Looking for image matching: ${searchPath}`);
    
    // Get the basename of the search path
    const searchBasename = path.basename(searchPath);
    
    // Try to find exact matches first
    for (const uploadedPath in uploadedImages) {
      // Check for exact match
      if (uploadedPath === searchPath) {
        console.log(`Found exact match: ${uploadedPath}`);
        return uploadedImages[uploadedPath];
      }
      
      // Check if uploadedPath ends with searchPath
      if (uploadedPath.endsWith(`/${searchPath}`)) {
        console.log(`Found path ending match: ${uploadedPath}`);
        return uploadedImages[uploadedPath];
      }
      
      // Check if basenames match
      const uploadedBasename = path.basename(uploadedPath);
      if (uploadedBasename === searchBasename) {
        console.log(`Found basename match: ${uploadedPath}`);
        return uploadedImages[uploadedPath];
      }
    }
    
    // Try looser matching
    for (const uploadedPath in uploadedImages) {
      // Check if search path is included in uploaded path
      if (uploadedPath.includes(searchPath)) {
        console.log(`Found partial path match: ${uploadedPath}`);
        return uploadedImages[uploadedPath];
      }
      
      // Check if basename is included in uploaded path
      if (uploadedPath.includes(searchBasename)) {
        console.log(`Found partial basename match: ${uploadedPath}`);
        return uploadedImages[uploadedPath];
      }
    }
    
    console.log(`No match found for: ${searchPath}`);
    return null;
  }
  
  // Find an image based on the key name
  function findImageByKeyName(key, uploadedImages) {
    const keyLower = key.toLowerCase();
    console.log(`Looking for image based on key name: ${keyLower}`);
    
    // Extract base name (e.g., "img" from "img1")
    const baseName = keyLower.replace(/\d+$/, '');
    
    // Guess potential folder names based on the key
    const folderGuesses = [];
    
    // Add some common sections based on your folder structure
    if (keyLower.includes('hero') || keyLower.includes('background')) folderGuesses.push('hero');
    if (keyLower.includes('about')) folderGuesses.push('about');
    if (keyLower.includes('service')) folderGuesses.push('services');
    if (keyLower.includes('team') || keyLower.includes('member')) folderGuesses.push('team');
    
    // If we couldn't guess from key, use generic guesses
    if (folderGuesses.length === 0) {
      folderGuesses.push('hero', 'about', 'services', 'team');
    }
    
    console.log(`Guessing folders: ${folderGuesses.join(', ')}`);
    
    // Try to find an image in the guessed folders
    for (const folder of folderGuesses) {
      // Extract number from key if it exists
      const matches = keyLower.match(/\d+$/);
      const number = matches ? parseInt(matches[0]) : null;
      
      // First try exact number match if we have a number
      if (number !== null) {
        for (const path in uploadedImages) {
          if (path.startsWith(`${folder}/`)) {
            const imageNumber = path.match(/\d+/);
            if (imageNumber && parseInt(imageNumber[0]) === number) {
              console.log(`Found numbered match in ${folder}: ${path}`);
              return uploadedImages[path];
            }
          }
        }
      }
      
      // If no match with number, find any image in the folder
      for (const path in uploadedImages) {
        if (path.startsWith(`${folder}/`)) {
          console.log(`Found image in ${folder}: ${path}`);
          return uploadedImages[path];
        }
      }
    }
    
    // Last resort: just return any image
    const anyImageKey = Object.keys(uploadedImages)[0];
    if (anyImageKey) {
      console.log(`Using any available image as fallback: ${anyImageKey}`);
      return uploadedImages[anyImageKey];
    }
    
    console.log(`No suitable image found for key: ${key}`);
    return null;
  }
  
  // Start processing the data
  processObject(data);
  console.log(`Total updates made: ${updateCount}`);
  return data;
}

// Make a backup of the original data.json
const backupPath = path.join(__dirname, 'data.json.backup');
fs.copyFileSync(dataJsonPath, backupPath);
console.log(`Created backup of original data.json at ${backupPath}`);

// Update the data with image URLs
const updatedData = updateDataWithImages(data, uploadedImages);

// Save the updated data back to data.json
fs.writeFileSync(dataJsonPath, JSON.stringify(updatedData, null, 2));

console.log('Successfully updated data.json with image URLs.');
console.log('You can now run insert_data.js to upload the data to Strapi.');
console.log(`If you need to restore the original data, you can find it at ${backupPath}`); 