// Admin Types
export interface Admin {
  _id: string;
  restaurantId: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

// Auth Context Types
export interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

// Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  RESTAURANT_ID: 'restaurantId',
  ADMIN_DATA: 'adminData',
} as const;

// Order Types
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: Array<{
    name: string;
    options: string[];
  }>;
  subtotal: number;
  specialInstructions?: string;
  status?: 'pending' | 'preparing' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  updatedBy?: string;
}

export interface Order {
  _id: string;
  restaurantId: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  servedAt?: string;
  preparationStartedAt?: string;
  preparationCompletedAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface KitchenOrders {
  received: Order[];
  preparing: Order[];
  ready: Order[];
}

// WebSocket Event Types
export interface OrderUpdateEvent {
  type: 'order:created' | 'order:updated' | 'order:cancelled';
  order: Order;
}

// Kitchen Stats
export interface KitchenStats {
  totalActive: number;
  received: number;
  preparing: number;
  ready: number;
  averagePreparationTime: number;
  oldestOrderAge: number;
}

// Dashboard Types
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  averagePreparationTime: number;
  ordersByStatus: {
    received: number;
    preparing: number;
    ready: number;
    served: number;
  };
}

export interface DashboardPageData {
  stats: DashboardStats;
  activeOrders: Order[];
}

// Category Types
export interface Category {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter Types
export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  tableId?: string;
  page?: number;
  limit?: number;
}

// Table Types
export interface Table {
  _id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  isOccupied: boolean;
  currentOrderId?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableFormData {
  tableNumber: string;
  capacity: number;
  location?: string;
  isActive: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'reserved';

// Menu Item Types
export interface CustomizationOption {
  label: string;
  priceModifier: number;
}

export interface Customization {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface AddOn {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  categoryId: string | { _id: string; name: string };
  price: number;
  originalPrice?: number;
  image?: string;
  images?: {
    original?: string;
    large?: string | null;
    medium?: string | null;
    small?: string | null;
  };
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNonVeg: boolean;
  customizationOptions: Customization[];
  addOnIds?: string[];
  preparationTime: number;
  createdAt: string;
  updatedAt: string;
}

// Menu Form Types
export interface MenuItemFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNonVeg: boolean;
  customizationOptions: Customization[];
  addOnIds?: string[];
  preparationTime: number;
}

export interface MenuFilters {
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

// Menu Page Data
export interface MenuPageData {
  categories: Category[];
  menuItems: MenuItem[];
  addOns: AddOn[];
}
