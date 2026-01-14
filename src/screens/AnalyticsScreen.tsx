/**
 * Analytics Screen
 * Display sales analytics, reports, and insights
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
import { dashboardApi } from '../api/dashboard';
import { formatCurrency } from '../utils/format';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const { stats: statsData } = await dashboardApi.getPageData();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Track your business performance</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name="chart-line" size="2xl" color={theme.colors.primary} solid />
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('today')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.periodButtonTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueCardContent}>
              <View style={styles.revenueIconContainer}>
                <Icon name="dollar-sign" size="2xl" color="#10B981" solid />
              </View>
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>{formatCurrency(stats?.todayRevenue || 0)}</Text>
                <View style={styles.revenueChange}>
                  <Icon name="arrow-trend-up" size="sm" color="#10B981" />
                  <Text style={[styles.revenueChangeText, { color: '#10B981' }]}>+12.5%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon="receipt"
              iconColor="#6366F1"
              iconBg="#E0E7FF"
              title="Orders"
              value={stats?.todayOrders?.toString() || '0'}
              change="+8.2%"
              isPositive
            />
            <MetricCard
              icon="users"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title="Customers"
              value="124"
              change="+5.4%"
              isPositive
            />
            <MetricCard
              icon="clock"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="Avg Time"
              value={`${stats?.averagePreparationTime || 0}m`}
              change="-2.1m"
              isPositive
            />
            <MetricCard
              icon="star"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Rating"
              value="4.8"
              change="+0.2"
              isPositive
            />
          </View>
        </View>

        {/* Order Status Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusCards}>
            <StatusCard
              label="Completed"
              count={stats?.ordersByStatus?.served || 0}
              total={stats?.todayOrders || 0}
              color="#10B981"
              icon="circle-check"
            />
            <StatusCard
              label="In Progress"
              count={(stats?.ordersByStatus?.preparing || 0) + (stats?.ordersByStatus?.ready || 0)}
              total={stats?.todayOrders || 0}
              color="#F59E0B"
              icon="clock"
            />
            <StatusCard
              label="Cancelled"
              count={stats?.ordersByStatus?.cancelled || 0}
              total={stats?.todayOrders || 0}
              color="#EF4444"
              icon="xmark-circle"
            />
          </View>
        </View>

        {/* Top Performing Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Menu Items</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topItemsContainer}>
            <TopMenuItem name="Butter Chicken" orders={45} revenue={2250} rank={1} />
            <TopMenuItem name="Paneer Tikka" orders={38} revenue={1520} rank={2} />
            <TopMenuItem name="Naan Bread" orders={35} revenue={700} rank={3} />
            <TopMenuItem name="Biryani" orders={32} revenue={1920} rank={4} />
          </View>
        </View>

        {/* Sales by Hour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales by Hour</Text>
          <View style={styles.chartPlaceholder}>
            <Icon name="chart-column" size="3xl" color={theme.colors.textTertiary} />
            <Text style={styles.chartPlaceholderText}>Chart visualization coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Metric Card Component
function MetricCard({ icon, iconColor, iconBg, title, value, change, isPositive }: any) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size="lg" color={iconColor} solid />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricChange}>
        <Icon
          name={isPositive ? 'arrow-up' : 'arrow-down'}
          size="xs"
          color={isPositive ? '#10B981' : '#EF4444'}
        />
        <Text style={[styles.metricChangeText, { color: isPositive ? '#10B981' : '#EF4444' }]}>
          {change}
        </Text>
      </View>
    </View>
  );
}

// Status Card Component
function StatusCard({ label, count, total, color, icon }: any) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusCardHeader}>
        <View style={[styles.statusCardIcon, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size="md" color={color} solid />
        </View>
        <Text style={styles.statusCardLabel}>{label}</Text>
      </View>
      <Text style={styles.statusCardCount}>{count}</Text>
      <View style={styles.statusCardProgress}>
        <View style={styles.statusCardProgressBg}>
          <View
            style={[styles.statusCardProgressFill, { width: `${percentage}%`, backgroundColor: color }]}
          />
        </View>
        <Text style={styles.statusCardPercentage}>{percentage}%</Text>
      </View>
    </View>
  );
}

// Top Menu Item Component
function TopMenuItem({ name, orders, revenue, rank }: any) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#F59E0B';
      case 2: return '#94A3B8';
      case 3: return '#CD7F32';
      default: return theme.colors.textTertiary;
    }
  };

  return (
    <View style={styles.topItemCard}>
      <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) + '20' }]}>
        <Text style={[styles.rankText, { color: getRankColor(rank) }]}>#{rank}</Text>
      </View>
      <View style={styles.topItemInfo}>
        <Text style={styles.topItemName}>{name}</Text>
        <View style={styles.topItemStats}>
          <View style={styles.topItemStat}>
            <Icon name="receipt" size="xs" color={theme.colors.textSecondary} />
            <Text style={styles.topItemStatText}>{orders} orders</Text>
          </View>
          <View style={styles.topItemStat}>
            <Icon name="dollar-sign" size="xs" color={theme.colors.textSecondary} />
            <Text style={styles.topItemStatText}>{formatCurrency(revenue)}</Text>
          </View>
        </View>
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
    marginBottom: theme.spacing.lg,
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: theme.colors.textInverse,
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
    paddingBottom: theme.spacing['3xl'],
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  revenueCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  revenueCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  revenueIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  revenueChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revenueChangeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metricValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metricTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusCards: {
    gap: theme.spacing.md,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusCardIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statusCardLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  statusCardCount: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusCardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusCardProgressBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  statusCardProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  statusCardPercentage: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  topItemsContainer: {
    gap: theme.spacing.md,
  },
  topItemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    ...theme.shadows.sm,
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  rankText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  topItemStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  topItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topItemStatText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  chartPlaceholder: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing['3xl'],
    ...theme.shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
