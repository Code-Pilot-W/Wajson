const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Users API calls (Admin only)
export const usersAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Get user statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Posts API calls
export const postsAPI = {
  // Get all published posts
  getPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/posts${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get post by slug
  getPost: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },

  // Admin: Get all posts
  getAdminPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/posts/admin${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Get post statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/posts/stats`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Create post
  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(postData),
    });
    
    return handleResponse(response);
  },

  // Admin: Update post
  updatePost: async (postId, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(postData),
    });
    
    return handleResponse(response);
  },

  // Admin: Delete post
  deletePost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Jobs API calls
export const jobsAPI = {
  // Get all active jobs
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get job by slug
  getJob: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${slug}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },

  // Apply to job
  applyToJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    return handleResponse(response);
  },

  // Admin: Get all jobs
  getAdminJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/jobs/admin${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Get job statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/stats`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Create job
  createJob: async (jobData) => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(jobData),
    });
    
    return handleResponse(response);
  },

  // Admin: Update job
  updateJob: async (jobId, jobData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(jobData),
    });
    
    return handleResponse(response);
  },

  // Admin: Delete job
  deleteJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Profile API calls
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(profileData),
    });
    
    return handleResponse(response);
  },

  // Upload profile picture (file)
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  // Update profile picture (URL)
  updateAvatar: async (profileImage) => {
    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ profileImage }),
    });
    
    return handleResponse(response);
  },

  // Upload cover image (file)
  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);

    const response = await fetch(`${API_BASE_URL}/profile/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  // Update cover image (URL)
  updateCover: async (coverImage) => {
    const response = await fetch(`${API_BASE_URL}/profile/cover`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ coverImage }),
    });
    
    return handleResponse(response);
  },

  // Get user statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/stats`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Increment user statistics
  incrementStat: async (type) => {
    const response = await fetch(`${API_BASE_URL}/profile/stats/increment`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ type }),
    });
    
    return handleResponse(response);
  },

  // Remove profile picture
  removeAvatar: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await fetch(`${API_BASE_URL}/profile/preferences`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(preferences),
    });
    
    return handleResponse(response);
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/delete`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

// Applications API calls
export const applicationsAPI = {
  // Submit job application
  submitApplication: async (applicationData) => {
    const formData = new FormData();
    
    // Add form fields
    Object.keys(applicationData).forEach(key => {
      if (key === 'cv' || key === 'coverLetter') {
        // Handle file uploads
        if (applicationData[key]) {
          formData.append(key, applicationData[key]);
        }
      } else if (typeof applicationData[key] === 'object') {
        // Stringify objects
        formData.append(key, JSON.stringify(applicationData[key]));
      } else {
        formData.append(key, applicationData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  // Get user's applications
  getMyApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/applications/my${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Get applications for a job
  getJobApplications: async (jobId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/applications/job/${jobId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Get application details
  getApplication: async (applicationId) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },

  // Admin: Update application status
  updateApplicationStatus: async (applicationId, status, notes) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ status, notes }),
    });
    
    return handleResponse(response);
  },

  // Admin: Get applications statistics
  getApplicationsStats: async () => {
    const response = await fetch(`${API_BASE_URL}/applications/stats/overview`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  posts: postsAPI,
  jobs: jobsAPI,
  profile: profileAPI,
  applications: applicationsAPI,
  health: healthAPI,
};
