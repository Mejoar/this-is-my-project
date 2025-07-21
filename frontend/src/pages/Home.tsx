import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

// Mock data with diverse content types
const mockPosts = [
  {
    _id: '1',
    title: 'Building a Simple CRUD App with React, Node.js, and Express',
    slug: 'building-simple-crud-app',
    excerpt: 'This blog post will walk you through building a simple CRUD (Create, Read, Update, Delete) application using the popular technologies: React (for the front-end), Node.js (for the back-end) and Express (a Node.js...',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    author: {
      _id: '1',
      name: 'Mike Johnson',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '1', name: 'React', color: '#61DAFB' },
      { _id: '2', name: 'Node.js', color: '#339933' },
      { _id: '3', name: 'CRUD', color: '#FF6B6B' }
    ],
    publishedAt: '2025-07-19T00:00:00Z',
    viewCount: 2150,
    likeCount: 89,
    commentCount: 23,
    readingTime: 8,
    featured: true
  },
  {
    _id: '2',
    title: 'Optimizing React Performance: Code Splitting, Memoization, and Lazy Loading',
    slug: 'optimizing-react-performance',
    excerpt: 'Learn advanced techniques to optimize your React applications for better performance and user experience.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    author: {
      _id: '2',
      name: 'Sarah Chen',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b4c2?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '1', name: 'React', color: '#61DAFB' },
      { _id: '4', name: 'Performance', color: '#FFA500' }
    ],
    publishedAt: '2025-07-18T00:00:00Z',
    viewCount: 1892,
    likeCount: 67,
    commentCount: 15,
    readingTime: 12
  },
  {
    _id: '3',
    title: 'Building a Serverless API with Next.js API Routes and Node.js',
    slug: 'serverless-api-nextjs',
    excerpt: 'Discover how to build scalable serverless APIs using Next.js API routes and modern Node.js practices.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    author: {
      _id: '3',
      name: 'Alex Rivera',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '5', name: 'Next.js', color: '#000000' },
      { _id: '2', name: 'Node.js', color: '#339933' }
    ],
    publishedAt: '2025-07-17T00:00:00Z',
    viewCount: 1243,
    likeCount: 45,
    commentCount: 12,
    readingTime: 10
  },
  {
    _id: '4',
    title: 'Mastering Server-Side Rendering (SSR) in Next.js for Improved SEO',
    slug: 'mastering-ssr-nextjs',
    excerpt: 'Learn how to implement server-side rendering in Next.js to boost your website SEO and performance.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    author: {
      _id: '4',
      name: 'David Kim',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '5', name: 'Next.js', color: '#000000' },
      { _id: '6', name: 'SEO', color: '#4285F4' }
    ],
    publishedAt: '2025-07-16T00:00:00Z',
    viewCount: 954,
    likeCount: 38,
    commentCount: 9,
    readingTime: 15
  },
  {
    _id: '5',
    title: 'Top 5 React UI Component Libraries to Supercharge Your Development',
    slug: 'top-react-ui-libraries',
    excerpt: 'Explore the best React UI component libraries that can accelerate your development workflow.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    author: {
      _id: '5',
      name: 'Emma Wilson',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '1', name: 'React', color: '#61DAFB' },
      { _id: '7', name: 'UI Libraries', color: '#9C27B0' }
    ],
    publishedAt: '2025-07-15T00:00:00Z',
    viewCount: 821,
    likeCount: 29,
    commentCount: 7,
    readingTime: 6
  },
  {
    _id: '6',
    title: 'Understanding TypeScript Generics: A Complete Guide',
    slug: 'typescript-generics-guide',
    excerpt: 'Master TypeScript generics with practical examples and real-world use cases that will make your code more flexible and reusable.',
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=250&fit=crop',
    author: {
      _id: '6',
      name: 'James Thompson',
      profileImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '8', name: 'TypeScript', color: '#3178C6' },
      { _id: '9', name: 'JavaScript', color: '#F7DF1E' }
    ],
    publishedAt: '2025-07-14T00:00:00Z',
    viewCount: 712,
    likeCount: 52,
    commentCount: 18,
    readingTime: 9
  },
  {
    _id: '7',
    title: 'MongoDB Atlas vs Self-Hosted: Which Should You Choose?',
    slug: 'mongodb-atlas-vs-self-hosted',
    excerpt: 'Compare MongoDB Atlas cloud service with self-hosted solutions to make the right choice for your project.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
    author: {
      _id: '7',
      name: 'Maria Garcia',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '10', name: 'MongoDB', color: '#47A248' },
      { _id: '11', name: 'Database', color: '#FF6B35' }
    ],
    publishedAt: '2025-07-13T00:00:00Z',
    viewCount: 634,
    likeCount: 33,
    commentCount: 11,
    readingTime: 7
  },
  {
    _id: '8',
    title: 'CSS Grid vs Flexbox: When to Use Each Layout Method',
    slug: 'css-grid-vs-flexbox',
    excerpt: 'Learn the differences between CSS Grid and Flexbox, and discover when to use each layout method for optimal results.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    author: {
      _id: '8',
      name: 'Tom Anderson',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '12', name: 'CSS', color: '#1572B6' },
      { _id: '13', name: 'Frontend', color: '#FF6B6B' }
    ],
    publishedAt: '2025-07-12T00:00:00Z',
    viewCount: 987,
    likeCount: 71,
    commentCount: 24,
    readingTime: 11
  },
  {
    _id: '9',
    title: 'Introduction to Docker for JavaScript Developers',
    slug: 'docker-javascript-developers',
    excerpt: 'Get started with Docker containerization and learn how to deploy your JavaScript applications efficiently.',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop',
    author: {
      _id: '9',
      name: 'Chris Martinez',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '14', name: 'Docker', color: '#2496ED' },
      { _id: '15', name: 'DevOps', color: '#FF6B35' }
    ],
    publishedAt: '2025-07-11T00:00:00Z',
    viewCount: 756,
    likeCount: 42,
    commentCount: 16,
    readingTime: 13
  },
  {
    _id: '10',
    title: 'Building REST APIs with Express.js and JWT Authentication',
    slug: 'rest-apis-express-jwt',
    excerpt: 'Learn how to create secure REST APIs using Express.js with JWT token authentication and best practices.',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
    author: {
      _id: '10',
      name: 'Lisa Park',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b4c2?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '16', name: 'Express.js', color: '#000000' },
      { _id: '17', name: 'JWT', color: '#FB015B' }
    ],
    publishedAt: '2025-07-10T00:00:00Z',
    viewCount: 892,
    likeCount: 58,
    commentCount: 21,
    readingTime: 14
  },
  {
    _id: '11',
    title: 'Modern State Management in React: Redux vs Zustand',
    slug: 'react-state-management-redux-zustand',
    excerpt: 'Compare popular state management solutions and learn when to use Redux vs Zustand in your React applications.',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
    author: {
      _id: '11',
      name: 'Kevin Brown',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '1', name: 'React', color: '#61DAFB' },
      { _id: '18', name: 'Redux', color: '#764ABC' }
    ],
    publishedAt: '2025-07-09T00:00:00Z',
    viewCount: 643,
    likeCount: 35,
    commentCount: 12,
    readingTime: 10
  },
  {
    _id: '12',
    title: 'GraphQL vs REST: Choosing the Right API Architecture',
    slug: 'graphql-vs-rest-api-architecture',
    excerpt: 'Understand the differences between GraphQL and REST APIs to make informed decisions for your projects.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    author: {
      _id: '12',
      name: 'Rachel Green',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '19', name: 'GraphQL', color: '#E10098' },
      { _id: '20', name: 'API', color: '#FF6B6B' }
    ],
    publishedAt: '2025-07-08T00:00:00Z',
    viewCount: 1024,
    likeCount: 76,
    commentCount: 28,
    readingTime: 12
  },
  {
    _id: '13',
    title: 'Vue.js 3 Composition API: Complete Guide with Examples',
    slug: 'vuejs-composition-api-guide',
    excerpt: 'Master Vue.js 3 Composition API with practical examples and learn how to build more maintainable components.',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
    author: {
      _id: '13',
      name: 'Michael Chen',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '21', name: 'Vue.js', color: '#4FC08D' },
      { _id: '9', name: 'JavaScript', color: '#F7DF1E' }
    ],
    publishedAt: '2025-07-07T00:00:00Z',
    viewCount: 567,
    likeCount: 41,
    commentCount: 14,
    readingTime: 11
  },
  {
    _id: '14',
    title: 'Microservices Architecture: Pros, Cons, and Best Practices',
    slug: 'microservices-architecture-guide',
    excerpt: 'Explore microservices architecture patterns and learn when to adopt this approach for scalable applications.',
    coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop',
    author: {
      _id: '14',
      name: 'Amanda Taylor',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b4c2?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '22', name: 'Microservices', color: '#FF9500' },
      { _id: '23', name: 'Architecture', color: '#34C759' }
    ],
    publishedAt: '2025-07-06T00:00:00Z',
    viewCount: 789,
    likeCount: 53,
    commentCount: 19,
    readingTime: 15
  },
  {
    _id: '15',
    title: 'Advanced Python: Decorators, Generators, and Context Managers',
    slug: 'advanced-python-concepts',
    excerpt: 'Deep dive into advanced Python concepts that will make your code more elegant and efficient.',
    coverImage: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=250&fit=crop',
    author: {
      _id: '15',
      name: 'Robert Wilson',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '24', name: 'Python', color: '#3776AB' },
      { _id: '25', name: 'Advanced', color: '#FF6B35' }
    ],
    publishedAt: '2025-07-05T00:00:00Z',
    viewCount: 934,
    likeCount: 68,
    commentCount: 22,
    readingTime: 16
  },
  {
    _id: '16',
    title: 'Web Security Fundamentals: Protecting Your Applications',
    slug: 'web-security-fundamentals',
    excerpt: 'Learn essential web security practices to protect your applications from common vulnerabilities and attacks.',
    coverImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
    author: {
      _id: '16',
      name: 'Jennifer Lee',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '26', name: 'Security', color: '#FF3B30' },
      { _id: '27', name: 'WebDev', color: '#007AFF' }
    ],
    publishedAt: '2025-07-04T00:00:00Z',
    viewCount: 1156,
    likeCount: 84,
    commentCount: 31,
    readingTime: 13
  },
  {
    _id: '17',
    title: 'Getting Started with Kubernetes: Container Orchestration',
    slug: 'kubernetes-container-orchestration',
    excerpt: 'Introduction to Kubernetes and how to deploy and manage containerized applications at scale.',
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop',
    author: {
      _id: '17',
      name: 'Steven Davis',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '28', name: 'Kubernetes', color: '#326CE5' },
      { _id: '15', name: 'DevOps', color: '#FF6B35' }
    ],
    publishedAt: '2025-07-03T00:00:00Z',
    viewCount: 687,
    likeCount: 47,
    commentCount: 18,
    readingTime: 14
  },
  {
    _id: '18',
    title: 'Machine Learning with JavaScript: TensorFlow.js Guide',
    slug: 'machine-learning-tensorflow-js',
    excerpt: 'Explore machine learning in the browser with TensorFlow.js and build intelligent web applications.',
    coverImage: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop',
    author: {
      _id: '18',
      name: 'Dr. Sarah Kim',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b4c2?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '29', name: 'Machine Learning', color: '#FF9500' },
      { _id: '9', name: 'JavaScript', color: '#F7DF1E' }
    ],
    publishedAt: '2025-07-02T00:00:00Z',
    viewCount: 823,
    likeCount: 61,
    commentCount: 25,
    readingTime: 17
  },
  {
    _id: '19',
    title: 'Progressive Web Apps: Building App-Like Web Experiences',
    slug: 'progressive-web-apps-guide',
    excerpt: 'Learn how to build Progressive Web Apps that provide native app experiences in the browser.',
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
    author: {
      _id: '19',
      name: 'Mark Johnson',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '30', name: 'PWA', color: '#5A67D8' },
      { _id: '27', name: 'WebDev', color: '#007AFF' }
    ],
    publishedAt: '2025-07-01T00:00:00Z',
    viewCount: 745,
    likeCount: 52,
    commentCount: 17,
    readingTime: 12
  },
  {
    _id: '20',
    title: 'Serverless Functions: AWS Lambda vs Vercel Functions',
    slug: 'serverless-functions-comparison',
    excerpt: 'Compare serverless function platforms and learn how to choose the right solution for your needs.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    author: {
      _id: '20',
      name: 'Emma Davis',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '31', name: 'Serverless', color: '#FF6B35' },
      { _id: '32', name: 'AWS', color: '#FF9900' }
    ],
    publishedAt: '2025-06-30T00:00:00Z',
    viewCount: 612,
    likeCount: 39,
    commentCount: 13,
    readingTime: 9
  },
  {
    _id: '21',
    title: 'Database Design Patterns for Modern Applications',
    slug: 'database-design-patterns',
    excerpt: 'Explore effective database design patterns and optimization techniques for scalable applications.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
    author: {
      _id: '21',
      name: 'Alex Thompson',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '11', name: 'Database', color: '#FF6B35' },
      { _id: '33', name: 'Design Patterns', color: '#34C759' }
    ],
    publishedAt: '2025-06-29T00:00:00Z',
    viewCount: 876,
    likeCount: 64,
    commentCount: 20,
    readingTime: 15
  },
  {
    _id: '22',
    title: 'React Native vs Flutter: Mobile Development Comparison',
    slug: 'react-native-vs-flutter',
    excerpt: 'Compare React Native and Flutter frameworks to make the right choice for your mobile app development.',
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
    author: {
      _id: '22',
      name: 'Jessica Wong',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b4c2?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '34', name: 'React Native', color: '#61DAFB' },
      { _id: '35', name: 'Flutter', color: '#02569B' }
    ],
    publishedAt: '2025-06-28T00:00:00Z',
    viewCount: 1098,
    likeCount: 78,
    commentCount: 32,
    readingTime: 11
  },
  {
    _id: '23',
    title: 'Testing React Applications: Jest, RTL, and Cypress',
    slug: 'testing-react-applications',
    excerpt: 'Comprehensive guide to testing React applications using Jest, React Testing Library, and Cypress.',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
    author: {
      _id: '23',
      name: 'Daniel Rodriguez',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '1', name: 'React', color: '#61DAFB' },
      { _id: '36', name: 'Testing', color: '#C21807' }
    ],
    publishedAt: '2025-06-27T00:00:00Z',
    viewCount: 754,
    likeCount: 55,
    commentCount: 19,
    readingTime: 13
  },
  {
    _id: '24',
    title: 'Building Real-time Applications with Socket.IO',
    slug: 'realtime-apps-socket-io',
    excerpt: 'Learn how to build real-time web applications using Socket.IO for instant communication and updates.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    author: {
      _id: '24',
      name: 'Carlos Martinez',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '37', name: 'Socket.IO', color: '#010101' },
      { _id: '38', name: 'Real-time', color: '#00D924' }
    ],
    publishedAt: '2025-06-26T00:00:00Z',
    viewCount: 683,
    likeCount: 48,
    commentCount: 16,
    readingTime: 10
  },
  {
    _id: '25',
    title: 'CI/CD Pipeline Setup with GitHub Actions',
    slug: 'cicd-github-actions',
    excerpt: 'Set up automated CI/CD pipelines using GitHub Actions for seamless deployment and testing workflows.',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop',
    author: {
      _id: '25',
      name: 'Nicole Foster',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    tags: [
      { _id: '39', name: 'CI/CD', color: '#2088FF' },
      { _id: '40', name: 'GitHub Actions', color: '#181717' }
    ],
    publishedAt: '2025-06-25T00:00:00Z',
    viewCount: 921,
    likeCount: 67,
    commentCount: 24,
    readingTime: 14
  }
];

// Additional content data

const trendingTopics = [
  { 
    name: 'React 19', 
    count: 156, 
    trend: '+12%',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    name: 'Next.js 15', 
    count: 89, 
    trend: '+8%',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    gradient: 'from-purple-500 to-indigo-600'
  },
  { 
    name: 'TypeScript', 
    count: 203, 
    trend: '+15%',
    image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=200&fit=crop',
    gradient: 'from-orange-500 to-red-600'
  },
  { 
    name: 'Node.js', 
    count: 134, 
    trend: '+5%',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
    gradient: 'from-cyan-500 to-blue-600'
  },
  { 
    name: 'MongoDB', 
    count: 67, 
    trend: '+22%',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200&fit=crop',
    gradient: 'from-rose-500 to-pink-600'
  },
  { 
    name: 'Python', 
    count: 98, 
    trend: '+18%',
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=200&fit=crop',
    gradient: 'from-yellow-500 to-amber-600'
  }
];

const Home: React.FC = () => {
  const { posts, loading, error, fetchPosts } = useBlog();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscriptionMessage('Thank you for subscribing! You\'ll receive our latest updates.');
        setEmail('');
      } else {
        const errorData = await response.json();
        setSubscriptionMessage(errorData.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubscriptionMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // If it's already a full URL (mock data), return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a local path, use it directly (Vite will proxy it)
    return imagePath;
  };

  // Use mock data if no real posts are available
  const displayPosts = posts.length > 0 ? posts : mockPosts;
  const featuredPost = displayPosts[0];
  const recentPosts = displayPosts.slice(1, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-2xl mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured Post */}
          <div className="lg:col-span-2">
            {featuredPost && (
              <article className="group cursor-pointer">
                <Link to={`/post/${featuredPost.slug}`}>
                  <div className="relative overflow-hidden rounded-2xl mb-6">
                    <img
                      src={getImageUrl(featuredPost.coverImage)}
                      alt={featuredPost.title}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackSet) {
                          console.log('Image failed to load:', getImageUrl(featuredPost.coverImage));
                          target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                          target.dataset.fallbackSet = 'true';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredPost.tags.map((tag) => (
                          <span
                            key={tag._id}
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: tag.color }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h1>
                    
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <img
                          src={featuredPost.author.profileImage}
                          alt={featuredPost.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{featuredPost.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>{featuredPost.readingTime} min read</span>
                    </div>
                  </div>
                </Link>
              </article>
            )}
          </div>

          {/* Sidebar with Recent Posts */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
              
              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <article key={post._id} className="group">
                    <Link to={`/post/${post.slug}`} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallbackSet) {
                              console.log('Thumbnail failed to load:', getImageUrl(post.coverImage));
                              target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                              target.dataset.fallbackSet = 'true';
                            }
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            {post.tags[0]?.name.toUpperCase() || 'BLOG'}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* View All Posts Button */}
              <div className="mt-8">
                <Link 
                  to="/posts" 
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  View All Posts
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        

        {/* Trending Topics Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Trending Topics</h2>
            <Link 
              to="/topics" 
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              View all topics
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.slice(0, 6).map((topic, index) => (
              <article key={topic.name} className="group">
                <Link to={`/topics/${topic.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={topic.image}
                        alt={topic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-6 left-6">
                        <span className="text-4xl font-bold text-white/30">#{index + 1}</span>
                      </div>
                      <div className="absolute bottom-6 right-6">
                        <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {topic.trend}
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <div className="text-white">
                          <div className="text-2xl font-bold mb-1">{topic.count}</div>
                          <div className="text-sm opacity-90">posts</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full">
                          TRENDING
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3">
                        {topic.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        Explore the latest discussions and articles about {topic.name.toLowerCase()}.
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>Hot Topic</span>
                        </div>
                        <span>{topic.trend} growth</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Articles Section */}
        {displayPosts.length > 5 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
              <Link 
                to="/posts" 
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
              >
                View all articles
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {/* Latest Articles in 3 Rows */}
            <div className="space-y-8">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayPosts.slice(5, 8).map((post) => (
                  <article key={post._id} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'ARTICLE'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayPosts.slice(8, 11).map((post, index) => (
                  <article key={post._id || `mock-${index + 8}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'ARTICLE'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayPosts.slice(11, 14).map((post, index) => (
                  <article key={post._id || `mock-${index + 11}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'ARTICLE'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* View All Articles Button */}
              <div className="flex justify-center mt-8">
                <Link 
                  to="/posts" 
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  View All Articles
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 4 Column Articles Section */}
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">More Articles</h3>
                <Link 
                  to="/posts" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                >
                  View all
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayPosts.slice(14, 18).map((post, index) => (
                  <article key={post._id || `more-${index + 14}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-2 left-2">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'ARTICLE'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-xs line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-4 h-4 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            {/* More Blogs Section */}
            <div className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">More Blogs</h3>
                <Link 
                  to="/posts" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                >
                  View all blogs
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* First 3 columns - Regular blog posts */}
                {displayPosts.slice(18, 21).map((post, index) => (
                  <article key={post._id || `blog-${index + 18}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={getImageUrl(post.coverImage)}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'BLOG'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
                
                {/* 4th column - List of 4 articles */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-900">Popular Reads</h4>
                    <Link 
                      to="/posts" 
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {displayPosts.slice(21, 25).map((post, index) => (
                      <article key={post._id || `popular-${index + 21}`} className="group">
                        <Link to={`/post/${post.slug}`} className="flex space-x-3">
                          <div className="flex-shrink-0">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span 
                                className="px-2 py-1 text-xs font-medium text-white rounded-full"
                                style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                              >
                                {post.tags[0]?.name || 'BLOG'}
                              </span>
                            </div>
                            
                            <h5 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {post.title}
                            </h5>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                {post.author.profileImage ? (
                                  <img
                                    src={post.author.profileImage}
                                    alt={post.author.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                ) : null}
                                <span>{post.author.name}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Second Row - 3 column layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Regular blog posts */}
                {displayPosts.length > 25 && displayPosts.slice(22, 25).map((post, index) => (
                  <article key={post._id || `blog-row2-${index + 22}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'BLOG'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {post.author.profileImage ? (
                              <img
                                src={post.author.profileImage}
                                alt={post.author.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : null}
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Third Row - 3 column layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Regular blog posts */}
                {displayPosts.length > 25 && displayPosts.slice(0, 3).map((post, index) => (
                  <article key={post._id || `blog-row3-${index}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'BLOG'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {post.author.profileImage ? (
                              <img
                                src={post.author.profileImage}
                                alt={post.author.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : null}
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Fourth Row - 3 column layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Regular blog posts */}
                {displayPosts.length > 25 && displayPosts.slice(5, 8).map((post, index) => (
                  <article key={post._id || `blog-row4-${index + 5}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'BLOG'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Fifth Row - 3 column layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Regular blog posts */}
                {displayPosts.length > 25 && displayPosts.slice(8, 11).map((post, index) => (
                  <article key={post._id || `blog-row5-${index + 8}`} className="group">
                    <Link to={`/post/${post.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.tags[0]?.color || '#6B7280' }}
                          >
                            #{post.tags[0]?.name || 'BLOG'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <img
                              src={post.author.profileImage}
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Signup Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest articles, tutorials, and insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={isSubscribing}
                />
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscriptionMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  subscriptionMessage.includes('Thank you') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscriptionMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
