const ADMIN_API_TOKEN = "4572351f60f82cf89a1879b9b60cc925fe8d543affd5cbab68db1f7df4a423e8e3c2bdc5ad4f5c29167abc132bbf889e2fe027575483eb527a07959e176fc4afb43e915f4ce7806cc2e18956fad7ed1b52e7a2cc41f4a304579fdf604ba5119e26543037b99b58e01721b2d9bd2f26f8695588307db3d8790afa2cf9b927f69a";
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
    const pagesToInsert = [
      {
        Contact: [
          {
            __component: "contact-page.contact-page",
            PageTitle: "Location 1",
            mapTitle: "Map for Location 1",
            adress: "1234 Main St",
            phone: "555-1234",
            email: "contact@example.com",
            Submitbtn: "Contact Us"
          }
        ]
      },
      {
        Contact: [
          {
            __component: "contact-page.contact-page",
            PageTitle: "Location 2",
            mapTitle: "Map for Location 2",
            adress: "5678 Elm St",
            phone: "555-5678",
            email: "contact2@example.com",
            Submitbtn: "Contact Us"
          }
        ]
      }
    ];
  
    try {
      // Insert the pages
      const results = await insertPages(pagesToInsert);
      console.log("All pages inserted successfully!");
      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      console.error("Failed to insert pages:", error);
    }
  })();