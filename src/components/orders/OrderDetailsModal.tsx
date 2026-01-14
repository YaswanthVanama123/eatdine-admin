import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Divider, Chip } from 'react-native-paper';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate, getRelativeTime, ORDER_STATUS_CONFIG } from '../../utils';

interface OrderDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
  order: Order | null;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onPrintReceipt?: (order: Order) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  onDismiss,
  order,
  onStatusChange,
  onPrintReceipt,
}) => {
  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const renderStatusActions = () => {
    const actions: { status: OrderStatus; label: string }[] = [];

    if (order.status === 'received') {
      actions.push({ status: 'preparing', label: 'Start Preparing' });
      actions.push({ status: 'cancelled', label: 'Cancel' });
    } else if (order.status === 'preparing') {
      actions.push({ status: 'ready', label: 'Mark Ready' });
      actions.push({ status: 'cancelled', label: 'Cancel' });
    } else if (order.status === 'ready') {
      actions.push({ status: 'served', label: 'Mark Served' });
    }

    return actions.map((action) => (
      <Button
        key={action.status}
        mode={action.status === 'cancelled' ? 'outlined' : 'contained'}
        onPress={() => onStatusChange?.(order._id, action.status)}
        style={styles.actionButton}
      >
        {action.label}
      </Button>
    ));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <View style={styles.header}>
            <Text variant="headlineMedium">Order {order.orderNumber}</Text>
            <Chip
              style={{ backgroundColor: statusConfig.color + '20' }}
              textStyle={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Chip>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Table</Text>
              <Text variant="bodyLarge" style={styles.value}>Table {order.tableNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Order Time</Text>
              <View>
                <Text variant="bodyMedium" style={styles.value}>{formatDate(order.createdAt)}</Text>
                <Text variant="bodySmall" style={styles.relativeTime}>{getRelativeTime(order.createdAt)}</Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemLeft}>
                  <Text variant="bodyLarge" style={styles.itemName}>
                    {item.quantity}x {item.name}
                  </Text>
                  {item.customizations && item.customizations.length > 0 && (
                    <View style={styles.customizations}>
                      {item.customizations.map((customization, idx) => (
                        <Text key={idx} variant="bodySmall" style={styles.customization}>
                          {customization.name}: {customization.options.join(', ')}
                        </Text>
                      ))}
                    </View>
                  )}
                  {item.specialInstructions && (
                    <Text variant="bodySmall" style={styles.specialInstructions}>
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>
                <View style={styles.itemRight}>
                  <Text variant="bodyLarge" style={styles.itemPrice}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                  <Text variant="bodySmall" style={styles.itemPriceEach}>
                    {formatCurrency(item.price)} each
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Divider />

          <View style={styles.section}>
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Subtotal</Text>
              <Text variant="bodyMedium">{formatCurrency(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Tax</Text>
              <Text variant="bodyMedium">{formatCurrency(order.tax)}</Text>
            </View>
            {order.tip && order.tip > 0 && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium">Tip</Text>
                <Text variant="bodyMedium">{formatCurrency(order.tip)}</Text>
              </View>
            )}
            <Divider style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>Total</Text>
              <Text variant="titleLarge" style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
          </View>

          {order.notes && (
            <>
              <Divider />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text variant="bodyMedium">{order.notes}</Text>
                </View>
              </View>
            </>
          )}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <>
              <Divider />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Status History</Text>
                {order.statusHistory.map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Chip
                      compact
                      style={{ backgroundColor: ORDER_STATUS_CONFIG[history.status].color + '20' }}
                      textStyle={{ color: ORDER_STATUS_CONFIG[history.status].color }}
                    >
                      {ORDER_STATUS_CONFIG[history.status].label}
                    </Chip>
                    <Text variant="bodySmall" style={styles.historyTime}>
                      {formatDate(history.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.actionsSection}>
            {renderStatusActions()}
            {onPrintReceipt && (
              <Button
                mode="outlined"
                icon="printer"
                onPress={() => onPrintReceipt(order)}
                style={styles.actionButton}
              >
                Print Receipt
              </Button>
            )}
          </View>

          <Button mode="text" onPress={onDismiss} style={styles.closeButton}>
            Close
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '600',
  },
  relativeTime: {
    color: '#999',
    textAlign: 'right',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  customizations: {
    marginTop: 4,
  },
  customization: {
    color: '#666',
    marginBottom: 2,
  },
  specialInstructions: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontWeight: '600',
  },
  itemPriceEach: {
    color: '#999',
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalDivider: {
    marginVertical: 12,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  notesContainer: {
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeb3b',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyTime: {
    color: '#666',
  },
  actionsSection: {
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 8,
  },
});

export default OrderDetailsModal;
