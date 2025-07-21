import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiCalendar, 
  FiUser, 
  FiEye, 
  FiHeart, 
  FiMessageCircle, 
  FiShare2, 
  FiCopy, 
  FiChevronRight,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiSend,
  FiBookmark,
  FiMaximize2,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';
import { Post, Comment } from '../types';

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(id!);
      setPost(response.post);
      setLikeCount(response.post.likeCount);
    } catch (error: any) {
      console.error('Error loading post:', error);
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await commentsAPI.getComments(id!);
      setComments(response.comments as CommentWithReplies[]);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!post) return;
    
    try {
      setSummaryLoading(true);
      const response = await postsAPI.summarizePost(post._id);
      setAiSummary(response.summary);
      setShowSummaryDrawer(true);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await postsAPI.likePost(post!._id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await commentsAPI.addComment(post!._id, { content: newComment });
      setNewComment('');
      loadComments();
      toast.success('Comment added successfully!');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await commentsAPI.addReply(commentId, { content: replyContent });
      setReplyContent('');
      setReplyTo(null);
      loadComments();
      toast.success('Reply added successfully!');
    } catch (error: any) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  const sharePost = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    const text = post.excerpt;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CommentComponent: React.FC<{ comment: CommentWithReplies; depth?: number }> = ({ comment, depth = 0 }) => (
    <div className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {comment.author.profileImage ? (
              <img 
                src={comment.author.profileImage} 
                alt={comment.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            
            <p className="text-gray-700 mb-3">{comment.content}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <button className="text-gray-500 hover:text-blue-600 transition-colors">
                <FiHeart className="w-4 h-4 inline mr-1" />
                {comment.likeCount}
              </button>
              
              <button 
                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            </div>
            
            {replyTo === comment._id && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(comment._id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FiSend className="w-3 h-3 mr-1" />
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply._id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 relative">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <button onClick={() => navigate('/')} className="hover:text-gray-700 transition-colors">
                Home
              </button>
              <FiChevronRight className="w-4 h-4" />
              <span>Blog Post</span>
            </nav>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <FiUser className="w-4 h-4 mr-2" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-2" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <FiEye className="w-4 h-4 mr-2" />
                <span>{post.viewCount} views</span>
              </div>
              <div className="flex items-center">
                <span>{post.readingTime} min read</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Featured Image */}
        {post.coverImage && post.coverImage.trim() !== '' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Prevent multiple onError calls by checking if fallback is already set
                if (!target.dataset.fallbackSet) {
                  target.src = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60';
                  target.dataset.fallbackSet = 'true';
                }
              }}
            />
            
            {/* Tags below image */}
            <div className="flex flex-wrap gap-2 mt-4 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
            
            {/* AI Summarize Button below image */}
            <button
              onClick={generateSummary}
              disabled={summaryLoading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {summaryLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiMaximize2 className="w-4 h-4 mr-2" />
              )}
              {summaryLoading ? 'Generating...' : 'Summarize Post'}
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
                <p className="text-blue-800 font-medium italic">{post.excerpt}</p>
              </div>
            )}
            
            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              style={{
                lineHeight: '1.8',
                fontSize: '18px'
              }}
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
            />
          </article>

          {/* Share Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Post</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => sharePost('facebook')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiFacebook className="w-4 h-4 mr-2" />
                Facebook
              </button>
              <button
                onClick={() => sharePost('twitter')}
                className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <FiTwitter className="w-4 h-4 mr-2" />
                Twitter
              </button>
              <button
                onClick={() => sharePost('linkedin')}
                className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <FiLinkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </button>
              <button
                onClick={() => sharePost('email')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiCopy className="w-4 h-4 mr-2" />
                Copy Link
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Comments ({comments.length})
              </h3>
              <button
                onClick={() => !user && setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Comment
              </button>
            </div>
            
            {/* Add Comment Form */}
            {user && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleComment}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <FiSend className="w-4 h-4 mr-2" />
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentComponent key={comment._id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Engagement Widget */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${liked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'} border border-gray-200 hover:shadow-xl`}
          >
            <FiHeart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center">
              {likeCount}
            </span>
          </button>
          
          <button
            onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:text-blue-500 relative"
          >
            <FiMessageCircle className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center">
              {comments.length}
            </span>
          </button>
          
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${bookmarked ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:text-yellow-500'} border border-gray-200 hover:shadow-xl`}
          >
            <FiBookmark className="w-5 h-5" />
          </button>
        </div>

        {/* AI Summary Drawer */}
        {showSummaryDrawer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full overflow-y-auto transform transition-transform duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
                  <button
                    onClick={() => setShowSummaryDrawer(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <FiMaximize2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">Quick Overview</span>
                  </div>
                  
                  {aiSummary ? (
                    <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-4">This summary was generated by AI to help you quickly understand the key points of the article.</p>
                  
                  <button
                    onClick={() => copyToClipboard(aiSummary)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiCopy className="w-4 h-4 mr-2" />
                    Copy Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
                <p className="text-gray-600 mb-6">Please sign in to interact with this post.</p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      navigate('/login');
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostDetail;
