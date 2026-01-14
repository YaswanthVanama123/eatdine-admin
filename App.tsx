/**
 * Main App Entry Point - React Native CLI
 * Complete app with Firebase notifications and auto-print functionality
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { ToastProvider } from './src/context/ToastContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import {
  notificationHandlerService,
  soundVibrationService,
  firebaseService,
} from './src/services';
import { apiClient } from './src/api/client';
import { API_BASE_URL } from './src/utils/constants';

/**
 * AppContent component that has access to SettingsContext
 * This allows us to initialize notification handler with settings
 */
function AppContent() {
  const { settings, loading } = useSettings();

  // Initialize API client once on app startup
  useEffect(() => {
    console.log('[App] Initializing API client with base URL:', API_BASE_URL);
    apiClient.initialize({
      baseURL: API_BASE_URL,
      timeout: 30000,
      debug: true, // Enable debug logging
      onUnauthorized: () => {
        console.log('[App] User unauthorized - session expired');
      },
      onNetworkError: (error) => {
        console.warn('[App] Network error:', error.message);
      },
    });
    console.log('[App] API client initialized successfully');
  }, []);

  useEffect(() => {
    if (loading) return;

    // Initialize notification handler with settings
    const initializeNotifications = async () => {
      try {
        console.log('[App] Initializing notification system...');

        // Initialize sound and vibration first
        await soundVibrationService.initialize();

        // Initialize notification handler with settings
        await notificationHandlerService.initialize({
          autoPrintEnabled: settings.autoPrintEnabled,
          soundEnabled: settings.soundEnabled,
          vibrationEnabled: true, // Can be added to settings
        });

        console.log('[App] Notification system initialized');
      } catch (error) {
        console.error('[App] Notification initialization failed:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      soundVibrationService.cleanup();
    };
  }, [settings, loading]);

  // Update notification handler when settings change
  useEffect(() => {
    if (!loading) {
      notificationHandlerService.updateSettings({
        autoPrintEnabled: settings.autoPrintEnabled,
        soundEnabled: settings.soundEnabled,
        vibrationEnabled: true,
      });
    }
  }, [settings.autoPrintEnabled, settings.soundEnabled, loading]);

  return (
    <OrdersProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
    </OrdersProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
