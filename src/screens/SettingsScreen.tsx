import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Switch, Button, TextInput, Divider, Card, Snackbar } from 'react-native-paper';
import { useSettings } from '../context/SettingsContext';
import printService from '../services/print.service';

/**
 * Settings Screen for Admin Mobile App
 * Configure auto-print, print service URL, notifications, and sounds
 */
const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [printServiceUrl, setPrintServiceUrl] = useState(settings.printServiceUrl);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  /**
   * Toggle auto-print feature
   */
  const handleToggleAutoPrint = async (value: boolean) => {
    try {
      await updateSettings({ autoPrintEnabled: value });
      setSnackbar({
        visible: true,
        message: `Auto-print ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-print setting');
    }
  };

  /**
   * Toggle notifications
   */
  const handleToggleNotifications = async (value: boolean) => {
    try {
      await updateSettings({ notificationsEnabled: value });
      setSnackbar({
        visible: true,
        message: `Notifications ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  /**
   * Toggle notification sound
   */
  const handleToggleSound = async (value: boolean) => {
    try {
      await updateSettings({ soundEnabled: value });
      setSnackbar({
        visible: true,
        message: `Sound ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update sound setting');
    }
  };

  /**
   * Save Print Service URL
   */
  const handleSavePrintServiceUrl = async () => {
    try {
      setSaving(true);

      // Validate URL format
      if (!printServiceUrl.startsWith('http://') && !printServiceUrl.startsWith('https://')) {
        Alert.alert('Invalid URL', 'URL must start with http:// or https://');
        return;
      }

      // Update Print Service client
      await printService.updateBaseURL(printServiceUrl);

      // Save to settings
      await updateSettings({ printServiceUrl });

      setSnackbar({
        visible: true,
        message: 'Print Service URL updated successfully',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update Print Service URL');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Test printer connection
   */
  const handleTestPrint = async () => {
    setTesting(true);
    try {
      const result = await printService.testPrint();

      if (result.success) {
        Alert.alert(
          'Success',
          'Test print sent successfully! Check your printer.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Print Failed',
          result.error || 'Test print failed. Please check:\n' +
            '• Print Service is running\n' +
            '• URL is correct\n' +
            '• Printer is connected',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Error',
        error.message || 'Cannot reach Print Service',
        [{ text: 'OK' }]
      );
    } finally {
      setTesting(false);
    }
  };

  /**
   * Reset URL to default
   */
  const handleResetUrl = () => {
    setPrintServiceUrl('http://localhost:9100');
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Printing Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Printing
            </Text>

            <View style={styles.row}>
              <View style={styles.settingInfo}>
                <Text variant="bodyLarge">Automatic Printing</Text>
                <Text variant="bodySmall" style={styles.description}>
                  Print new orders automatically when received
                </Text>
              </View>
              <Switch
                value={settings.autoPrintEnabled}
                onValueChange={handleToggleAutoPrint}
              />
            </View>

            <Divider style={styles.divider} />

            <Text variant="bodyMedium" style={styles.label}>
              Print Service URL
            </Text>
            <Text variant="bodySmall" style={styles.helperText}>
              For tablets: Use network IP (e.g., http://192.168.1.100:9100)
            </Text>
            <TextInput
              value={printServiceUrl}
              onChangeText={setPrintServiceUrl}
              placeholder="http://localhost:9100"
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleResetUrl}
                style={styles.halfButton}
                compact
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={handleSavePrintServiceUrl}
                loading={saving}
                disabled={saving}
                style={styles.halfButton}
              >
                Save URL
              </Button>
            </View>

            <Button
              mode="outlined"
              onPress={handleTestPrint}
              loading={testing}
              disabled={testing}
              style={styles.fullButton}
              icon="printer"
            >
              Test Print
            </Button>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notifications
            </Text>

            <View style={styles.row}>
              <View style={styles.settingInfo}>
                <Text variant="bodyLarge">Push Notifications</Text>
                <Text variant="bodySmall" style={styles.description}>
                  Receive notifications for new orders
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.settingInfo}>
                <Text variant="bodyLarge">Notification Sound</Text>
                <Text variant="bodySmall" style={styles.description}>
                  Play sound when notification is received
                </Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleToggleSound}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About Print Service
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              The Print Service is a separate desktop application that handles thermal receipt printing.
              Make sure it's running before enabling auto-print.
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, styles.marginTop]}>
              For network printing from tablets, enter the IP address of the computer running the Print Service
              (e.g., http://192.168.1.100:9100).
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
  },
  helperText: {
    color: '#666',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  halfButton: {
    flex: 1,
  },
  fullButton: {
    marginTop: 4,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
  },
  marginTop: {
    marginTop: 12,
  },
});

export default SettingsScreen;
