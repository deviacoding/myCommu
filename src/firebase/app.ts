import { Platform } from 'react-native';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, browserLocalPersistence, getAuth, initializeAuth } from 'firebase/auth';
import { Firestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration web Firebase, lue dans .env (variables EXPO_PUBLIC_FIREBASE_*).
// Ces valeurs identifient le projet côté client ; la sécurité repose sur les règles Firestore.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = !!(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function ensureApp(): FirebaseApp {
  if (!firebaseConfigured) throw new Error('Firebase non configuré : renseignez le fichier .env (voir .env.example).');
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const a = ensureApp();
  if (Platform.OS === 'web') {
    auth = initializeAuth(a, { persistence: browserLocalPersistence });
  } else {
    // Sur téléphone, la session est conservée dans AsyncStorage.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require('firebase/auth') as { getReactNativePersistence: (s: typeof AsyncStorage) => never };
    auth = initializeAuth(a, { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return auth;
}

export function getDb(): Firestore {
  if (db) return db;
  db = initializeFirestore(ensureApp(), {
    ignoreUndefinedProperties: true,
    // Les téléphones passent mieux en long polling qu'en WebSocket derrière certains réseaux.
    experimentalAutoDetectLongPolling: Platform.OS !== 'web',
  });
  return db;
}

export { getAuth };
