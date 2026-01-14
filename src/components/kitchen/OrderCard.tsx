import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, getOrderAge } from '../../utils';
import { useOrderTimer } from '../../hooks/useOrderTimer';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, onPress }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const { formattedTime, isUrgent, isCritical, elapsedMinutes } = useOrderTimer({
    orderId: order._id,
    createdAt: order.createdAt,
    preparationStartedAt: order.preparationStartedAt,
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'received':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: OrderStatus): string => {
    switch (currentStatus) {
      case 'received':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark Ready';
      case 'ready':
        return 'Mark Served';
      default:
        return '';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return '#3B82F6'; // blue
      case 'preparing':
        return '#F59E0B'; // amber
      case 'ready':
        return '#10B981'; // green
      default:
        return '#6B7280'; // gray
    }
  };

  const handleStatusChange = async () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order._id, nextStatus);
      // Announce to screen readers
      AccessibilityInfo.announceForAccessibility(
        `Order ${order.orderNumber} moved to ${nextStatus}`
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const nextStatus = getNextStatus(order.status);
  const borderColor = isCritical ? '#EF4444' : isUrgent ? '#F97316' : '#E5E7EB';

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Order ${order.orderNumber}, Table ${order.tableNumber}, ${order.items.length} items, ${elapsedMinutes} minutes old`}
      accessibilityHint="Double tap to view order details"
      accessibilityRole="button"
    >
      {/* Priority Indicator */}
      {(isUrgent || isCritical) && (
        <View style={[styles.priorityBar, { backgroundColor: isCritical ? '#EF4444' : '#F97316' }]} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.orderBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.orderLabel}>Order</Text>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          </View>

          <View style={styles.tableBadge}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#4B5563" />
            <Text style={styles.tableText}>Table {order.tableNumber}</Text>
          </View>

          {/* Timer Badge */}
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: isCritical ? '#FEE2E2' : isUrgent ? '#FED7AA' : '#F3F4F6',
              },
            ]}
            accessible={true}
            accessibilityLabel={`Order age: ${elapsedMinutes} minutes`}
          >
            <MaterialCommunityIcons
              name={isCritical ? 'alert' : isUrgent ? 'fire' : 'clock-outline'}
              size={14}
              color={isCritical ? '#DC2626' : isUrgent ? '#EA580C' : '#6B7280'}
            />
            <Text
              style={[
                styles.timerText,
                {
                  color: isCritical ? '#DC2626' : isUrgent ? '#EA580C' : '#6B7280',
                },
              ]}
            >
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow} accessible={true} accessibilityLabel={`${item.quantity} ${item.name}`}>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{item.quantity}x</Text>
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>

              {/* Customizations */}
              {item.customizations && item.customizations.length > 0 && (
                <View style={styles.customizationsContainer}>
                  {item.customizations.map((customization, idx) => (
                    <View key={idx} style={styles.customization}>
                      <Text style={styles.customizationName}>{customization.name}:</Text>
                      <Text style={styles.customizationOptions}>
                        {customization.options.join(', ')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Special Instructions */}
              {item.specialInstructions && (
                <View style={styles.specialInstructions} accessible={true} accessibilityLabel={`Special instructions: ${item.specialInstructions}`}>
                  <MaterialCommunityIcons name="alert-circle" size={14} color="#F59E0B" />
                  <Text style={styles.specialInstructionsText}>{item.specialInstructions}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalAmount} accessible={true} accessibilityLabel={`Total: ${formatCurrency(order.total)}`}>
          {formatCurrency(order.total)}
        </Text>

        {nextStatus && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getStatusColor(order.status) }]}
            onPress={handleStatusChange}
            disabled={isUpdating}
            accessible={true}
            accessibilityLabel={getNextStatusLabel(order.status)}
            accessibilityRole="button"
            accessibilityState={{ disabled: isUpdating }}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.actionButtonText}>{getNextStatusLabel(order.status)}</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Order Notes */}
      {order.notes && (
        <View style={styles.notesContainer} accessible={true} accessibilityLabel={`Order notes: ${order.notes}`}>
          <MaterialCommunityIcons name="note-text" size={16} color="#D97706" />
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityBar: {
    height: 4,
    width: '100%',
  },
  header: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    padding: 12,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  quantityBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  customizationsContainer: {
    gap: 4,
    marginTop: 4,
  },
  customization: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  customizationName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  customizationOptions: {
    fontSize: 11,
    color: '#6B7280',
  },
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    marginTop: 6,
  },
  specialInstructionsText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
});
