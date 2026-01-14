import { OrderStatus } from '../types';
import Config from 'react-native-config';

// API Configuration
// Use your computer's IP address for development
// Example: http://192.168.1.100:5000
export const API_BASE_URL = Config.API_BASE_URL || 'http://192.168.1.100:5000';
export const SOCKET_URL = Config.SOCKET_URL || 'http://192.168.1.100:5000';

// Order Status Configuration
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
}> = {
  received: {
    label: 'Received',
    color: '#3b82f6',
  },
  preparing: {
    label: 'Preparing',
    color: '#f59e0b',
  },
  ready: {
    label: 'Ready',
    color: '#10b981',
  },
  served: {
    label: 'Served',
    color: '#6b7280',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
  },
};

// Status colors for React Native
export const STATUS_COLORS = {
  received: '#3b82f6',
  preparing: '#f59e0b',
  ready: '#10b981',
  served: '#6b7280',
  cancelled: '#ef4444',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: '@adminToken',
  RESTAURANT_ID: '@restaurantId',
  ADMIN_DATA: '@adminData',
  FCM_TOKEN: '@fcmToken',
  PRINT_SERVICE_URL: '@printServiceUrl',
  APP_SETTINGS: '@appSettings',
};
