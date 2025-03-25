# Customizing Component-to-Image Mappings

This guide explains how to customize the mapping between Strapi components and images in the `update_data_with_images.js` script.

## Understanding the Mapping Structure

The mappings are defined in the `componentMappings` object in `update_data_with_images.js`. Each entry maps a component to its image fields:

```javascript
const componentMappings = {
  'component-name.component-name': {
    'fieldName': { folder: 'folder-name', pattern: 'file-pattern' }
  }
};
```

- `component-name.component-name`: The full component identifier as used in Strapi
- `fieldName`: The name of the field in the component that contains an image
- `folder`: The subfolder in `images/` where this component's images are stored
- `pattern`: A string pattern to match file names for this specific field

## Example: Adding a New Component Mapping

Let's say you have a new "testimonial" component with image fields for client photos:

1. Create a directory for testimonial images:
   ```
   mkdir -p images/testimonials
   ```

2. Add your images to the directory:
   ```
   cp client1.jpg images/testimonials/
   cp client2.jpg images/testimonials/
   ```

3. Add the mapping to `update_data_with_images.js`:
   ```javascript
   const componentMappings = {
     // ... existing mappings ...
     
     // Add new testimonial component mapping
     'testimonial.testimonial': {
       'clientImage': { folder: 'testimonials', pattern: 'client' }
     }
   };
   ```

## Skipping Images for Specific Components

To skip image processing for a specific component, use an empty object as the mapping:

```javascript
// Skip all images for this component
'component-name.component-name': { }
```

For more complex scenarios, you can add a special condition in the `updateDataWithImages` function. For example, to skip image processing for the services.services section fields:

```javascript
// In the updateDataWithImages function
if (currentComponent === 'services.services' && key === 'section') {
  console.log(`Skipping image fields for services.services section as requested`);
  // Still process any other nested objects and arrays in 'section'
  if (value && typeof value === 'object') {
    updateCount += updateDataWithImages(value, 'services.services.section');
  }
  continue;
}

// Skip image processing for the specially marked section
if (currentComponent === 'services.services.section' && isImageField(key)) {
  console.log(`Skipping image field '${key}' in services section`);
  continue;
}
```

## Example: Handling Nested Fields in Arrays

If your component contains an array of objects with image fields, use a nested structure:

```javascript
'gallery.gallery': {
  'slides': {
    'image': { folder: 'gallery', pattern: 'slide' }
  }
}
```

This maps the `image` field inside each object in the `slides` array.

## Advanced: Using Number Patterns

For numbered fields (e.g., img1, img2, etc.), you can use the numeric pattern:

```javascript
'carousel.carousel': {
  'slide1Image': { folder: 'carousel', pattern: 'slide1' },
  'slide2Image': { folder: 'carousel', pattern: 'slide2' },
  'slide3Image': { folder: 'carousel', pattern: 'slide3' }
}
```

## Fallback Strategies

If no exact match is found for a component or field, the script will use these fallback strategies:

1. Try to find any image in the component's folder
2. Use pattern-based matching based on field names
3. Use general image name patterns
4. As a last resort, use any available image

## Testing Your Mappings

To test your mappings:

1. Run the image upload script:
   ```bash
   node upload_images.js
   ```

2. Check the `uploaded_images.json` file to see if your images were uploaded correctly

3. Run the update script with verbose logging:
   ```bash
   node update_data_with_images.js
   ```

4. Check the output for any warnings about missing matches

## Troubleshooting

- **Images not matching**: Check that the folder and pattern names match exactly
- **Case sensitivity**: Some file systems are case-sensitive, so ensure your patterns match the case
- **Component name mismatch**: Verify the component name matches what's in your data.json 