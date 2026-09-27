import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { CommunityId, UserProfile } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { defaultUser } from '../mocks/user';

interface SignupInput {
  name: string;
  email: string;
  community: CommunityId;
}

interface AuthValue {
  isAuthenticated: boolean;
  user: UserProfile;
  signInWithGoogle: () => void;
  signInWithEmail: (email: string) => void;
  signUp: (input: SignupInput) => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setCommunity } = useTheme();
  const [isAuthenticated, setAuth] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const signInWithGoogle = useCallback(() => {
    setUser(defaultUser);
    setCommunity(defaultUser.community);
    setAuth(true);
  }, [setCommunity]);

  const signInWithEmail = useCallback(
    (email: string) => {
      setUser({ ...defaultUser, email: email.trim() || defaultUser.email });
      setCommunity(defaultUser.community);
      setAuth(true);
    },
    [setCommunity]
  );

  const signUp = useCallback(
    ({ name, email, community }: SignupInput) => {
      setUser({
        ...defaultUser,
        name: name.trim() || defaultUser.name,
        email: email.trim() || defaultUser.email,
        community,
        hebrewName: undefined,
        memberSince: new Date().toISOString().slice(0, 10),
      });
      setCommunity(community);
      setAuth(true);
    },
    [setCommunity]
  );

  const signOut = useCallback(() => setAuth(false), []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((u) => ({ ...u, ...patch }));
      if (patch.community) setCommunity(patch.community);
    },
    [setCommunity]
  );

  const value = useMemo(
    () => ({ isAuthenticated, user, signInWithGoogle, signInWithEmail, signUp, signOut, updateUser }),
    [isAuthenticated, user, signInWithGoogle, signInWithEmail, signUp, signOut, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
