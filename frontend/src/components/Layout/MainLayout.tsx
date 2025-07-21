import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Routes that should not show navbar and footer (have their own layout)
  const fullLayoutRoutes = ['/user/panel', '/user/posts', '/user/comments', '/super-admin', '/super-admin/dashboard'];
  
  const shouldShowNavbarFooter = !fullLayoutRoutes.includes(location.pathname);

  if (!shouldShowNavbarFooter) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
