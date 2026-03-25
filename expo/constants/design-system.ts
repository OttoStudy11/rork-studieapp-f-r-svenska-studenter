// Design System Constants
// This file defines all spacing, typography, shadows, colors, and other design tokens
// used throughout the app for consistency

// Color Palette
export const COLORS = {
  // Primary Colors
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primaryGradientStart: '#6366F1',
  primaryGradientEnd: '#8B5CF6',
  
  // Secondary Colors
  secondary: '#F59E0B',
  secondaryDark: '#D97706',
  secondaryLight: '#FBBF24',
  
  // Neutral Colors - Dark Mode
  backgroundDark: '#0F172A',
  backgroundMedium: '#1A1F36',
  backgroundLight: '#1E293B',
  surfaceDark: '#1E293B',
  surfaceMedium: '#334155',
  surfaceLight: '#475569',
  
  // Text Colors
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',
  
  // Border Colors
  border: '#334155',
  borderLight: '#475569',
  divider: '#1E293B',
  
  // Functional Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  info: '#06B6D4',
  infoLight: '#22D3EE',
  infoDark: '#0891B2',
  
  // Difficulty Colors
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
  
  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
} as const;

export const TYPOGRAPHY = {
  // Display
  displayLarge: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
    letterSpacing: -1,
  },
  displayMedium: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  
  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  
  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  // Labels
  labelLarge: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  labelMedium: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
} as const;

export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const HEADER_HEIGHTS = {
  default: 60,
  large: 100,
} as const;

export const CARD_STYLES = {
  default: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
  compact: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  elevated: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
} as const;

export const BUTTON_STYLES = {
  primary: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  secondary: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const SCREEN_PADDING = {
  horizontal: SPACING.xxl,
  vertical: SPACING.lg,
  top: HEADER_HEIGHTS.default,
} as const;

export const SECTION_SPACING = {
  betweenSections: SPACING.xxxl,
  betweenElements: SPACING.md,
  sectionTop: SPACING.lg,
  sectionBottom: SPACING.lg,
} as const;
