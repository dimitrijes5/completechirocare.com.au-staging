const fs = require("fs");
// Load environment variables from .env file
require("dotenv").config();

// Use environment variables instead of hardcoded values
const ADMIN_API_TOKEN = process.env.TOKEN;
const STRAPI_URL = process.env.URL;

/**
 * Create a single page in Strapi
 */
async function createPage(pageData) {
    try {
      const response = await fetch(`${STRAPI_URL}/api/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_API_TOKEN}`,
        },
        body: JSON.stringify({ data: pageData }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create page: ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`);
      }
  
      const result = await response.json();
      console.log("Page created:", result);
      return result;
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
    const pagesToInsert = JSON.parse(fs.readFileSync("data.json", "utf8"));
  
    try {
      // Insert the pages
      const results = await insertPages(pagesToInsert);
      console.log("All pages inserted successfully!");
      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      console.error("Failed to insert pages:", error);
    }
  })();