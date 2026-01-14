/**
 * Modern Professional Theme - Restaurant Admin
 * Clean, vibrant design for mobile admin experience
 */

export const theme = {
  colors: {
    // Primary Brand Colors - Vibrant Indigo/Purple Gradient
    primary: '#6366F1',        // Indigo 500
    primaryDark: '#4F46E5',    // Indigo 600
    primaryLight: '#818CF8',   // Indigo 400
    primaryLighter: '#C7D2FE', // Indigo 200
    primaryBg: '#EEF2FF',      // Indigo 50

    // Accent Colors
    accent: '#F59E0B',         // Amber 500
    accentLight: '#FCD34D',    // Amber 300
    accentBg: '#FEF3C7',       // Amber 100

    // Semantic Colors
    success: '#10B981',        // Emerald 500
    successLight: '#D1FAE5',   // Emerald 100
    successDark: '#059669',    // Emerald 600

    warning: '#F59E0B',        // Amber 500
    warningLight: '#FEF3C7',   // Amber 100
    warningDark: '#D97706',    // Amber 600

    error: '#EF4444',          // Red 500
    errorLight: '#FEE2E2',     // Red 100
    errorDark: '#DC2626',      // Red 600

    info: '#3B82F6',           // Blue 500
    infoLight: '#DBEAFE',      // Blue 100
    infoDark: '#2563EB',       // Blue 600

    // Neutral Colors - Modern Gray Scale
    background: '#F9FAFB',     // Gray 50
    surface: '#FFFFFF',        // White
    surfaceHover: '#F3F4F6',   // Gray 100
    surfaceVariant: '#F3F4F6', // Gray 100

    text: '#111827',           // Gray 900
    textSecondary: '#6B7280',  // Gray 500
    textTertiary: '#9CA3AF',   // Gray 400
    textDisabled: '#D1D5DB',   // Gray 300
    textInverse: '#FFFFFF',

    border: '#E5E7EB',         // Gray 200
    borderLight: '#F3F4F6',    // Gray 100
    borderDark: '#D1D5DB',     // Gray 300

    // Order Status Colors
    received: '#3B82F6',       // Blue
    preparing: '#F59E0B',      // Amber
    ready: '#10B981',          // Emerald
    served: '#6B7280',         // Gray
    cancelled: '#EF4444',      // Red

    // Gradient Colors
    gradientStart: '#6366F1',  // Indigo
    gradientMid: '#8B5CF6',    // Purple
    gradientEnd: '#A855F7',    // Purple 500

    // Overlay & Shadow
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    shadow: '#0F172A1A',

    // Chart Colors
    chart1: '#6366F1', // Indigo
    chart2: '#10B981', // Emerald
    chart3: '#F59E0B', // Amber
    chart4: '#8B5CF6', // Purple
    chart5: '#EC4899', // Pink
    chart6: '#06B6D4', // Cyan
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 19,
      '2xl': 22,
      '3xl': 28,
      '4xl': 34,
      '5xl': 42,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 16,
    },
  },

  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export type Theme = typeof theme;
