const ADMIN_API_TOKEN = "4572351f60f82cf89a1879b9b60cc925fe8d543affd5cbab68db1f7df4a423e8e3c2bdc5ad4f5c29167abc132bbf889e2fe027575483eb527a07959e176fc4afb43e915f4ce7806cc2e18956fad7ed1b52e7a2cc41f4a304579fdf604ba5119e26543037b99b58e01721b2d9bd2f26f8695588307db3d8790afa2cf9b927f69a";
const STRAPI_URL = "http://localhost:1337";

/**
 * Create a single page in Strapi
 */
async function createPage(pageData) {
    try {
      // Adjust "/pages" to match your actual endpoint (e.g., "/approach-pages" if needed)
      const response = await fetch(`${STRAPI_URL}/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_API_TOKEN}`,
        },
        body: JSON.stringify({ data: pageData }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create page: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("Page created:", result);
    } catch (error) {
      console.error(error);
    }
  }
  
  /**
   * Insert multiple pages from an array of data
   */
  async function insertPages(pages) {
    for (const page of pages) {
      await createPage(page);
    }
  }
  
  /**
   * Example usage
   */
  (async () => {
    // Example data array. Replace with real data or load from a JSON file.
    const pagesToInsert = [
      {
        PageTitle: "Location 1",
        SubTitle: "Subtitle for Location 1",
        Img: "https://example.com/image1.jpg",
        mapTitle: "Map for Location 1",
        address: "1234 Main St",
        phone: "555-1234",
        email: "contact@example.com",
      },
      {
        PageTitle: "Location 2",
        SubTitle: "Subtitle for Location 2",
        Img: "https://example.com/image2.jpg",
        mapTitle: "Map for Location 2",
        address: "5678 Elm St",
        phone: "555-5678",
        email: "contact2@example.com",
      },
    ];
  
    // Insert the pages
    await insertPages(pagesToInsert);
  
    console.log("All pages inserted successfully!");
  })();