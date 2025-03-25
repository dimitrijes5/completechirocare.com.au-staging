# Content Generation Scripts

This directory contains scripts for generating and uploading content to the Strapi backend.

## Overview

These scripts help you:
1. Upload images to Strapi Media Library
2. Update your data with the uploaded image references
3. Insert content into Strapi

## Prerequisites

- Node.js installed
- Strapi backend running (local or remote)
- Environment variables configured in `.env` file

## Environment Setup

Create a `.env` file with:

```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
```

## Directory Structure

```
generation/
├── data_and_images/
│   ├── images/            # Directory containing images to upload
│   ├── data.json          # The data to be uploaded
│   ├── data.json.backup   # Backup of original data.json
│   ├── uploaded_images.json # Metadata about uploaded images
│   ├── update_data_with_images.js # Script for updating data.json with image references
│   └── upload_images.js   # Script for uploading images to Strapi
├── insert_data.js         # Script for inserting data into Strapi
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Installation

```bash
cd generation
npm install
```

## Usage

### 1. Organizing Images

Place your images in the appropriate folders under `data_and_images/images/` based on which component they belong to.

For example:
- Team member images go in `data_and_images/images/teams-part/` with names like `member1.jpg`, `member2.jpg`, etc.
- Hero background image goes in `data_and_images/images/hero/` with a name like `hero.jpg`

Name your images according to their content and ensure they match the structure expected by the `update_data_with_images.js` script.

### 2. Uploading Images

```bash
node data_and_images/upload_images.js
```

This will:
- Upload all images from the `data_and_images/images/` directory to Strapi media library
- Save metadata about the uploaded images to `data_and_images/uploaded_images.json`

### 3. Updating Data with Image References

```bash
node data_and_images/update_data_with_images.js
```

This will:
- Create a backup of your original `data_and_images/data.json` as `data_and_images/data.json.backup`
- Update image references in `data_and_images/data.json` with the uploaded image URLs

### 4. Inserting Data into Strapi

```bash
node insert_data.js
```

This will:
- Insert the data from `data_and_images/data.json` into Strapi
- Create all necessary content types and relationships

## Troubleshooting

### Image Upload Issues

- Check your network connection and Strapi server status
- Verify that your API token has permission to upload media
- Try uploading one image at a time to identify problematic files

### Data Insertion Issues

- Make sure your data structure matches the Strapi content types
- Check the Strapi logs for more detailed error messages
- Verify that your API token has correct permissions

## Workflow Example

1. Organize your images in the `data_and_images/images/` directory according to the component structure
2. Run `node data_and_images/upload_images.js` to upload images to Strapi
3. Run `node data_and_images/update_data_with_images.js` to update your data.json with the image URLs
4. Run `node insert_data.js` to insert the data into Strapi
5. Verify the content in your Strapi admin panel

## Tips

- Always make sure your Strapi server is running before executing scripts
- Check the `data_and_images/uploaded_images.json` file to see what images were successfully uploaded
- If you need to start over, delete the media from Strapi admin panel first