import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { adminAPI, commentsAPI } from '../../services/api';
import { Comment } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminLayout from '../../components/Layout/AdminLayout';

interface CommentWithPost extends Comment {
  post: {
    _id: string;
    title: string;
  };
}

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [aiReplyLoading, setAiReplyLoading] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [filter, currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const approved = filter === 'approved' ? true : filter === 'pending' ? false : undefined;
      const response = await adminAPI.getAllComments(currentPage, 20, approved);
      setComments(response.comments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error(error.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'delete') => {
    try {
      if (action === 'approve') {
        await adminAPI.approveComment(commentId, true);
        toast.success('Comment approved successfully!');
      } else if (action === 'delete') {
        await commentsAPI.deleteComment(commentId);
        toast.success('Comment deleted successfully!');
      }
      fetchComments(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const generateAIReply = async (commentId: string) => {
    try {
      setAiReplyLoading(commentId);
      const response = await commentsAPI.generateAIReply(commentId, 'friendly');
      toast.success('AI reply generated!');
      // You could show the generated reply in a modal or expand the comment
      alert(`AI suggested reply: ${response.generatedReply}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate AI reply');
    } finally {
      setAiReplyLoading(null);
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'pending') return !comment.isApproved;
    if (filter === 'approved') return comment.isApproved;
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3 text-blue-500" />
              Comment Management
            </h1>
            <p className="text-gray-600">Moderate and manage comments from your readers</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{filteredComments.length} comments</span>
              <span>•</span>
              <span>{comments.filter(c => !c.isApproved).length} pending</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter comments:</span>
              <div className="flex space-x-2">
                {(['all', 'pending', 'approved'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => {
                      setFilter(filterOption);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {filteredComments.length > 0 ? (
            filteredComments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {comment.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {comment.author?.email}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(comment.isApproved)
                      }`}>
                        {comment.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Post Reference */}
                    <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>On post:</span>
                      <span className="font-medium text-gray-900">
                        {comment.post?.title || 'Unknown post'}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {expandedComments.has(comment._id) || comment.content.length <= 200
                          ? comment.content
                          : `${comment.content.substring(0, 200)}...`
                        }
                      </p>
                      {comment.content.length > 200 && (
                        <button
                          onClick={() => toggleCommentExpansion(comment._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          {expandedComments.has(comment._id) ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>

                    {/* Replies Count */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mb-3 text-sm text-gray-600">
                        <ArrowUturnLeftIcon className="w-4 h-4 inline mr-1" />
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleCommentAction(comment._id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve comment"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => generateAIReply(comment._id)}
                      disabled={aiReplyLoading === comment._id}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Generate AI reply"
                    >
                      {aiReplyLoading === comment._id ? (
                        <div className="w-5 h-5">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <SparklesIcon className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCommentAction(comment._id, 'delete')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete comment"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
              <p className="text-gray-500">
                {filter === 'pending' 
                  ? 'No comments are waiting for approval.' 
                  : filter === 'approved'
                  ? 'No approved comments yet.'
                  : 'No comments have been posted yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComments;
