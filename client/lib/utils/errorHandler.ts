import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Handle API errors by showing a toast and logging to console
 * @param error - The error object (usually from Axios)
 * @param fallbackMessage - Message to show if we can't extract one from the error
 * @returns The error message that was displayed
 */
export const handleApiError = (
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): string => {
  let message = fallbackMessage;

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    message = data?.message || data?.error || error.message || fallbackMessage;
  } else if (error instanceof Error) {
    message = error.message || fallbackMessage;
  }

  toast.error(message);
  console.error('API Error:', error);

  return message;
};

/**
 * Wrapper for async operations with automatic error handling
 * @param promise - The promise to execute
 * @param errorMessage - Custom error message to show on failure
 * @returns The result or null if failed
 */
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  errorMessage: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};
