/**
 * Professional Badge Component for Status Indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';
import { Icon, IconName } from './Icon';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  icon,
  size = 'md',
  style,
}) => {
  const { backgroundColor, textColor } = getBadgeColors(variant);
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const fontSize = size === 'sm' ? theme.typography.fontSize.xs : size === 'lg' ? theme.typography.fontSize.base : theme.typography.fontSize.sm;

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor },
        style,
      ]}
    >
      {icon && (
        <Icon name={icon} size={iconSize} color={textColor} style={styles.icon} solid />
      )}
      <Text style={[styles.text, { color: textColor, fontSize }]}>{label}</Text>
    </View>
  );
};

const getBadgeColors = (variant: BadgeVariant) => {
  const colorMap: Record<BadgeVariant, { backgroundColor: string; textColor: string }> = {
    default: {
      backgroundColor: theme.colors.surfaceVariant,
      textColor: theme.colors.text,
    },
    success: {
      backgroundColor: theme.colors.successLight,
      textColor: theme.colors.successDark,
    },
    warning: {
      backgroundColor: theme.colors.warningLight,
      textColor: theme.colors.warningDark,
    },
    error: {
      backgroundColor: theme.colors.errorLight,
      textColor: theme.colors.errorDark,
    },
    info: {
      backgroundColor: theme.colors.infoLight,
      textColor: theme.colors.infoDark,
    },
    pending: {
      backgroundColor: theme.colors.warningLight,
      textColor: theme.colors.warningDark,
    },
    confirmed: {
      backgroundColor: '#DBEAFE',
      textColor: '#1E40AF',
    },
    preparing: {
      backgroundColor: '#EDE9FE',
      textColor: '#6B21A8',
    },
    ready: {
      backgroundColor: theme.colors.successLight,
      textColor: theme.colors.successDark,
    },
    completed: {
      backgroundColor: '#F3F4F6',
      textColor: '#374151',
    },
    cancelled: {
      backgroundColor: theme.colors.errorLight,
      textColor: theme.colors.errorDark,
    },
  };

  return colorMap[variant];
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
  },
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  icon: {
    marginRight: 4,
  },
});
