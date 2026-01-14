import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  ActivityIndicator,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order, OrderFilters as OrderFiltersType, OrderStatus, Table } from '../types';
import { ordersApi } from '../api/orders.api';
import { tablesApi } from '../api/tables.api';
import { formatCurrency, formatDate, getRelativeTime, ORDER_STATUS_CONFIG } from '../utils';
import OrderFilters from '../components/orders/OrderFilters';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';

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
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

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
      setSnackbar({ visible: true, message: 'Failed to load orders' });
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

      setSnackbar({ visible: true, message: 'Order status updated successfully' });

      // Refresh if the order should be removed from the list
      if (status === 'served' || status === 'cancelled') {
        handleCloseModal();
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      setSnackbar({ visible: true, message: 'Failed to update order status' });
    }
  };

  const handlePrintReceipt = async (order: Order) => {
    try {
      const html = generateReceiptHTML(order);

      // Try to print directly first
      try {
        await RNPrint.print({ html });
        setSnackbar({ visible: true, message: 'Receipt sent to printer' });
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
          setSnackbar({ visible: true, message: 'Receipt shared successfully' });
        }
      }
    } catch (error) {
      console.error('Failed to print receipt:', error);
      setSnackbar({ visible: true, message: 'Failed to print receipt' });
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
        <MaterialCommunityIcons name="check" size={24} color="white" />
        <Text style={styles.swipeActionText}>{config.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (order: Order) => {
    if (order.status === 'served' || order.status === 'cancelled') return null;

    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#ef4444' }]}
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
        <MaterialCommunityIcons name="close" size={24} color="white" />
        <Text style={styles.swipeActionText}>Cancel</Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status];

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
      >
        <TouchableOpacity onPress={() => handleOrderClick(item)}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View>
                  <Text variant="titleMedium" style={styles.orderNumber}>
                    {item.orderNumber}
                  </Text>
                  <Text variant="bodyMedium" style={styles.tableNumber}>
                    Table {item.tableNumber}
                  </Text>
                </View>
                <Chip
                  style={{ backgroundColor: statusConfig.color + '20' }}
                  textStyle={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Chip>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="food" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                  <Text variant="bodySmall" style={styles.infoText}>
                    {getRelativeTime(item.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text variant="titleMedium" style={styles.total}>
                  {formatCurrency(item.total)}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="receipt-text-outline" size={64} color="#ccc" />
      <Text variant="titleMedium" style={styles.emptyText}>
        No orders found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        Orders will appear here when customers place them
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <OrderFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        tables={tables}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
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

      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  tableNumber: {
    color: '#666',
    marginTop: 4,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  total: {
    fontWeight: 'bold',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
});

export default OrdersScreen;
