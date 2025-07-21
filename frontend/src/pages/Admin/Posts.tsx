import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, postsAPI } from '../../services/api';
import { Post } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminPosts: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const statusFilter = filterStatus === 'All' ? 'all' : filterStatus.toLowerCase();
      const response = await adminAPI.getAllPosts(currentPage, 10, statusFilter);
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setTotalPosts(response.totalPosts);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, filterStatus]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const statusValue = filterStatus.toLowerCase();
    const matchesStatus = filterStatus === 'All' || post.status === statusValue;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map(post => post._id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId]);
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'delete' && selectedPosts.length > 0) {
      setShowDeleteModal(true);
    }
    // Add other bulk actions as needed
  };

  const confirmDelete = async () => {
    try {
      // Delete selected posts
      await Promise.all(selectedPosts.map(id => postsAPI.deletePost(id)));
      // Refresh posts list
      await fetchPosts();
      setSelectedPosts([]);
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Failed to delete posts:', err);
      setError(err.response?.data?.message || 'Failed to delete posts');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return `px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId);
        await fetchPosts();
      } catch (err: any) {
        console.error('Failed to delete post:', err);
        setError(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFirstTag = (tags: any[]) => {
    return tags && tags.length > 0 ? tags[0].name : 'Uncategorized';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <button 
            onClick={() => navigate('/admin/posts/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Post
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700">
                {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Posts Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post._id)}
                          onChange={(e) => handleSelectPost(post._id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 truncate">{post.title}</div>
                          <div className="text-sm text-gray-500 truncate">{post.excerpt}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getFirstTag(post.tags)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{post.author?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(post.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(post.status)}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{post.viewCount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{post.commentCount || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/posts/${post._id}/edit`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/posts/${post._id}/details`)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No posts found</h3>
              <p className="text-sm text-gray-500">Get started by creating a new post.</p>
            </div>
          )}
        </div>
        )}

        {/* Pagination */}
        {!loading && filteredPosts.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPosts.length}</span> of{' '}
              <span className="font-medium">{totalPosts}</span> results
            </div>
            <div className="flex space-x-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                {currentPage}
              </button>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Posts</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
