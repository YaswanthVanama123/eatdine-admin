import { apiClient } from './client';
import { Order, OrderStatus, ApiResponse } from '../types';

export const kitchenApi = {
  /**
   * Get all active orders for kitchen view
   */
  getActiveOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/kitchen/orders');
    return response.data.data;
  },

  /**
   * Update order status from kitchen
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/kitchen/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Mark order as preparing
   */
  startPreparing: async (orderId: string): Promise<Order> => {
    return kitchenApi.updateOrderStatus(orderId, 'preparing');
  },

  /**
   * Mark order as ready
   */
  markReady: async (orderId: string): Promise<Order> => {
    return kitchenApi.updateOrderStatus(orderId, 'ready');
  },

  /**
   * Mark order as served
   */
  markServed: async (orderId: string): Promise<Order> => {
    return kitchenApi.updateOrderStatus(orderId, 'served');
  },
};
