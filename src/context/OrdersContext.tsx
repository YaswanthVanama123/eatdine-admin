import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { ordersApi } from '../api/orders.api';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, STORAGE_KEYS } from '../utils/constants';
import { SecureStorage } from '../utils/storage';
import firebaseService from '../services/firebase.service';
import fcmTokenService from '../services/fcmToken.service';
import printService from '../services/print.service';
import soundVibrationService from '../services/soundVibration.service';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';

interface OrdersContextType {
  activeOrders: Order[];
  loading: boolean;
  error: string | null;
  fetchActiveOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { settings } = useSettings();
  const { showToast } = useToast();

  /**
   * Setup Firebase notifications
   */
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        // Initialize sound and vibration service
        await soundVibrationService.initialize();

        // Initialize Firebase and get token
        const token = await firebaseService.initialize();
        if (token) {
          // Register token with backend
          await fcmTokenService.registerToken(token);
          console.log('✅ Firebase initialized and token registered');
        }

        // Handle foreground messages (app is open)
        const unsubscribeForeground = firebaseService.onMessageReceived(
          async (remoteMessage) => {
            console.log('📱 Foreground notification received:', remoteMessage);

            const { data } = remoteMessage;

            if (data?.type === 'new-order' && data?.orderId) {
              // Fetch fresh order data and trigger auto-print
              await handleNewOrderNotification(data.orderId);
            } else if (data?.type === 'order-status-changed') {
              handleOrderStatusChangedNotification(data);
            }
          }
        );

        // Handle notification taps (user opens app from notification)
        const unsubscribeOpened = firebaseService.onNotificationOpened(
          (remoteMessage) => {
            console.log('📱 Notification opened:', remoteMessage);
            // Could navigate to specific order details here
            const { data } = remoteMessage;
            if (data?.orderId) {
              // TODO: Navigate to order details screen
              console.log('Navigate to order:', data.orderId);
            }
          }
        );

        return () => {
          unsubscribeForeground();
          unsubscribeOpened();
        };
      } catch (error) {
        console.error('Failed to setup Firebase:', error);
      }
    };

    setupFirebase();
  }, []);

  /**
   * Handle new order notification from Firebase
   * Fetches complete order data and triggers auto-print if enabled
   */
  const handleNewOrderNotification = useCallback(async (orderId: string) => {
    try {
      console.log('📦 Fetching new order data:', orderId);

      // Fetch complete order data from API
      const order = await ordersApi.getById(orderId);

      // Add to local state (prevent duplicates)
      setActiveOrders((prevOrders) => {
        const exists = prevOrders.some((o) => o._id === orderId);
        if (exists) return prevOrders;
        return [order, ...prevOrders];
      });

      // Show notification for new order
      showToast(`New Order #${order.orderNumber} - Table ${order.tableNumber || 'N/A'}`, 'info');

      // Play sound and vibrate (like Swiggy/Zomato)
      if (settings.soundEnabled) {
        await soundVibrationService.notifyNewOrder();
      }

      // Trigger auto-print if enabled
      if (settings.autoPrintEnabled) {
        console.log('🖨️  Auto-print enabled, printing order...');
        showToast(`Printing Order #${order.orderNumber}...`, 'info');

        try {
          await printService.printOrder(order);
          console.log('✅ Order auto-printed successfully');
          showToast(`Order #${order.orderNumber} printed successfully!`, 'success');

          // Play success sound
          if (settings.soundEnabled) {
            await soundVibrationService.notifySuccess();
          }
        } catch (printError: any) {
          console.error('❌ Auto-print failed:', printError);
          showToast(
            `Print failed: ${printError.message}. Order saved, print manually.`,
            'error'
          );

          // Play error sound
          if (settings.soundEnabled) {
            await soundVibrationService.notifyError();
          }
          // Don't throw - we still want to show the order even if print fails
        }
      }
    } catch (error) {
      console.error('Failed to handle new order notification:', error);
      showToast('Failed to fetch order details', 'error');

      // Play error sound
      if (settings.soundEnabled) {
        await soundVibrationService.notifyError();
      }
    }
  }, [settings.autoPrintEnabled, settings.soundEnabled, showToast]);

  /**
   * Handle order status changed notification from Firebase
   */
  const handleOrderStatusChangedNotification = useCallback((data: any) => {
    console.log('📊 Order status changed via Firebase:', data);

    setActiveOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex((o) => o._id === data.orderId);
      if (orderIndex === -1) return prevOrders;

      // Remove from active orders if served/cancelled
      if (data.status === 'served' || data.status === 'cancelled') {
        return prevOrders.filter((o) => o._id !== data.orderId);
      }

      // Update status
      const newOrders = [...prevOrders];
      newOrders[orderIndex] = {
        ...newOrders[orderIndex],
        status: data.status,
      };
      return newOrders;
    });
  }, []);

  /**
   * Fetch active orders from API
   */
  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const orders = await ordersApi.getActive();
      setActiveOrders(orders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active orders';
      console.error('Failed to fetch active orders:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      setError(null);
      const updatedOrder = await ordersApi.updateStatus(id, status);

      // Update local state
      setActiveOrders((prevOrders) => {
        const orderIndex = prevOrders.findIndex((order) => order._id === id);
        if (orderIndex === -1) return prevOrders;

        // Remove order from active orders if it's served or cancelled
        if (status === 'served' || status === 'cancelled') {
          return prevOrders.filter((order) => order._id !== id);
        }

        // Update order in place
        const newOrders = [...prevOrders];
        newOrders[orderIndex] = updatedOrder;
        return newOrders;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Failed to update order status:', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Handle new order created via socket
   */
  const handleOrderCreated = useCallback((data: any) => {
    console.log('New order received:', data);

    setActiveOrders((prevOrders) => {
      // Create a basic Order object from the socket data
      const newOrder: Order = {
        _id: data.orderId,
        orderNumber: data.orderNumber,
        tableNumber: data.tableNumber,
        items: data.items,
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        total: data.total,
        status: data.status,
        createdAt: data.createdAt,
        restaurantId: '',
        tableId: data.tableId || '',
        notes: data.notes || '',
        statusHistory: [],
        updatedAt: data.createdAt,
      } as Order;

      // Check if order already exists (prevent duplicates)
      const exists = prevOrders.some((o) => o._id === newOrder._id);
      if (exists) return prevOrders;

      // Add new order to the beginning of the list
      return [newOrder, ...prevOrders];
    });
  }, []);

  /**
   * Handle order status changed via socket
   */
  const handleOrderStatusChanged = useCallback((data: any) => {
    console.log('Order status changed:', data);
    setActiveOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex((o) => o._id === data.orderId);

      // If order not found, ignore
      if (orderIndex === -1) return prevOrders;

      // Remove order if it's served or cancelled
      if (data.status === 'served' || data.status === 'cancelled') {
        return prevOrders.filter((o) => o._id !== data.orderId);
      }

      // Update order status in place
      const newOrders = [...prevOrders];
      newOrders[orderIndex] = {
        ...newOrders[orderIndex],
        status: data.status,
      };
      return newOrders;
    });
  }, []);

  /**
   * Setup socket connection
   */
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const restaurantId = await SecureStorage.getItem(STORAGE_KEYS.RESTAURANT_ID);
        if (!restaurantId) return;

        const token = await SecureStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
        if (!token) return;

        // Connect to restaurant-specific namespace
        const socketInstance = io(`${SOCKET_URL}/${restaurantId}`, {
          auth: { token },
          transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected to restaurant:', restaurantId);
          socketInstance.emit('join-admin');
        });

        socketInstance.on('admin-joined', (data) => {
          console.log('Successfully joined admin room:', data);
        });

        socketInstance.on('new-order', handleOrderCreated);
        socketInstance.on('order-status-changed', handleOrderStatusChanged);

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected from restaurant:', restaurantId);
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.off('new-order', handleOrderCreated);
          socketInstance.off('order-status-changed', handleOrderStatusChanged);
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Failed to setup socket:', error);
      }
    };

    setupSocket();
  }, [handleOrderCreated, handleOrderStatusChanged]);

  const value: OrdersContextType = {
    activeOrders,
    loading,
    error,
    fetchActiveOrders,
    updateOrderStatus,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
};
