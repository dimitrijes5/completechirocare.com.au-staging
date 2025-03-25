const fs = require("fs");
// Load environment variables from .env file
require("dotenv").config();

// Use environment variables instead of hardcoded values
const ADMIN_API_TOKEN = process.env.REAL_TOKEN;
const STRAPI_URL = process.env.REAL_URL;

/**
 * Process data to make it Strapi-compatible
 * This function will clean up the data before sending it to Strapi
 */
function processDataForStrapi(data) {
  // Function to recursively process objects and arrays
  function processItem(item) {
    if (!item || typeof item !== 'object') return item;
    
    // Handle arrays
    if (Array.isArray(item)) {
      return item.map(processItem);
    }
    
    // Create a new object to hold the processed properties
    const processed = {};
    
    // Process each property
    for (const [key, value] of Object.entries(item)) {
      // Skip problematic keys
      if (key === 'id' && typeof value === 'number') {
        // Convert image reference to Strapi media format - just use the ID
        processed.id = value;
      } 
      // For image objects with url, id, etc.
      else if (value && typeof value === 'object' && !Array.isArray(value) && value.url && value.id) {
        processed[key] = value.id; // Just use the ID for the relationship
      } 
      // For other objects or arrays, recursively process them
      else if (value && typeof value === 'object') {
        processed[key] = processItem(value);
      } 
      // For primitive values, copy them as-is
      else {
        processed[key] = value;
      }
    }
    
    return processed;
  }
  
  return processItem(data);
}

/**
 * Create a single page in Strapi
 */
async function createPage(pageData) {
  // Process the page data to make it compatible with Strapi
  const processedData = processDataForStrapi(pageData);
  
  try {
    console.log("Sending data to Strapi:", JSON.stringify({ data: processedData }, null, 2).substring(0, 500) + "...");
    
    const response = await fetch(`${STRAPI_URL}/api/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({ data: processedData }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Error response status: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      throw new Error(`Failed to create page: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log("Page created:", JSON.stringify(result, null, 2).substring(0, 500) + "...");
      return result;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse creation response');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Insert multiple pages from an array of data
 */
async function insertPages(pages) {
  console.log("Inserting pages:", JSON.stringify(pages, null, 2));
  const results = [];
  for (const page of pages) {
    const result = await createPage(page);
    results.push(result);
  }
  return results;
}

/**
 * Example usage
 */
(async () => {
  // Example data array structured according to Strapi schema
  const pagesToInsert = JSON.parse(fs.readFileSync("data_and_images/data.json", "utf8"));

  try {
    // Insert the pages
    const results = await insertPages(pagesToInsert);
    console.log("All pages inserted successfully!");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Failed to insert pages:", error);
  }
})();