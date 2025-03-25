# Approach Pages Scraper and Inserter

This directory contains scripts to:
1. Scrape approach pages from the Complete Chirocare website
2. Insert the scraped data into the Strapi backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the parent directory's `.env` file contains valid Strapi API credentials:
```
TOKEN=your_strapi_admin_api_token
URL=your_strapi_backend_url
```

## Usage

### 1. Scrape Approach Pages

```bash
npm run scrape
```

This will:
- Fetch the main approach page at https://www.completechirocare.com.au/our-approach/
- Extract links to all individual approach pages
- Scrape each approach page to extract:
  - The H1 title
  - Content paragraphs from the div with class "prose prose-sm md:prose max-w-none"
  - Preserve formatting including strong/bold text
  - The URL slug
- Save the data to `data_approach.json` in this directory

### 2. Insert Data into Strapi

After scraping (or if you already have a valid `data_approach.json` file):

```bash
npm run insert
```

This will:
- Read the approach page data from `data_approach.json`
- Process the data to make it compatible with Strapi
- Insert each approach page into the Strapi backend

## Content Extraction Details

The scraper specifically looks for:
1. The div with class "prose prose-sm md:prose max-w-none"
2. All paragraph elements within that div
3. For each paragraph, it preserves both regular text and text in <strong> tags (marked as bold)

If the script can't find the specific div class, it falls back to looking for paragraphs after the H1 title.

## Notes

- The scraper sets placeholder values for FeaturedImage. You may need to update these with actual image IDs after uploading images to Strapi.
- The content extraction logic specifically targets the "prose prose-sm md:prose max-w-none" div class. If the HTML structure changes, you may need to update the selectors.
- Text formatting (bold from <strong> tags) is preserved in the content blocks. 