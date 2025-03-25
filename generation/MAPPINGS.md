# Component to Image Mappings

## Mapping Structure

The `update_data_with_images.js` script uses a mapping system to associate image fields in your data with the correct uploaded images.

Each mapping has the following structure:

```javascript
'component-name.component-name': {
  'imageFieldName': { folder: 'folder-name', pattern: 'file-pattern' }
}
```

Where:
- `component-name.component-name`: The full component name, including the API ID prefix
- `imageFieldName`: The name of the field in the component that should contain an image
- `folder`: The subfolder in `data_and_images/images/` where this component's images are stored
- `pattern`: The file name pattern to look for (without extension)

## Adding a New Image Mapping

To add support for a new component or image field:

1. Create a folder for your component images:
```bash
mkdir -p data_and_images/images/testimonials
```

2. Place your images in the folder with appropriate names:
```bash
cp client1.jpg data_and_images/images/testimonials/
cp client2.jpg data_and_images/images/testimonials/
```

3. Add a mapping in `update_data_with_images.js`:
```javascript
// In the componentMappings object
'testimonials.testimonial': {
  'clientImage': { folder: 'testimonials', pattern: 'client' }
}
```

## Current Mappings

The following mappings are currently defined:

| Component | Field Name | Image Folder | Image Pattern |
|-----------|------------|--------------|---------------|
| hero-component.hero-component | background | hero | hero |
| about.about | img1 | about | about1 |
| about.about | img2 | about | about2 |
| about.about | img3 | about | about3 |
| why-choose.why-choose | firstIcon | why-choose-us | image1 |
| why-choose.why-choose | secondIcon | why-choose-us | image2 |
| why-choose.why-choose | ThirdIcon | why-choose-us | image3 |
| let-us-help-you.let-us-help-you | img | let-us-help-you | let-us-help-you-image |
| featured-section.featured-section | img1 | featured | img1 |
| featured-section.featured-section | img2 | featured | img2 |
| featured-section.featured-section | img3 | featured | img3 |
| featured-section.featured-section | img4 | featured | img4 |
| goals.goals | img1 | goals | img1 |
| goals.goals | img2 | goals | img2 |
| goals.goals | img3 | goals | img3 |
| map.map | backgorund | map | map |
| last-section.last-section | img | last-section | image |
| consultation.consultation | img | consultation | consultation |
| teams-part.teams-part | memberOneImg | teams-part | member1 |
| teams-part.teams-part | memberTwoImg | teams-part | member2 |
| teams-part.teams-part | memberThreeImg | teams-part | member3 |
| teams-part.teams-part | memberFourImg | teams-part | member4 |
| teams-part.teams-part | memberFiveImg | teams-part | member5 |
| teams-part.teams-part | memberSixImg | teams-part | member6 |

## Special Cases

### Service Sections

Image fields within the `section` array of the `services.services` component are intentionally skipped. No images will be updated for these sections.

## Troubleshooting

If your images aren't being properly mapped:

1. Verify the image exists in the correct subfolder
2. Check the `data_and_images/uploaded_images.json` file to see if your images were uploaded correctly
3. Confirm the component and field names match what's in your data
4. Ensure the pattern you specified matches part of the filename

### Common Issues

- **Missing images**: Make sure the image file exists in the correct folder
- **Wrong mapping**: Double-check the component name, field name, folder, and pattern
- **Pattern mismatch**: The pattern should match part of the filename (without extension)
- **Component name mismatch**: Verify the component name matches what's in your data.json 