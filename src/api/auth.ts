import { apiClient } from './client';
import { Admin, ApiResponse, LoginFormData } from '../types';

export const authApi = {
  /**
   * Admin login
   */
  login: async (credentials: LoginFormData): Promise<{ token: string; admin: Admin }> => {
    const response = await apiClient.post<ApiResponse<{ token: string; admin: Admin }>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  /**
   * Get current authenticated admin
   */
  getCurrentAdmin: async (): Promise<Admin> => {
    const response = await apiClient.get<ApiResponse<Admin>>('/auth/me');
    return response.data.data;
  },

  /**
   * Logout admin
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Verify authentication token
   */
  verifyToken: async (): Promise<{ valid: boolean; admin?: Admin }> => {
    const response = await apiClient.get<ApiResponse<{ valid: boolean; admin?: Admin }>>(
      '/auth/verify'
    );
    return response.data.data;
  },

  /**
   * Refresh JWT token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password-reset/request', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/password-reset/confirm', { token, newPassword });
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/password/change', { currentPassword, newPassword });
  },
};
