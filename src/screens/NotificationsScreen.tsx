/**
 * Notifications Screen
 * Professional notifications interface with order updates
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

interface Notification {
  id: string;
  type: 'new_order' | 'order_ready' | 'order_cancelled' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderNumber?: string;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock notifications data - replace with actual API call
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'new_order',
      title: 'New Order Received',
      message: 'Table 5 placed a new order',
      time: '2 minutes ago',
      read: false,
      orderNumber: 'ORD-1234',
    },
    {
      id: '2',
      type: 'order_ready',
      title: 'Order Ready',
      message: 'Table 3 order is ready to serve',
      time: '15 minutes ago',
      read: false,
      orderNumber: 'ORD-1233',
    },
    {
      id: '3',
      type: 'new_order',
      title: 'New Order Received',
      message: 'Table 8 placed a new order',
      time: '1 hour ago',
      read: true,
      orderNumber: 'ORD-1232',
    },
    {
      id: '4',
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: 'Table 2 cancelled their order',
      time: '2 hours ago',
      read: true,
      orderNumber: 'ORD-1231',
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      message: 'App updated to version 1.0.1',
      time: '1 day ago',
      read: true,
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return { name: 'bell-concierge', color: '#3B82F6', bg: '#DBEAFE' };
      case 'order_ready':
        return { name: 'circle-check', color: '#10B981', bg: '#D1FAE5' };
      case 'order_cancelled':
        return { name: 'ban', color: '#EF4444', bg: '#FEE2E2' };
      case 'system':
        return { name: 'gear', color: '#8B5CF6', bg: '#F3E8FF' };
      default:
        return { name: 'bell', color: theme.colors.primary, bg: theme.colors.primaryBg };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size="lg" color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {notifications.filter(n => !n.read).length} unread
          </Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Icon name="bell-slash" size="3xl" color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.notificationUnread,
                  ]}
                  onPress={() => handleMarkAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View style={[styles.notificationIcon, { backgroundColor: iconConfig.bg }]}>
                      <Icon name={iconConfig.name} size="lg" color={iconConfig.color} solid />
                    </View>
                    <View style={styles.notificationText}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      {notification.orderNumber && (
                        <View style={styles.orderNumberBadge}>
                          <Icon name="hashtag" size="xs" color={theme.colors.primary} />
                          <Text style={styles.orderNumberText}>{notification.orderNumber}</Text>
                        </View>
                      )}
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.errorLight,
  },
  clearButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  notificationsContainer: {
    gap: theme.spacing.md,
  },
  notificationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  notificationUnread: {
    backgroundColor: theme.colors.primaryBg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  orderNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  orderNumberText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  notificationTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['5xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
