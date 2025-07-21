# User Dashboard API Documentation

This document outlines the new user-specific dashboard API endpoints that allow users to see only their own statistics and manage their own content.

## Overview

Each user can now access personalized dashboard data showing:
- Their own post statistics (total posts, views, likes)
- Comments on their posts only
- Tag distribution for their posts
- Analytics for their content
- Management of only their own posts

## Authentication

All dashboard routes require authentication. Users can only see their own data - no other user's information is accessible.

## API Endpoints

### Base URL: `/api/dashboard`

---

### 1. Personal Statistics
**GET** `/api/dashboard/my-stats`

Returns comprehensive statistics for the authenticated user's content.

**Response:**
```json
{
  "totalPosts": 15,
  "publishedPosts": 12,
  "draftPosts": 3,
  "totalViews": 1250,
  "totalLikes": 89,
  "totalComments": 34,
  "pendingComments": 2,
  "postsThisMonth": 4,
  "commentsThisMonth": 8,
  "avgViews": 104,
  "avgLikes": 7
}
```

---

### 2. Tag Distribution
**GET** `/api/dashboard/my-tag-distribution`

Returns the distribution of tags used in the user's posts.

**Response:**
```json
{
  "tags": [
    {
      "_id": "tag_id",
      "name": "javascript",
      "color": "#f7df1e",
      "count": 5
    },
    {
      "_id": "tag_id",
      "name": "react",
      "color": "#61dafb",
      "count": 3
    }
  ]
}
```

---

### 3. Top Posts
**GET** `/api/dashboard/my-top-posts?sort=views&limit=5`

Returns the user's most popular posts.

**Query Parameters:**
- `sort`: "views" or "likes" (default: "views")
- `limit`: Number of posts to return (default: 5)

**Response:**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "My Popular Post",
      "slug": "my-popular-post",
      "viewCount": 250,
      "likeCount": 15,
      "commentCount": 8,
      "publishedAt": "2024-01-15T10:00:00Z",
      "coverImage": "/uploads/posts/image.jpg"
    }
  ]
}
```

---

### 4. Recent Comments
**GET** `/api/dashboard/my-recent-comments?limit=10`

Returns recent comments on the user's posts.

**Query Parameters:**
- `limit`: Number of comments to return (default: 10)

**Response:**
```json
{
  "comments": [
    {
      "_id": "comment_id",
      "content": "Great post!",
      "author": {
        "name": "John Doe",
        "profileImage": "/uploads/profiles/john.jpg"
      },
      "post": {
        "title": "My Post Title",
        "slug": "my-post-title"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 5. My Posts
**GET** `/api/dashboard/my-posts?page=1&limit=10&status=all`

Returns the user's posts with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 10)
- `status`: "published", "draft", or "all" (default: "all")

**Response:**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "My Post",
      "slug": "my-post",
      "status": "published",
      "viewCount": 100,
      "likeCount": 5,
      "commentCount": 3,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "publishedAt": "2024-01-15T10:00:00Z",
      "coverImage": "/uploads/posts/image.jpg",
      "excerpt": "Post excerpt...",
      "tags": [
        {
          "name": "javascript",
          "slug": "javascript",
          "color": "#f7df1e"
        }
      ]
    }
  ],
  "totalPosts": 15,
  "currentPage": 1,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

### 6. Analytics
**GET** `/api/dashboard/my-analytics?period=30`

Returns analytics data for the user's content over a specified time period.

**Query Parameters:**
- `period`: Number of days (default: 30)

**Response:**
```json
{
  "postsOverTime": [
    {
      "_id": "2024-01-15",
      "count": 2
    }
  ],
  "commentsOverTime": [
    {
      "_id": "2024-01-15",
      "count": 5
    }
  ],
  "viewsByPost": [
    {
      "_id": "post_id",
      "title": "Popular Post",
      "viewCount": 250,
      "likeCount": 15
    }
  ],
  "period": 30
}
```

---

## Post Management Updates

The post management endpoints have been updated to ensure users can only edit/delete their own posts:

### Updated Endpoints:

**PUT** `/api/posts/:id` - Users can only edit their own posts
**DELETE** `/api/posts/:id` - Users can only delete their own posts
**GET** `/api/admin/posts` - Users can only see their own posts (not all posts)

These endpoints will return a 403 error if a user tries to modify another user's post.

---

## User Roles

- **Default Role**: All new users are assigned the "admin" role by default
- **Post Permissions**: All authenticated users can create, edit, and delete posts (only their own)
- **Dashboard Access**: All authenticated users can access their personal dashboard

---

## Error Responses

All endpoints return appropriate error responses:

- `401 Unauthorized`: No valid authentication token
- `403 Forbidden`: Attempting to access/modify another user's content
- `404 Not Found`: Requested resource doesn't exist
- `500 Internal Server Error`: Server-side error

Example error response:
```json
{
  "message": "You can only edit your own posts",
  "error": "Forbidden"
}
```
