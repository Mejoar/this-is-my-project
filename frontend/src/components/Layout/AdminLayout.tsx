import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-60
        transform transition-transform duration-300 ease-in-out
        ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }
      `}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${!isMobile && sidebarOpen ? 'lg:ml-60' : 'ml-0'}
      `}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Left side - Toggle button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                title={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
              >
                {sidebarOpen ? (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Hide</span>
                  </>
                ) : (
                  <>
                    <Bars3Icon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Menu</span>
                  </>
                )}
              </button>
              
              {/* Welcome text - responsive */}
              <div className="hidden md:block">
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  Welcome back, {user?.name || 'Admin'} 👋
                </h1>
                <p className="text-sm text-gray-600 hidden lg:block">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Right side - User profile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile welcome text */}
              <div className="md:hidden">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin'}
                </p>
              </div>
              
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
