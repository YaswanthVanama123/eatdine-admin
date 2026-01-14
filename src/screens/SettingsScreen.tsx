/**
 * Modern Settings Screen
 * Beautiful settings interface with organized sections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="user" size="2xl" color={theme.colors.primary} solid />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'admin@restaurant.com'}</Text>
            <View style={styles.roleBadge}>
              <Icon name="shield-check" size="xs" color={theme.colors.primary} solid />
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'ADMIN'}</Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <SettingItem
            icon="bell"
            iconColor={theme.colors.primary}
            iconBg={theme.colors.primaryBg}
            title="Push Notifications"
            subtitle="Receive order notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={notifications ? theme.colors.primary : theme.colors.surface}
              />
            }
          />

          <SettingItem
            icon="volume-high"
            iconColor={theme.colors.accent}
            iconBg={theme.colors.accentBg}
            title="Sound"
            subtitle="Play sound for new orders"
            rightElement={
              <Switch
                value={sound}
                onValueChange={setSound}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={sound ? theme.colors.primary : theme.colors.surface}
              />
            }
          />

          <SettingItem
            icon="mobile-screen"
            iconColor={theme.colors.info}
            iconBg={theme.colors.infoLight}
            title="Vibration"
            subtitle="Vibrate on notifications"
            rightElement={
              <Switch
                value={vibration}
                onValueChange={setVibration}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={vibration ? theme.colors.primary : theme.colors.surface}
              />
            }
          />
        </View>

        {/* Restaurant Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>

          <SettingButton
            icon="store"
            iconColor={theme.colors.primary}
            iconBg={theme.colors.primaryBg}
            title="Restaurant Info"
            subtitle="View restaurant details"
            onPress={() => Alert.alert('Info', 'Restaurant info screen')}
          />

          <SettingButton
            icon="clock"
            iconColor={theme.colors.success}
            iconBg={theme.colors.successLight}
            title="Operating Hours"
            subtitle="Manage opening hours"
            onPress={() => Alert.alert('Info', 'Operating hours screen')}
          />

          <SettingButton
            icon="utensils"
            iconColor={theme.colors.warning}
            iconBg={theme.colors.warningLight}
            title="Menu Management"
            subtitle="Edit menu items"
            onPress={() => Alert.alert('Info', 'Menu management screen')}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <SettingButton
            icon="circle-info"
            iconColor={theme.colors.info}
            iconBg={theme.colors.infoLight}
            title="About"
            subtitle="App version 1.0.0"
            onPress={() => Alert.alert('About', 'Restaurant Admin App v1.0.0')}
          />

          <SettingButton
            icon="file-lines"
            iconColor={theme.colors.textSecondary}
            iconBg={theme.colors.surfaceVariant}
            title="Terms & Privacy"
            subtitle="Legal information"
            onPress={() => Alert.alert('Info', 'Terms & Privacy screen')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={theme.colors.textInverse} />
          ) : (
            <>
              <Icon name="right-from-bracket" size="md" color={theme.colors.textInverse} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with care for restaurant owners
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// SettingItem Component (with Switch)
function SettingItem({ icon, iconColor, iconBg, title, subtitle, rightElement }: any) {
  return (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size="md" color={iconColor} solid />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {rightElement}
    </View>
  );
}

// SettingButton Component (clickable)
function SettingButton({ icon, iconColor, iconBg, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size="md" color={iconColor} solid />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size="sm" color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.lg,
    gap: theme.spacing.sm,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
  },
  footer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
