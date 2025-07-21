import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  return (
    <div className="h-full bg-white shadow-lg w-60 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>User Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/admin/posts"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <PencilSquareIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>Blog Posts</span>
        </NavLink>
        
        <NavLink
          to="/admin/comments"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>Comments</span>
        </NavLink>
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

