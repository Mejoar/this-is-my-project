import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Post } from '../types';

const CategoryPosts: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategoryPosts();
  }, [category, currentPage]);

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        tag: category,
        page: currentPage,
        limit: 12
      });
      setPosts(response.posts);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError('Failed to fetch posts');
      console.error('Error fetching category posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (category: string | undefined) => {
    if (!category) return 'Category';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span>•</span>
            <span>Categories</span>
            <span>•</span>
            <span className="text-gray-900 font-medium">{getCategoryTitle(category)}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getCategoryTitle(category)} Posts
              </h1>
              <p className="text-gray-600">
                {posts.length > 0 
                  ? `${posts.length} post${posts.length === 1 ? '' : 's'} found`
                  : 'No posts found'
                }
              </p>
            </div>
            
            {category && (
              <div className="hidden sm:block">
                <span 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  #{category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post._id} className="group">
                  <Link to={`/post/${post.slug}`} className="block">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                      {/* Cover Image */}
                      {post.coverImage && (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag._id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${tag.color}20`, 
                                  color: tag.color 
                                }}
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            {post.author && (
                              <div className="flex items-center space-x-1">
                                {post.author.profileImage && (
                                  <img
                                    src={post.author.profileImage}
                                    alt={post.author.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                                <span>{post.author.name}</span>
                              </div>
                            )}
                            <span>•</span>
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          
                          {post.readingTime && (
                            <span>{post.readingTime} min read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {getCategoryTitle(category)} posts yet
              </h3>
              <p className="text-gray-500 mb-6">
                We haven't published any {category} posts yet. Check back soon!
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Posts
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPosts;
