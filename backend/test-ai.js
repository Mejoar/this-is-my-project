require('dotenv').config();
const aiService = require('./services/aiService');

// Test the AI service directly
async function testAI() {
  try {
    console.log('Testing AI service...');
    console.log('AI service available:', aiService.isAvailable());
    
    if (!aiService.isAvailable()) {
      console.log('AI service not available. Please check GEMINI_API_KEY');
      return;
    }
    
    const title = 'The Future of Artificial Intelligence in 2024';
    console.log(`Generating content for: ${title}`);
    
    const content = await aiService.generateBlogPost(title, 'informative', ['AI', 'technology', 'future']);
    console.log('Generated content:');
    console.log(content.substring(0, 500) + '...');
    
    const metaDescription = await aiService.generateMetaDescription(title, content);
    console.log('\nGenerated meta description:');
    console.log(metaDescription);
    
    console.log('\n✅ AI service test completed successfully!');
  } catch (error) {
    console.error('❌ AI service test failed:', error.message);
  }
}

testAI();
