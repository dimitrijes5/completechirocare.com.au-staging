const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for the approach pages
const BASE_URL = 'https://www.completechirocare.com.au/our-approach/';

/**
 * Fetches the HTML content of a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - HTML content
 */
async function fetchHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Extracts the approach page URLs from the main approach page
 * @param {string} html - HTML content of the main approach page
 * @returns {Array<string>} - List of approach page URLs
 */
function extractApproachPageUrls(html) {
  const $ = cheerio.load(html);
  const pageUrls = [];
  
  // Find all links in the navigation menu that contain "our-approach/"
  $('a[href*="our-approach/"]').each((_, element) => {
    const href = $(element).attr('href');
    // Exclude the main approach page and ensure it's a specific approach page
    if (href && href !== 'https://www.completechirocare.com.au/our-approach/' && 
        href !== '/our-approach/' && href.includes('our-approach/')) {
      
      // Make sure we have the full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.completechirocare.com.au${href.startsWith('/') ? '' : '/'}${href}`;
      
      // Avoid duplicates
      if (!pageUrls.includes(fullUrl)) {
        pageUrls.push(fullUrl);
      }
    }
  });
  
  return pageUrls;
}

/**
 * Process a paragraph and its children to create a paragraph block with formatted text
 * @param {cheerio.Cheerio} $paragraph - The paragraph element
 * @returns {Object} - A paragraph block with formatted text
 */
function processParagraph($, element) {
  const children = [];
  
  // Process each node in the paragraph
  $(element).contents().each((_, node) => {
    // If it's a text node, add it as is
    if (node.type === 'text') {
      const text = $(node).text().trim();
      if (text) {
        children.push({
          type: "text",
          text: text
        });
      }
    } 
    // If it's a <strong> element, add it with bold formatting
    else if (node.name === 'strong') {
      const text = $(node).text().trim();
      if (text) {
        children.push({
          type: "text",
          text: text,
          bold: true
        });
      }
    } 
    // Handle other elements recursively if needed
    else if (node.type === 'tag') {
      // Process other types of formatting like em, a, etc. if needed
      const text = $(node).text().trim();
      if (text) {
        children.push({
          type: "text",
          text: text
        });
      }
    }
  });
  
  return {
    type: "paragraph",
    children: children
  };
}

/**
 * Extracts content from an approach page
 * @param {string} html - HTML content of an approach page
 * @param {string} url - URL of the approach page
 * @returns {Object} - Page data including title, content, and slug
 */
function extractPageContent(html, url) {
  const $ = cheerio.load(html);
  
  // Extract the H1 title
  const title = $('h1').first().text().trim();
  
  // Extract the content paragraphs from the specific div class
  const contentBlocks = [];
  
  // Find the main content div with the specific class
  const contentDiv = $('.prose.prose-sm.md\\:prose.max-w-none');
  
  if (contentDiv.length > 0) {
    // Process all paragraphs within the content div
    contentDiv.find('p').each((_, element) => {
      const paragraphBlock = processParagraph($, element);
      if (paragraphBlock.children.length > 0) {
        contentBlocks.push(paragraphBlock);
      }
    });
  } else {
    console.warn(`No content div found with class "prose prose-sm md:prose max-w-none" for page: ${url}`);
    
    // Fallback: try to find paragraphs after the h1
    $('h1').first().nextAll('p').each((_, element) => {
      const paragraphBlock = processParagraph($, element);
      if (paragraphBlock.children.length > 0) {
        contentBlocks.push(paragraphBlock);
      }
    });
  }
  
  // If still no content found, log a warning
  if (contentBlocks.length === 0) {
    console.warn(`No paragraphs found for page: ${url}`);
  }
  
  // Extract slug from URL
  const urlPath = new URL(url).pathname;
  const slug = urlPath.split('/our-approach/')[1].replace(/\/$/, '');
  
  return {
    Title: title,
    Slug: slug,
    Content: contentBlocks,
    // Using a placeholder for FeaturedImage
    FeaturedImage: {
      id: 1, // This will need to be updated with actual image IDs
      url: "/uploads/placeholder.jpg"
    }
  };
}

/**
 * Main function to scrape all approach pages
 */
async function scrapeApproachPages() {
  try {
    console.log('Starting to scrape approach pages...');
    
    // Fetch the main approach page
    const mainPageHtml = await fetchHtml(BASE_URL);
    if (!mainPageHtml) {
      throw new Error('Failed to fetch the main approach page');
    }
    
    // Extract all approach page URLs
    const approachPageUrls = extractApproachPageUrls(mainPageHtml);
    console.log(`Found ${approachPageUrls.length} approach pages to scrape`);
    
    // Scrape each approach page
    const approachPagesData = [];
    for (const url of approachPageUrls) {
      console.log(`Scraping ${url}...`);
      const html = await fetchHtml(url);
      
      if (html) {
        const pageData = extractPageContent(html, url);
        approachPagesData.push(pageData);
        console.log(`Successfully scraped: ${pageData.Title}`);
      }
    }
    
    // Save the data to JSON file
    const outputPath = path.join(__dirname, 'data_approach.json');
    fs.writeFileSync(outputPath, JSON.stringify(approachPagesData, null, 2));
    
    console.log(`Saved ${approachPagesData.length} approach pages to ${outputPath}`);
    return approachPagesData;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  }
}

// Execute the script
(async () => {
  try {
    await scrapeApproachPages();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
})(); 