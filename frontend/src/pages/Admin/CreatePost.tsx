import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PhotoIcon,
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
  SparklesIcon,
  LightBulbIcon,
  BookOpenIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { postsAPI } from '../../services/api';
import { PostFormData, AIGenerationRequest } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminCreatePost: React.FC = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      status: 'draft',
      featured: false,
      tags: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const watchedContent = watch('content', '');
  const watchedTitle = watch('title', '');

  // AI Assistant functions
  const generateContentWithAI = async (prompt: string) => {
    try {
      setAiLoading(true);
      const request: AIGenerationRequest = {
        title: watchedTitle || prompt,
        tone: 'professional',
        keywords: []
      };
      const response = await postsAPI.generatePost(request);
      if (response.generatedContent) {
        setValue('content', response.generatedContent.content);
        if (!watchedTitle && response.generatedContent.title) {
          setValue('title', response.generatedContent.title);
        }
        if (response.generatedContent.seoDescription) {
          setValue('seoDescription', response.generatedContent.seoDescription);
        }
        toast.success('AI content generated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate AI content');
    } finally {
      setAiLoading(false);
    }
  };

  const improveTitleWithAI = async () => {
    if (!watchedTitle) {
      toast.warning('Please enter a title first');
      return;
    }
    try {
      setAiLoading(true);
      const request: AIGenerationRequest = {
        title: watchedTitle,
        tone: 'engaging'
      };
      const response = await postsAPI.generatePost(request);
      if (response.generatedContent?.title) {
        setValue('title', response.generatedContent.title);
        toast.success('Title improved with AI!');
      }
    } catch (error: any) {
      toast.error('Failed to improve title');
    } finally {
      setAiLoading(false);
    }
  };

  const generateExcerptFromContent = () => {
    if (!watchedContent) {
      toast.warning('Please write some content first');
      return;
    }
    // Generate excerpt from first 160 characters of content
    const excerpt = watchedContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 160)
      .trim() + '...';
    setValue('excerpt', excerpt);
    toast.success('Excerpt generated!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      setLoading(true);
      
      // Debug: Log the current user and token
      console.log('Current user:', localStorage.getItem('user'));
      console.log('Current token exists:', !!localStorage.getItem('token'));
      
      // Process tags from comma-separated string to array
      const processedData = {
        ...data,
        tags: typeof data.tags === 'string' 
          ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : data.tags || [],
        coverImage: coverImage || undefined
      };

      console.log('Processed data:', processedData);
      
      await postsAPI.createPost(processedData);
      toast.success('Post created successfully!');
      navigate('/admin/posts');
    } catch (error: any) {
      console.error('Create post error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        fullError: error
      });
      
      // Log the form data being sent
      console.log('Form data being sent:', processedData);
      
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized. Please login again.';
        // Don't clear tokens here - let the auth context handle it
        navigate('/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/posts')}
              className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
              <p className="text-gray-600">Create and publish your blog post</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="btn btn-outline flex items-center"
            >
              {isPreviewMode ? (
                <>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Cover Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <label htmlFor="cover-image" className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      Upload a cover image
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <button
                  type="button"
                  onClick={improveTitleWithAI}
                  disabled={aiLoading || !watchedTitle}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center"
                >
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  AI Improve
                </button>
              </div>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="form-input"
                placeholder="Enter your post title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              {isPreviewMode ? (
                <div className="min-h-[300px] p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="prose max-w-none">
                    {watchedContent ? (
                      <div dangerouslySetInnerHTML={{ __html: watchedContent.replace(/\n/g, '<br>') }} />
                    ) : (
                      <p className="text-gray-500 italic">Start writing your content to see preview...</p>
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  id="content"
                  rows={12}
                  {...register('content', { required: 'Content is required' })}
                  className="form-textarea"
                  placeholder="Write your post content here... You can use Markdown formatting."
                />
              )}
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt
                </label>
                <button
                  type="button"
                  onClick={generateExcerptFromContent}
                  disabled={!watchedContent}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 flex items-center"
                >
                  <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                  Generate
                </button>
              </div>
              <textarea
                id="excerpt"
                rows={3}
                {...register('excerpt')}
                className="form-textarea"
                placeholder="Optional excerpt or summary of your post..."
              />
              <p className="mt-1 text-sm text-gray-500">
                If left empty, an excerpt will be automatically generated from your content.
              </p>
            </div>
          </div>

          {/* AI Writing Assistant */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
                AI Writing Assistant
              </h3>
              <button
                type="button"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                {showAIAssistant ? 'Hide' : 'Show'} Assistant
              </button>
            </div>
            
            {showAIAssistant && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Let AI help you create engaging content for your blog post.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => generateContentWithAI('Write a comprehensive blog post')}
                    disabled={aiLoading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-start text-left"
                  >
                    <BookOpenIcon className="w-5 h-5 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Generate Full Content</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Create a complete blog post based on your title
                      </p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => generateContentWithAI('Write an engaging introduction')}
                    disabled={aiLoading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-start text-left"
                  >
                    <LightBulbIcon className="w-5 h-5 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Create Introduction</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Generate an engaging opening paragraph
                      </p>
                    </div>
                  </button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Custom AI Prompt</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Describe what you want AI to write..."
                      className="flex-1 form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          generateContentWithAI(target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        generateContentWithAI(input.value);
                        input.value = '';
                      }}
                      disabled={aiLoading}
                      className="btn btn-outline flex items-center"
                    >
                      {aiLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Post Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Post Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  {...register('tags')}
                  className="form-input"
                  placeholder="react, javascript, tutorial"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  {...register('status', { required: 'Status is required' })}
                  className="form-select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="mt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="featured"
                    type="checkbox"
                    {...register('featured')}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="featured" className="font-medium text-gray-700">
                    Featured Post
                  </label>
                  <p className="text-gray-500">Mark this post as featured to highlight it on your blog.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            {/* SEO Title */}
            <div className="mb-6">
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                id="seoTitle"
                type="text"
                {...register('seoTitle')}
                className="form-input"
                placeholder="Optimized title for search engines..."
              />
              <p className="mt-1 text-sm text-gray-500">
                If left empty, the post title will be used.
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                rows={3}
                {...register('seoDescription')}
                className="form-textarea"
                placeholder="Brief description for search engines (150-160 characters)..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This description will appear in search engine results.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/admin/posts')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn btn-outline"
                disabled={loading}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                onClick={() => {
                  // Set status to published using React Hook Form's setValue
                  setValue('status', 'published');
                }}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCreatePost;
