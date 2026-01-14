import { apiClient } from './client';
import { Table, TableFormData, ApiResponse } from '../types';

export const tablesApi = {
  /**
   * Get all tables
   */
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get<ApiResponse<Table[]>>('/tables');
    return response.data.data;
  },

  /**
   * Get table by ID
   */
  getById: async (id: string): Promise<Table> => {
    const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
    return response.data.data;
  },

  /**
   * Create new table
   */
  create: async (data: TableFormData): Promise<Table> => {
    const response = await apiClient.post<ApiResponse<Table>>('/tables', data);
    return response.data.data;
  },

  /**
   * Update table
   */
  update: async (id: string, data: Partial<TableFormData>): Promise<Table> => {
    const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete table
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
  },

  /**
   * Get table status
   */
  getStatus: async (id: string): Promise<{ isOccupied: boolean; currentOrderId?: string }> => {
    const response = await apiClient.get<ApiResponse<{ isOccupied: boolean; currentOrderId?: string }>>(
      `/tables/${id}/status`
    );
    return response.data.data;
  },

  /**
   * Get all occupied tables
   */
  getOccupied: async (): Promise<Table[]> => {
    const response = await apiClient.get<ApiResponse<Table[]>>('/tables/occupied');
    return response.data.data;
  },

  /**
   * Get all available tables
   */
  getAvailable: async (): Promise<Table[]> => {
    const response = await apiClient.get<ApiResponse<Table[]>>('/tables/available');
    return response.data.data;
  },

  /**
   * Toggle table status (active/inactive)
   */
  toggleStatus: async (id: string): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Mark table as occupied
   */
  markOccupied: async (id: string, orderId: string): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/occupy`, { orderId });
    return response.data.data;
  },

  /**
   * Mark table as available
   */
  markAvailable: async (id: string): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/release`);
    return response.data.data;
  },

  /**
   * Get tables with current order information
   */
  getWithOrders: async (): Promise<Array<Table & { currentOrder?: any }>> => {
    const response = await apiClient.get<ApiResponse<Array<Table & { currentOrder?: any }>>>(
      '/tables/with-orders'
    );
    return response.data.data;
  },
};
