# ThisBlog - AI-Powered MERN Blog Platform

A full-stack blog application built with MongoDB, Express.js, React, and Node.js (MERN stack) featuring AI-powered content generation, markdown support, and a complete admin dashboard.

![ThisBlog Screenshot](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=ThisBlog+-+AI+Powered+Blog+Platform)

## 🚀 Features

### Core Features
- ✅ **User Authentication** - JWT-based authentication with role-based access
- ✅ **Blog Management** - Complete CRUD operations for blog posts
- ✅ **Markdown Support** - Rich text editing with markdown preview
- ✅ **Comment System** - Nested comments with replies
- ✅ **Tag System** - Categorize posts with tags
- ✅ **File Uploads** - Profile images and post cover images
- ✅ **Search & Filtering** - Search posts by keywords and filter by tags
- ✅ **Responsive Design** - Mobile-first design with Tailwind CSS

### AI-Powered Features
- 🤖 **AI Blog Post Generation** - Generate full blog posts from titles using Google Gemini AI
- 🤖 **Post Summarization** - AI-powered summaries of existing posts
- 🤖 **Comment Reply Generation** - Smart AI replies to comments
- 🤖 **SEO Optimization** - AI-generated meta descriptions

### Admin Features
- 📊 **Dashboard Analytics** - Real-time metrics and insights
- 📝 **Post Management** - Manage all posts (published and drafts)
- 💬 **Comment Moderation** - Approve/disapprove comments
- 👥 **User Management** - Control user accounts
- 🏷️ **Tag Analytics** - Visual insights with charts

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Google Gemini AI** - AI content generation
- **Bcrypt** - Password hashing

### Frontend
- **React 19** + **TypeScript** - UI framework
- **Tailwind CSS** - Styling framework
- **React Router v6** - Client-side routing
- **React Hook Form** - Form management
- **React Context** - State management
- **Axios** - HTTP client
- **Vite** - Build tool

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **pnpm** (package manager)
- **Google Gemini API Key** (for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd thisblog-app
```

### 2. Backend Setup
```bash
cd backend
pnpm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd ../frontend
pnpm install
```

## ⚙️ Configuration

### Backend Environment Variables (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/thisblog

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Admin Configuration
ADMIN_INVITE_TOKEN=123456

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

### Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
pnpm run dev
```
Server runs on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
pnpm run dev
```
Frontend runs on `http://localhost:3000`

## 👤 Creating Your First Admin Account

1. Go to `http://localhost:3000/signup`
2. Fill in your details
3. Enter `123456` in the "Admin Invite Token" field
4. Click "Create Account"
5. You'll now have admin privileges!

## 📱 Usage Guide

### For Regular Users
1. **Browse Posts** - View all published blog posts on the homepage
2. **Read Articles** - Click on any post to read the full content
3. **Comment** - Sign up and leave comments on posts
4. **Search** - Use the search functionality to find specific content

### For Admins
1. **Access Admin Panel** - Click "Admin" in the navigation after logging in
2. **Create Posts** - Use the rich markdown editor to create content
3. **AI Generation** - Use AI features to generate content or summaries
4. **Manage Comments** - Moderate user comments
5. **View Analytics** - Check dashboard metrics and insights

## 🤖 AI Features Guide

### Generate Blog Posts
1. Go to Admin → Create Post
2. Click "Generate with AI"
3. Enter a title and select tone
4. AI will generate a complete blog post

### Summarize Posts
1. View any blog post
2. Click "Generate Summary" button
3. AI creates a concise summary in seconds

### Smart Comment Replies
1. In Admin → Comments
2. Click "Generate AI Reply" on any comment
3. AI suggests contextual responses

## 🎨 Customization

### Styling
- Edit `frontend/src/index.css` for global styles
- Modify `frontend/tailwind.config.js` for theme colors
- All components use Tailwind CSS classes

### Features
- Add new API routes in `backend/routes/`
- Create new React components in `frontend/src/components/`
- Extend the database models in `backend/models/`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Posts Endpoints
- `GET /api/posts` - Get all published posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (Admin)
- `PUT /api/posts/:id` - Update post (Admin)
- `DELETE /api/posts/:id` - Delete post (Admin)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/summarize` - AI summarize post
- `POST /api/posts/generate-ai` - AI generate post (Admin)

### Comments Endpoints
- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments/:postId` - Add comment
- `POST /api/comments/:commentId/reply` - Reply to comment
- `DELETE /api/comments/:commentId` - Delete comment

### Admin Endpoints
- `GET /api/admin/dashboard-metrics` - Dashboard data
- `GET /api/admin/posts` - All posts (Admin)
- `GET /api/admin/comments` - All comments (Admin)

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to services like Railway, Render, or Heroku
3. Ensure MongoDB connection string is configured

### Frontend Deployment
1. Build the frontend: `pnpm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API base URL to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Issues**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network connectivity and credentials

**AI Features Not Working**
- Check if `GEMINI_API_KEY` is correctly set in `.env`
- Verify API key is valid and has sufficient quota

**File Upload Issues**
- Check if upload directories exist in `backend/uploads/`
- Verify file size limits in configuration

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors in the console

## 📞 Support

For questions and support:
- Check the [GitHub Issues](../../issues)
- Review the documentation above
- Make sure all environment variables are properly configured

---

**Happy Blogging with AI!** 🎉
