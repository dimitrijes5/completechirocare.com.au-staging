# Blog Posts Scraper and Inserter

This directory contains scripts to:
1. Scrape blog posts from the Complete Chirocare website
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

### 1. Scrape Blog Posts

```bash
npm run scrape
```

This will:
- Fetch the main blog page at https://www.completechirocare.com.au/blog/
- Extract links to all blog posts (including pagination)
- Scrape each blog post to extract:
  - The title from `h1` with class `text-3xl md:text-5xl capitalize font-medium mb-6 md:mb-8`
  - The publication date from the first `p` with class `text-gray-600 mb-4`
  - Content paragraphs from the `div` with class `prose prose-sm md:prose max-w-none`
  - Featured image (if available)
  - The URL slug from the post URL
- Save all the scraped data to `blog_data.json` in this directory

The script is configured to scrape all blog posts found on the website.

### 2. Insert Data into Strapi

After the data has been scraped and saved to `blog_data.json`:

```bash
npm run insert
```

This will:
- Read the blog post data from `blog_data.json`
- Process the data to make it compatible with Strapi
- Insert or update each blog post in the Strapi backend using the `/api/posts` endpoint (matching the frontend)

## Data Structure

The scraped blog posts follow this structure:

```json
[
  {
    "Title": "Blog Post Title",
    "Slug": "blog-post-slug",
    "Content": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Regular text"
          },
          {
            "type": "text",
            "text": "Bold text",
            "bold": true
          }
        ]
      }
    ],
    "PublishDate": "January 1, 2023",
    "FeaturedImage": {
      "id": null,
      "url": "/uploads/image.jpg"
    }
  }
]
```

## Frontend Integration

The insert script uses the same API endpoint (`/api/posts`) as the frontend to ensure compatibility. The frontend retrieves blog posts using:

```javascript
const response = await fetch(`${baseUrl}/api/posts?filters[Slug][$eq]=${slug}&populate=*`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Notes

- The scraper specifically targets HTML elements with the exact classes as defined on the Complete Chirocare website.
- The FeaturedImage IDs are set to `null` and will need to be updated with actual image IDs from your Strapi media library after uploading the images.
- The script is designed to be resilient - if one blog post fails, it will continue processing the others.
- Slug conflicts are handled automatically - if a blog post with the same slug already exists, it will be updated instead of creating a duplicate. 