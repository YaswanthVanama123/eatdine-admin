/**
 * Professional Settings Screen
 * Configure auto-print, notifications, and system preferences
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import printService from '../services/print.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { logout } = useAuth();
  const [printServiceUrl, setPrintServiceUrl] = useState(settings.printServiceUrl);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggleAutoPrint = async (value: boolean) => {
    try {
      await updateSettings({ autoPrintEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-print setting');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await updateSettings({ notificationsEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  const handleToggleSound = async (value: boolean) => {
    try {
      await updateSettings({ soundEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update sound setting');
    }
  };

  const handleSavePrintServiceUrl = async () => {
    try {
      setSaving(true);

      if (!printServiceUrl.startsWith('http://') && !printServiceUrl.startsWith('https://')) {
        Alert.alert('Invalid URL', 'URL must start with http:// or https://');
        return;
      }

      await printService.updateBaseURL(printServiceUrl);
      await updateSettings({ printServiceUrl });

      Alert.alert('Success', 'Print Service URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update Print Service URL');
    } finally {
      setSaving(false);
    }
  };

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

  const handleResetUrl = () => {
    setPrintServiceUrl('http://localhost:9100');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences and system configuration</Text>
        </View>

        {/* Printing Settings */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="print" size="md" color={theme.colors.primary} solid />
            <Text style={styles.cardTitle}>Printing</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Automatic Printing</Text>
              <Text style={styles.settingDescription}>
                Print new orders automatically when received
              </Text>
            </View>
            <Switch
              value={settings.autoPrintEnabled}
              onValueChange={handleToggleAutoPrint}
              trackColor={{ false: theme.colors.borderDark, true: theme.colors.primaryLight }}
              thumbColor={settings.autoPrintEnabled ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Print Service URL</Text>
          <Text style={styles.helperText}>
            For tablets: Use network IP (e.g., http://192.168.1.100:9100)
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="wifi" size="sm" color={theme.colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              value={printServiceUrl}
              onChangeText={setPrintServiceUrl}
              placeholder="http://localhost:9100"
              placeholderTextColor={theme.colors.textTertiary}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Reset"
              variant="outline"
              onPress={handleResetUrl}
              size="sm"
              style={styles.halfButton}
            />
            <Button
              title="Save URL"
              variant="primary"
              onPress={handleSavePrintServiceUrl}
              loading={saving}
              disabled={saving}
              size="sm"
              style={styles.halfButton}
            />
          </View>

          <Button
            title="Test Print"
            variant="secondary"
            icon="print"
            onPress={handleTestPrint}
            loading={testing}
            disabled={testing}
            fullWidth
            style={styles.testButton}
          />
        </Card>

        {/* Notification Settings */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="bell" size="md" color={theme.colors.primary} solid />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new orders
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.colors.borderDark, true: theme.colors.primaryLight }}
              thumbColor={settings.notificationsEnabled ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notification Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound when notification is received
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: theme.colors.borderDark, true: theme.colors.primaryLight }}
              thumbColor={settings.soundEnabled ? theme.colors.primary : theme.colors.surface}
            />
          </View>
        </Card>

        {/* Info Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="circle-info" size="md" color={theme.colors.info} solid />
            <Text style={styles.cardTitle}>About Print Service</Text>
          </View>
          <Text style={styles.infoText}>
            The Print Service is a separate desktop application that handles thermal receipt printing.
            Make sure it's running before enabling auto-print.
          </Text>
          <Text style={[styles.infoText, styles.infoTextMargin]}>
            For network printing from tablets, enter the IP address of the computer running the Print Service
            (e.g., http://192.168.1.100:9100).
          </Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          icon="right-from-bracket"
          onPress={handleLogout}
          fullWidth
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
  testButton: {
    marginTop: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
  },
  infoTextMargin: {
    marginTop: theme.spacing.md,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default SettingsScreen;
