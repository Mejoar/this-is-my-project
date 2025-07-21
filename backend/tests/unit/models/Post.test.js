const Post = require('../../../models/Post');
const { createTestUser, createTestPost } = require('../../utils/testHelpers');

describe('Post Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Post Creation', () => {
    it('should create a valid post', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content with enough words to calculate reading time properly.',
        author: testUser._id
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe(postData.title);
      expect(savedPost.content).toBe(postData.content);
      expect(savedPost.author.toString()).toBe(testUser._id.toString());
      expect(savedPost.status).toBe('draft'); // Default status
      expect(savedPost.slug).toBeDefined();
      expect(savedPost.excerpt).toBeDefined();
      expect(savedPost.readingTime).toBeGreaterThan(0);
    });

    it('should generate unique slug from title', async () => {
      const title = 'Test Post Title';
      
      // Create first post
      const post1 = new Post({
        title,
        content: 'Content for first post',
        author: testUser._id
      });
      await post1.save();

      // Create second post with same title
      const post2 = new Post({
        title,
        content: 'Content for second post',
        author: testUser._id
      });
      await post2.save();

      expect(post1.slug).toBe('test-post-title');
      expect(post2.slug).toBe('test-post-title-1');
    });

    it('should generate excerpt from content if not provided', async () => {
      const content = 'This is a very long content that should be truncated to create an excerpt. '.repeat(10);
      
      const post = new Post({
        title: 'Test Post',
        content,
        author: testUser._id
      });
      await post.save();

      expect(post.excerpt).toBeDefined();
      expect(post.excerpt.length).toBeLessThanOrEqual(203); // 200 + '...'
      expect(post.excerpt.endsWith('...')).toBe(true);
    });

    it('should calculate reading time based on content', async () => {
      const shortContent = 'Short content.';
      const longContent = 'Word '.repeat(400); // 400 words, should be 2 minutes

      const shortPost = new Post({
        title: 'Short Post',
        content: shortContent,
        author: testUser._id
      });
      await shortPost.save();

      const longPost = new Post({
        title: 'Long Post',
        content: longContent,
        author: testUser._id
      });
      await longPost.save();

      expect(shortPost.readingTime).toBe(1); // Minimum 1 minute
      expect(longPost.readingTime).toBe(2); // 400 words / 200 = 2 minutes
    });

    it('should require required fields', async () => {
      const post = new Post({});

      let error;
      try {
        await post.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.content).toBeDefined();
      expect(error.errors.author).toBeDefined();
    });

    it('should enforce title maximum length', async () => {
      const post = new Post({
        title: 'A'.repeat(201), // Too long
        content: 'Test content',
        author: testUser._id
      });

      let error;
      try {
        await post.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toContain('cannot exceed 200 characters');
    });

    it('should validate status enum values', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Test content',
        author: testUser._id,
        status: 'invalid_status'
      });

      let error;
      try {
        await post.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it('should set publishedAt when status changes to published', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Test content',
        author: testUser._id,
        status: 'published'
      });

      await post.save();
      expect(post.publishedAt).toBeDefined();
      expect(post.publishedAt).toBeInstanceOf(Date);
    });
  });

  describe('Post Methods', () => {
    it('should increment view count', async () => {
      const post = await createTestPost(undefined, testUser._id);
      const originalViewCount = post.viewCount;

      await post.incrementViewCount();
      expect(post.viewCount).toBe(originalViewCount + 1);

      await post.incrementViewCount();
      expect(post.viewCount).toBe(originalViewCount + 2);
    });
  });

  describe('Post Static Methods', () => {
    it('should find only published posts', async () => {
      // Create draft post
      await createTestPost({
        title: 'Draft Post',
        content: 'Draft content',
        status: 'draft'
      }, testUser._id);

      // Create published post
      await createTestPost({
        title: 'Published Post',
        content: 'Published content',
        status: 'published'
      }, testUser._id);

      const publishedPosts = await Post.findPublished();
      expect(publishedPosts).toHaveLength(1);
      expect(publishedPosts[0].title).toBe('Published Post');
      expect(publishedPosts[0].status).toBe('published');
    });
  });

  describe('Post Updates', () => {
    it('should regenerate slug when title is modified', async () => {
      const post = await createTestPost(undefined, testUser._id);
      const originalSlug = post.slug;

      post.title = 'Updated Post Title';
      await post.save();

      expect(post.slug).not.toBe(originalSlug);
      expect(post.slug).toBe('updated-post-title');
    });

    it('should not set publishedAt again if already set', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Test content',
        author: testUser._id,
        status: 'published'
      });

      await post.save();
      const originalPublishedAt = post.publishedAt;

      // Save again without changing status
      await post.save();
      expect(post.publishedAt.getTime()).toBe(originalPublishedAt.getTime());
    });

    it('should maintain excerpt if provided explicitly', async () => {
      const customExcerpt = 'This is a custom excerpt.';
      const post = new Post({
        title: 'Test Post',
        content: 'This is a much longer content that would generate a different excerpt if not provided explicitly.',
        excerpt: customExcerpt,
        author: testUser._id
      });

      await post.save();
      expect(post.excerpt).toBe(customExcerpt);
    });
  });

  describe('Post Indexes', () => {
    it('should have required indexes for performance', async () => {
      const indexes = await Post.collection.getIndexes();
      
      // Check for compound index on status and publishedAt
      const statusPublishedIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'status') &&
        indexes[key].some(field => field[0] === 'publishedAt')
      );
      expect(statusPublishedIndex).toBeDefined();

      // Check for author index
      const authorIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'author')
      );
      expect(authorIndex).toBeDefined();

      // Check for slug index
      const slugIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'slug')
      );
      expect(slugIndex).toBeDefined();
    });
  });
});
