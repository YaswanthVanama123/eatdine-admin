import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KitchenColumn } from '../components/kitchen/KitchenColumn';
import { Order, OrderStatus } from '../types';
import { kitchenApi } from '../api/kitchen';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioNotification } from '../hooks/useAudioNotification';
import { getOrderAge } from '../utils';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const KitchenScreen: React.FC = () => {
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>(
    isTablet ? 'horizontal' : 'vertical'
  );

  const isFetching = useRef(false);
  const { playNewOrderSound, playOrderReadySound, playUrgentAlert } = useAudioNotification();

  // Fetch kitchen orders
  const fetchKitchenOrders = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      const data = await kitchenApi.getOrders();
      setReceivedOrders(data.received);
      setPreparingOrders(data.preparing);
      setReadyOrders(data.ready);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetching.current = false;
    }
  }, []);

  // WebSocket handlers
  const handleOrderCreated = useCallback(
    (order: Order) => {
      if (order.status === 'received') {
        setReceivedOrders((prev) => [order, ...prev]);
        playNewOrderSound();
        AccessibilityInfo.announceForAccessibility(
          `New order ${order.orderNumber} for table ${order.tableNumber}`
        );
      }
    },
    [playNewOrderSound]
  );

  const handleOrderUpdated = useCallback(
    (order: Order) => {
      // Update order in the appropriate list
      const updateOrders = (orders: Order[]) =>
        orders.map((o) => (o._id === order._id ? order : o));

      const removeOrder = (orders: Order[]) =>
        orders.filter((o) => o._id !== order._id);

      setReceivedOrders((prev) =>
        order.status === 'received' ? updateOrders(prev) : removeOrder(prev)
      );
      setPreparingOrders((prev) =>
        order.status === 'preparing' ? updateOrders(prev) : removeOrder(prev)
      );
      setReadyOrders((prev) =>
        order.status === 'ready' ? updateOrders(prev) : removeOrder(prev)
      );

      // Play sound for ready orders
      if (order.status === 'ready') {
        playOrderReadySound();
        AccessibilityInfo.announceForAccessibility(
          `Order ${order.orderNumber} is ready for pickup`
        );
      }

      // Move order to appropriate list if status changed
      if (order.status === 'received' && !receivedOrders.find((o) => o._id === order._id)) {
        setReceivedOrders((prev) => [order, ...prev]);
      } else if (order.status === 'preparing' && !preparingOrders.find((o) => o._id === order._id)) {
        setPreparingOrders((prev) => [order, ...prev]);
      } else if (order.status === 'ready' && !readyOrders.find((o) => o._id === order._id)) {
        setReadyOrders((prev) => [order, ...prev]);
      }
    },
    [playOrderReadySound, receivedOrders, preparingOrders, readyOrders]
  );

  const handleOrderCancelled = useCallback((order: Order) => {
    setReceivedOrders((prev) => prev.filter((o) => o._id !== order._id));
    setPreparingOrders((prev) => prev.filter((o) => o._id !== order._id));
    setReadyOrders((prev) => prev.filter((o) => o._id !== order._id));
    AccessibilityInfo.announceForAccessibility(`Order ${order.orderNumber} has been cancelled`);
  }, []);

  // WebSocket connection
  const { isConnected, joinKitchenRoom } = useWebSocket({
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderCancelled: handleOrderCancelled,
    onConnect: () => {
      console.log('WebSocket connected');
      // Join kitchen room - you may need to get restaurantId from auth context
      // joinKitchenRoom('your-restaurant-id');
    },
  });

  // Initial fetch
  useEffect(() => {
    fetchKitchenOrders();
  }, [fetchKitchenOrders]);

  // Check for urgent orders periodically
  useEffect(() => {
    const checkUrgentOrders = () => {
      const allOrders = [...receivedOrders, ...preparingOrders, ...readyOrders];
      const criticalOrders = allOrders.filter((order) => getOrderAge(order.createdAt) > 30);

      if (criticalOrders.length > 0) {
        playUrgentAlert();
      }
    };

    const interval = setInterval(checkUrgentOrders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [receivedOrders, preparingOrders, readyOrders, playUrgentAlert]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === 'preparing') {
        await kitchenApi.startPreparing(orderId);
      } else if (newStatus === 'ready') {
        await kitchenApi.markReady(orderId);
      } else if (newStatus === 'served') {
        await kitchenApi.markServed(orderId);
      }
      await fetchKitchenOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchKitchenOrders();
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  // Calculate metrics
  const totalActiveOrders = receivedOrders.length + preparingOrders.length + readyOrders.length;
  const oldestOrder = [...receivedOrders, ...preparingOrders, ...readyOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
  const oldestOrderAge = oldestOrder ? getOrderAge(oldestOrder.createdAt) : 0;
  const hasUrgentOrders = oldestOrderAge > 15;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialCommunityIcons name="chef-hat" size={64} color="#6366F1" />
        <Text style={styles.loadingText}>Loading Kitchen Display...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={28} color="#FFFFFF" />
            <View>
              <Text style={styles.headerTitle}>Kitchen Display</Text>
              <View style={styles.connectionStatus}>
                <View
                  style={[
                    styles.connectionDot,
                    { backgroundColor: isConnected ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={styles.connectionText}>
                  {isConnected ? 'Live' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            {isTablet && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleViewMode}
                accessible={true}
                accessibilityLabel="Toggle view mode"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={viewMode === 'horizontal' ? 'view-column' : 'view-sequential'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleRefresh}
              accessible={true}
              accessibilityLabel="Refresh orders"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalActiveOrders}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{receivedOrders.length}</Text>
            <Text style={styles.metricLabel}>Received</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{preparingOrders.length}</Text>
            <Text style={styles.metricLabel}>Preparing</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{readyOrders.length}</Text>
            <Text style={styles.metricLabel}>Ready</Text>
          </View>
        </View>

        {/* Urgent Alert */}
        {hasUrgentOrders && oldestOrder && (
          <View style={styles.urgentAlert}>
            <MaterialCommunityIcons name="alert" size={20} color="#DC2626" />
            <Text style={styles.urgentAlertText}>
              Order #{oldestOrder.orderNumber} waiting {oldestOrderAge}m
            </Text>
          </View>
        )}
      </View>

      {/* Kitchen Board */}
      {viewMode === 'horizontal' || !isTablet ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.columnContainer}>
            <KitchenColumn
              title="Received"
              status="received"
              orders={receivedOrders}
              icon="clock-outline"
              color="blue"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>

          <View style={styles.columnContainer}>
            <KitchenColumn
              title="Preparing"
              status="preparing"
              orders={preparingOrders}
              icon="chef-hat"
              color="yellow"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>

          <View style={styles.columnContainer}>
            <KitchenColumn
              title="Ready"
              status="ready"
              orders={readyOrders}
              icon="check-circle"
              color="green"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.horizontalContainer}>
          <View style={styles.horizontalColumn}>
            <KitchenColumn
              title="Received"
              status="received"
              orders={receivedOrders}
              icon="clock-outline"
              color="blue"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>
          <View style={styles.horizontalColumn}>
            <KitchenColumn
              title="Preparing"
              status="preparing"
              orders={preparingOrders}
              icon="chef-hat"
              color="yellow"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>
          <View style={styles.horizontalColumn}>
            <KitchenColumn
              title="Ready"
              status="ready"
              orders={readyOrders}
              icon="check-circle"
              color="green"
              onStatusChange={handleStatusChange}
              onOrderPress={handleOrderPress}
            />
          </View>
        </View>
      )}

      {/* Order Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessible={true}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalOrderNumber}>#{selectedOrder.orderNumber}</Text>
                <Text style={styles.modalTableNumber}>Table {selectedOrder.tableNumber}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.modalItem}>
                      <Text style={styles.modalItemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      {item.specialInstructions && (
                        <Text style={styles.modalItemInstructions}>
                          Note: {item.specialInstructions}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>

                {selectedOrder.notes && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Order Notes</Text>
                    <Text style={styles.modalNotes}>{selectedOrder.notes}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  urgentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  urgentAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  columnContainer: {
    marginBottom: 24,
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  horizontalColumn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  modalOrderNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  modalTableNumber: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalItemInstructions: {
    fontSize: 13,
    color: '#F59E0B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalNotes: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default KitchenScreen;
