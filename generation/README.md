# Strapi Content Generation Scripts

This directory contains scripts to help upload images and content to a Strapi CMS instance.

## Setup

1. Make sure you have installed the dependencies:

```bash
npm install
```

2. Ensure your `.env` file is properly configured with:
   - `URL`: The URL of your Strapi instance (e.g., `http://localhost:1337`)
   - `TOKEN`: Your Strapi admin API token

## Scripts

### 1. Upload Images

This script will upload all images found in the `images` directory to Strapi's media library:

```bash
npm run upload-images
```

The script will:
- Recursively search for images in the `images` directory
- Upload each image to Strapi's media library
- Save the results to `uploaded_images.json`

### 2. Update Data with Image URLs

After uploading images, you can update your `data.json` file with the URLs of the uploaded images:

```bash
npm run update-data
```

This script will:
- Read the uploaded image data from `uploaded_images.json`
- Update image references in `data.json` with the appropriate Strapi URLs
- Save the updated data back to `data.json`

### 3. Insert Data

Finally, you can insert the data into Strapi:

```bash
npm run insert-data
```

This script will:
- Read the updated `data.json` file
- Upload the content to your Strapi instance

## Complete Workflow

To fully populate your Strapi instance with images and content:

1. Organize your images in the `images` directory
2. Prepare your data in `data.json`
3. Run `npm run upload-images` to upload all images
4. Run `npm run update-data` to update your data.json with image URLs
5. Run `npm run insert-data` to insert the data into Strapi

## Troubleshooting

- If you encounter issues with image uploads, check your Strapi permissions
- Ensure your Strapi token has the necessary permissions
- Check that your Strapi instance is running and accessible at the URL in your `.env` file 