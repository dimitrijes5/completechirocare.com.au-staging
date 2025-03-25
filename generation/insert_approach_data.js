const fs = require("fs");
// Load environment variables from .env file
require("dotenv").config();

// Use environment variables instead of hardcoded values
const ADMIN_API_TOKEN = process.env.TOKEN;
const STRAPI_URL = process.env.URL;

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
 * Check if an approach page with the given slug already exists
 * @param {string} slug - The slug to check
 * @returns {Promise<{exists: boolean, id: number|null}>} - Whether the page exists and its ID if it does
 */
async function checkApproachPageExists(slug) {
  try {
    console.log(`Checking if approach page with slug "${slug}" exists...`);
    
    // URL encode the slug to handle special characters
    const encodedSlug = encodeURIComponent(slug);
    const url = `${STRAPI_URL}/api/approach-pages?filters[Slug][$eq]=${encodedSlug}`;
    
    console.log(`Querying: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      }
    });

    if (!response.ok) {
      console.error(`Error checking if page exists: ${response.status} ${response.statusText}`);
      return { exists: false, id: null };
    }

    const data = await response.json();
    console.log(`Found ${data.data ? data.data.length : 0} pages with slug "${slug}"`);
    
    if (data.data && data.data.length > 0) {
      const id = data.data[0].id;
      console.log(`Found existing page with ID: ${id}`);
      console.log(`Page data:`, JSON.stringify(data.data[0], null, 2));
      return { exists: true, id };
    }
    
    return { exists: false, id: null };
  } catch (error) {
    console.error("Error checking if page exists:", error);
    return { exists: false, id: null };
  }
}

/**
 * Create a new approach page in Strapi
 */
async function createApproachPage(pageData) {
  const processedData = processDataForStrapi(pageData);
  
  try {
    console.log(`Creating new approach page with slug "${pageData.Slug}"...`);
    
    const response = await fetch(`${STRAPI_URL}/api/approach-pages`, {
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
      
      // If we get a duplicate error, let's try to find the existing page and update it
      if (response.status === 400 && responseText.includes("unique")) {
        console.log("Detected unique constraint error, falling back to update...");
        
        // Try to check if page exists again and get its ID
        const { exists, id } = await checkApproachPageExists(pageData.Slug);
        
        if (exists && id) {
          return await updateApproachPage(id, pageData);
        }
      }
      
      throw new Error(`Failed to create approach page: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`Approach page created successfully!`);
      return result;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Update an existing approach page in Strapi
 */
async function updateApproachPage(id, pageData) {
  const processedData = processDataForStrapi(pageData);
  
  try {
    console.log(`Updating approach page with ID ${id}...`);
    
    const url = `${STRAPI_URL}/api/approach-pages/${id}`;
    console.log(`Using URL: ${url}`);
    
    const response = await fetch(url, {
      method: "PUT",
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
      throw new Error(`Failed to update approach page: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`Approach page updated successfully!`);
      return result;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Process approach pages - create or update as needed
 */
async function processApproachPage(pageData) {
  try {
    // First, check if a page with this slug already exists
    const { exists, id } = await checkApproachPageExists(pageData.Slug);
    
    if (exists && id) {
      // Update the existing page
      return await updateApproachPage(id, pageData);
    } else {
      // Create a new page
      return await createApproachPage(pageData);
    }
  } catch (error) {
    console.error(`Error processing page with slug "${pageData.Slug}":`, error);
    throw error;
  }
}

/**
 * Process multiple approach pages
 */
async function processApproachPages(pages) {
  console.log(`Processing ${pages.length} approach pages...`);
  const results = [];
  
  for (const page of pages) {
    try {
      const result = await processApproachPage(page);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process page with slug "${page.Slug}". Continuing with next page.`);
      // Continue with other pages instead of stopping the whole process
    }
  }
  
  return results;
}

/**
 * Main execution
 */
(async () => {
  try {
    // Read approach page data from JSON file
    console.log("Reading approach page data from data_approach.json...");
    const dataFilePath = "approach-pages/data_approach.json";
    
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Error: ${dataFilePath} does not exist. Make sure the file is in the correct location.`);
      process.exit(1);
    }
    
    const approachPagesToProcess = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    
    if (!Array.isArray(approachPagesToProcess)) {
      console.error("Error: data_approach.json should contain an array of approach page objects.");
      process.exit(1);
    }
    
    console.log(`Found ${approachPagesToProcess.length} approach pages to process.`);
    
    // Process the approach pages
    const results = await processApproachPages(approachPagesToProcess);
    
    console.log(`Successfully processed ${results.length} out of ${approachPagesToProcess.length} approach pages.`);
    
  } catch (error) {
    console.error("Failed to process approach pages:", error);
    process.exit(1);
  }
})(); 