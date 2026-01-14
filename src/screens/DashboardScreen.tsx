import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatsCard, OrdersGrid } from '../components/dashboard';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats, Order, OrderStatus } from '../types';
import { formatCurrency } from '../utils/format';

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

      // Note: API call should be added here when orders API is implemented
      console.log('[Dashboard] Updating order status:', orderId, newStatus);
    } catch (err) {
      console.error('[Dashboard] Error updating order status:', err);
      Alert.alert('Error', 'Failed to update order status');
      // Refresh data to revert optimistic update
      fetchDashboardData(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
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
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Real-time overview of your restaurant operations</Text>
        </View>

        {stats && (
          <View style={styles.statsSection}>
            <StatsCard
              title="Today's Orders"
              value={stats.todayOrders ?? 0}
              icon={<Ionicons name="bag-handle" size={28} color="#3b82f6" />}
              color="#3b82f6"
            />
            <StatsCard
              title="Today's Revenue"
              value={formatCurrency(stats.todayRevenue ?? 0)}
              icon={<Ionicons name="cash" size={28} color="#10b981" />}
              color="#10b981"
            />
            <StatsCard
              title="Active Orders"
              value={stats.activeOrders ?? 0}
              icon={<Ionicons name="cube" size={28} color="#f59e0b" />}
              color="#f59e0b"
            />
            <StatsCard
              title="Avg Prep Time"
              value={`${stats.averagePreparationTime ?? 0}m`}
              icon={<Ionicons name="time" size={28} color="#8b5cf6" />}
              color="#8b5cf6"
            />
          </View>
        )}

        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Active Orders</Text>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  retryText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsSection: {
    marginBottom: 32,
  },
  ordersSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
});
