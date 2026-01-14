import { apiClient } from './client';
import { Order, OrderFilters, OrderStatus, PaginatedResponse, ApiResponse, OrderItem } from './types';

export interface CreateOrderData {
  tableId: string;
  items: OrderItem[];
  notes?: string;
}

export const ordersApi = {
  /**
   * Get all orders with filters and pagination
   */
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get active orders (not served or cancelled)
   */
  getActive: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/active');
    return response.data.data;
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Create new order
   */
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Cancel order
   */
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.delete<ApiResponse<Order>>(`/orders/${id}`, {
      data: { reason },
    });
    return response.data.data;
  },

  /**
   * Get orders for a specific table
   */
  getByTable: async (tableId: string): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/table/${tableId}`);
    return response.data.data;
  },

  /**
   * Add items to existing order
   */
  addItems: async (id: string, items: OrderItem[]): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${id}/items`,
      { items }
    );
    return response.data.data;
  },

  /**
   * Remove item from order
   */
  removeItem: async (id: string, itemId: string): Promise<Order> => {
    const response = await apiClient.delete<ApiResponse<Order>>(`/orders/${id}/items/${itemId}`);
    return response.data.data;
  },

  /**
   * Update order item quantity
   */
  updateItemQuantity: async (id: string, itemId: string, quantity: number): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/items/${itemId}/quantity`,
      { quantity }
    );
    return response.data.data;
  },

  /**
   * Update order notes
   */
  updateNotes: async (id: string, notes: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/notes`,
      { notes }
    );
    return response.data.data;
  },

  /**
   * Get order history for a table
   */
  getTableHistory: async (tableId: string, limit?: number): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/table/${tableId}/history`, {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get recent orders
   */
  getRecent: async (limit: number = 10): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/recent', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get orders by status
   */
  getByStatus: async (status: OrderStatus): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/status/${status}`);
    return response.data.data;
  },

  /**
   * Get orders by date range
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/date-range', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  /**
   * Search orders
   */
  search: async (query: string): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/search', {
      params: { query },
    });
    return response.data.data;
  },

  /**
   * Get order statistics
   */
  getStatistics: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/orders/statistics', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  /**
   * Bulk update order status
   */
  bulkUpdateStatus: async (ids: string[], status: OrderStatus): Promise<void> => {
    await apiClient.patch('/orders/bulk/status', { ids, status });
  },

  /**
   * Print order (get print data)
   */
  getPrintData: async (id: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}/print`);
    return response.data.data;
  },
};
