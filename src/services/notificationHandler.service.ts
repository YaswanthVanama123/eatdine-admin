import firebaseService from './firebase.service';
import soundVibrationService from './soundVibration.service';
import printService from './print.service';

/**
 * Notification Handler Service
 * Centralized service for handling all notification types with auto-print functionality
 *
 * Features:
 * - Firebase Cloud Messaging integration
 * - Sound and vibration alerts
 * - Automatic order printing
 * - Order status notifications
 * - Urgent order alerts
 */

export interface NotificationData {
  type: 'new_order' | 'order_ready' | 'order_status_changed' | 'urgent_order';
  orderId?: string;
  orderNumber?: string;
  orderData?: any;
  message?: string;
  title?: string;
}

export interface NotificationSettings {
  autoPrintEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationHandlerService {
  private settings: NotificationSettings = {
    autoPrintEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  private onNewOrderCallback?: (orderData: any) => void;
  private onOrderStatusChangedCallback?: (orderId: string, status: string) => void;

  /**
   * Initialize the notification handler service
   * Sets up Firebase listeners and notification handlers
   */
  async initialize(settings: NotificationSettings): Promise<void> {
    try {
      this.settings = settings;

      // Initialize Firebase
      const fcmToken = await firebaseService.initialize();
      console.log('✅ Notification Handler initialized with FCM token:', fcmToken?.substring(0, 20));

      // Set up foreground message handler
      firebaseService.onMessageReceived((remoteMessage) => {
        this.handleForegroundNotification(remoteMessage);
      });

      // Set up notification tap handler
      firebaseService.onNotificationOpened((remoteMessage) => {
        this.handleNotificationTap(remoteMessage);
      });

      // Set up background message handler
      firebaseService.setBackgroundMessageHandler(async (remoteMessage) => {
        await this.handleBackgroundNotification(remoteMessage);
      });

      console.log('✅ Notification handlers set up successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification handler:', error);
      throw error;
    }
  }

  /**
   * Handle foreground notifications (app is open)
   */
  private async handleForegroundNotification(remoteMessage: any): Promise<void> {
    console.log('📱 Foreground notification received:', remoteMessage);

    const data: NotificationData = remoteMessage.data || {};

    // Handle notification based on type
    await this.processNotification(data);
  }

  /**
   * Handle background notifications (app is closed/background)
   */
  private async handleBackgroundNotification(remoteMessage: any): Promise<void> {
    console.log('📱 Background notification received:', remoteMessage);

    const data: NotificationData = remoteMessage.data || {};

    // Process notification (auto-print will happen here if enabled)
    await this.processNotification(data);
  }

  /**
   * Handle notification tap (user opened app from notification)
   */
  private handleNotificationTap(remoteMessage: any): void {
    console.log('📱 Notification tapped:', remoteMessage);

    const data: NotificationData = remoteMessage.data || {};

    // Navigate to appropriate screen based on notification type
    // This will be handled by the navigation service
    if (data.type === 'new_order' && data.orderId) {
      // Navigate to orders screen with order details
      console.log('Navigate to order:', data.orderId);
    }
  }

  /**
   * Process notification and trigger appropriate actions
   */
  private async processNotification(data: NotificationData): Promise<void> {
    try {
      switch (data.type) {
        case 'new_order':
          await this.handleNewOrder(data);
          break;

        case 'order_ready':
          await this.handleOrderReady(data);
          break;

        case 'order_status_changed':
          await this.handleOrderStatusChanged(data);
          break;

        case 'urgent_order':
          await this.handleUrgentOrder(data);
          break;

        default:
          console.log('Unknown notification type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error processing notification:', error);
    }
  }

  /**
   * Handle new order notification
   * - Play sound
   * - Vibrate
   * - Auto-print if enabled
   * - Trigger callback
   */
  private async handleNewOrder(data: NotificationData): Promise<void> {
    console.log('🆕 New order notification:', data.orderNumber);

    // Play sound and vibrate
    if (this.settings.soundEnabled) {
      await soundVibrationService.playNewOrderSound();
    }

    if (this.settings.vibrationEnabled) {
      await soundVibrationService.vibrateNewOrder();
    }

    // Auto-print if enabled
    if (this.settings.autoPrintEnabled && data.orderData) {
      try {
        console.log('🖨️  Auto-printing new order:', data.orderNumber);
        await printService.printOrder(data.orderData);
      } catch (error) {
        console.error('❌ Auto-print failed:', error);
        // Continue even if print fails
      }
    }

    // Trigger callback for app to refresh orders
    if (this.onNewOrderCallback && data.orderData) {
      this.onNewOrderCallback(data.orderData);
    }
  }

  /**
   * Handle order ready notification
   */
  private async handleOrderReady(data: NotificationData): Promise<void> {
    console.log('✅ Order ready notification:', data.orderNumber);

    // Play success sound
    if (this.settings.soundEnabled) {
      await soundVibrationService.playSuccessSound();
    }

    if (this.settings.vibrationEnabled) {
      await soundVibrationService.vibrateSuccess();
    }
  }

  /**
   * Handle order status changed notification
   */
  private async handleOrderStatusChanged(data: NotificationData): Promise<void> {
    console.log('🔄 Order status changed:', data.orderNumber, data.message);

    // Play success sound
    if (this.settings.soundEnabled) {
      await soundVibrationService.playSuccessSound();
    }

    // Trigger callback
    if (this.onOrderStatusChangedCallback && data.orderId) {
      this.onOrderStatusChangedCallback(data.orderId, data.message || 'status_changed');
    }
  }

  /**
   * Handle urgent order alert
   */
  private async handleUrgentOrder(data: NotificationData): Promise<void> {
    console.log('⚠️  Urgent order alert:', data.orderNumber);

    // Play urgent alert (same as new order but more attention-grabbing)
    if (this.settings.soundEnabled) {
      await soundVibrationService.playNewOrderSound();
      // Play twice for urgency
      setTimeout(() => soundVibrationService.playNewOrderSound(), 1000);
    }

    if (this.settings.vibrationEnabled) {
      await soundVibrationService.vibrateNewOrder();
      // Vibrate twice for urgency
      setTimeout(() => soundVibrationService.vibrateNewOrder(), 1000);
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('✅ Notification settings updated:', this.settings);

    // Update sound and vibration service settings
    if (newSettings.soundEnabled !== undefined) {
      soundVibrationService.setSoundEnabled(newSettings.soundEnabled);
    }

    if (newSettings.vibrationEnabled !== undefined) {
      soundVibrationService.setVibrationEnabled(newSettings.vibrationEnabled);
    }
  }

  /**
   * Register callback for new orders
   */
  onNewOrder(callback: (orderData: any) => void): void {
    this.onNewOrderCallback = callback;
  }

  /**
   * Register callback for order status changes
   */
  onOrderStatusChanged(callback: (orderId: string, status: string) => void): void {
    this.onOrderStatusChangedCallback = callback;
  }

  /**
   * Manually trigger new order notification (for testing)
   */
  async testNewOrderNotification(): Promise<void> {
    const testOrder = {
      _id: 'test-123',
      orderNumber: 'TEST-001',
      tableNumber: '5',
      items: [
        {
          name: 'Test Item',
          quantity: 1,
          price: 10.99,
        },
      ],
      subtotal: 10.99,
      tax: 0.88,
      total: 11.87,
      status: 'received',
      createdAt: new Date().toISOString(),
    };

    await this.handleNewOrder({
      type: 'new_order',
      orderId: 'test-123',
      orderNumber: 'TEST-001',
      orderData: testOrder,
    });
  }

  /**
   * Get FCM token for device
   */
  async getFCMToken(): Promise<string | null> {
    return await firebaseService.getToken();
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return firebaseService.isInitialized();
  }
}

export const notificationHandlerService = new NotificationHandlerService();
export default notificationHandlerService;
