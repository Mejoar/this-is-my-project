import api from './api';

export interface SuperAdminMetrics {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    totalLikes: number;
    publishedPosts: number;
    draftPosts: number;
    featuredPosts: number;
    totalTags: number;
    totalReadingTime: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    superAdmins: number;
    regular: number;
    growthRate: string;
  };
  content: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    featuredPosts: number;
    totalComments: number;
    approvedComments: number;
    pendingComments: number;
    totalTags: number;
    totalViews: number;
    totalLikes: number;
    postGrowthRate: string;
    commentGrowthRate: string;
    avgViewsPerPost: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgReadingTime: number;
  };
  activity: {
    today: {
      newUsers: number;
      newPosts: number;
      newComments: number;
    };
    thisWeek: {
      newUsers: number;
      newPosts: number;
      newComments: number;
    };
    thisMonth: {
      newUsers: number;
      newPosts: number;
      newComments: number;
    };
    last3Months: {
      newUsers: number;
      newPosts: number;
      newComments: number;
    };
  };
  engagement: {
    mostViewedPosts: Array<{
      _id: string;
      title: string;
      viewCount: number;
      slug: string;
      author: {
        name: string;
      };
    }>;
    mostLikedPosts: Array<{
      _id: string;
      title: string;
      likeCount: number;
      slug: string;
      author: {
        name: string;
      };
    }>;
    mostActiveUsers: Array<{
      _id: string;
      name: string;
      email: string;
      postCount: number;
      totalViews: number;
      totalLikes: number;
      avgViewsPerPost: number;
    }>;
  };
  systemHealth: {
    activeUsersPercentage: string;
    publishedPostsPercentage: string;
    approvedCommentsPercentage: string;
    postsWithCommentsPercentage: string;
  };
}

export interface SuperAdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: SuperAdminUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface UpdateRoleResponse {
  message: string;
  user: SuperAdminUser;
}

export interface CleanupResponse {
  message: string;
  results: {
    orphanedComments: number;
    inactiveUsers: number;
    emptyTags: number;
  };
}

export interface AnalyticsTrendsResponse {
  period: number;
  trends: {
    users: Array<{
      _id: string;
      count: number;
      admins: number;
      superAdmins: number;
    }>;
    posts: Array<{
      _id: string;
      count: number;
      published: number;
      totalViews: number;
      totalLikes: number;
    }>;
    comments: Array<{
      _id: string;
      count: number;
      approved: number;
    }>;
  };
}

export interface TopContentResponse {
  topPosts: Array<{
    _id: string;
    title: string;
    slug: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    engagementScore: number;
    publishedAt: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  topAuthors: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    avgViews: number;
    avgLikes: number;
  }>;
  topTags: Array<{
    _id: string;
    name: string;
    color: string;
    slug: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
    avgViews: number;
  }>;
  recentActivity: Array<{
    _id: string;
    title: string;
    slug: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

export interface UserEngagementResponse {
  engagementStats: {
    _id: null;
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    avgViewsPerPost: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    maxViews: number;
    maxLikes: number;
  };
  userActivity: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    postCount: number;
    commentCount: number;
    publishedPosts: number;
  }>;
  contentDistribution: Array<{
    _id: string;
    role: string;
    userCount: number;
    totalPosts: number;
    publishedPosts: number;
    avgPostsPerUser: number;
  }>;
}

class SuperAdminAPI {
  // Get comprehensive system metrics
  async getSystemMetrics(): Promise<SuperAdminMetrics> {
    const response = await api.get('/superadmin/system-metrics');
    return response.data;
  }

  // Get all users with pagination and filters
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: 'member' | 'admin' | 'super_admin' | 'all';
    status?: 'active' | 'inactive' | 'all';
  } = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role && params.role !== 'all') queryParams.append('role', params.role);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);

    const response = await api.get(`/superadmin/users/all?${queryParams.toString()}`);
    return response.data;
  }

  // Delete a user (including their content)
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    const response = await api.delete(`/superadmin/users/${userId}`);
    return response.data;
  }

  // Change user role
  async updateUserRole(userId: string, role: 'member' | 'admin' | 'super_admin'): Promise<UpdateRoleResponse> {
    const response = await api.put(`/superadmin/users/${userId}/role`, { role });
    return response.data;
  }

  // Delete any post
  async deletePost(postId: string): Promise<{ message: string; deletedPost: any }> {
    const response = await api.delete(`/superadmin/posts/${postId}`);
    return response.data;
  }

  // System cleanup
  async systemCleanup(): Promise<CleanupResponse> {
    const response = await api.post('/superadmin/system/cleanup');
    return response.data;
  }

  // Get all posts (system-wide)
  async getAllPosts(params: {
    page?: number;
    limit?: number;
    status?: 'published' | 'draft' | 'all';
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);

    const response = await api.get(`/admin/posts?${queryParams.toString()}`);
    return response.data;
  }

  // Get all comments (system-wide)
  async getAllComments(params: {
    page?: number;
    limit?: number;
    approved?: boolean;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.approved !== undefined) queryParams.append('approved', params.approved.toString());

    const response = await api.get(`/admin/comments?${queryParams.toString()}`);
    return response.data;
  }

  // Create user
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'member' | 'admin' | 'super_admin';
  }): Promise<any> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Get system analytics
  async getAnalytics(period: string = '30'): Promise<any> {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  }

  // Get analytics trends over time
  async getAnalyticsTrends(period: '7' | '30' | '90' | '365' = '30'): Promise<AnalyticsTrendsResponse> {
    const response = await api.get(`/superadmin/analytics/trends?period=${period}`);
    return response.data;
  }

  // Get top performing content analytics
  async getTopContent(limit: number = 10): Promise<TopContentResponse> {
    const response = await api.get(`/superadmin/analytics/top-content?limit=${limit}`);
    return response.data;
  }

  // Get detailed user engagement analytics
  async getUserEngagement(): Promise<UserEngagementResponse> {
    const response = await api.get('/superadmin/analytics/user-engagement');
    return response.data;
  }
}

export const superAdminAPI = new SuperAdminAPI();
export default superAdminAPI;
