import { apiClient } from './client';
import { Category, CategoryFormData, ApiResponse } from '../types';

export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Create new category
   */
  create: async (data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  /**
   * Update category
   */
  update: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  /**
   * Toggle category status
   */
  toggleStatus: async (id: string): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Reorder categories
   */
  reorder: async (categoryIds: string[]): Promise<void> => {
    await apiClient.put('/categories/reorder', { categoryIds });
  },
};
