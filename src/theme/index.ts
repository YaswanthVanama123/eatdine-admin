/**
 * Professional Admin Dashboard Theme
 * Clean, modern design for business applications
 */

export const theme = {
  colors: {
    // Primary Brand Colors
    primary: '#2563EB', // Blue 600
    primaryLight: '#3B82F6', // Blue 500
    primaryDark: '#1E40AF', // Blue 700
    primaryBg: '#EFF6FF', // Blue 50

    // Semantic Colors
    success: '#10B981', // Green 500
    successLight: '#D1FAE5', // Green 100
    successDark: '#047857', // Green 700

    warning: '#F59E0B', // Amber 500
    warningLight: '#FEF3C7', // Amber 100
    warningDark: '#D97706', // Amber 600

    error: '#EF4444', // Red 500
    errorLight: '#FEE2E2', // Red 100
    errorDark: '#DC2626', // Red 600

    info: '#0EA5E9', // Sky 500
    infoLight: '#E0F2FE', // Sky 100
    infoDark: '#0284C7', // Sky 600

    // Neutral Colors
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF', // White
    surfaceVariant: '#F1F5F9', // Slate 100

    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8', // Slate 400
    textDisabled: '#CBD5E1', // Slate 300

    border: '#E2E8F0', // Slate 200
    borderLight: '#F1F5F9', // Slate 100
    borderDark: '#CBD5E1', // Slate 300

    shadow: '#0F172A1A', // Slate 900 with 10% opacity
    overlay: '#0F172A80', // Slate 900 with 50% opacity

    // Status Colors (for orders, etc.)
    pending: '#F59E0B', // Amber 500
    confirmed: '#3B82F6', // Blue 500
    preparing: '#8B5CF6', // Violet 500
    ready: '#10B981', // Green 500
    completed: '#6B7280', // Gray 500
    cancelled: '#EF4444', // Red 500

    // Chart Colors
    chart1: '#3B82F6', // Blue
    chart2: '#10B981', // Green
    chart3: '#F59E0B', // Amber
    chart4: '#8B5CF6', // Violet
    chart5: '#EC4899', // Pink
    chart6: '#06B6D4', // Cyan
  },

  typography: {
    // Font Families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },

    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Font Weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.12,
      shadowRadius: 25,
      elevation: 8,
    },
  },

  // Icon Sizes
  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
  },
} as const;

export type Theme = typeof theme;
