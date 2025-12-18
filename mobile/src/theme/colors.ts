/**
 * Homezy Brand Colors
 * Professional Blue palette matching the web app
 */

export const colors = {
  // Primary - Brand Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb', // Hover states
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Neutral - Grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#fafafa',
  },

  // Text colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    inverse: '#ffffff',
    muted: '#a3a3a3',
  },

  // Border colors
  border: {
    light: '#e5e5e5',
    default: '#d4d4d4',
    dark: '#a3a3a3',
  },

  // Specific UI elements
  card: {
    background: '#ffffff',
    border: '#e5e5e5',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  input: {
    background: '#ffffff',
    border: '#e5e5e5',
    focusBorder: '#3b82f6',
    placeholder: '#a3a3a3',
  },

  // Role-specific accent colors
  homeowner: {
    primary: '#3b82f6',
    light: '#eff6ff',
  },

  professional: {
    primary: '#059669', // Emerald for pro features
    light: '#ecfdf5',
  },
} as const;

export type Colors = typeof colors;
