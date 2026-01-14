import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order, OrderStatus } from '../../types';
import { OrderCard } from './OrderCard';

interface KitchenColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onOrderPress?: (order: Order) => void;
}

const colorMap = {
  blue: {
    bg: '#DBEAFE',
    text: '#1E40AF',
    icon: '#3B82F6',
  },
  yellow: {
    bg: '#FEF3C7',
    text: '#92400E',
    icon: '#F59E0B',
  },
  green: {
    bg: '#D1FAE5',
    text: '#065F46',
    icon: '#10B981',
  },
};

export const KitchenColumn: React.FC<KitchenColumnProps> = ({
  title,
  status,
  orders,
  icon,
  color,
  onStatusChange,
  onOrderPress,
}) => {
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  return (
    <View style={styles.container}>
      {/* Column Header */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name={icon} size={24} color={colors.icon} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.icon }]}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onStatusChange={onStatusChange}
            onPress={() => onOrderPress?.(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {title.toLowerCase()} orders</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
