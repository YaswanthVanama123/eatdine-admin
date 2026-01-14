import Sound from 'react-native-sound';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

/**
 * Sound & Vibration Service for Admin Mobile App
 * Provides audio and haptic feedback for important events
 *
 * Migrated from Expo to React Native CLI:
 * - expo-av → react-native-sound
 * - expo-haptics → react-native-haptic-feedback
 */

// Enable playback in silence mode
Sound.setCategory('Playback');

class SoundVibrationService {
  private newOrderSound: Sound | null = null;
  private successSound: Sound | null = null;
  private errorSound: Sound | null = null;
  private soundEnabled = true;
  private vibrationEnabled = true;

  /**
   * Initialize and preload sounds
   * Sound files should be placed in:
   * - Android: android/app/src/main/res/raw/new_order.wav
   * - iOS: Add to Xcode project
   */
  async initialize(): Promise<void> {
    try {
      // Preload new order sound
      this.newOrderSound = new Sound('new_order.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Failed to load new order sound:', error);
        }
      });

      // Preload success sound (using same sound as new order for now)
      this.successSound = new Sound('new_order.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Failed to load success sound:', error);
        }
      });

      // Preload error sound (using same sound as new order for now)
      this.errorSound = new Sound('new_order.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Failed to load error sound:', error);
        }
      });

      console.log('✅ Audio initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Play new order sound
   * Like Swiggy/Zomato notification sound
   */
  async playNewOrderSound(): Promise<void> {
    if (!this.soundEnabled || !this.newOrderSound) return;

    try {
      this.newOrderSound.setVolume(1.0);
      this.newOrderSound.play((success) => {
        if (!success) {
          console.error('Playback failed');
        }
      });
    } catch (error) {
      console.error('Failed to play new order sound:', error);
    }
  }

  /**
   * Play success sound (order completed, payment received, etc.)
   */
  async playSuccessSound(): Promise<void> {
    if (!this.soundEnabled || !this.successSound) return;

    try {
      this.successSound.setVolume(0.7);
      this.successSound.play((success) => {
        if (!success) {
          console.error('Playback failed');
        }
      });
    } catch (error) {
      console.error('Failed to play success sound:', error);
    }
  }

  /**
   * Play error sound
   */
  async playErrorSound(): Promise<void> {
    if (!this.soundEnabled || !this.errorSound) return;

    try {
      this.errorSound.setVolume(0.7);
      this.errorSound.play((success) => {
        if (!success) {
          console.error('Playback failed');
        }
      });
    } catch (error) {
      console.error('Failed to play error sound:', error);
    }
  }

  /**
   * Vibrate for new order (heavy impact)
   * Double vibration pattern for attention
   */
  async vibrateNewOrder(): Promise<void> {
    if (!this.vibrationEnabled) return;

    try {
      const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      ReactNativeHapticFeedback.trigger('impactHeavy', options);
      setTimeout(() => {
        ReactNativeHapticFeedback.trigger('impactHeavy', options);
      }, 200);
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Vibrate for success (light impact)
   */
  async vibrateSuccess(): Promise<void> {
    if (!this.vibrationEnabled) return;

    try {
      ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Vibrate for error (medium impact)
   */
  async vibrateError(): Promise<void> {
    if (!this.vibrationEnabled) return;

    try {
      ReactNativeHapticFeedback.trigger('notificationError', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Vibrate for warning
   */
  async vibrateWarning(): Promise<void> {
    if (!this.vibrationEnabled) return;

    try {
      ReactNativeHapticFeedback.trigger('notificationWarning', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Combined notification: Sound + Vibration for new order
   */
  async notifyNewOrder(): Promise<void> {
    await Promise.all([this.playNewOrderSound(), this.vibrateNewOrder()]);
  }

  /**
   * Combined notification: Sound + Vibration for success
   */
  async notifySuccess(): Promise<void> {
    await Promise.all([this.playSuccessSound(), this.vibrateSuccess()]);
  }

  /**
   * Combined notification: Sound + Vibration for error
   */
  async notifyError(): Promise<void> {
    await Promise.all([this.playErrorSound(), this.vibrateError()]);
  }

  /**
   * Enable/disable sound
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Enable/disable vibration
   */
  setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
  }

  /**
   * Get current settings
   */
  getSettings(): { soundEnabled: boolean; vibrationEnabled: boolean } {
    return {
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled,
    };
  }

  /**
   * Cleanup - release sound resources
   */
  async cleanup(): Promise<void> {
    this.newOrderSound?.release();
    this.successSound?.release();
    this.errorSound?.release();
  }
}

export const soundVibrationService = new SoundVibrationService();
export default soundVibrationService;
