import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useBlog } from '../../contexts/BlogContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  PencilIcon,
  EyeIcon,
  TrashIcon,
  DocumentPlusIcon,
  CalendarDaysIcon,
  TagIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const UserPosts: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, fetchPosts } = useBlog();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts && user) {
      // Filter posts by current user
      const myPosts = posts.filter((post: any) => post.author?.id === user.id || post.author?._id === user._id);
      setUserPosts(myPosts);
      setFilteredPosts(myPosts);
    }
  }, [posts, user]);

  useEffect(() => {
    let filtered = [...userPosts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [userPosts, statusFilter, sortBy, searchQuery]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <LoadingSpinner />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Blog Posts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and edit your published and draft blog posts ({filteredPosts.length} posts)
              </p>
            </div>
            <Link
              to="/admin/posts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentPlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                {userPosts.length === 0 ? (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first blog post.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/admin/posts/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DocumentPlusIcon className="h-4 w-4 mr-2" />
                        Create Your First Post
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post._id || post.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Post Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <span className={getStatusBadge(post.status)}>
                            {post.status}
                          </span>
                        </div>

                        {/* Post Meta */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {post.status === 'published' && post.publishedAt
                              ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                              : `Created ${new Date(post.createdAt).toLocaleDateString()}`
                            }
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center">
                              <TagIcon className="h-4 w-4 mr-1" />
                              {post.tags.slice(0, 2).map((tag: any, index: number) => (
                                <span key={tag._id || tag.id || index} className="mr-1">
                                  {tag.name || tag}{index < Math.min(post.tags.length, 2) - 1 ? ',' : ''}
                                </span>
                              ))}
                              {post.tags.length > 2 && <span>+{post.tags.length - 2} more</span>}
                            </div>
                          )}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {post.viewCount || 0} views
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            {post.likeCount || 0} likes
                          </div>
                          <div className="flex items-center">
                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1" />
                            {post.commentCount || 0} comments
                          </div>
                        </div>

                        {/* Post Excerpt */}
                        {post.excerpt && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {post.status === 'published' && (
                          <Link
                            to={`/post/${post.slug || post._id || post.id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        )}
                        <Link
                          to={`/admin/posts/edit/${post._id || post.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        {userPosts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentPlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Posts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userPosts.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Views
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {userPosts.filter(post => post.status === 'published').length}
                    </span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Published
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {userPosts.filter(post => post.status === 'draft').length}
                    </span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Drafts
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserPosts;
