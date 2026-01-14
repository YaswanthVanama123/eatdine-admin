import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend
}) => {
  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>

            {trend && (
              <View style={styles.trend}>
                <Text
                  style={[
                    styles.trendValue,
                    { color: trend.isPositive ? '#10b981' : '#ef4444' }
                  ]}
                >
                  {trend.isPositive ? '+' : '-'}
                  {Math.abs(trend.value)}%
                </Text>
                <Text style={styles.trendLabel}>vs yesterday</Text>
              </View>
            )}
          </View>

          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            {icon}
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
