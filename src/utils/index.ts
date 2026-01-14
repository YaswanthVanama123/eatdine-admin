// Export storage and constants
export { SecureStorage } from './storage';
export * from './constants';
export { formatCurrency, formatDate, formatTime, getRelativeTime } from './format';

/**
 * Get order age in minutes
 */
export const getOrderAge = (createdAt: string): number => {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
};

/**
 * Check if order is urgent (>15 minutes old)
 */
export const isOrderUrgent = (createdAt: string): boolean => {
  return getOrderAge(createdAt) > 15;
};

/**
 * Check if order is critical (>30 minutes old)
 */
export const isOrderCritical = (createdAt: string): boolean => {
  return getOrderAge(createdAt) > 30;
};

/**
 * Format time duration in MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get preparation time for an order
 */
export const getPreparationTime = (order: { createdAt: string; preparationStartedAt?: string }): number => {
  const startTime = order.preparationStartedAt
    ? new Date(order.preparationStartedAt).getTime()
    : new Date(order.createdAt).getTime();
  return Math.floor((Date.now() - startTime) / 1000);
};

/**
 * Calculate average preparation time
 */
export const calculateAveragePreparationTime = (orders: any[]): number => {
  if (orders.length === 0) return 0;

  const totalTime = orders.reduce((sum, order) => {
    if (order.preparationCompletedAt && order.preparationStartedAt) {
      const diff = new Date(order.preparationCompletedAt).getTime() -
                   new Date(order.preparationStartedAt).getTime();
      return sum + diff;
    }
    return sum;
  }, 0);

  return Math.floor(totalTime / orders.length / 60000); // in minutes
};
