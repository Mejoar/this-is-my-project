import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { postsAPI } from '../services/api';
import { Post, Tag, BlogContextType, PostFormData, SearchParams, AIGenerationRequest } from '../types';

// Blog state interface
interface BlogState {
  posts: Post[];
  currentPost: Post | null;
  tags: Tag[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Blog actions
type BlogAction =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_POSTS'; payload: { posts: Post[]; pagination: any } }
  | { type: 'SET_CURRENT_POST'; payload: Post }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'LIKE_POST'; payload: { postId: string; likeCount: number } };

// Initial state
const initialState: BlogState = {
  posts: [],
  currentPost: null,
  tags: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Blog reducer
const blogReducer = (state: BlogState, action: BlogAction): BlogState => {
  switch (action.type) {
    case 'LOADING_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOADING_END':
      return {
        ...state,
        loading: false,
      };
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload.posts,
        pagination: action.payload.pagination,
        loading: false,
      };
    case 'SET_CURRENT_POST':
      return {
        ...state,
        currentPost: action.payload,
        loading: false,
      };
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post._id === action.payload._id ? action.payload : post
        ),
        currentPost: state.currentPost?._id === action.payload._id 
          ? action.payload 
          : state.currentPost,
      };
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post._id !== action.payload),
        currentPost: state.currentPost?._id === action.payload 
          ? null 
          : state.currentPost,
      };
    case 'SET_TAGS':
      return {
        ...state,
        tags: action.payload,
      };
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post._id === action.payload.postId
            ? { ...post, likeCount: action.payload.likeCount }
            : post
        ),
        currentPost: state.currentPost?._id === action.payload.postId
          ? { ...state.currentPost, likeCount: action.payload.likeCount }
          : state.currentPost,
      };
    default:
      return state;
  }
};

// Create context
const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Blog provider props
interface BlogProviderProps {
  children: ReactNode;
}

// Blog provider component
export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  // Fetch posts function
  const fetchPosts = async (params: SearchParams = {}) => {
    try {
      dispatch({ type: 'LOADING_START' });
      
      const response = await postsAPI.getPosts(params);
      
      dispatch({
        type: 'SET_POSTS',
        payload: {
          posts: response.posts,
          pagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage,
          },
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch posts';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Fetch single post function
  const fetchPost = async (id: string) => {
    try {
      dispatch({ type: 'LOADING_START' });
      
      const response = await postsAPI.getPost(id);
      
      dispatch({ type: 'SET_CURRENT_POST', payload: response.post });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch post';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Create post function
  const createPost = async (postData: PostFormData) => {
    try {
      dispatch({ type: 'LOADING_START' });
      
      const response = await postsAPI.createPost(postData);
      
      dispatch({ type: 'ADD_POST', payload: response.post });
      dispatch({ type: 'LOADING_END' });
      
      toast.success('Post created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create post';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update post function
  const updatePost = async (id: string, postData: PostFormData) => {
    try {
      dispatch({ type: 'LOADING_START' });
      
      const response = await postsAPI.updatePost(id, postData);
      
      dispatch({ type: 'UPDATE_POST', payload: response.post });
      dispatch({ type: 'LOADING_END' });
      
      toast.success('Post updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update post';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete post function
  const deletePost = async (id: string) => {
    try {
      await postsAPI.deletePost(id);
      
      dispatch({ type: 'DELETE_POST', payload: id });
      
      toast.success('Post deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete post';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Like post function
  const likePost = async (id: string) => {
    try {
      const response = await postsAPI.likePost(id);
      
      dispatch({
        type: 'LIKE_POST',
        payload: { postId: id, likeCount: response.likeCount },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to like post';
      toast.error(errorMessage);
    }
  };

  // Generate post function
  const generatePost = async (request: AIGenerationRequest): Promise<string> => {
    try {
      dispatch({ type: 'LOADING_START' });
      
      const response = await postsAPI.generatePost(request);
      
      dispatch({ type: 'LOADING_END' });
      
      toast.success('Post generated successfully!');
      return response.generatedContent.content;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate post';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Summarize post function
  const summarizePost = async (id: string): Promise<string> => {
    try {
      const response = await postsAPI.summarizePost(id);
      
      toast.success('Summary generated!');
      return response.summary;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate summary';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value: BlogContextType = {
    posts: state.posts,
    currentPost: state.currentPost,
    tags: state.tags,
    loading: state.loading,
    error: state.error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    generatePost,
    summarizePost,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

// Custom hook to use blog context
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
