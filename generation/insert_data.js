const fs = require("fs");

const ADMIN_API_TOKEN = "0cf6e4a98098d8d76bc11c497ad0243fd211c12ef1f5fa3b4f16bf07c4af1588b01da7c45931779570170e029b29f097347f0fd59b44a15ded963cfca985de5c5a889ae60728b98c347b9da5a597fe2ee5722bb5312c649eadcc16b28af3c9f0e4d66177e412e32f8dad02f56f0f30b18171c5fc0a2f163dc31536a2e15fb942";
const STRAPI_URL = "http://localhost:1337";

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