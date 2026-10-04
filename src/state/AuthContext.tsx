import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { Platform } from 'react-native';
import { CommunityId, Membership, MembershipRole, StaffMember, UserProfile } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { getSeed } from '../seeds';
import { firebaseConfigured, getDb, getFirebaseAuth } from '../firebase/app';
import { StaffRole } from '../config/roles';
import { todayISO } from '../utils/time';

// Deux façons d'entrer dans l'application :
// - la démo (données fictives en mémoire, aucun compte) ;
// - un vrai compte Firebase (e-mail/mot de passe ou Google), avec ses communautés et ses rôles en base.
// « setup » : première connexion, l'utilisateur choisit sa confession avant d'entrer.
export type AccessMode = 'none' | 'setup' | 'member' | 'rav' | 'treasurer' | 'organizer';
export type DemoRole = 'member' | 'rav' | 'treasurer';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  religion: CommunityId;
  intent: 'member' | 'leader';
}

interface AuthValue {
  mode: AccessMode;
  isDemo: boolean;
  isAuthenticated: boolean;
  authReady: boolean; // Firebase a répondu (session existante ou non) et le profil est chargé
  firebaseAvailable: boolean;
  uid: string | null;
  user: UserProfile;
  memberships: Membership[];
  staffRoleFor: (congregationId: string) => StaffRole | null;
  onboarded: boolean; // le fidèle a rejoint au moins une communauté
  enterDemo: (community: CommunityId, role: DemoRole) => void;
  switchRole: (role: DemoRole | 'organizer') => void;
  finishOnboarding: () => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  claimStaffCode: (code: string) => Promise<{ congregationId: string; role: StaffRole }>;
  completeSetup: (choice: { community: CommunityId; intent: 'member' | 'leader' }) => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

const modeOfRole = (role: MembershipRole): AccessMode => (role === 'leader' || role === 'deputy' ? 'rav' : role === 'treasurer' ? 'treasurer' : role === 'organizer' ? 'organizer' : 'member');

// Messages d'erreur Firebase en français.
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet e-mail. Connectez-vous.';
    case 'auth/weak-password':
      return 'Mot de passe trop court : 8 caractères minimum.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Connexion Google annulée.';
    case 'auth/network-request-failed':
      return 'Pas de connexion internet.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Ce mode de connexion n’est pas encore activé dans Firebase (console → Authentication).';
    default:
      return (e as Error)?.message ?? 'Une erreur est survenue.';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setCommunity, community } = useTheme();
  // ---- Démo
  const [demoMode, setDemoMode] = useState<AccessMode>('none');
  const [demoOnboarded, setDemoOnboarded] = useState(false);
  const [demoUser, setDemoUser] = useState<UserProfile>(getSeed(community).user);
  // ---- Compte réel
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [fbReady, setFbReady] = useState(!firebaseConfigured);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsReady, setMembershipsReady] = useState(false);
  const [realMode, setRealMode] = useState<AccessMode | null>(null);
  const [onboardedOverride, setOnboardedOverride] = useState(false);
  const pendingSignup = useRef<Partial<UserProfile> | null>(null);

  // Session Firebase
  useEffect(() => {
    if (!firebaseConfigured) return;
    try {
      return onAuthStateChanged(getFirebaseAuth(), (u) => {
        setFbUser(u);
        setFbReady(true);
        if (!u) {
          setProfile(null);
          setMemberships([]);
          setMembershipsReady(false);
          setRealMode(null);
          setOnboardedOverride(false);
        }
      });
    } catch (e) {
      console.warn('[auth]', (e as Error).message);
      setFbReady(true);
    }
  }, []);

  // Profil users/{uid} : créé à la première connexion (Google) s'il n'existe pas.
  useEffect(() => {
    if (!fbUser) return;
    const ref = doc(getDb(), 'users', fbUser.uid);
    let cancelled = false;
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const d = snap.data() as Partial<UserProfile>;
          setProfile({
            id: fbUser.uid,
            name: d.name ?? fbUser.displayName ?? 'Utilisateur',
            email: d.email ?? fbUser.email ?? '',
            community: d.community ?? 'jewish',
            memberSince: d.memberSince ?? todayISO(),
            ...d,
          } as UserProfile);
        } else {
          const extra = pendingSignup.current;
          pendingSignup.current = null;
          const fresh: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName ?? extra?.name ?? 'Utilisateur',
            email: fbUser.email ?? extra?.email ?? '',
            community: extra?.community ?? community,
            intent: extra?.intent ?? 'member',
            // Sans inscription par formulaire (Google), la confession reste à choisir à l'écran suivant.
            needsSetup: !extra,
            memberSince: todayISO(),
          };
          await setDoc(ref, { ...fresh, createdAt: new Date().toISOString() }).catch((e) => console.warn('[auth] profil', e.message));
        }
      },
      (e) => console.warn('[auth] profil', e.message)
    );
    return () => {
      cancelled = true;
      unsub();
    };
  }, [fbUser, community]);

  // Communautés et rôles de l'utilisateur
  useEffect(() => {
    if (!fbUser) return;
    const q = query(collection(getDb(), 'memberships'), where('uid', '==', fbUser.uid));
    return onSnapshot(
      q,
      (snap) => {
        // Une adhésion en cours d'écriture n'ouvre rien tant que le serveur ne l'a pas confirmée.
        if (snap.metadata.hasPendingWrites) return;
        setMemberships(snap.docs.map((d) => ({ ...(d.data() as Membership), id: d.id })));
        setMembershipsReady(true);
      },
      (e) => {
        console.warn('[auth] memberships', e.message);
        setMembershipsReady(true);
      }
    );
  }, [fbUser]);

  // Thème et espace d'entrée dès que le profil et les rôles sont connus.
  useEffect(() => {
    if (!fbUser || !profile || !membershipsReady) return;
    if (profile.needsSetup && memberships.length === 0) {
      if (realMode !== 'setup') setRealMode('setup');
      return;
    }
    setCommunity(profile.community);
    if (realMode && realMode !== 'setup') return;
    const staff = memberships.find((m) => m.role !== 'member');
    setRealMode(staff ? modeOfRole(staff.role) : profile.intent === 'leader' ? 'rav' : 'member');
  }, [fbUser, profile, memberships, membershipsReady, realMode, setCommunity]);

  const enterDemo = useCallback(
    (id: CommunityId, role: DemoRole) => {
      setDemoUser(getSeed(id).user);
      setCommunity(id);
      // Un fidèle qui arrive commence par rejoindre une communauté ; le responsable a déjà la sienne.
      setDemoOnboarded(role !== 'member');
      setDemoMode(role);
    },
    [setCommunity]
  );

  const isReal = !!fbUser;

  const switchRole = useCallback(
    (role: DemoRole | 'organizer') => {
      if (isReal) setRealMode(role);
      else {
        setDemoOnboarded(true);
        setDemoMode(role);
      }
    },
    [isReal]
  );

  const finishOnboarding = useCallback(() => {
    if (isReal) setOnboardedOverride(true);
    else setDemoOnboarded(true);
  }, [isReal]);

  const signOut = useCallback(() => {
    if (isReal) {
      firebaseSignOut(getFirebaseAuth()).catch((e) => console.warn('[auth] signOut', e.message));
      return;
    }
    setDemoMode('none');
    setDemoOnboarded(false);
  }, [isReal]);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      if (isReal && fbUser) {
        setProfile((p) => (p ? { ...p, ...patch } : p));
        setDoc(doc(getDb(), 'users', fbUser.uid), patch, { merge: true }).catch((e) => console.warn('[auth] updateUser', e.message));
      } else {
        setDemoUser((u) => ({ ...u, ...patch }));
      }
      if (patch.community) setCommunity(patch.community);
    },
    [isReal, fbUser, setCommunity]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }, []);

  const signUp = useCallback(async ({ name, email, password, religion, intent }: SignUpInput) => {
    pendingSignup.current = { name: name.trim(), email: email.trim(), community: religion, intent };
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() }).catch(() => undefined);
    // Le profil est écrit tout de suite pour ne pas dépendre de l'ordre des événements.
    await setDoc(doc(getDb(), 'users', cred.user.uid), { id: cred.user.uid, name: name.trim(), email: email.trim(), community: religion, intent, memberSince: todayISO(), createdAt: new Date().toISOString() }, { merge: true });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS !== 'web') throw new Error('La connexion Google sur téléphone arrive avec la version mobile. Utilisez l’e-mail.');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getFirebaseAuth(), provider);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  }, []);

  // Un code d'accès (RB-1234, TR-1234, OR-1234) donné par le responsable ouvre l'espace correspondant.
  const claimStaffCode = useCallback(
    async (raw: string) => {
      if (!fbUser) throw new Error('Connectez-vous d’abord.');
      const code = raw.trim().toUpperCase().replace(/\s+/g, '').replace(/^([A-Z]{2})-?(\d{4})$/, '$1-$2');
      const snap = await getDoc(doc(getDb(), 'staffInvites', code));
      if (!snap.exists()) throw new Error('Code inconnu. Vérifiez-le auprès de votre responsable.');
      const invite = snap.data() as StaffMember & { congregationId: string };
      if (invite.status === 'active' && invite.claimedBy !== fbUser.uid) throw new Error('Ce code a déjà été utilisé.');
      const role = invite.role as StaffRole;
      const b = writeBatch(getDb());
      const name = profile?.name ?? fbUser.displayName ?? invite.name;
      b.set(doc(getDb(), 'memberships', `${invite.congregationId}_${fbUser.uid}`), { uid: fbUser.uid, congregationId: invite.congregationId, role, name, joinedAt: todayISO(), joinedVia: 'staff', inviteCode: code });
      b.update(doc(getDb(), 'staffInvites', code), { status: 'active', claimedBy: fbUser.uid });
      await b.commit();
      setRealMode(modeOfRole(role));
      return { congregationId: invite.congregationId, role };
    },
    [fbUser, profile]
  );

  // Première connexion : la confession et le rôle choisis ouvrent l'espace correspondant.
  const completeSetup = useCallback(
    ({ community: chosen, intent }: { community: CommunityId; intent: 'member' | 'leader' }) => {
      updateUser({ community: chosen, intent, needsSetup: false });
      setRealMode(intent === 'leader' ? 'rav' : 'member');
    },
    [updateUser]
  );

  const staffRoleFor = useCallback(
    (congregationId: string): StaffRole | null => {
      if (!isReal) return demoMode === 'treasurer' ? 'treasurer' : demoMode === 'rav' ? 'leader' : null;
      const m = memberships.find((x) => x.congregationId === congregationId && x.role !== 'member');
      return (m?.role as StaffRole) ?? null;
    },
    [isReal, demoMode, memberships]
  );

  const mode: AccessMode = isReal ? (realMode ?? 'none') : demoMode;
  const authReady = fbReady && (!fbUser || (!!profile && membershipsReady && !!realMode));
  const user = isReal && profile ? profile : demoUser;
  const onboarded = isReal ? onboardedOverride || memberships.length > 0 : demoOnboarded;

  const value = useMemo<AuthValue>(
    () => ({
      mode,
      isDemo: !isReal && demoMode !== 'none',
      isAuthenticated: mode !== 'none',
      authReady,
      firebaseAvailable: firebaseConfigured,
      uid: fbUser?.uid ?? null,
      user,
      memberships,
      staffRoleFor,
      onboarded,
      enterDemo,
      switchRole,
      finishOnboarding,
      signOut,
      updateUser,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      claimStaffCode,
      completeSetup,
    }),
    [mode, isReal, demoMode, authReady, fbUser, user, memberships, staffRoleFor, onboarded, enterDemo, switchRole, finishOnboarding, signOut, updateUser, signIn, signUp, signInWithGoogle, resetPassword, claimStaffCode, completeSetup]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
