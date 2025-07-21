const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  // Check if AI service is available
  isAvailable() {
    return this.genAI !== null;
  }

  // Generate a full blog post
  async generateBlogPost(title, tone = 'informative', keywords = []) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const keywordText = keywords.length > 0 ? ` Include these keywords: ${keywords.join(', ')}.` : '';
      
      const prompt = `Write a comprehensive blog post with the title "${title}". 
      The tone should be ${tone}. 
      ${keywordText}
      
      Please structure the blog post with:
      1. An engaging introduction
      2. Well-organized main content with subheadings
      3. A conclusion that summarizes key points
      
      Format the response in Markdown with proper headers (##, ###), bullet points, and emphasis where appropriate.
      The post should be informative, well-researched, and engaging for readers.
      Aim for approximately 800-1200 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw new Error('Failed to generate blog post. Please try again.');
    }
  }

  // Summarize a blog post
  async summarizeBlogPost(content, maxLength = 200) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const prompt = `Please create a concise summary of the following blog post content. 
      The summary should be approximately ${maxLength} characters and capture the main points:
      
      ${content}
      
      Summary:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let summary = response.text().trim();

      // Ensure the summary doesn't exceed the max length
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...';
      }

      return summary;
    } catch (error) {
      console.error('Error summarizing blog post:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  // Generate comment reply
  async generateCommentReply(originalComment, postTitle, tone = 'friendly') {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const prompt = `Generate a ${tone} and helpful reply to this comment on the blog post titled "${postTitle}":
      
      Original comment: "${originalComment}"
      
      The reply should be:
      - Respectful and engaging
      - Relevant to the comment and post topic  
      - Around 50-150 words
      - Written in a conversational tone
      
      Reply:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating comment reply:', error);
      throw new Error('Failed to generate reply. Please try again.');
    }
  }

  // Generate blog post ideas based on topic
  async generateBlogIdeas(topic, count = 5) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const prompt = `Generate ${count} creative and engaging blog post ideas related to "${topic}". 
      For each idea, provide:
      1. A compelling title
      2. A brief description (1-2 sentences)
      
      Format as a JSON array with objects containing 'title' and 'description' fields.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse as JSON
        const ideas = JSON.parse(text);
        return Array.isArray(ideas) ? ideas : [];
      } catch (parseError) {
        // If JSON parsing fails, return a simple format
        return [{
          title: 'AI-Generated Ideas',
          description: 'Please try again - there was an issue processing the response.'
        }];
      }
    } catch (error) {
      console.error('Error generating blog ideas:', error);
      throw new Error('Failed to generate blog ideas. Please try again.');
    }
  }

  // Generate SEO-friendly title variations
  async generateSEOTitles(originalTitle, count = 3) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const prompt = `Given this blog post title: "${originalTitle}"
      
      Generate ${count} SEO-friendly variations that are:
      - Under 60 characters
      - Include relevant keywords
      - Are engaging and clickable
      - Maintain the original meaning
      
      Return as a simple JSON array of strings.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const titles = JSON.parse(text);
        return Array.isArray(titles) ? titles : [originalTitle];
      } catch (parseError) {
        return [originalTitle];
      }
    } catch (error) {
      console.error('Error generating SEO titles:', error);
      throw new Error('Failed to generate SEO titles. Please try again.');
    }
  }

  // Generate meta description
  async generateMetaDescription(title, content) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check GEMINI_API_KEY configuration.');
    }

    try {
      const prompt = `Based on this blog post title and content, create an SEO-optimized meta description:
      
      Title: ${title}
      Content: ${content.substring(0, 500)}...
      
      The meta description should be:
      - 150-160 characters max
      - Include the main keyword
      - Be compelling and descriptive
      - Encourage clicks
      
      Meta Description:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let description = response.text().trim();

      // Ensure it doesn't exceed 160 characters
      if (description.length > 160) {
        description = description.substring(0, 157) + '...';
      }

      return description;
    } catch (error) {
      console.error('Error generating meta description:', error);
      throw new Error('Failed to generate meta description. Please try again.');
    }
  }
}

module.exports = new AIService();
