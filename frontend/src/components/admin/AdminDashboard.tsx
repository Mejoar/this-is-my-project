import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Reply,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  pendingComments: number;
}

interface TagInsight {
  name: string;
  count: number;
  color: string;
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

interface RecentComment {
  id: string;
  author: string;
  content: string;
  postTitle: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'spam';
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    pendingComments: 0
  });

  const [tagInsights, setTagInsights] = useState<TagInsight[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock stats
    setStats({
      totalPosts: 127,
      publishedPosts: 98,
      totalViews: 45892,
      totalLikes: 3247,
      totalComments: 892,
      pendingComments: 12
    });

    // Mock tag insights
    setTagInsights([
      { name: 'Technology', count: 35, color: '#3B82F6' },
      { name: 'Design', count: 28, color: '#10B981' },
      { name: 'Programming', count: 22, color: '#F59E0B' },
      { name: 'AI/ML', count: 18, color: '#EF4444' },
      { name: 'Web Dev', count: 15, color: '#8B5CF6' },
      { name: 'Other', count: 9, color: '#6B7280' }
    ]);

    // Mock top posts
    setTopPosts([
      {
        id: '1',
        title: 'Building Scalable React Applications with TypeScript',
        views: 2847,
        likes: 156,
        comments: 23,
        publishedAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'The Future of AI in Web Development',
        views: 2156,
        likes: 134,
        comments: 18,
        publishedAt: '2024-01-12'
      },
      {
        id: '3',
        title: 'Modern CSS Techniques for Better UX',
        views: 1932,
        likes: 112,
        comments: 15,
        publishedAt: '2024-01-10'
      },
      {
        id: '4',
        title: 'Node.js Performance Optimization Tips',
        views: 1678,
        likes: 89,
        comments: 12,
        publishedAt: '2024-01-08'
      },
      {
        id: '5',
        title: 'Understanding GraphQL vs REST APIs',
        views: 1534,
        likes: 76,
        comments: 9,
        publishedAt: '2024-01-05'
      }
    ]);

    // Mock recent comments
    setRecentComments([
      {
        id: '1',
        author: 'John Doe',
        content: 'Great article! Really helped me understand the concepts better. Looking forward to more content like this.',
        postTitle: 'Building Scalable React Applications with TypeScript',
        createdAt: '2024-01-16T10:30:00Z',
        status: 'pending'
      },
      {
        id: '2',
        author: 'Sarah Wilson',
        content: 'The examples you provided are very practical. Would love to see a follow-up on advanced patterns.',
        postTitle: 'Modern CSS Techniques for Better UX',
        createdAt: '2024-01-16T09:15:00Z',
        status: 'approved'
      },
      {
        id: '3',
        author: 'Mike Chen',
        content: 'Could you elaborate more on the performance implications?',
        postTitle: 'The Future of AI in Web Development',
        createdAt: '2024-01-16T08:45:00Z',
        status: 'pending'
      },
      {
        id: '4',
        author: 'Anonymous',
        content: 'Check out my amazing deals! Best prices guaranteed!!! Visit my site...',
        postTitle: 'Node.js Performance Optimization Tips',
        createdAt: '2024-01-16T07:20:00Z',
        status: 'spam'
      }
    ]);
  }, [selectedTimeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleCommentAction = (commentId: string, action: 'approve' | 'delete' | 'spam') => {
    setRecentComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, status: action === 'approve' ? 'approved' : action as 'spam' }
          : comment
      ).filter(comment => comment.id !== commentId || action !== 'delete')
    );
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    change?: number;
    color: string;
  }> = ({ title, value, icon, change, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last {selectedTimeRange}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, Admin! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your blog today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as 'week' | 'month' | 'year')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            change={12}
            color="bg-blue-100"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={<Eye className="w-6 h-6 text-green-600" />}
            change={8}
            color="bg-green-100"
          />
          <StatCard
            title="Total Likes"
            value={stats.totalLikes}
            icon={<Heart className="w-6 h-6 text-red-600" />}
            change={15}
            color="bg-red-100"
          />
          <StatCard
            title="Comments"
            value={stats.totalComments}
            icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
            change={-3}
            color="bg-purple-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tag Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tag Insights</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagInsights}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {tagInsights.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Posts */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Posts</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{post.title}</h4>
                    <p className="text-xs text-gray-500">Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {formatNumber(post.views)}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {formatNumber(post.likes)}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {post.comments}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Comments with Moderation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Comments</h3>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {stats.pendingComments} Pending Review
              </span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Comments
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentComments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{comment.author}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-500">
                      On: <span className="font-medium">{comment.postTitle}</span>
                    </p>
                  </div>
                  
                  {comment.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleCommentAction(comment.id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve comment"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCommentAction(comment.id, 'spam')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Mark as spam"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Reply to comment"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCommentAction(comment.id, 'delete')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recentComments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No recent comments</h4>
              <p className="text-gray-500">Comments will appear here when readers engage with your posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
