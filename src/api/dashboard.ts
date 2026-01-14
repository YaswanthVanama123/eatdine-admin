import { apiClient } from './client';
import { DashboardStats, Order, ApiResponse } from './types';

export interface DashboardPageData {
  stats: DashboardStats;
  activeOrders: Order[];
}

export const dashboardApi = {
  /**
   * Get complete dashboard page data (stats + active orders) - OPTIMIZED
   * Single API call instead of 2 separate calls
   */
  getPageData: async (): Promise<DashboardPageData> => {
    const response = await apiClient.get<ApiResponse<DashboardStats> & { activeOrders: Order[] }>(
      '/dashboard/page-data'
    );
    return {
      stats: response.data.data,
      activeOrders: response.data.activeOrders,
    };
  },

  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get active orders for dashboard
   */
  getActiveOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/dashboard/active-orders');
    return response.data.data;
  },

  /**
   * Get today's summary
   */
  getTodaySummary: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/today-summary');
    return response.data.data;
  },
};
