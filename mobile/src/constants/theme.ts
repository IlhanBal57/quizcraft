export const colors = {
  // Primary Colors
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Accent Colors
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
  
  // Background Colors
  background: '#0f0f23',
  backgroundLight: '#1a1a2e',
  backgroundCard: '#16213e',
  
  // Surface Colors
  surface: '#1e1e3f',
  surfaceLight: '#252550',
  
  // Text Colors
  text: '#ffffff',
  textSecondary: '#a0a0b2',
  textMuted: '#6b7280',
  
  // Status Colors
  success: '#10b981',
  successLight: '#34d399',
  error: '#ef4444',
  errorLight: '#f87171',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Difficulty Colors
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  
  // Border Colors
  border: '#2d2d5a',
  borderLight: '#3d3d7a',
  
  // Gradient Colors
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  
  // Medal Colors
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};

export default theme;
