/**
 * Modern Dashboard Screen
 * Beautiful real-time restaurant operations overview
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats, Order } from '../types';
import { formatCurrency } from '../utils/format';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      if (showLoading) setLoading(true);

      const { stats: statsData, activeOrders: ordersData } = await dashboardApi.getPageData();
      setStats(statsData);
      setActiveOrders(ordersData);
    } catch (err) {
      console.error('[Dashboard] Error:', err);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (hasFetchedData.current || isFetching.current) return;
    hasFetchedData.current = true;
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Premium Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Icon name="chart-line" size="lg" color={theme.colors.primary} solid />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
              <Text style={styles.headerTitle}>{user?.name || 'Admin'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="bell" size="lg" color={theme.colors.primary} solid />
              {activeOrders.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{activeOrders.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerBottom}>
          <Icon name="calendar-days" size="sm" color={theme.colors.textSecondary} />
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        {/* Quick Stats Banner */}
        <View style={styles.quickStatsBanner}>
          <View style={styles.quickStat}>
            <Icon name="fire" size="md" color="#EF4444" solid />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatValue}>{stats?.activeOrders || 0}</Text>
              <Text style={styles.quickStatLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Icon name="clock" size="md" color="#F59E0B" solid />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatValue}>{stats?.ordersByStatus?.preparing || 0}</Text>
              <Text style={styles.quickStatLabel}>Cooking</Text>
            </View>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Icon name="check-circle" size="md" color="#10B981" solid />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatValue}>{stats?.ordersByStatus?.ready || 0}</Text>
              <Text style={styles.quickStatLabel}>Ready</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Performance Stats Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Today's Performance</Text>
              <Icon name="chart-line" size="md" color={theme.colors.primary} solid />
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
            <StatCard
              title="Today's Revenue"
              value={formatCurrency(stats?.todayRevenue || 0)}
              icon="dollar-sign"
              iconColor={theme.colors.success}
              bgColor={theme.colors.successLight}
            />
            <StatCard
              title="Orders Today"
              value={stats?.todayOrders?.toString() || '0'}
              icon="receipt"
              iconColor={theme.colors.primary}
              bgColor={theme.colors.primaryBg}
            />
            <StatCard
              title="Active Orders"
              value={stats?.activeOrders?.toString() || '0'}
              icon="clock"
              iconColor={theme.colors.warning}
              bgColor={theme.colors.warningLight}
            />
            <StatCard
              title="Avg Prep Time"
              value={`${stats?.averagePreparationTime || 0}m`}
              icon="gauge-high"
              iconColor={theme.colors.info}
              bgColor={theme.colors.infoLight}
            />
          </View>
          </View>

          {/* Order Status Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={styles.statusGrid}>
              <StatusCard
                label="Received"
                count={stats?.ordersByStatus?.received || 0}
                color={theme.colors.received}
                icon="inbox"
              />
              <StatusCard
                label="Preparing"
                count={stats?.ordersByStatus?.preparing || 0}
                color={theme.colors.preparing}
                icon="fire"
              />
              <StatusCard
                label="Ready"
                count={stats?.ordersByStatus?.ready || 0}
                color={theme.colors.ready}
                icon="check-circle"
              />
              <StatusCard
                label="Served"
                count={stats?.ordersByStatus?.served || 0}
                color={theme.colors.served}
                icon="circle-check"
              />
            </View>
          </View>

          {/* Active Orders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {activeOrders.length > 0 ? (
              <View style={styles.ordersContainer}>
                {activeOrders.slice(0, 5).map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="inbox" size="3xl" color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No active orders</Text>
                <Text style={styles.emptyStateSubtext}>New orders will appear here</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// StatCard Component
function StatCard({ title, value, icon, iconColor, bgColor }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Icon name={icon} size="lg" color={iconColor} solid />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

// StatusCard Component
function StatusCard({ label, count, color, icon }: any) {
  return (
    <View style={styles.statusCard}>
      <View style={[styles.statusIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size="md" color={color} solid />
      </View>
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

// OrderCard Component
function OrderCard({ order }: { order: Order }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return theme.colors.received;
      case 'preparing': return theme.colors.preparing;
      case 'ready': return theme.colors.ready;
      default: return theme.colors.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return 'inbox';
      case 'preparing': return 'fire';
      case 'ready': return 'check-circle';
      default: return 'circle';
    }
  };

  return (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
      <View style={styles.orderCardHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderTable}>Table {order.tableNumber}</Text>
        </View>
        <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Icon name={getStatusIcon(order.status)} size="xs" color={getStatusColor(order.status)} solid />
          <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.orderCardFooter}>
        <Text style={styles.orderItems}>{order.items.length} items</Text>
        <Text style={styles.orderAmount}>{formatCurrency(order.total)}</Text>
      </View>
    </TouchableOpacity>
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
    ...theme.shadows.lg,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  quickStatsBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  quickStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  quickStatText: {
    alignItems: 'flex-start',
  },
  quickStatValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    lineHeight: 24,
  },
  quickStatLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statusCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusCount: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  ordersContainer: {
    gap: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  orderTable: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  orderStatusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  orderAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing['3xl'],
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
