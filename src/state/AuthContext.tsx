import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { CommunityId, UserProfile } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { defaultUser } from '../mocks/user';

export type AccessMode = 'none' | 'member' | 'rav';
export type DemoRole = 'member' | 'rav';

interface AuthValue {
  mode: AccessMode;
  isAuthenticated: boolean;
  user: UserProfile;
  enterDemo: (community: CommunityId, role: DemoRole) => void;
  switchRole: (role: DemoRole) => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setCommunity } = useTheme();
  const [mode, setMode] = useState<AccessMode>('none');
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const enterDemo = useCallback(
    (community: CommunityId, role: DemoRole) => {
      setUser({ ...defaultUser, community });
      setCommunity(community);
      setMode(role);
    },
    [setCommunity]
  );

  const switchRole = useCallback((role: DemoRole) => setMode(role), []);
  const signOut = useCallback(() => setMode('none'), []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((u) => ({ ...u, ...patch }));
      if (patch.community) setCommunity(patch.community);
    },
    [setCommunity]
  );

  const value = useMemo(
    () => ({ mode, isAuthenticated: mode !== 'none', user, enterDemo, switchRole, signOut, updateUser }),
    [mode, user, enterDemo, switchRole, signOut, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
