import type { ApiResponse, ApiError } from '../types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  getAuthToken?: () => Promise<string | null>;
}

/**
 * Platform-agnostic API client
 * Works on both web (fetch) and React Native
 */
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseURL}${endpoint}`;

      // Get auth token if available
      const token = this.config.getAuthToken
        ? await this.config.getAuthToken()
        : null;

      // Merge headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data: any = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          code: data.error?.code || 'API_ERROR',
          message: data.error?.message || 'An error occurred',
          details: data.error?.details,
        };
        return {
          success: false,
          error,
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error: any) {
      // Handle network errors
      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
      };
      return {
        success: false,
        error: apiError,
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(endpoint + queryString, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   * Works on both web and React Native
   */
  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseURL}${endpoint}`;

      const token = this.config.getAuthToken
        ? await this.config.getAuthToken()
        : null;

      const headers: Record<string, string> = {
        ...this.config.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Don't set Content-Type for FormData - let browser/RN handle it
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data: any = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          code: data.error?.code || 'UPLOAD_ERROR',
          message: data.error?.message || 'Upload failed',
          details: data.error?.details,
        };
        return {
          success: false,
          error,
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error: any) {
      const apiError: ApiError = {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Upload failed',
      };
      return {
        success: false,
        error: apiError,
      };
    }
  }
}

// Export singleton instance (will be configured in each platform)
let apiClient: ApiClient | null = null;

export function initializeApiClient(config: ApiClientConfig): ApiClient {
  apiClient = new ApiClient(config);
  return apiClient;
}

export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error(
      'API client not initialized. Call initializeApiClient() first.'
    );
  }
  return apiClient;
}
