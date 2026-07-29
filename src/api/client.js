/**
 * API Client for Distill Frontend
 * Provides fetch wrapper with error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw {
        status: response.status,
        code: data.code || 'UNKNOWN_ERROR',
        message: data.error || 'An error occurred',
        details: data.details,
      };
    }
    
    return data;
  } catch (error) {
    // Network or parsing errors
    if (error.status) {
      throw error; // Already formatted error
    }
    
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
    };
  }
}

/**
 * API Client
 */
export const api = {
  // Projects
  projects: {
    /**
     * Create a new project
     * @param {string} name - Project name
     * @returns {Promise<Object>} Created project
     */
    create: (name) => 
      fetchAPI('/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),

    /**
     * Get all projects
     * @returns {Promise<Array>} List of projects
     */
    getAll: () => 
      fetchAPI('/projects'),

    /**
     * Get project by ID with full canvas
     * @param {string} id - Project ID
     * @returns {Promise<Object>} Project with canvas
     */
    getById: (id) => 
      fetchAPI(`/projects/${id}`),

    /**
     * Delete a project
     * @param {string} id - Project ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    delete: (id) => 
      fetchAPI(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  // Chat
  chat: {
    /**
     * Send a message to the AI
     * @param {string} projectId - Project ID
     * @param {string} message - User message
     * @returns {Promise<Object>} AI response with canvas updates
     */
    send: (projectId, message) => 
      fetchAPI('/chat', {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          message,
        }),
      }),

    /**
     * Get chat history for a project
     * @param {string} projectId - Project ID
     * @returns {Promise<Array>} List of messages
     */
    getHistory: (projectId) => 
      fetchAPI(`/chat/${projectId}`),
  },

  // Blueprint
  blueprint: {
    /**
     * Generate blueprint preview without saving (FR-06-003)
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Blueprint preview (not saved)
     */
    preview: (projectId) =>
      fetchAPI(`/blueprint/${projectId}/preview`),

    /**
     * Generate blueprint for a project (saves to DB)
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Generated blueprint
     */
    generate: (projectId) => 
      fetchAPI(`/blueprint/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ approve: true }),
      }),

    /**
     * Get existing blueprint
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Blueprint data
     */
    get: (projectId) => 
      fetchAPI(`/blueprint/${projectId}`),
  },

  // Health check
  health: () => 
    fetchAPI('/health'),
};

export default api;

// Made with Bob
