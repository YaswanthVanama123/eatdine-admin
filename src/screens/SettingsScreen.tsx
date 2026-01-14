/**
 * Modern Settings Screen
 * Beautiful settings interface with organized sections and professional design
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
  const [autoPrint, setAutoPrint] = useState(true);
  const [printReceipts, setPrintReceipts] = useState(true);
  const [printKitchenTickets, setPrintKitchenTickets] = useState(true);

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
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name="gear" size="2xl" color={theme.colors.primary} solid />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icon name="user-circle" size="4xl" color={theme.colors.primary} solid />
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'admin@restaurant.com'}</Text>
              <View style={styles.roleBadge}>
                <Icon name="shield-halved" size="xs" color={theme.colors.primary} solid />
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'ADMIN'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="bell" size="md" color={theme.colors.primary} solid />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingsGroup}>
            <SettingItem
              icon="bell"
              iconColor="#6366F1"
              iconBg="#E0E7FF"
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
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
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
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
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
        </View>

        {/* Printer Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="print" size="md" color={theme.colors.primary} solid />
            <Text style={styles.sectionTitle}>Printer Settings</Text>
          </View>

          <View style={styles.settingsGroup}>
            <SettingButton
              icon="print"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Connected Printer"
              subtitle="No printer connected"
              onPress={() => Alert.alert('Printer', 'Configure printer connection')}
            />

            <SettingItem
              icon="bolt"
              iconColor="#DC2626"
              iconBg="#FEE2E2"
              title="Auto-Print Orders"
              subtitle="Print new orders automatically"
              rightElement={
                <Switch
                  value={autoPrint}
                  onValueChange={setAutoPrint}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={autoPrint ? theme.colors.primary : theme.colors.surface}
                />
              }
            />

            <SettingItem
              icon="receipt"
              iconColor="#059669"
              iconBg="#D1FAE5"
              title="Print Receipts"
              subtitle="Print customer receipts"
              rightElement={
                <Switch
                  value={printReceipts}
                  onValueChange={setPrintReceipts}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={printReceipts ? theme.colors.primary : theme.colors.surface}
                />
              }
            />

            <SettingItem
              icon="kitchen-set"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Print Kitchen Tickets"
              subtitle="Send orders to kitchen printer"
              rightElement={
                <Switch
                  value={printKitchenTickets}
                  onValueChange={setPrintKitchenTickets}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={printKitchenTickets ? theme.colors.primary : theme.colors.surface}
                />
              }
            />

            <SettingButton
              icon="file-invoice"
              iconColor="#0891B2"
              iconBg="#CFFAFE"
              title="Paper Size"
              subtitle="80mm (Thermal)"
              onPress={() => Alert.alert('Paper Size', 'Configure paper size settings')}
            />

            <SettingButton
              icon="file-circle-check"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="Test Print"
              subtitle="Print a test receipt"
              onPress={() => Alert.alert('Test Print', 'Printing test receipt...')}
            />
          </View>
        </View>

        {/* Restaurant Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="store" size="md" color={theme.colors.primary} solid />
            <Text style={styles.sectionTitle}>Restaurant Information</Text>
          </View>

          <View style={styles.infoGroup}>
            <InfoCard
              icon="store"
              iconColor="#6366F1"
              iconBg="#E0E7FF"
              title="Restaurant Name"
              value="Spice Garden Restaurant"
            />

            <InfoCard
              icon="phone"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title="Phone Number"
              value="+91 98765 43210"
            />

            <InfoCard
              icon="envelope"
              iconColor="#3B82F6"
              iconBg="#DBEAFE"
              title="Email Address"
              value="contact@spicegarden.com"
            />

            <InfoCard
              icon="location-dot"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title="Address"
              value="123 Main Street, Mumbai, Maharashtra 400001"
            />

            <InfoCard
              icon="building-columns"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="GST Number"
              value="27AABCU9603R1ZM"
            />

            <InfoCard
              icon="clock"
              iconColor="#14B8A6"
              iconBg="#CCFBF1"
              title="Business Hours"
              value="Mon-Sun: 11:00 AM - 11:00 PM"
            />
          </View>

          <TouchableOpacity
            style={styles.editInfoButton}
            onPress={() => Alert.alert('Edit Info', 'Restaurant information edit screen')}
            activeOpacity={0.7}
          >
            <Icon name="pen-to-square" size="md" color={theme.colors.primary} solid />
            <Text style={styles.editInfoText}>Edit Information</Text>
            <Icon name="chevron-right" size="sm" color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="utensils" size="md" color={theme.colors.primary} solid />
            <Text style={styles.sectionTitle}>Restaurant Management</Text>
          </View>

          <View style={styles.settingsGroup}>
            <SettingButton
              icon="clock"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title="Operating Hours"
              subtitle="Manage opening hours"
              onPress={() => Alert.alert('Info', 'Operating hours screen')}
            />

            <SettingButton
              icon="utensils"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title="Menu Management"
              subtitle="Edit menu items"
              onPress={() => Alert.alert('Info', 'Menu management screen')}
            />

            <SettingButton
              icon="users"
              iconColor="#3B82F6"
              iconBg="#DBEAFE"
              title="Staff Management"
              subtitle="Manage team members"
              onPress={() => Alert.alert('Info', 'Staff management screen')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="mobile-screen" size="md" color={theme.colors.primary} solid />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>

          <View style={styles.settingsGroup}>
            <SettingButton
              icon="circle-info"
              iconColor="#6366F1"
              iconBg="#E0E7FF"
              title="About"
              subtitle="App version 1.0.0"
              onPress={() => Alert.alert('About', 'Restaurant Admin App v1.0.0')}
            />

            <SettingButton
              icon="file-lines"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="Terms & Privacy"
              subtitle="Legal information"
              onPress={() => Alert.alert('Info', 'Terms & Privacy screen')}
            />
          </View>
        </View>

        {/* Premium Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIconContainer}>
              {isLoggingOut ? (
                <ActivityIndicator color={theme.colors.textInverse} size="small" />
              ) : (
                <Icon name="arrow-right-from-bracket" size="lg" color={theme.colors.textInverse} solid />
              )}
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={styles.logoutText}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
              <Text style={styles.logoutSubtext}>Sign out from your account</Text>
            </View>
            {!isLoggingOut && (
              <Icon name="chevron-right" size="md" color={theme.colors.textInverse} />
            )}
          </TouchableOpacity>

          {/* Danger Zone */}
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => Alert.alert('Delete Account', 'This action cannot be undone')}
            activeOpacity={0.7}
          >
            <Icon name="trash-can" size="sm" color="#DC2626" solid />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for restaurant owners
          </Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
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

// InfoCard Component (display information)
function InfoCard({ icon, iconColor, iconBg, title, value }: any) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size="md" color={iconColor} solid />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.md,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['5xl'],
  },
  profileSection: {
    marginBottom: theme.spacing.xl,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#10B981',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
  },
  settingsGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  settingIcon: {
    width: 44,
    height: 44,
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
    fontWeight: theme.typography.fontWeight.medium,
  },
  infoGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: 22,
  },
  editInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryBg,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  editInfoText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  logoutSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.lg,
    ...theme.shadows.xl,
    marginBottom: theme.spacing.md,
  },
  logoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textInverse,
    marginBottom: 2,
  },
  logoutSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: theme.spacing.sm,
  },
  dangerButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#DC2626',
  },
  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  footerVersion: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
