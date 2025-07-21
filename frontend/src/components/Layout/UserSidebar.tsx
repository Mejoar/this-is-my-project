import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  PencilSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const UserSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Header with logo/title */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Time To Program</h1>
      </div>

      <div className="flex-grow">
        <div className="p-4">
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user.profileImage}
                  alt="Profile"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <Link
              to="/user/panel"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/user/panel')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HomeIcon
                className={`mr-3 h-5 w-5 ${
                  isActive('/user/panel')
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              Dashboard
            </Link>
            
            <Link
              to="/user/posts"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/user/posts')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PencilSquareIcon
                className={`mr-3 h-5 w-5 ${
                  isActive('/user/posts')
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              Blog Posts
            </Link>
            
            <Link
              to="/user/comments"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/user/comments')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon
                className={`mr-3 h-5 w-5 ${
                  isActive('/user/comments')
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              Comments
            </Link>
            
            {/* Super Admin Link - Only for super_admin users */}
            {user?.role === 'super_admin' && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                    Super Admin
                  </p>
                </div>
                <Link
                  to="/super-admin"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                >
                  <ShieldCheckIcon
                    className="mr-3 h-5 w-5 text-red-500"
                  />
                  <span className="flex items-center">
                    System Control
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded-full">
                      SUPER
                    </span>
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowRightOnRectangleIcon
            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
          />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;

