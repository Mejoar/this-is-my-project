export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'super_admin';
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: User;
  tags: Tag[];
  status: 'draft' | 'published';
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  parentComment?: string;
  replies: Comment[];
  isApproved: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostsResponse extends PaginatedResponse<Post> {
  posts: Post[];
  totalPosts: number;
}

export interface CommentsResponse extends PaginatedResponse<Comment> {
  comments: Comment[];
  totalComments: number;
}

export interface DashboardMetrics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  totalAdmins: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  totalLikes: number;
  postsThisMonth: number;
  commentsThisMonth: number;
}

export interface TagInsights {
  tags: Array<{
    _id: string;
    name: string;
    postCount: number;
    color: string;
  }>;
}

export interface AIGenerationRequest {
  title: string;
  tone?: string;
  keywords?: string[];
}

export interface AIGenerationResponse {
  message: string;
  generatedContent: {
    title: string;
    content: string;
    seoDescription?: string;
  };
}

export interface FormFieldError {
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  profileImage?: File;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  coverImage?: File;
}

export interface CommentFormData {
  content: string;
}

export interface SearchParams {
  query?: string;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface BlogContextType {
  posts: Post[];
  currentPost: Post | null;
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchPosts: (params?: SearchParams) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (postData: PostFormData) => Promise<void>;
  updatePost: (id: string, postData: PostFormData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  generatePost: (request: AIGenerationRequest) => Promise<string>;
  summarizePost: (id: string) => Promise<string>;
}
