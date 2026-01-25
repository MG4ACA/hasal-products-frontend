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

  // Create error object with message
  const apiError = new Error(message);
  apiError.statusCode = statusCode;

  // Handle specific status codes
  switch (statusCode) {
    case 401:
      // Unauthorized - Clear session and redirect to login
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenExpiresAt');
      window.location.href = '/login';
      apiError.message = 'Session expired. Please login again.';
      break;

    case 403:
      // Forbidden - Permission denied
      apiError.message = 'You do not have permission to perform this action.';
      break;

    case 404:
      // Not Found - Resource doesn't exist
      apiError.message = message || 'Resource not found.';
      break;

    case 500:
      // Server Error
      apiError.message = 'Server error. Please try again later.';
      break;

    default:
      // Generic error - use the original message
      apiError.message = message || 'An unexpected error occurred.';
  }

  // Throw the error so it can be caught by the caller
  throw apiError;
};
