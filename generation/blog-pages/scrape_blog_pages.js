const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Base URL for the blog pages
const BASE_URL = 'https://www.completechirocare.com.au/blog/';

/**
 * Fetches the HTML content of a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - HTML content
 */
async function fetchHtml(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Extracts the blog post URLs from the main blog page and pagination
 * @param {string} html - HTML content of the blog page
 * @param {string} baseUrl - Base URL of the blog
 * @returns {Promise<Array<string>>} - List of blog post URLs
 */
async function extractBlogPostUrls(html, baseUrl) {
  const $ = cheerio.load(html);
  const postUrls = new Set();
  
  // Find all blog post links on the current page
  $('a[href*="/blog/"]').each((_, element) => {
    const href = $(element).attr('href');
    
    // Ensure it's a blog post link, not just a link to the blog main page
    if (href && href !== baseUrl && !href.includes('page=') && href.includes('/blog/')) {
      // Make sure we have the full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.completechirocare.com.au${href.startsWith('/') ? '' : '/'}${href}`;
      
      postUrls.add(fullUrl);
    }
  });
  
  // Check for pagination and scrape other pages
  const paginationLinks = [];
  $('a[href*="page="]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && href.includes('page=')) {
      paginationLinks.push(href);
    }
  });
  
  // If there are pagination links, fetch each page and extract post URLs
  if (paginationLinks.length > 0) {
    console.log(`Found ${paginationLinks.length} pagination links`);
    
    for (const pageLink of paginationLinks) {
      const pageUrl = pageLink.startsWith('http') ? pageLink : `https://www.completechirocare.com.au${pageLink.startsWith('/') ? '' : '/'}${pageLink}`;
      const pageHtml = await fetchHtml(pageUrl);
      
      if (pageHtml) {
        const $page = cheerio.load(pageHtml);
        
        $page('a[href*="/blog/"]').each((_, element) => {
          const href = $page(element).attr('href');
          
          if (href && href !== baseUrl && !href.includes('page=') && href.includes('/blog/')) {
            const fullUrl = href.startsWith('http') ? href : `https://www.completechirocare.com.au${href.startsWith('/') ? '' : '/'}${href}`;
            postUrls.add(fullUrl);
          }
        });
      }
    }
  }
  
  return Array.from(postUrls);
}

/**
 * Convert various date formats to the required yyyy-MM-dd format
 * @param {string} dateStr - Date string in various formats
 * @returns {string} - Date in yyyy-MM-dd format
 */
function convertToStandardDateFormat(dateStr) {
  if (!dateStr) return '';
  
  // Try to parse the date string
  const datePatterns = [
    // Month DD, YYYY (e.g., "January 1, 2023")
    {
      regex: /([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/,
      converter: (match) => {
        const months = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
          'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        const month = months[match[1].toLowerCase()];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    },
    // DD Month YYYY (e.g., "1 January 2023")
    {
      regex: /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
      converter: (match) => {
        const months = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
          'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        const day = match[1].padStart(2, '0');
        const month = months[match[2].toLowerCase()];
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    },
    // MM/DD/YYYY or DD/MM/YYYY
    {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      converter: (match) => {
        // Assuming DD/MM/YYYY format
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    }
  ];
  
  for (const pattern of datePatterns) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      return pattern.converter(match);
    }
  }
  
  // If no pattern matches, fallback to current date
  console.warn(`Could not parse date: "${dateStr}". Using current date as fallback.`);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Process a paragraph and its children to create a paragraph block with formatted text
 * @param {cheerio.CheerioAPI} $ - Cheerio API
 * @param {cheerio.Element} element - The paragraph element
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
    else if (node.name === 'strong' || node.name === 'b') {
      const text = $(node).text().trim();
      if (text) {
        children.push({
          type: "text",
          text: text,
          bold: true
        });
      }
    } 
    // If it's an <em> or <i> element, add it with italic formatting
    else if (node.name === 'em' || node.name === 'i') {
      const text = $(node).text().trim();
      if (text) {
        children.push({
          type: "text",
          text: text,
          italic: true
        });
      }
    }
    // Handle other elements recursively if needed
    else if (node.type === 'tag') {
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
 * Extracts content from a blog post
 * @param {string} html - HTML content of a blog post
 * @param {string} url - URL of the blog post
 * @returns {Object} - Post data including title, content, date, and slug
 */
function extractBlogPostContent(html, url) {
  const $ = cheerio.load(html);
  
  // 1. Extract the title from h1 with specific class
  const title = $('h1.text-3xl.md\\:text-5xl.capitalize.font-medium.mb-6.md\\:mb-8').first().text().trim();
  console.log(`Found title: ${title}`);
  
  // 2. Extract the date from the first p with specific class
  const rawDate = $('p.text-gray-600.mb-4').first().text().trim();
  console.log(`Found raw date: ${rawDate}`);
  
  // Convert date to yyyy-MM-dd format
  const formattedDate = convertToStandardDateFormat(rawDate);
  console.log(`Converted date to: ${formattedDate}`);
  
  // 3. Extract the content paragraphs from div with specific class
  const contentBlocks = [];
  const contentDiv = $('.prose.prose-sm.md\\:prose.max-w-none');
  
  if (contentDiv.length > 0) {
    console.log('Found content div with specified class');
    
    // Process all paragraphs within the content div
    contentDiv.find('p').each((_, element) => {
      const paragraphBlock = processParagraph($, element);
      if (paragraphBlock.children.length > 0) {
        contentBlocks.push(paragraphBlock);
      }
    });
    
    console.log(`Extracted ${contentBlocks.length} paragraphs from content div`);
  } else {
    console.warn(`No content div found with class "prose prose-sm md:prose max-w-none" for blog post: ${url}`);
    
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
    console.warn(`No paragraphs found for blog post: ${url}`);
  }
  
  // Extract slug from URL
  const urlPath = new URL(url).pathname;
  const slug = urlPath.split('/blog/')[1].replace(/\/$/, '');
  
  return {
    Title: title,
    Slug: slug,
    Content: contentBlocks,
    date: formattedDate
  };
}

/**
 * Main function to scrape all blog posts
 */
async function scrapeBlogPosts() {
  try {
    console.log('Starting to scrape blog posts...');
    
    // Fetch the main blog page
    const mainPageHtml = await fetchHtml(BASE_URL);
    if (!mainPageHtml) {
      throw new Error('Failed to fetch the main blog page');
    }
    
    // Extract all blog post URLs (including pagination)
    const blogPostUrls = await extractBlogPostUrls(mainPageHtml, BASE_URL);
    console.log(`Found ${blogPostUrls.length} blog posts to scrape`);
    
    // Scrape each blog post
    const blogPostsData = [];
    
    // Remove the limit for production use
    for (const url of blogPostUrls) {
      console.log(`Scraping ${url}...`);
      const html = await fetchHtml(url);
      
      if (html) {
        const postData = extractBlogPostContent(html, url);
        blogPostsData.push(postData);
        console.log(`Successfully scraped: ${postData.Title}`);
      }
    }
    
    // Write data to file for insertion
    console.log(`Scraped ${blogPostsData.length} blog posts successfully.`);
    const outputPath = path.join(__dirname, 'blog_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(blogPostsData, null, 2));
    console.log(`Data saved to ${outputPath}`);
    
    // Print a sample of the first post
    if (blogPostsData.length > 0) {
      console.log('Sample of first post title and date:', {
        Title: blogPostsData[0].Title,
        date: blogPostsData[0].date,
        ContentParagraphs: blogPostsData[0].Content.length
      });
    }
    
    return blogPostsData;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  }
}

// Execute the script
(async () => {
  try {
    await scrapeBlogPosts();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
})(); 