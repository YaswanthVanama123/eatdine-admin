import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { storage } from './storage';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  onUnauthorized?: () => void;
  onNetworkError?: (error: Error) => void;
  debug?: boolean;
}

class ApiClient {
  private instance: AxiosInstance | null = null;
  private config: ApiClientConfig | null = null;

  /**
   * Initialize the API client with configuration
   * Must be called before making any API requests
   */
  initialize(config: ApiClientConfig) {
    this.config = config;

    // Create axios instance
    this.instance = axios.create({
      baseURL: `${config.baseURL}/api`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    if (config.debug) {
      console.log('[API Client] Initialized with baseURL:', config.baseURL);
    }
  }

  private setupRequestInterceptor() {
    if (!this.instance) return;

    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = await storage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add restaurant ID header for multi-tenant isolation
        const restaurantId = await storage.getRestaurantId();
        if (restaurantId) {
          config.headers['x-restaurant-id'] = restaurantId;
        }

        // Add subdomain header for mobile apps (if not already set)
        // The login request sets this header directly, so don't overwrite it
        if (!config.headers['x-subdomain']) {
          const subdomain = await storage.getSubdomain();
          if (subdomain) {
            config.headers['x-subdomain'] = subdomain;
          }
        }

        if (this.config?.debug) {
          console.log('[API Client] Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            hasAuth: !!token,
            hasRestaurantId: !!restaurantId,
            hasSubdomain: !!config.headers['x-subdomain'],
            subdomain: config.headers['x-subdomain'] || 'none',
          });
          console.log('[API Client] Full Request URL:', `${config.baseURL}${config.url}`);
          console.log('[API Client] All Headers:', {
            'x-subdomain': config.headers['x-subdomain'],
            'x-restaurant-id': config.headers['x-restaurant-id'],
            'Authorization': config.headers['Authorization'] ? 'Bearer ***' : 'none',
            'Content-Type': config.headers['Content-Type'],
          });
          console.log('[API Client] Request Body:', config.data);
        }

        return config;
      },
      (error: AxiosError) => {
        if (this.config?.debug) {
          console.error('[API Client] Request error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  private setupResponseInterceptor() {
    if (!this.instance) return;

    this.instance.interceptors.response.use(
      (response) => {
        if (this.config?.debug) {
          console.log('[API Client] Response:', {
            status: response.status,
            url: response.config.url,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        // Detailed error logging
        if (this.config?.debug) {
          console.error('[API Client] Error Response:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: (error.response?.data as any)?.message || error.message,
            code: (error.response?.data as any)?.code,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            requestHeaders: {
              'x-subdomain': error.config?.headers?.['x-subdomain'],
              'x-restaurant-id': error.config?.headers?.['x-restaurant-id'],
            },
          });
        }

        // Handle 401 Unauthorized and 403 Forbidden
        if (error.response?.status === 401 || error.response?.status === 403) {
          const errorMessage = (error.response?.data as any)?.message || '';

          // Only clear auth if it's an actual token expiry/invalid error
          if (
            errorMessage.includes('token') ||
            errorMessage.includes('expired') ||
            errorMessage.includes('invalid')
          ) {
            if (this.config?.debug) {
              console.log('[API Client] Token expired or invalid - clearing session');
            }

            // Clear auth data
            await storage.clearAuth();

            // Call the onUnauthorized callback
            if (this.config?.onUnauthorized) {
              this.config.onUnauthorized();
            }
          } else {
            if (this.config?.debug) {
              console.warn('[API Client] Received 401/403 but not clearing auth - might be temporary server issue');
            }
          }
        } else if (!error.response) {
          // Network error - backend is down or unreachable
          if (this.config?.debug) {
            console.warn('[API Client] Network error - backend may be restarting or unreachable');
          }

          // Call the onNetworkError callback
          if (this.config?.onNetworkError) {
            this.config.onNetworkError(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the axios instance
   * Throws error if not initialized
   */
  getInstance(): AxiosInstance {
    if (!this.instance) {
      throw new Error(
        'API Client not initialized. Call apiClient.initialize() with configuration first.'
      );
    }
    return this.instance;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.getInstance().get<T>(url, config);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getInstance().post<T>(url, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getInstance().put<T>(url, data, config);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.getInstance().patch<T>(url, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.getInstance().delete<T>(url, config);
  }

  /**
   * Update the base URL (useful for environment switching)
   */
  updateBaseURL(baseURL: string) {
    if (this.instance) {
      this.instance.defaults.baseURL = `${baseURL}/api`;
      if (this.config) {
        this.config.baseURL = baseURL;
      }
      if (this.config?.debug) {
        console.log('[API Client] Base URL updated to:', baseURL);
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig | null {
    return this.config;
  }
}

export const apiClient = new ApiClient();
