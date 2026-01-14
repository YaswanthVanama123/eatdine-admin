import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Icon } from '../components/Icon';
import { Order, OrderFilters as OrderFiltersType, OrderStatus, Table } from '../types';
import { ordersApi } from '../api/orders.api';
import { tablesApi } from '../api/tables.api';
import { formatCurrency, formatDate, getRelativeTime, ORDER_STATUS_CONFIG } from '../utils';
import OrderFilters from '../components/orders/OrderFilters';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import { theme } from '../theme';

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState<OrderFiltersType>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const response = await ordersApi.getAll(filters);
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchTables = async () => {
    try {
      const tablesData = await tablesApi.getAll();
      setTables(tablesData);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
  }, [filters.page, filters.limit, filters.status, filters.tableId, filters.startDate, filters.endDate]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters({
      ...newFilters,
      page: 1,
      limit: filters.limit,
    });
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, status);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      // Update selected order if it's open
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      // Refresh if the order should be removed from the list
      if (status === 'served' || status === 'cancelled') {
        handleCloseModal();
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handlePrintReceipt = async (order: Order) => {
    try {
      const html = generateReceiptHTML(order);

      // Try to print directly first
      try {
        await RNPrint.print({ html });
      } catch (printError) {
        // If direct print fails, offer to share the receipt
        console.log('Direct print failed, offering share option:', printError);

        // Generate PDF and share
        const { filePath } = await RNPrint.print({ html });
        if (filePath) {
          await Share.open({
            url: `file://${filePath}`,
            type: 'application/pdf',
          });
        }
      }
    } catch (error) {
      console.error('Failed to print receipt:', error);
      Alert.alert('Error', 'Failed to print receipt');
    }
  };

  const generateReceiptHTML = (order: Order): string => {
    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td>${item.quantity}x ${item.name}</td>
          <td style="text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>
        ${
          item.customizations
            ? item.customizations
                .map(
                  (c) => `
          <tr>
            <td colspan="2" style="font-size: 12px; color: #666; padding-left: 20px;">
              ${c.name}: ${c.options.join(', ')}
            </td>
          </tr>
        `
                )
                .join('')
            : ''
        }
        ${
          item.specialInstructions
            ? `
          <tr>
            <td colspan="2" style="font-size: 12px; color: #666; padding-left: 20px; font-style: italic;">
              Note: ${item.specialInstructions}
            </td>
          </tr>
        `
            : ''
        }
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            td { padding: 8px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; }
          </style>
        </head>
        <body>
          <h1>Order Receipt</h1>
          <div class="info">
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Table:</strong> ${order.tableNumber}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Status:</strong> ${ORDER_STATUS_CONFIG[order.status].label}</p>
          </div>
          <table>
            ${itemsHTML}
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;">${formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td style="text-align: right;">${formatCurrency(order.tax)}</td>
            </tr>
            ${
              order.tip && order.tip > 0
                ? `
              <tr>
                <td>Tip</td>
                <td style="text-align: right;">${formatCurrency(order.tip)}</td>
              </tr>
            `
                : ''
            }
            <tr class="total">
              <td>Total</td>
              <td style="text-align: right;">${formatCurrency(order.total)}</td>
            </tr>
          </table>
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </body>
      </html>
    `;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      received: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const renderRightActions = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return null;

    const config = ORDER_STATUS_CONFIG[nextStatus];

    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: config.color }]}
        onPress={() => handleStatusChange(order._id, nextStatus)}
      >
        <Icon name="check" size="md" color="white" solid />
        <Text style={styles.swipeActionText}>{config.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (order: Order) => {
    if (order.status === 'served' || order.status === 'cancelled') return null;

    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#EF4444' }]}
        onPress={() => {
          Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', onPress: () => handleStatusChange(order._id, 'cancelled') },
            ]
          );
        }}
      >
        <Icon name="xmark" size="md" color="white" solid />
        <Text style={styles.swipeActionText}>Cancel</Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'received': return '#3B82F6';
        case 'preparing': return '#F59E0B';
        case 'ready': return '#10B981';
        case 'served': return '#8B5CF6';
        case 'cancelled': return '#EF4444';
        default: return theme.colors.textTertiary;
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'received': return 'bell-concierge';
        case 'preparing': return 'fire-burner';
        case 'ready': return 'circle-check';
        case 'served': return 'circle-check';
        case 'cancelled': return 'ban';
        default: return 'circle';
      }
    };

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
      >
        <TouchableOpacity onPress={() => handleOrderClick(item)}>
          <View style={styles.orderCardContainer}>
            {/* Status Indicator Bar */}
            <View style={[styles.orderStatusBar, { backgroundColor: getStatusColor(item.status) }]} />

            <View style={styles.orderCardContent}>
              {/* Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <View style={[styles.orderIconCircle, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Icon name={getStatusIcon(item.status)} size="xl" color={getStatusColor(item.status)} solid />
                  </View>
                  <View style={styles.orderHeaderText}>
                    <Text style={styles.orderNumberText}>{item.orderNumber}</Text>
                    <View style={styles.tableRow}>
                      <Icon name="chair" size="xs" color={theme.colors.textSecondary} />
                      <Text style={styles.tableText}>Table {item.tableNumber}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusChipText}>{statusConfig.label}</Text>
                </View>
              </View>

              {/* Body */}
              <View style={styles.orderBody}>
                <View style={styles.orderInfoRow}>
                  <Icon name="utensils" size="sm" color={theme.colors.textSecondary} />
                  <Text style={styles.orderBodyText}>
                    {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <View style={styles.orderInfoRow}>
                  <Icon name="clock" size="sm" color={theme.colors.textSecondary} />
                  <Text style={styles.orderBodyText}>{getRelativeTime(item.createdAt)}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.orderFooter}>
                <View style={styles.orderTotalContainer}>
                  <Text style={styles.orderTotalLabel}>Total</Text>
                  <Text style={styles.orderTotalValue}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={styles.orderViewButton}>
                  <Text style={styles.orderViewText}>View Details</Text>
                  <Icon name="chevron-right" size="sm" color={theme.colors.primary} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="inbox" size="4xl" color={theme.colors.textTertiary} />
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubtext}>Orders will appear here when customers place them</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OrderFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        tables={tables}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      <OrderDetailsModal
        visible={isModalVisible}
        onDismiss={handleCloseModal}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onPrintReceipt={handlePrintReceipt}
      />
    </SafeAreaView>
  );
};

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
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  orderCardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  orderStatusBar: {
    height: 4,
    width: '100%',
  },
  orderCardContent: {
    padding: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIconCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  orderHeaderText: {
    flex: 1,
  },
  orderNumberText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  statusChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  orderBody: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border + '50',
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderBodyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalContainer: {
    flex: 1,
  },
  orderTotalLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderTotalValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  orderViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: 4,
  },
  orderViewText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  swipeActionText: {
    color: 'white',
    fontSize: theme.typography.fontSize.xs,
    marginTop: 6,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['5xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OrdersScreen;
