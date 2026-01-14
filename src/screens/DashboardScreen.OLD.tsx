/**
 * Professional Dashboard Screen
 * Displays real-time restaurant operations overview with clean, modern UI
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../components/StatCard';
import { Icon } from '../components/Icon';
import { OrdersGrid } from '../components/dashboard';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats, Order, OrderStatus } from '../types';
import { formatCurrency } from '../utils/format';
import { theme } from '../theme';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('[Dashboard] Fetching dashboard data...');

      const { stats: statsData, activeOrders: ordersData } = await dashboardApi.getPageData();

      setStats(statsData);
      setActiveOrders(ordersData);

      console.log('[Dashboard] Data fetched successfully');
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Optimistic update
      setActiveOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      console.log('[Dashboard] Updating order status:', orderId, newStatus);
    } catch (err) {
      console.error('[Dashboard] Error updating order status:', err);
      Alert.alert('Error', 'Failed to update order status');
      fetchDashboardData(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="circle-exclamation" size="2xl" color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Pull down to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Real-time overview of your restaurant operations</Text>
        </View>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <StatCard
                title="Today's Orders"
                value={stats.todayOrders ?? 0}
                icon="receipt"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primaryBg}
                trend={stats.ordersGrowth ? { value: stats.ordersGrowth, isPositive: stats.ordersGrowth > 0 } : undefined}
                style={styles.statCard}
              />
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(stats.todayRevenue ?? 0)}
                icon="wallet"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successLight}
                trend={stats.revenueGrowth ? { value: stats.revenueGrowth, isPositive: stats.revenueGrowth > 0 } : undefined}
                style={styles.statCard}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Active Orders"
                value={stats.activeOrders ?? 0}
                icon="fire"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningLight}
                subtitle="Currently processing"
                style={styles.statCard}
              />
              <StatCard
                title="Avg Prep Time"
                value={`${stats.averagePreparationTime ?? 0}m`}
                icon="clock"
                iconColor="#8B5CF6"
                iconBgColor="#EDE9FE"
                subtitle="Per order"
                style={styles.statCard}
              />
            </View>
          </View>
        )}

        {/* Active Orders Section */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <Icon name="bell" size="sm" color={theme.colors.textTertiary} />
          </View>
          <OrdersGrid
            orders={activeOrders}
            loading={false}
            onUpdateStatus={handleUpdateStatus}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  retryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
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
  statsSection: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
  },
  ordersSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});
