import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBlog } from '../../contexts/BlogContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  PencilIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentPlusIcon,
  UserIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, fetchPosts } = useBlog();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts && user) {
      // Filter posts by current user
      const myPosts = posts.filter((post: any) => post.author?._id === user._id);
      setUserPosts(myPosts);
      
      // Calculate stats
      const totalViews = myPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0);
      const totalLikes = myPosts.reduce((sum: number, post: any) => sum + (post.likes?.length || 0), 0);
      const totalComments = myPosts.reduce((sum: number, post: any) => sum + (post.comments?.length || 0), 0);
      
      setStats({
        totalPosts: myPosts.length,
        totalViews,
        totalLikes,
        totalComments
      });
    }
  }, [posts, user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your content and track your blog's performance
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                    {stats.totalPosts}
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
                    {stats.totalViews.toLocaleString()}
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
                <HeartIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Likes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalLikes}
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
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Comments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalComments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/posts/new"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <DocumentPlusIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Create Post</p>
                <p className="text-sm text-gray-500 truncate">Write a new blog post</p>
              </div>
            </Link>

            <Link
              to="/user/posts"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <PencilIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Manage Posts</p>
                <p className="text-sm text-gray-500 truncate">Edit your blog posts</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Profile</p>
                <p className="text-sm text-gray-500 truncate">Update your profile</p>
              </div>
            </Link>

            <Link
              to="/user/comments"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Comments</p>
                <p className="text-sm text-gray-500 truncate">Manage comments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Recent Posts
            </h3>
            <Link
              to="/user/posts"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                  New Post
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {post.views || 0} views
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            {post.likes?.length || 0} likes
                          </div>
                          <div className="flex items-center">
                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1" />
                            {post.comments?.length || 0} comments
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="text-green-600 hover:text-green-500 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
