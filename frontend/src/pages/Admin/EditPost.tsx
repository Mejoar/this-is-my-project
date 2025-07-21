import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Layout/AdminLayout';
import { postsAPI, adminAPI } from '../../services/api';
import { FiUpload, FiX, FiEye, FiEdit, FiSend, FiStar, FiRefreshCw } from 'react-icons/fi';

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  status: 'draft' | 'published';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminEditPost: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, getValues, watch } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      status: 'draft',
      featured: false,
      seoTitle: '',
      seoDescription: ''
    }
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  useEffect(() => {
    if (!id) {
      toast.error('Post ID not found');
      navigate('/admin/posts');
      return;
    }

    loadPost();
  }, [id, navigate]);

  const loadPost = async () => {
    try {
      setInitialLoading(true);
      const response = await adminAPI.getPost(id!);
      const postData = response.post;
      setPost(postData);
      
      // Populate form with existing data
      setValue('title', postData.title);
      setValue('content', postData.content);
      setValue('excerpt', postData.excerpt);
      setValue('tags', postData.tags?.join(', ') || '');
      setValue('status', postData.status);
      setValue('featured', postData.featured);
      setValue('seoTitle', postData.seoTitle || '');
      setValue('seoDescription', postData.seoDescription || '');
      
      if (postData.coverImage) {
        setCoverImagePreview(postData.coverImage);
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to continue');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Post not found');
        navigate('/admin/posts');
      } else {
        toast.error('Failed to load post');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for AI content generation');
      return;
    }

    try {
      setAiLoading(true);
      const response = await postsAPI.generateContent(aiPrompt);
      const currentContent = getValues('content');
      const newContent = currentContent ? currentContent + '\n\n' + response.data.content : response.data.content;
      setValue('content', newContent);
      setAiPrompt('');
      toast.success('AI content generated successfully!');
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiLoading(false);
    }
  };

  const improveTitle = async () => {
    const currentTitle = getValues('title');
    if (!currentTitle.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    try {
      setLoading(true);
      const response = await postsAPI.improveTitle(currentTitle);
      setValue('title', response.data.title);
      toast.success('Title improved with AI!');
    } catch (error: any) {
      console.error('Error improving title:', error);
      toast.error('Failed to improve title');
    } finally {
      setLoading(false);
    }
  };

  const generateExcerpt = async () => {
    const content = getValues('content');
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    try {
      setLoading(true);
      const response = await postsAPI.generateExcerpt(content);
      setValue('excerpt', response.data.excerpt);
      toast.success('Excerpt generated!');
    } catch (error: any) {
      console.error('Error generating excerpt:', error);
      toast.error('Failed to generate excerpt');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Prepare the post data object for the API
      const postData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: data.status,
        featured: data.featured,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        coverImage: coverImage
      };

      await postsAPI.updatePost(id, postData);
      
      toast.success(`Post ${data.status === 'published' ? 'updated and published' : 'updated as draft'} successfully!`);
      navigate('/admin/posts');
    } catch (error: any) {
      console.error('Error updating post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to continue');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: any) => {
            toast.error(`Validation error: ${err.msg || err.message}`);
          });
        } else {
          toast.error(errorData.message || 'Validation failed');
        }
      } else if (error.response?.status === 403) {
        toast.error('You can only edit your own posts');
        navigate('/admin/posts');
      } else if (error.response?.status === 404) {
        toast.error('Post not found');
        navigate('/admin/posts');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/posts');
  };

  const aiPrompts = [
    "Write an engaging introduction for this topic",
    "Add some practical examples and use cases",
    "Include relevant statistics and data points",
    "Write a compelling conclusion with call-to-action",
    "Add frequently asked questions section",
    "Include best practices and tips"
  ];

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-600">Post not found</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            <p className="mt-2 text-gray-600">Update your blog post content and settings</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Cover Image */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Cover Image</h3>
                  
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="cover-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload cover image
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </span>
                        </label>
                        <input
                          id="cover-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Post Title</h3>
                    <button
                      type="button"
                      onClick={improveTitle}
                      disabled={loading || !watchedTitle}
                      className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiStar className="w-4 h-4 mr-1" />
                      Improve with AI
                    </button>
                  </div>
                  
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Enter your post title..."
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Content</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <FiSend className="w-4 h-4 mr-1" />
                        AI Assistant
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {isPreviewMode ? (
                          <><FiEdit className="w-4 h-4 mr-1" /> Edit</>
                        ) : (
                          <><FiEye className="w-4 h-4 mr-1" /> Preview</>
                        )}
                      </button>
                    </div>
                  </div>

                  {isPreviewMode ? (
                    <div className="prose max-w-none p-4 bg-gray-50 rounded-lg min-h-96">
                      {watchedContent ? (
                        <div dangerouslySetInnerHTML={{ __html: watchedContent.replace(/\n/g, '<br>') }} />
                      ) : (
                        <p className="text-gray-500 italic">No content to preview</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      {...register('content', { required: 'Content is required' })}
                      rows={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      placeholder="Write your post content here..."
                    />
                  )}
                  
                  {errors.content && (
                    <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                  )}

                  {/* AI Assistant */}
                  {showAIAssistant && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3">AI Writing Assistant</h4>
                      
                      {/* Quick Prompts */}
                      <div className="mb-4">
                        <p className="text-sm text-blue-700 mb-2">Quick prompts:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiPrompts.map((prompt, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setAiPrompt(prompt)}
                              className="px-3 py-1 text-xs bg-white text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Prompt */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Or enter your custom prompt..."
                          className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={generateWithAI}
                          disabled={aiLoading || !aiPrompt.trim()}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          {aiLoading ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiSend className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Excerpt</h3>
                    <button
                      type="button"
                      onClick={generateExcerpt}
                      disabled={loading || !watchedContent}
                      className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiRefreshCw className="w-4 h-4 mr-1" />
                      Generate from content
                    </button>
                  </div>
                  
                  <textarea
                    {...register('excerpt', { required: 'Excerpt is required' })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Brief summary of your post..."
                  />
                  {errors.excerpt && (
                    <p className="mt-2 text-sm text-red-600">{errors.excerpt.message}</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Post Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <input
                        {...register('tags')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                      <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('featured')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Featured post
                      </label>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Title
                      </label>
                      <input
                        {...register('seoTitle')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Custom title for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        {...register('seoDescription')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Description for search engines"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setValue('status', 'draft')}
                      className="w-full px-4 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Save as Draft
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setValue('status', 'published')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Update & Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEditPost;
