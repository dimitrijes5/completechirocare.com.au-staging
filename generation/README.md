# Strapi Data Generation and Upload Scripts

This directory contains scripts for generating, updating, and uploading data to a Strapi instance, including handling media uploads.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Strapi credentials:
   ```
   TOKEN=your_strapi_admin_token
   URL=http://your-strapi-instance.com
   ```

## Directory Structure

The scripts expect the following directory structure for images:

```
generation/
├── images/
│   ├── hero/               # Hero component images
│   ├── about/              # About component images
│   ├── services/           # Services component images
│   ├── teams-part/         # Team members images
│   ├── featured/           # Featured section images
│   ├── goals/              # Goals section images
│   ├── why-choose-us/      # Why choose us section images
│   ├── let-us-help-you/    # Help section images
│   ├── map/                # Map section images
│   ├── last-section/       # Last section images
│   └── consultation/       # Consultation section images
├── upload_images.js        # Script for uploading images to Strapi
├── update_data_with_images.js # Script for updating data.json with image references
├── insert_data.js          # Script for inserting data into Strapi
└── data.json               # The data to be uploaded
```

## Component to Image Mapping

The scripts use the following mapping between components and image fields:

| Component | Field Name | Image Folder | Image Pattern |
|-----------|------------|--------------|---------------|
| hero-component | background | hero | hero |
| about | img1, img2, img3 | about | about1, about2, about3 |
| why-choose | firstIcon, secondIcon, ThirdIcon | why-choose-us | image1, image2, image3 |
| let-us-help-you | img | let-us-help-you | help |
| featured-section | img1, img2, img3, img4 | featured | img1, img2, img3, img4 |
| services | section.img | services | service |
| goals | img1, img2, img3 | goals | img1, img2, img3 |
| map | backgorund | map | map |
| last-section | img | last-section | image |
| consultation | img | consultation | consultation |
| teams-part | memberOneImg, memberTwoImg, etc. | teams-part | member1, member2, etc. |

## Usage

### 1. Prepare Your Images

Place your images in the appropriate folders under `images/` based on which component they belong to. 

For example:
- Team member images go in `images/teams-part/` with names like `member1.jpg`, `member2.jpg`, etc.
- Hero background image goes in `images/hero/` with a name like `hero.jpg`

### 2. Upload Images to Strapi

Run the image upload script:

```bash
node upload_images.js
```

This will:
- Upload all images from the `images/` directory to Strapi media library
- Save metadata about the uploaded images to `uploaded_images.json`

### 3. Update Data JSON with Image References

Run the update script:

```bash
node update_data_with_images.js
```

This will:
- Create a backup of your original `data.json` as `data.json.backup`
- Update image references in `data.json` with the uploaded image URLs
- Use the component mapping to match the right images to each field

### 4. Insert Data into Strapi

Finally, insert the updated data into Strapi:

```bash
node insert_data.js
```

## Adding Custom Image Mappings

If you need to customize the mapping between components and images, edit the `componentMappings` object in `update_data_with_images.js`.

Example:
```javascript
'component-name.component-name': {
  'imageFieldName': { folder: 'folder-name', pattern: 'file-pattern' }
}
```

## Complete Workflow

To fully populate your Strapi instance with images and content:

1. Organize your images in the `images/` directory according to the component structure
2. Run `node upload_images.js` to upload all images to Strapi
3. Run `node update_data_with_images.js` to update your data.json with the image URLs
4. Run `node insert_data.js` to insert the data into Strapi

## Troubleshooting

- If you encounter issues with image uploads, check your Strapi permissions
- Ensure your Strapi token has the necessary permissions
- Check that your Strapi instance is running and accessible at the URL in your `.env` file
- If image mappings are incorrect, you may need to adjust the component mappings in `update_data_with_images.js`
- Check the `uploaded_images.json` file to see what images were successfully uploaded