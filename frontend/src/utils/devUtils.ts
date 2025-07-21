/**
 * Development utilities for managing tokens and authentication
 */

export const devUtils = {
  /**
   * Sets the development token in localStorage
   * @param token - The token to set (defaults to environment variable)
   */
  setDevToken: (token?: string) => {
    const devToken = token || import.meta.env.VITE_DEV_TOKEN || '00000000';
    localStorage.setItem('token', devToken);
    
    // Automatically set a mock admin user for development
    devUtils.setMockUser({ role: 'admin' });
    
    console.log('Development token and admin user set:', devToken);
    return devToken;
  },

  /**
   * Clears the current token from localStorage
   */
  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Token cleared');
  },

  /**
   * Gets the current token (either from localStorage or dev environment)
   */
  getCurrentToken: () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      return storedToken;
    }
    
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_TOKEN) {
      return import.meta.env.VITE_DEV_TOKEN;
    }
    
    return null;
  },

  /**
   * Checks if we're using a development token
   */
  isUsingDevToken: () => {
    const currentToken = devUtils.getCurrentToken();
    return currentToken === import.meta.env.VITE_DEV_TOKEN;
  },

  /**
   * Development helper to set a mock user in localStorage
   */
  setMockUser: (userOverrides: Partial<any> = {}) => {
    const mockUser = {
      _id: 'dev-user-1',
      name: 'Developer User',
      email: 'dev@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userOverrides
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    console.log('Mock user set:', mockUser);
    return mockUser;
  },

  /**
   * Shows current development status
   */
  showDevStatus: () => {
    console.log('=== Development Status ===');
    console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
    console.log('Current Token:', devUtils.getCurrentToken());
    console.log('Using Dev Token:', devUtils.isUsingDevToken());
    console.log('Stored User:', localStorage.getItem('user'));
    console.log('========================');
  }
};

// Make devUtils available globally in development
if (import.meta.env.DEV) {
  (window as any).devUtils = devUtils;
  console.log('💡 Development utilities available as window.devUtils');
  console.log('Try: devUtils.showDevStatus(), devUtils.setDevToken(), etc.');
}

export default devUtils;
