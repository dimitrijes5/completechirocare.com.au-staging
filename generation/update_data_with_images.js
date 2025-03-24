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
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('icon')) {
      console.log(`Found potential image/icon field: ${fullPath}`, 
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
  function processObject(obj, parent = null) {
    if (!obj || typeof obj !== 'object') return;
    
    // Store reference to parent for component context
    if (parent) {
      obj.parent = parent;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => processObject(item, obj));
      return;
    }
    
    // Handle objects
    for (const key in obj) {
      // Skip if not own property or parent reference
      if (!Object.prototype.hasOwnProperty.call(obj, key) || key === 'parent') continue;
      
      const value = obj[key];
      
      // Check if the key suggests it's an image or icon
      if (key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('background') || 
          key.toLowerCase().includes('avatar') || 
          key.toLowerCase().includes('photo') ||
          key.toLowerCase().includes('icon')) {
        
        // If it's an object with a URL, replace it with a component-specific image
        if (value && typeof value === 'object' && value.url) {
          // Try to find an appropriate image based on the component
          const keyBasedImage = findImageByKeyName(key, uploadedImages, obj);
          
          if (keyBasedImage) {
            obj[key] = {
              url: keyBasedImage.url,
              id: keyBasedImage.id,
              width: keyBasedImage.width,
              height: keyBasedImage.height,
              formats: keyBasedImage.formats
            };
            console.log(`Updated existing ${key} with component-specific image: ${keyBasedImage.url}`);
            updateCount++;
          }
        }
        // If it's a string value, replace it too
        else if (typeof value === 'string' && value.length > 0) {
          const keyBasedImage = findImageByKeyName(key, uploadedImages, obj);
          
          if (keyBasedImage) {
            obj[key] = {
              url: keyBasedImage.url,
              id: keyBasedImage.id,
              width: keyBasedImage.width,
              height: keyBasedImage.height,
              formats: keyBasedImage.formats
            };
            console.log(`Updated ${key} string value with component-specific image: ${keyBasedImage.url}`);
            updateCount++;
          }
        }
        // If it's null, try to find a matching image
        else if (value === null) {
          const keyBasedImage = findImageByKeyName(key, uploadedImages, obj);
          
          if (keyBasedImage) {
            obj[key] = {
              url: keyBasedImage.url,
              id: keyBasedImage.id,
              width: keyBasedImage.width,
              height: keyBasedImage.height,
              formats: keyBasedImage.formats
            };
            console.log(`Updated null ${key} with component-specific image: ${keyBasedImage.url}`);
            updateCount++;
          }
        }
      }
      
      // Process nested objects/arrays
      if (value && typeof value === 'object') {
        processObject(value, obj);
      }
    }
    
    // Clean up parent reference to avoid circular references when stringifying
    delete obj.parent;
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
  
  // Find an image based on the key name and component context
  function findImageByKeyName(key, uploadedImages, obj = null) {
    const keyLower = key.toLowerCase();
    console.log(`Looking for image based on key name: ${keyLower}`);
    
    // Try to determine the component type from the object or parent hierarchy
    let componentType = null;
    
    // Check if we can determine the component type from the object
    if (obj && typeof obj === 'object') {
      // Look for __component field which indicates the component type
      if (obj.__component) {
        componentType = obj.__component.split('.')[0]; // Get the first part of component name
        console.log(`Found component type from object: ${componentType}`);
      }
      
      // If we have a parent, check if it's a known component
      if (!componentType && obj.parent && obj.parent.__component) {
        componentType = obj.parent.__component.split('.')[0];
        console.log(`Found component type from parent: ${componentType}`);
      }
    }
    
    // Use the component type to determine the folder
    let primaryFolder = null;
    if (componentType) {
      // Map component types to folder names
      const componentToFolder = {
        'hero-component': 'hero',
        'about': 'about',
        'services': 'services',
        'team': 'team',
        'teams-part': 'team',
        'slider-animation': 'slider',
        'featured-section': 'featured',
        'goals': 'goals',
        'why-choose': 'why-choose-us',
        'consultation': 'consultation',
        'let-us-help-you': 'help',
        'map': 'map',
        'last-section': 'last-section'
      };
      
      primaryFolder = componentToFolder[componentType];
      if (primaryFolder) {
        console.log(`Mapped component ${componentType} to folder ${primaryFolder}`);
      }
    }
    
    // Extract number from key if it exists - try different patterns
    // First, check for patterns like "firstIcon", "secondIcon", "ThirdIcon"
    let number = null;
    let orderKeywords = {
      'first': 1,
      'second': 2,
      'third': 3,
      'fourth': 4,
      'fifth': 5,
      'sixth': 6,
      'seventh': 7,
      'eighth': 8,
      'ninth': 9,
      'tenth': 10
    };
    
    // Check for order words in the key
    for (const [word, num] of Object.entries(orderKeywords)) {
      if (keyLower.includes(word)) {
        number = num;
        console.log(`Found ordered number ${number} from key part: ${word}`);
        break;
      }
    }
    
    // If no order word was found, try numeric extraction
    if (number === null) {
      const matches = keyLower.match(/\d+$/);
      if (matches) {
        number = parseInt(matches[0]);
        console.log(`Found numeric value ${number} in key`);
      }
    }
    
    // Special case for icons - check if the key contains "icon"
    const isIcon = keyLower.includes('icon');
    
    // Extract base name (e.g., "img" from "img1")
    const baseName = keyLower.replace(/\d+$/, '');
    
    // Guess potential folder names based on various factors
    const folderGuesses = [];
    
    // First priority: use the component-derived folder if available
    if (primaryFolder) {
      folderGuesses.push(primaryFolder);
    }
    
    // For icons, check icon-specific folders first
    if (isIcon) {
      folderGuesses.push('why-choose-us', 'icons', 'icon');
    }
    
    // Second priority: use key-based guesses
    if (keyLower.includes('hero') || keyLower.includes('background')) folderGuesses.push('hero');
    if (keyLower.includes('about')) folderGuesses.push('about');
    if (keyLower.includes('service')) folderGuesses.push('services');
    if (keyLower.includes('team') || keyLower.includes('member')) folderGuesses.push('team');
    if (keyLower.includes('slider')) folderGuesses.push('slider');
    if (keyLower.includes('feature')) folderGuesses.push('featured');
    if (keyLower.includes('goal')) folderGuesses.push('goals');
    if (keyLower.includes('why')) folderGuesses.push('why-choose-us');
    if (keyLower.includes('consult')) folderGuesses.push('consultation');
    if (keyLower.includes('help')) folderGuesses.push('help');
    if (keyLower.includes('map')) folderGuesses.push('map');
    if (keyLower.includes('last')) folderGuesses.push('last-section');
    
    // Third priority: generic fallback folders
    if (folderGuesses.length === 0) {
      folderGuesses.push('hero', 'about', 'services', 'team');
    }
    
    // Remove duplicates
    const uniqueFolders = [...new Set(folderGuesses)];
    console.log(`Guessing folders: ${uniqueFolders.join(', ')}`);
    
    // For icons, check for specific icon images like "image1", "icon1", etc.
    if (isIcon && number !== null) {
      // Try direct match for the number
      for (const folder of uniqueFolders) {
        for (const path in uploadedImages) {
          if (path.startsWith(`${folder}/`)) {
            // Check for pattern like "image1.png" or "icon1.svg"
            if (path.includes(`image${number}`) || path.includes(`icon${number}`)) {
              console.log(`Found numbered icon match in ${folder}: ${path}`);
              return uploadedImages[path];
            }
          }
        }
      }
    }
    
    // Try to find an image with matching number in primary folder first
    if (primaryFolder && number !== null) {
      for (const path in uploadedImages) {
        if (path.startsWith(`${primaryFolder}/`)) {
          const imageNumber = path.match(/\d+/);
          if (imageNumber && parseInt(imageNumber[0]) === number) {
            console.log(`Found numbered match in primary folder ${primaryFolder}: ${path}`);
            return uploadedImages[path];
          }
        }
      }
    }
    
    // Try to find images in the guessed folders with matching number
    if (number !== null) {
      for (const folder of uniqueFolders) {
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
    }
    
    // If no match with number, try to find any image in primary folder
    if (primaryFolder) {
      for (const path in uploadedImages) {
        if (path.startsWith(`${primaryFolder}/`)) {
          console.log(`Found image in primary folder ${primaryFolder}: ${path}`);
          return uploadedImages[path];
        }
      }
    }
    
    // If still no match, try any image in guessed folders
    for (const folder of uniqueFolders) {
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