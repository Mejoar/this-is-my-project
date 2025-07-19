# ThisBlog Backend

This is the backend service for the ThisBlog application built with Node.js and Express. It handles all API requests related to user authentication, blog post management, comments, and more.

## Features
- **User Authentication**: Using JWT for secure user sessions.
- **Blog Post Management**: Create, update, delete, and view blog posts.
- **Comments**: Add, delete, and manage comments on blog posts.
- **AI Integration**: Generate and summarize content using Google Gemini AI.
- **File Uploads**: Image uploads for posts and profiles with Multer.
- **Admin Dashboard**: Metrics and insights for administrator users.

## Getting Started

### Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **MongoDB**: Access to a MongoDB instance.
- **Google AI API Key**: Access token for the AI features.

### Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/thisblog.git
   cd thisblog/backend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   
3. **Set Environment Variables**:
   Copy `.env.example` to `.env` and update the values.

4. **Run the server**:
   ```bash
   pnpm run dev
   ```

5. **Access API Endpoints**:
   The server will run at `http://localhost:5000`. API endpoints are available under `/api`.

## Documentation

### API Endpoints
- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, etc.
- **Posts**: `GET /api/posts`, `POST /api/posts`, etc.
- **Comments**: `GET /api/comments/:postId`, `POST /api/comments/:postId`, etc.
- **Admin**: `GET /api/admin/dashboard-metrics`, etc.
- **Upload**: `POST /api/upload/profile`, etc.

### Environment Variables
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: JWT secret key for signing tokens.
- `GEMINI_API_KEY`: API key for AI integration.
- `ADMIN_INVITE_TOKEN`: Admin invite token.
- More details can be found inside `.env.example`.

## Contribution
Feel free to open issues or submit PRs for improvements.

## License
This project is licensed under the MIT License.
