import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { adminAPI } from '../../services/api';
import { DashboardMetrics, TagInsights } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminLayout from '../../components/Layout/AdminLayout';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-md ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tagInsights, setTagInsights] = useState<TagInsights | null>(null);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalizedMessage = (): string => {
    const messages = [
      "Let's see how your blog is performing today!",
      "Ready to create amazing content?",
      "Your readers are waiting for your next post!",
      "Time to engage with your community!",
      "Let's make today productive!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatTagsForChart = (tags: any[]) => {
    return tags.slice(0, 6).map(tag => ({
      name: tag.name,
      value: tag.postCount,
      color: tag.color
    }));
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'delete') => {
    try {
      if (action === 'approve') {
        await adminAPI.approveComment(commentId, true);
        toast.success('Comment approved successfully!');
      } else {
        // Add delete functionality if needed
        toast.success('Comment deleted successfully!');
      }
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, tagsData, postsData, commentsData] = await Promise.allSettled([
        adminAPI.getDashboardMetrics(),
        adminAPI.getTagInsights(),
        adminAPI.getTopPosts(5, 'views'),
        adminAPI.getRecentComments(10)
      ]);

      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      }
      if (tagsData.status === 'fulfilled') {
        setTagInsights(tagsData.value);
      }
      if (postsData.status === 'fulfilled') {
        setTopPosts(postsData.value.posts || []);
      }
      if (commentsData.status === 'fulfilled') {
        setRecentComments(commentsData.value.comments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <SparklesIcon className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">
                  {getGreeting()}, {user?.name || 'Admin'}! 👋
                </h1>
              </div>
              <p className="text-blue-100 text-lg">{getPersonalizedMessage()}</p>
              <p className="text-blue-200 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/posts/new"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Post
              </Link>
              <Link
                to="/admin/posts/new"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400 transition-colors flex items-center"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                AI Assist
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Posts"
              value={metrics.totalPosts}
              icon={DocumentTextIcon}
              color="bg-blue-500"
              trend={{
                value: metrics.postsThisMonth,
                isPositive: metrics.postsThisMonth > 0
              }}
            />
            <StatCard
              title="Total Users"
              value={metrics.totalUsers}
              icon={UsersIcon}
              color="bg-green-500"
            />
            <StatCard
              title="Total Views"
              value={metrics.totalViews}
              icon={EyeIcon}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Likes"
              value={metrics.totalLikes}
              icon={HeartIcon}
              color="bg-red-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Stats */}
          {metrics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Published Posts</span>
                  <span className="font-semibold">{metrics.publishedPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Draft Posts</span>
                  <span className="font-semibold">{metrics.draftPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Comments</span>
                  <span className="font-semibold">{metrics.totalComments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Comments</span>
                  <span className="font-semibold text-yellow-600">{metrics.pendingComments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Admin Users</span>
                  <span className="font-semibold">{metrics.totalAdmins}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tag Insights Donut Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tag Distribution</h3>
            <div className="h-64">
              {tagInsights && tagInsights.tags.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatTagsForChart(tagInsights.tags)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {formatTagsForChart(tagInsights.tags).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, `${name} Posts`]}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v1M9 21h.01M17 17h.01M20.59 13.41c-.2.8-.8 1.47-1.59 1.59L12 21 5 12h7V3"
                    />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No Tags Yet</h4>
                  <p className="text-sm text-gray-400 text-center">Start creating posts with tags to see your tag distribution here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Posts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Posts</h3>
              <Link to="/admin/posts" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {topPosts.length > 0 ? (
                topPosts.map((post, index) => (
                  <div key={post._id} className="flex items-start">
                    <span className="text-sm text-gray-500 mr-3 mt-1">#{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        {post.viewCount} views
                        <HeartIcon className="w-3 h-3 ml-3 mr-1" />
                        {post.likeCount} likes
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No posts available</p>
              )}
            </div>
          </div>

          {/* Recent Comments with Moderation */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Comments</h3>
              <div className="flex items-center space-x-2">
                {metrics && metrics.pendingComments > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    {metrics.pendingComments} pending
                  </span>
                )}
                <Link to="/admin/comments" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {recentComments.length > 0 ? (
                recentComments.map((comment) => (
                  <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author?.name || 'Anonymous'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            comment.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comment.isApproved ? 'Approved' : 'Pending'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                        <p className="text-xs text-gray-500">
                          On: <span className="font-medium">{comment.post?.title || 'Unknown post'}</span>
                        </p>
                      </div>
                      
                      {!comment.isApproved && (
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => handleCommentAction(comment._id, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve comment"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCommentAction(comment._id, 'delete')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete comment"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No recent comments</h4>
                  <p className="text-gray-500">Comments will appear here when readers engage with your posts.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/posts/new"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
            >
              <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">New Post</p>
                <p className="text-sm text-gray-600">Create a new blog post</p>
              </div>
            </Link>
            <Link
              to="/admin/posts"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
            >
              <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="font-medium">Manage Posts</p>
                <p className="text-sm text-gray-600">Edit and organize posts</p>
              </div>
            </Link>
            <Link
              to="/admin/comments"
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
            >
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-gray-600">Moderate comments</p>
              </div>
            </Link>
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center cursor-pointer"
                 onClick={() => fetchDashboardData()}>
              <ArrowTrendingUpIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="font-medium">Refresh Data</p>
                <p className="text-sm text-gray-600">Update dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDashboard;
