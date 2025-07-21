import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  CalendarDaysIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  post: {
    _id: string;
    title: string;
    slug: string;
  };
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserComments: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

  // Mock data for demonstration - in a real app, this would fetch from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock comments data - you would replace this with actual API call
        const mockComments: Comment[] = [
          {
            _id: '1',
            content: 'Great article! This really helped me understand the concept better.',
            author: {
              _id: '2',
              name: 'John Doe',
              email: 'john@example.com'
            },
            post: {
              _id: 'post1',
              title: 'Understanding React Hooks',
              slug: 'understanding-react-hooks'
            },
            isApproved: true,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            _id: '2',
            content: 'I have a question about the implementation. Could you provide more details?',
            author: {
              _id: '3',
              name: 'Jane Smith',
              email: 'jane@example.com'
            },
            post: {
              _id: 'post2',
              title: 'Advanced TypeScript Patterns',
              slug: 'advanced-typescript-patterns'
            },
            isApproved: false,
            createdAt: '2024-01-14T15:45:00Z',
            updatedAt: '2024-01-14T15:45:00Z'
          }
        ];
        
        setComments(mockComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComments();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...comments];

    // Apply status filter
    if (filter === 'approved') {
      filtered = filtered.filter(comment => comment.isApproved);
    } else if (filter === 'pending') {
      filtered = filtered.filter(comment => !comment.isApproved);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredComments(filtered);
  }, [comments, filter, searchQuery]);

  const handleApproveComment = async (commentId: string) => {
    // In a real app, this would make an API call
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { ...comment, isApproved: true }
        : comment
    ));
  };

  const handleRejectComment = async (commentId: string) => {
    // In a real app, this would make an API call  
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { ...comment, isApproved: false }
        : comment
    ));
  };

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckIcon className="h-3 w-3 mr-1" />
        Approved
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <XMarkIcon className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Comments on My Posts</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and moderate comments on your blog posts ({filteredComments.length} comments)
              </p>
            </div>
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
                    placeholder="Search comments, authors, or posts..."
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
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'approved' | 'pending')}
                >
                  <option value="all">All Comments</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                {comments.length === 0 ? (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      When people comment on your posts, they'll appear here.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No comments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredComments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Author Avatar */}
                      <div className="flex-shrink-0">
                        {comment.author.profileImage ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={comment.author.profileImage}
                            alt={comment.author.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Comment Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.author.name}
                            </p>
                            {getStatusBadge(comment.isApproved)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!comment.isApproved && (
                              <button
                                onClick={() => handleApproveComment(comment._id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                            )}
                            {comment.isApproved && (
                              <button
                                onClick={() => handleRejectComment(comment._id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <XMarkIcon className="h-3 w-3 mr-1" />
                                Unapprove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comment Content */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-800">
                            {comment.content}
                          </p>
                        </div>

                        {/* Comment Meta */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            On: 
                            <Link
                              to={`/post/${comment.post.slug}`}
                              className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                            >
                              {comment.post.title}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        {comments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Comments
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {comments.length}
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
                      {comments.filter(comment => comment.isApproved).length}
                    </span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Approved
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
                      {comments.filter(comment => !comment.isApproved).length}
                    </span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending
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

export default UserComments;
