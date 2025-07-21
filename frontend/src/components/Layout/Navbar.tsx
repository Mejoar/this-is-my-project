import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              Time To Program
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium border-b-2 border-transparent hover:border-primary-500"
            >
              Home
            </Link>
            <Link 
              to="/category/react" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium border-b-2 border-transparent hover:border-primary-500"
            >
              React JS
            </Link>
            <Link 
              to="/category/nextjs" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium border-b-2 border-transparent hover:border-primary-500"
            >
              Next JS
            </Link>
            <Link 
              to="/category/python" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium border-b-2 border-transparent hover:border-primary-500"
            >
              Python
            </Link>
          </div>

          {/* Search and Auth */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 text-sm hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-primary-500 cursor-pointer">Hello, {user.name}</span>
                {user.role === 'super_admin' ? (
                  <>
                    <Link 
                      to="/user/panel" 
                      className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors border-b-2 border-transparent hover:border-primary-500"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin" 
                      className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors border-b-2 border-transparent hover:border-primary-500"
                    >
                      Admin
                    </Link>
                  </>
                ) : user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors border-b-2 border-transparent hover:border-primary-500"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link 
                    to="/user/panel" 
                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors border-b-2 border-transparent hover:border-primary-500"
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-primary-500"
                >
                  Profile
                </Link>
                <button 
                  onClick={logout}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors border-b-2 border-transparent hover:border-primary-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  SignUp
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
