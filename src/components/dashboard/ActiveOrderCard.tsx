import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Order, OrderStatus } from '../../types';
import { formatCurrency } from '../../utils/format';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

interface ActiveOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({
  order,
  onUpdateStatus
}) => {
  const [timeElapsed, setTimeElapsed] = useState<string>('');

  useEffect(() => {
    const updateTimeElapsed = () => {
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

      if (diffInMinutes < 1) {
        setTimeElapsed('Just now');
      } else if (diffInMinutes < 60) {
        setTimeElapsed(`${diffInMinutes}m ago`);
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        setTimeElapsed(`${hours}h ${minutes}m ago`);
      }
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 30000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const statusConfig = ORDER_STATUS_CONFIG[order.status];

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

  const nextStatus = getNextStatus(order.status);

  return (
    <Card
      style={[styles.card, { borderLeftColor: statusConfig.color, borderLeftWidth: 4 }]}
      elevation={2}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.tableNumber}>Table {order.tableNumber}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusConfig.color}20` }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusConfig.color }
              ]}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.items}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.timeElapsed}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.timeText}>{timeElapsed}</Text>
            </View>

            {nextStatus && (
              <Button
                mode="contained"
                onPress={() => onUpdateStatus(order._id, nextStatus)}
                style={[styles.button, { backgroundColor: ORDER_STATUS_CONFIG[nextStatus].color }]}
                labelStyle={styles.buttonLabel}
                compact
              >
                Mark as {ORDER_STATUS_CONFIG[nextStatus].label}
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  tableNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  items: {
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeElapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  button: {
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
