/**
 * Professional Icon Component using FontAwesome 6
 * Wrapper around react-native-vector-icons for consistent usage
 */

import React from 'react';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { theme } from '../theme';

export type IconName =
  | 'chart-line'
  | 'receipt'
  | 'utensils'
  | 'gear'
  | 'bell'
  | 'user'
  | 'right-from-bracket'
  | 'circle-check'
  | 'clock'
  | 'fire'
  | 'check'
  | 'xmark'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'search'
  | 'filter'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'ellipsis-vertical'
  | 'print'
  | 'share-nodes'
  | 'bars'
  | 'grid-2'
  | 'list'
  | 'calendar'
  | 'location-dot'
  | 'phone'
  | 'envelope'
  | 'credit-card'
  | 'money-bill'
  | 'wallet'
  | 'chart-pie'
  | 'arrow-trend-up'
  | 'arrow-trend-down'
  | 'users'
  | 'box'
  | 'tags'
  | 'star'
  | 'heart'
  | 'comment'
  | 'image'
  | 'camera'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'lock'
  | 'unlock'
  | 'eye'
  | 'eye-slash'
  | 'house'
  | 'shop'
  | 'cart-shopping'
  | 'bag-shopping'
  | 'truck'
  | 'motorcycle'
  | 'person-walking'
  | 'circle-info'
  | 'triangle-exclamation'
  | 'circle-exclamation'
  | 'circle-xmark'
  | 'circle-plus'
  | 'circle-minus'
  | 'square-check'
  | 'ban'
  | 'toggle-on'
  | 'toggle-off'
  | 'sliders'
  | 'palette'
  | 'volume-high'
  | 'volume-xmark'
  | 'mobile-screen'
  | 'tablet-screen-button'
  | 'desktop'
  | 'wifi'
  | 'signal'
  | 'battery-full'
  | 'plug';

interface IconProps {
  name: IconName;
  size?: keyof typeof theme.iconSizes | number;
  color?: string;
  solid?: boolean;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = theme.colors.text,
  solid = false,
  style,
}) => {
  const iconSize = typeof size === 'number' ? size : theme.iconSizes[size];

  return (
    <FontAwesome6
      name={name}
      size={iconSize}
      color={color}
      solid={solid}
      style={style}
    />
  );
};

// Convenience components for specific icon categories
export const StatusIcon: React.FC<Omit<IconProps, 'name'> & { status: 'success' | 'warning' | 'error' | 'info' }> = ({
  status,
  size = 'md',
  ...props
}) => {
  const iconMap = {
    success: { name: 'circle-check' as IconName, color: theme.colors.success },
    warning: { name: 'triangle-exclamation' as IconName, color: theme.colors.warning },
    error: { name: 'circle-xmark' as IconName, color: theme.colors.error },
    info: { name: 'circle-info' as IconName, color: theme.colors.info },
  };

  return <Icon name={iconMap[status].name} size={size} color={iconMap[status].color} solid {...props} />;
};

export const NavIcon: React.FC<Omit<IconProps, 'color'> & { focused: boolean }> = ({
  focused,
  size = 'md',
  ...props
}) => {
  return (
    <Icon
      {...props}
      size={size}
      color={focused ? theme.colors.primary : theme.colors.textTertiary}
      solid={focused}
    />
  );
};
