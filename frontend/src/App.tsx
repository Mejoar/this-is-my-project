import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Page Components
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import TagPosts from './pages/TagPosts';
import SearchResults from './pages/SearchResults';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Auth/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminPosts from './pages/Admin/Posts';
import AdminCreatePost from './pages/Admin/CreatePost';
import AdminEditPost from './pages/Admin/EditPost';
import AdminComments from './pages/Admin/Comments';

// Protected Route Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Loading and Error Components
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BlogProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Navigation */}
              <Navbar />
              
              {/* Main Content */}
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/tag/:tag" element={<TagPosts />} />
                  <Route path="/search" element={<SearchResults />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/dashboard" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/posts" element={
                    <AdminRoute>
                      <AdminPosts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/posts/new" element={
                    <AdminRoute>
                      <AdminCreatePost />
                    </AdminRoute>
                  } />
                  <Route path="/admin/posts/edit/:id" element={
                    <AdminRoute>
                      <AdminEditPost />
                    </AdminRoute>
                  } />
                  <Route path="/admin/comments" element={
                    <AdminRoute>
                      <AdminComments />
                    </AdminRoute>
                  } />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={
                    <div className="container mx-auto px-4 py-16 text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page not found</p>
                      <a 
                        href="/" 
                        className="btn btn-primary"
                      >
                        Go Home
                      </a>
                    </div>
                  } />
                </Routes>
              </main>
              
              {/* Footer */}
              <Footer />
              
              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                className="mt-16"
              />
            </div>
          </Router>
        </BlogProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
