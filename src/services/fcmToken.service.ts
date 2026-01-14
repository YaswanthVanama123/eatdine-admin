import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { SecureStorage } from '../utils/storage';

class FCMTokenService {
  /**
   * Register FCM token with the backend
   */
  async registerToken(fcmToken: string): Promise<void> {
    try {
      const authToken = await SecureStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      if (!authToken) {
        console.warn('⚠️ No auth token found, skipping FCM token registration');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/admin/fcm-token`,
        { fcmToken },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('✅ FCM token registered with backend');
    } catch (error) {
      console.error('❌ Failed to register FCM token:', error);
      // Don't throw - this is not critical for app functionality
    }
  }

  /**
   * Unregister FCM token from the backend (on logout)
   */
  async unregisterToken(fcmToken: string): Promise<void> {
    try {
      const authToken = await SecureStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      if (!authToken) {
        return;
      }

      await axios.delete(`${API_BASE_URL}/admin/fcm-token`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: { fcmToken },
      });

      console.log('✅ FCM token unregistered from backend');
    } catch (error) {
      console.error('❌ Failed to unregister FCM token:', error);
      // Don't throw - this is not critical
    }
  }
}

export default new FCMTokenService();
