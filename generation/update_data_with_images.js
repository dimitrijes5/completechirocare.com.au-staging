const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// File paths
const uploadedImagesPath = path.join(__dirname, 'uploaded_images.json');
const dataJsonPath = path.join(__dirname, 'data.json');
const backupPath = path.join(__dirname, 'data.json.backup');

// Check if required files exist
if (!fs.existsSync(uploadedImagesPath)) {
  console.error('Error: uploaded_images.json not found. Please run upload_images.js first.');
  process.exit(1);
}

if (!fs.existsSync(dataJsonPath)) {
  console.error('Error: data.json not found.');
  process.exit(1);
}

// Make a backup of the original data.json
fs.copyFileSync(dataJsonPath, backupPath);
console.log(`Created backup of original data.json at ${backupPath}`);

// Load the uploaded images and data.json files
let uploadedImages;
let data;

try {
  uploadedImages = JSON.parse(fs.readFileSync(uploadedImagesPath, 'utf8'));
  data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
  console.log('Loaded uploaded images and data.json successfully.');
  console.log(`Found ${Object.keys(uploadedImages).length} image entries in uploaded_images.json`);
} catch (error) {
  console.error('Error loading JSON files:', error.message);
  process.exit(1);
}

/**
 * Component to folder/file mapping configuration
 * This defines which folders and files to use for different components and their image fields
 */
const componentMappings = {
  // Hero component mapping
  'hero-component.hero-component': {
    'background': { folder: 'hero', pattern: 'hero' }
  },
  
  // About component mapping
  'about.about': {
    'img1': { folder: 'about', pattern: 'about1' },
    'img2': { folder: 'about', pattern: 'about2' },
    'img3': { folder: 'about', pattern: 'about3' }
  },
  
  // Why choose us component mapping
  'why-choose.why-choose': {
    'firstIcon': { folder: 'why-choose-us', pattern: 'image1' },
    'secondIcon': { folder: 'why-choose-us', pattern: 'image2' },
    'ThirdIcon': { folder: 'why-choose-us', pattern: 'image3' }
  },
  
  // Help component mapping
  'let-us-help-you.let-us-help-you': {
    'img': { folder: 'let-us-help-you', pattern: 'help' }
  },
  
  // Featured section mapping
  'featured-section.featured-section': {
    'img1': { folder: 'featured', pattern: 'img1' },
    'img2': { folder: 'featured', pattern: 'img2' },
    'img3': { folder: 'featured', pattern: 'img3' },
    'img4': { folder: 'featured', pattern: 'img4' }
  },
  
  // Services component mapping - No images for service sections
  'services.services': { },
  
  // Goals component mapping
  'goals.goals': {
    'img1': { folder: 'goals', pattern: 'img1' },
    'img2': { folder: 'goals', pattern: 'img2' },
    'img3': { folder: 'goals', pattern: 'img3' }
  },
  
  // Map component mapping
  'map.map': {
    'backgorund': { folder: 'map', pattern: 'map' }
  },
  
  // Last section mapping
  'last-section.last-section': {
    'img': { folder: 'last-section', pattern: 'image' }
  },
  
  // Consultation mapping
  'consultation.consultation': {
    'img': { folder: 'consultation', pattern: 'consultation' }
  },
  
  // Team members mapping
  'teams-part.teams-part': {
    'memberOneImg': { folder: 'teams-part', pattern: 'member1' },
    'memberTwoImg': { folder: 'teams-part', pattern: 'member2' },
    'memberThreeImg': { folder: 'teams-part', pattern: 'member3' },
    'memberFourImg': { folder: 'teams-part', pattern: 'member4' },
    'memberFiveImg': { folder: 'teams-part', pattern: 'member5' },
    'memberSixImg': { folder: 'teams-part', pattern: 'member6' }
  }
};

/**
 * Find the best matching image for a field
 * 
 * @param {string} field - The field name in the data object
 * @param {string} componentType - The component type this field belongs to
 * @param {Object} uploadedImages - Object containing all uploaded images
 * @returns {Object|null} - The matching image or null if not found
 */
function findMatchingImage(field, componentType, uploadedImages) {
  console.log(`Finding image for field '${field}' in component '${componentType}'`);
  
  // First look for specific mapping in our configuration
  const componentConfig = componentMappings[componentType];
  if (componentConfig) {
    // Direct field mapping
    const fieldConfig = componentConfig[field];
    
    if (fieldConfig) {
      const { folder, pattern } = fieldConfig;
      console.log(`  Found mapping: folder='${folder}', pattern='${pattern}'`);
      
      // Try to find exact match first
      for (const imagePath in uploadedImages) {
        if (imagePath.startsWith(`${folder}/`) && imagePath.includes(pattern)) {
          console.log(`  ✅ Found exact match: ${imagePath}`);
          return uploadedImages[imagePath];
        }
      }
      
      // If no exact match, try any image in the folder
      for (const imagePath in uploadedImages) {
        if (imagePath.startsWith(`${folder}/`)) {
          console.log(`  ⚠️ Found folder match: ${imagePath}`);
          return uploadedImages[imagePath];
        }
      }
    } else if (typeof componentConfig === 'object') {
      // Check for nested fields (for arrays of objects)
      for (const key in componentConfig) {
        if (typeof componentConfig[key] === 'object' && componentConfig[key][field]) {
          const { folder, pattern } = componentConfig[key][field];
          console.log(`  Found nested mapping: folder='${folder}', pattern='${pattern}'`);
          
          // Try to find match
          for (const imagePath in uploadedImages) {
            if (imagePath.startsWith(`${folder}/`) && imagePath.includes(pattern)) {
              console.log(`  ✅ Found exact match: ${imagePath}`);
              return uploadedImages[imagePath];
            }
          }
          
          // If no exact match, try any image in the folder
          for (const imagePath in uploadedImages) {
            if (imagePath.startsWith(`${folder}/`)) {
              console.log(`  ⚠️ Found folder match: ${imagePath}`);
              return uploadedImages[imagePath];
            }
          }
        }
      }
    }
  }
  
  // If we didn't find a match through our mappings, use fallback strategies
  
  // Try to determine component folder from component type
  const componentFolder = getComponentFolder(componentType);
  if (componentFolder) {
    console.log(`  Using component folder: ${componentFolder}`);
    
    // Try to match based on field name pattern
    if (field.match(/img\d+|image\d+|icon\d+/i)) {
      const numberMatch = field.match(/\d+/);
      if (numberMatch) {
        const num = numberMatch[0];
        
        // Try patterns like img1, image1, etc.
        const patterns = [`img${num}`, `image${num}`, `icon${num}`, `member${num}`];
        
        for (const pattern of patterns) {
          for (const imagePath in uploadedImages) {
            if (imagePath.startsWith(`${componentFolder}/`) && imagePath.includes(pattern)) {
              console.log(`  ✅ Found numbered match: ${imagePath}`);
              return uploadedImages[imagePath];
            }
          }
        }
      }
    }
    
    // Just find any image in the component folder
    for (const imagePath in uploadedImages) {
      if (imagePath.startsWith(`${componentFolder}/`)) {
        console.log(`  ⚠️ Found folder fallback: ${imagePath}`);
        return uploadedImages[imagePath];
      }
    }
  }
  
  // Last resort: return any image
  const firstImage = Object.values(uploadedImages)[0];
  if (firstImage) {
    console.log(`  ❗ Using fallback image`);
    return firstImage;
  }
  
  console.log(`  ❌ No image found for ${field}`);
  return null;
}

/**
 * Get folder name from component type
 * 
 * @param {string} componentType - The component type string (e.g. 'hero-component.hero-component')
 * @returns {string|null} - The folder name or null if not found
 */
function getComponentFolder(componentType) {
  if (!componentType) return null;
  
  // Extract the main part of the component name
  const mainComponent = componentType.split('.')[0];
  
  // Map component names to folder names
  const folderMap = {
    'hero-component': 'hero',
    'about': 'about',
    'why-choose': 'why-choose-us',
    'let-us-help-you': 'let-us-help-you',
    'featured-section': 'featured',
    'services': 'services',
    'goals': 'goals',
    'map': 'map',
    'last-section': 'last-section',
    'consultation': 'consultation',
    'teams-part': 'teams-part',
    'team': 'teams-part'
  };
  
  return folderMap[mainComponent] || null;
}

/**
 * Update data with image URLs recursively
 * 
 * @param {*} obj - The object to update
 * @param {string} currentComponent - The current component context
 * @returns {number} - Number of updates made
 */
function updateDataWithImages(obj, currentComponent = null) {
  let updateCount = 0;
  
  if (!obj || typeof obj !== 'object') {
    return updateCount;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      updateCount += updateDataWithImages(obj[i], currentComponent);
    }
    return updateCount;
  }
  
  // Check if this is a component object
  if (obj.__component && typeof obj.__component === 'string') {
    currentComponent = obj.__component;
    console.log(`\nProcessing component: ${currentComponent}`);
  }
  
  // Process each property
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    const value = obj[key];
    
    // Skip image fields in services.services section component
    if (currentComponent === 'services.services' && key === 'section') {
      console.log(`Skipping image fields for services.services section as requested`);
      // Still process any other nested objects and arrays in 'section'
      if (value && typeof value === 'object') {
        // Just recurse but don't update any image fields
        updateCount += updateDataWithImages(value, 'services.services.section');
      }
      continue;
    }
    
    // Skip image processing for the specially marked services.services.section component
    if (currentComponent === 'services.services.section' && isImageField(key)) {
      console.log(`Skipping image field '${key}' in services section`);
      continue;
    }
    
    // Image field detection
    if (isImageField(key) && currentComponent) {
      // Image object with URL - needs updating
      if (value && typeof value === 'object' && value.url) {
        // Find matching image
        const matchedImage = findMatchingImage(key, currentComponent, uploadedImages);
        
        if (matchedImage) {
          // Update the image object
          obj[key] = {
            url: matchedImage.url,
            id: matchedImage.id,
            width: matchedImage.width,
            height: matchedImage.height,
            formats: matchedImage.formats
          };
          updateCount++;
          console.log(`Updated image field: ${key}`);
        }
      }
      // Empty image field (null or empty string)
      else if (value === null || value === '') {
        const matchedImage = findMatchingImage(key, currentComponent, uploadedImages);
        
        if (matchedImage) {
          obj[key] = {
            url: matchedImage.url,
            id: matchedImage.id,
            width: matchedImage.width,
            height: matchedImage.height,
            formats: matchedImage.formats
          };
          updateCount++;
          console.log(`Added image to empty field: ${key}`);
        }
      }
    }
    
    // Recurse into nested objects and arrays
    if (value && typeof value === 'object') {
      updateCount += updateDataWithImages(value, currentComponent);
    }
  }
  
  return updateCount;
}

/**
 * Check if a field name represents an image
 * 
 * @param {string} fieldName - The name of the field
 * @returns {boolean} - True if it's likely an image field
 */
function isImageField(fieldName) {
  const imagePatterns = [
    /img(\d+)?$/i,
    /image(\d+)?$/i,
    /icon(\d+)?$/i,
    /photo(\d+)?$/i,
    /avatar$/i,
    /background$/i,
    /backgorund$/i, // Common typo in the data
    /logo$/i,
    /banner$/i,
    /thumbnail$/i,
    /member(\w+)img$/i
  ];
  
  return imagePatterns.some(pattern => pattern.test(fieldName));
}

// Start the update process
console.log('\n=== Starting data update process ===');
const updateCount = updateDataWithImages(data);

// Save the updated data
if (updateCount > 0) {
  console.log(`\n✅ Successfully updated ${updateCount} image references in data.json`);
  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2));
  console.log(`\nUpdated data saved to: ${dataJsonPath}`);
  console.log(`Original data backed up to: ${backupPath}`);
  console.log('\nNext step: Run insert_data.js to upload the data to Strapi.');
} else {
  console.log('\n⚠️ No image references were updated.');
} 