
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { themes, Theme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setThemeName: (name: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('Default');

  useEffect(() => {
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      const root = window.document.documentElement;
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [themeName]);

  const value = useMemo(() => ({
    theme: themes[themeName],
    setThemeName,
    availableThemes: themes,
  }), [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
