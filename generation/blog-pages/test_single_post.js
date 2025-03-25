const fs = require('fs');
const path = require('path');
const { processBlogPost } = require('./insert_blog_data');

// Test with a single blog post with image
async function testSinglePost() {
  try {
    // Get the blog data
    const dataFilePath = path.join(__dirname, 'blog_data.json');
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Error: ${dataFilePath} does not exist`);
      process.exit(1);
    }

    // Read and parse the data
    const allPosts = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    if (!Array.isArray(allPosts) || allPosts.length === 0) {
      console.error('No blog posts found in data file');
      process.exit(1);
    }

    // Take just the first post
    const testPost = allPosts[0];
    console.log(`Testing with post: ${testPost.Title}`);
    console.log(`Featured image URL: ${testPost.featuredImgSrc || 'None'}`);
    
    if (testPost.featuredImgInfo) {
      console.log(`Local image path: ${testPost.featuredImgInfo.filePath}`);
      
      // Check if the image file exists
      if (fs.existsSync(testPost.featuredImgInfo.filePath)) {
        const stats = fs.statSync(testPost.featuredImgInfo.filePath);
        console.log(`Image exists, size: ${stats.size} bytes`);
      } else {
        console.log('Image file not found locally!');
      }
    } else {
      console.log('No local image info found');
    }

    // Process only the first post
    console.log('Processing the blog post...');
    await processBlogPost(testPost);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSinglePost(); 