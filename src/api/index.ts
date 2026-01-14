/**
 * API Client for React Native Admin App
 *
 * @example
 * // Initialize in App.tsx
 * import { initializeApi } from './src/api';
 * import Constants from 'expo-constants';
 *
 * initializeApi({
 *   apiUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000',
 *   onUnauthorized: () => {
 *     // Navigate to login screen
 *   },
 *   debug: __DEV__,
 * });
 */

export { authApi } from './auth';
export { apiClient } from './client';
export type { ApiClientConfig } from './client';

/**
 * Initialize the API client
 * Should be called once at app startup
 */
export function initializeApi(options: {
  apiUrl: string;
  onUnauthorized?: () => void;
  onNetworkError?: (error: Error) => void;
  debug?: boolean;
}) {
  // Initialize API client
  apiClient.initialize({
    baseURL: options.apiUrl,
    timeout: 30000,
    onUnauthorized: options.onUnauthorized,
    onNetworkError: options.onNetworkError,
    debug: options.debug || false,
  });
}
