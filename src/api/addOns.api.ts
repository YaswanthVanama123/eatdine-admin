import { apiClient } from './client';
import { AddOn, ApiResponse } from '../types';

export interface AddOnFormData {
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
}

export const addOnsApi = {
  /**
   * Get all add-ons
   */
  getAll: async (): Promise<AddOn[]> => {
    const response = await apiClient.get<ApiResponse<AddOn[]>>('/addons');
    return response.data.data;
  },

  /**
   * Get add-on by ID
   */
  getById: async (id: string): Promise<AddOn> => {
    const response = await apiClient.get<ApiResponse<AddOn>>(`/addons/${id}`);
    return response.data.data;
  },

  /**
   * Create new add-on
   */
  create: async (data: AddOnFormData): Promise<AddOn> => {
    const response = await apiClient.post<ApiResponse<AddOn>>('/addons', data);
    return response.data.data;
  },

  /**
   * Update add-on
   */
  update: async (id: string, data: Partial<AddOnFormData>): Promise<AddOn> => {
    const response = await apiClient.put<ApiResponse<AddOn>>(`/addons/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete add-on
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addons/${id}`);
  },

  /**
   * Toggle add-on availability
   */
  toggleAvailability: async (id: string): Promise<AddOn> => {
    const response = await apiClient.patch<ApiResponse<AddOn>>(`/addons/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Get available add-ons only
   */
  getAvailable: async (): Promise<AddOn[]> => {
    const response = await apiClient.get<ApiResponse<AddOn[]>>('/addons/available');
    return response.data.data;
  },

  /**
   * Bulk update add-on availability
   */
  bulkUpdateAvailability: async (ids: string[], isAvailable: boolean): Promise<void> => {
    await apiClient.patch('/addons/bulk/availability', { ids, isAvailable });
  },
};
