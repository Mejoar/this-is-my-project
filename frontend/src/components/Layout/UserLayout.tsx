import React from 'react';
import UserSidebar from './UserSidebar';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <UserSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
