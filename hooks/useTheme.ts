import { createContext, useContext } from 'react';
import { Theme, lightTheme } from '../constants/theme';

export const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeContext.Provider');
  }
  return theme;
};
