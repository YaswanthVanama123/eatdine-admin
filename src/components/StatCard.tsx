/**
 * Professional StatCard Component for Dashboard Metrics
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Icon, IconName } from './Icon';
import { theme } from '../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = theme.colors.primary,
  iconBgColor = theme.colors.primaryBg,
  trend,
  subtitle,
  onPress,
  style,
}) => {
  return (
    <Card onPress={onPress} variant="elevated" style={[styles.card, style]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Icon name={icon} size="md" color={iconColor} solid />
          </View>
          {trend && (
            <View style={styles.trend}>
              <Icon
                name={trend.isPositive ? 'arrow-trend-up' : 'arrow-trend-down'}
                size={12}
                color={trend.isPositive ? theme.colors.success : theme.colors.error}
                solid
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend.isPositive ? theme.colors.success : theme.colors.error },
                ]}
              >
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
  },
  container: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  value: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
});
