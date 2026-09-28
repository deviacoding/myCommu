import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { CommunityId, UserProfile } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { getSeed } from '../seeds';

export type AccessMode = 'none' | 'member' | 'rav';
export type DemoRole = 'member' | 'rav';

interface AuthValue {
  mode: AccessMode;
  isAuthenticated: boolean;
  user: UserProfile;
  onboarded: boolean; // le fidèle a rejoint au moins une communauté
  enterDemo: (community: CommunityId, role: DemoRole) => void;
  switchRole: (role: DemoRole) => void;
  finishOnboarding: () => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setCommunity, community } = useTheme();
  const [mode, setMode] = useState<AccessMode>('none');
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<UserProfile>(getSeed(community).user);

  const enterDemo = useCallback(
    (id: CommunityId, role: DemoRole) => {
      setUser(getSeed(id).user);
      setCommunity(id);
      // Un fidèle qui arrive commence par rejoindre une communauté ; le responsable a déjà la sienne.
      setOnboarded(role === 'rav');
      setMode(role);
    },
    [setCommunity]
  );

  const switchRole = useCallback((role: DemoRole) => {
    setOnboarded(true);
    setMode(role);
  }, []);

  const finishOnboarding = useCallback(() => setOnboarded(true), []);
  const signOut = useCallback(() => {
    setMode('none');
    setOnboarded(false);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((u) => ({ ...u, ...patch }));
      if (patch.community) setCommunity(patch.community);
    },
    [setCommunity]
  );

  const value = useMemo(
    () => ({ mode, isAuthenticated: mode !== 'none', user, onboarded, enterDemo, switchRole, finishOnboarding, signOut, updateUser }),
    [mode, user, onboarded, enterDemo, switchRole, finishOnboarding, signOut, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
