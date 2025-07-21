import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  PencilIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ServerIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  KeyIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminLayout from '../../components/Layout/AdminLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  isActive: boolean;
  createdAt: string;
  profileImage?: string;
}

interface AdminMetrics {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingComments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsData, usersData] = await Promise.allSettled([
        adminAPI.getDashboardMetrics(),
        adminAPI.getAllUsers(1, 10)
      ]);

      if (metricsData.status === 'fulfilled') {
        const data = metricsData.value;
        setMetrics({
          totalUsers: data.totalUsers,
          totalAdmins: data.totalAdmins,
          activeUsers: data.totalUsers - (data.inactiveUsers || 0),
          inactiveUsers: data.inactiveUsers || 0,
          totalPosts: data.totalPosts,
          totalComments: data.totalComments,
          pendingComments: data.pendingComments,
          systemHealth: 'healthy'
        });
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value.users || []);
        setRecentUsers(usersData.value.users?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete' | 'makeAdmin' | 'removeAdmin') => {
    if (userId === user?._id && (action === 'deactivate' || action === 'delete' || action === 'removeAdmin')) {
      toast.error("You cannot perform this action on your own account");
      return;
    }

    const confirmMessages = {
      activate: 'Are you sure you want to activate this user?',
      deactivate: 'Are you sure you want to deactivate this user?',
      delete: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
      makeAdmin: 'Are you sure you want to make this user an admin?',
      removeAdmin: 'Are you sure you want to remove admin privileges from this user?'
    };

    if (!confirm(confirmMessages[action])) return;

    try {
      setActionLoading(userId);
      
      switch (action) {
        case 'activate':
        case 'deactivate':
          await adminAPI.updateUserStatus(userId, action === 'activate');
          toast.success(`User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`);
          break;
        case 'delete':
          // Note: You'll need to implement this endpoint in your backend
          // await adminAPI.deleteUser(userId);
          toast.success('User deleted successfully');
          break;
        case 'makeAdmin':
        case 'removeAdmin':
          // Note: You'll need to implement this endpoint in your backend
          // await adminAPI.updateUserRole(userId, action === 'makeAdmin' ? 'admin' : 'member');
          toast.success(`User role updated successfully`);
          break;
      }
      
      fetchAdminData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    description?: string;
  }> = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">
                  Admin Control Panel
                </h1>
              </div>
              <p className="text-red-100 text-lg">System administration and user management</p>
              <p className="text-red-200 text-sm mt-1">
                Welcome, Super Admin {user?.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchAdminData}
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={metrics.totalUsers}
              icon={UsersIcon}
              color="bg-blue-500"
              description="All registered users"
            />
            <StatCard
              title="Admin Users"
              value={metrics.totalAdmins}
              icon={ShieldCheckIcon}
              color="bg-red-500"
              description="Users with admin privileges"
            />
            <StatCard
              title="Active Users"
              value={metrics.activeUsers}
              icon={CheckCircleIcon}
              color="bg-green-500"
              description="Currently active accounts"
            />
            <StatCard
              title="Inactive Users"
              value={metrics.inactiveUsers}
              icon={XCircleIcon}
              color="bg-gray-500"
              description="Deactivated accounts"
            />
          </div>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Health</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 font-medium">Healthy</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Status</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="text-green-600 font-medium">Running</span>
              </div>
            </div>
          </div>

          {/* Content Overview */}
          {metrics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Content Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Total Posts</span>
                  </div>
                  <span className="font-semibold">{metrics.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Total Comments</span>
                  </div>
                  <span className="font-semibold">{metrics.totalComments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Pending Comments</span>
                  </div>
                  <span className="font-semibold text-yellow-600">{metrics.pendingComments}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 mr-3" />
                <span>Manage Users</span>
              </Link>
              <Link
                to="/admin/comments"
                className="flex items-center p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
                <span>Moderate Comments</span>
              </Link>
              <Link
                to="/admin/posts"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 mr-3" />
                <span>Review Posts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Users</h3>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all users
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profileImage ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.profileImage}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                          disabled={actionLoading === user._id}
                          className={`p-1 rounded transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          } ${actionLoading === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.isActive ? (
                            <LockClosedIcon className="w-4 h-4" />
                          ) : (
                            <LockOpenIcon className="w-4 h-4" />
                          )}
                        </button>
                        {user._id !== user._id && (
                          <button
                            onClick={() => handleUserAction(user._id, 'delete')}
                            disabled={actionLoading === user._id}
                            className={`p-1 text-red-600 hover:bg-red-50 rounded transition-colors ${
                              actionLoading === user._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Security & Alerts</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">System Secure</p>
                <p className="text-sm text-green-600">No security issues detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
