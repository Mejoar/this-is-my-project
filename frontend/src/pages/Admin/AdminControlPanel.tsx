import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminLayout from '../../components/Layout/AdminLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  postCount: number;
  commentCount: number;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  newUsersThisMonth: number;
  systemUptime: string;
  databaseSize: string;
  storageUsed: string;
}

const AdminControlPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin' | 'moderator',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, metricsData] = await Promise.allSettled([
        adminAPI.getAllUsers(),
        adminAPI.getSystemMetrics()
      ]);

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value.users || []);
      }
      
      if (metricsData.status === 'fulfilled') {
        setSystemMetrics(metricsData.value);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete' | 'promote' | 'demote') => {
    try {
      switch (action) {
        case 'activate':
        case 'deactivate':
          await adminAPI.toggleUserStatus(userId, action === 'activate');
          toast.success(`User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted successfully');
          }
          break;
        case 'promote':
          await adminAPI.updateUserRole(userId, 'admin');
          toast.success('User promoted to admin');
          break;
        case 'demote':
          await adminAPI.updateUserRole(userId, 'user');
          toast.success('User role updated');
          break;
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      await adminAPI.bulkUserAction(selectedUsers, action);
      toast.success(`Bulk action ${action} completed successfully`);
      setSelectedUsers([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    }
  };

  const handleCreateUser = async () => {
    try {
      await adminAPI.createUser(newUser);
      toast.success('User created successfully');
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', role: 'user', password: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              </div>
              <p className="text-red-100 text-lg">Manage users, roles, and system settings</p>
              <p className="text-red-200 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-200" />
              <span className="text-sm text-yellow-200">Admin Access Required</span>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
                </div>
                <div className="p-3 rounded-md bg-blue-500">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeUsers}</p>
                </div>
                <div className="p-3 rounded-md bg-green-500">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.adminUsers}</p>
                </div>
                <div className="p-3 rounded-md bg-purple-500">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.newUsersThisMonth}</p>
                </div>
                <div className="p-3 rounded-md bg-indigo-500">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User Management</h2>
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Show inactive</span>
              </label>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-gray-300"
                    />
                  </th>
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
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(userData._id)}
                        onChange={() => toggleUserSelection(userData._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {userData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        userData.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{userData.postCount} posts</div>
                      <div className="text-gray-500">{userData.commentCount} comments</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUserAction(userData._id, userData.isActive ? 'deactivate' : 'activate')}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            userData.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={userData.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {userData.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                        
                        {userData.role !== 'admin' && (
                          <button
                            onClick={() => handleUserAction(userData._id, 'promote')}
                            className="p-1 rounded hover:bg-gray-100 text-purple-600"
                            title="Promote to admin"
                          >
                            <ShieldCheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {userData._id !== user?._id && (
                          <button
                            onClick={() => handleUserAction(userData._id, 'delete')}
                            className="p-1 rounded hover:bg-gray-100 text-red-600"
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* System Information */}
        {systemMetrics && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-medium">{systemMetrics.systemUptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Size</span>
                  <span className="font-medium">{systemMetrics.databaseSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-medium">{systemMetrics.storageUsed}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick System Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                  <ServerIcon className="w-5 h-5 text-blue-500 mr-3" />
                  <span>System Settings</span>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                  <KeyIcon className="w-5 h-5 text-purple-500 mr-3" />
                  <span>API Keys Management</span>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                  <ChartBarIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Create New User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'admin' | 'moderator'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminControlPanel;
