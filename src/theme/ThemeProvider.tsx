import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { CommunityId } from '../types';
import { themes, CommunityTheme, defaultCommunity } from './themes';

interface ThemeContextValue {
  community: CommunityId;
  setCommunity: (id: CommunityId) => void;
  theme: CommunityTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, initial = defaultCommunity }: { children: ReactNode; initial?: CommunityId }) {
  const [community, setCommunity] = useState<CommunityId>(initial);
  const value = useMemo<ThemeContextValue>(
    () => ({ community, setCommunity, theme: themes[community] }),
    [community]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
