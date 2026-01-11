/**
 * Centralized API Error Handler
 * Handles all API errors consistently across the application
 */

/**
 * Handle API errors and return standardized error object
 * @param {Error} error - Axios error object
 * @returns {{ error: true, message: string, statusCode?: number }}
 */
export const handleApiError = error => {
  const statusCode = error.response?.status;
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

  // Log error for debugging
  console.error(`[API Error ${statusCode || 'Unknown'}]:`, message);

  // Handle specific status codes
  switch (statusCode) {
    case 401:
      // Unauthorized - Clear session and redirect to login
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenExpiresAt');
      window.location.href = '/login';
      return {
        error: true,
        message: 'Session expired. Please login again.',
        statusCode: 401,
      };

    case 403:
      // Forbidden - Permission denied
      return {
        error: true,
        message: 'You do not have permission to perform this action.',
        statusCode: 403,
      };

    case 404:
      // Not Found - Resource doesn't exist
      return {
        error: true,
        message: message || 'Resource not found.',
        statusCode: 404,
      };

    case 500:
      // Server Error
      return {
        error: true,
        message: 'Server error. Please try again later.',
        statusCode: 500,
      };

    default:
      // Generic error
      return {
        error: true,
        message: message || 'An unexpected error occurred.',
        statusCode,
      };
  }
};
