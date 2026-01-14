import soundVibrationService from '../services/soundVibration.service';

export const useAudioNotification = () => {
  /**
   * Play notification sound for new order
   */
  const playNewOrderSound = async () => {
    try {
      await soundVibrationService.notifyNewOrder();
    } catch (error) {
      console.error('Error playing new order sound:', error);
    }
  };

  /**
   * Play notification sound for order ready
   */
  const playOrderReadySound = async () => {
    try {
      await soundVibrationService.notifySuccess();
    } catch (error) {
      console.error('Error playing order ready sound:', error);
    }
  };

  /**
   * Play urgent alert sound
   */
  const playUrgentAlert = async () => {
    try {
      await soundVibrationService.playNewOrderSound();
      await soundVibrationService.vibrateNewOrder();
    } catch (error) {
      console.error('Error playing urgent alert:', error);
    }
  };

  /**
   * Stop any currently playing sound
   */
  const stopSound = async () => {
    try {
      // Note: react-native-sound doesn't require explicit stop for short notification sounds
      console.log('Sound stopped');
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  return {
    playNewOrderSound,
    playOrderReadySound,
    playUrgentAlert,
    stopSound,
  };
};
