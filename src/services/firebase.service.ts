import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Firebase Cloud Messaging Service for Admin Mobile App
 * Handles push notifications for new orders and order updates
 *
 * Migrated from Expo to React Native CLI:
 * - expo-notifications → @notifee/react-native
 * - expo-device → react-native-device-info
 */
class FirebaseService {
  private initialized = false;

  /**
   * Initialize Firebase and request notification permissions
   * Returns FCM token if successful, null otherwise
   */
  async initialize(): Promise<string | null> {
    try {
      // Request FCM permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('Push notification permission denied');
        return null;
      }

      // Create notification channel for Android
      await this.createNotificationChannels();

      // Get FCM token
      const token = await messaging().getToken();
      console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');

      // Log device info for debugging
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceName = await DeviceInfo.getDeviceName();
      const isTablet = DeviceInfo.isTablet();
      console.log(`📱 Device: ${deviceName} (${deviceId}), Tablet: ${isTablet}`);

      this.initialized = true;
      return token;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return null;
    }
  }

  /**
   * Create Android notification channels
   * Required for Android 8.0+
   */
  private async createNotificationChannels(): Promise<void> {
    try {
      // Orders channel - high priority with sound
      await notifee.createChannel({
        id: 'orders',
        name: 'Order Notifications',
        description: 'Notifications for new orders and order updates',
        importance: AndroidImportance.HIGH,
        sound: 'new_order',
        vibration: true,
        vibrationPattern: [300, 500, 300, 500],
      });

      // Default channel
      await notifee.createChannel({
        id: 'default',
        name: 'General Notifications',
        description: 'General app notifications',
        importance: AndroidImportance.DEFAULT,
      });

      console.log('✅ Notification channels created');
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  }

  /**
   * Display notification using Notifee
   * Called for foreground messages
   */
  async displayNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: 'orders',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          sound: 'new_order',
          vibrationPattern: [300, 500, 300, 500],
          largeIcon: require('../../assets/icon.png'),
          color: '#3b82f6',
        },
        ios: {
          sound: 'new_order.wav',
          critical: true,
          criticalVolume: 1.0,
        },
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  }

  /**
   * Get current FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.initialized) {
        return await this.initialize();
      }
      return await messaging().getToken();
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground notifications
   * Called when app is in foreground and notification is received
   */
  onMessageReceived(callback: (remoteMessage: any) => void): () => void {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('📱 Foreground notification received:', remoteMessage);

      // Display notification with Notifee for better control
      if (remoteMessage.notification) {
        await this.displayNotification(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || '',
          remoteMessage.data
        );
      }

      // Call callback for app logic
      callback(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * Set background message handler
   * Called when app is in background/quit and notification is received
   */
  setBackgroundMessageHandler(handler: (remoteMessage: any) => Promise<void>): void {
    messaging().setBackgroundMessageHandler(handler);
  }

  /**
   * Listen for notification taps (when user opens app from notification)
   * Returns unsubscribe function
   */
  onNotificationOpened(callback: (remoteMessage: any) => void): () => void {
    // Handle initial notification (app opened from quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📱 App opened from quit state by notification:', remoteMessage);
          callback(remoteMessage);
        }
      });

    // Handle notification tap when app is in background
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 App opened from background by notification:', remoteMessage);
      callback(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * Delete FCM token (on logout)
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.initialized = false;
      console.log('✅ FCM token deleted');
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
    }
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export default new FirebaseService();
