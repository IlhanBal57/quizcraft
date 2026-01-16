import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';

type ThemeType = 'dark' | 'midnight' | 'ocean' | 'sunset' | 'cyberpunk';

interface ThemeColors {
  background: string;
  backgroundLight: string;
  backgroundCard: string;
  primary: string;
  primaryLight: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  surface: string;
}

const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    background: '#0f0f23',
    backgroundLight: '#1a1a2e',
    backgroundCard: '#16213e',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    accent: '#8b5cf6',
    text: '#ffffff',
    textSecondary: '#a0a0b2',
    border: '#2d2d5a',
    surface: '#1e1e3f',
  },
  midnight: {
    background: '#0a1628',
    backgroundLight: '#132238',
    backgroundCard: '#1a2f4a',
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    accent: '#c084fc',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    border: '#1e3a5f',
    surface: '#1e3a5f',
  },
  ocean: {
    background: '#0c1929',
    backgroundLight: '#142638',
    backgroundCard: '#1a3448',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    accent: '#14b8a6',
    text: '#ffffff',
    textSecondary: '#7dd3fc',
    border: '#164e63',
    surface: '#164e63',
  },
  sunset: {
    background: '#1a0a14',
    backgroundLight: '#2d1420',
    backgroundCard: '#3d1a2a',
    primary: '#f97316',
    primaryLight: '#fb923c',
    accent: '#ec4899',
    text: '#ffffff',
    textSecondary: '#fda4af',
    border: '#4c1d3a',
    surface: '#4c1d3a',
  },
  cyberpunk: {
    background: '#0a0a0f',
    backgroundLight: '#12121a',
    backgroundCard: '#1a1a24',
    primary: '#00ff88',
    primaryLight: '#33ffaa',
    accent: '#ff00ff',
    text: '#ffffff',
    textSecondary: '#00ff88',
    border: '#2a2a3a',
    surface: '#1e1e2a',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  themeColors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && savedTheme in themes) {
        setThemeState(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeColors: themes[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { themes, ThemeType };
