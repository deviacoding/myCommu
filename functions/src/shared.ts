// Initialisation commune : Admin SDK, options globales, petits utilitaires Firestore.
// Ce module doit être importé en premier par chaque fichier de fonctions
// (setGlobalOptions doit s'exécuter avant la déclaration des fonctions).
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';

// Région : au plus près de Firestore (eur3) et des utilisateurs.
export const REGION = 'europe-west1';
setGlobalOptions({ region: REGION, maxInstances: 10 });

if (getApps().length === 0) initializeApp();

export const db: Firestore = getFirestore();
export const messaging = getMessaging();
export { FieldValue };

export type Role = 'member' | 'leader' | 'deputy' | 'treasurer' | 'organizer';
export const FINANCE_ROLES: Role[] = ['leader', 'deputy', 'treasurer'];

// Même convention que l'application : les dates sont des chaînes ISO « AAAA-MM-JJ ».
export function todayISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

// Rôle de l'utilisateur dans une communauté (document memberships/{congregationId}_{uid}).
export async function roleOf(uid: string, congregationId: string): Promise<Role | null> {
  const snap = await db.doc(`memberships/${congregationId}_${uid}`).get();
  if (!snap.exists) return null;
  return (snap.data()?.role as Role) ?? null;
}

export async function requireRole(uid: string, congregationId: string, roles: Role[] | 'any'): Promise<Role> {
  const role = await roleOf(uid, congregationId);
  if (!role) throw new HttpsError('permission-denied', "Vous n'êtes pas membre de cette communauté.");
  if (roles !== 'any' && !roles.includes(role)) throw new HttpsError('permission-denied', 'Réservé au responsable, à son adjoint ou au trésorier.');
  return role;
}

export interface CongregationLite {
  id: string;
  name: string;
  religion?: string;
  country?: string;
  leaderUid?: string;
}

export async function getCongregation(congregationId: string): Promise<CongregationLite> {
  const snap = await db.doc(`congregations/${congregationId}`).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Communauté introuvable.');
  const d = snap.data() ?? {};
  return { id: congregationId, name: d.name ?? 'Votre communauté', religion: d.religion, country: d.country, leaderUid: d.leaderUid };
}

// Devise : shekel pour la confession juive, euro sinon (montants entiers dans la devise).
export function currencyOf(religion?: string): { symbol: string; code: 'ils' | 'eur' } {
  return religion === 'jewish' ? { symbol: '₪', code: 'ils' } : { symbol: '€', code: 'eur' };
}

export function formatAmount(amount: number, symbol: string): string {
  return `${amount} ${symbol}`;
}

// Sujet FCM d'une communauté : tous ses membres y sont abonnés.
export function topicOf(congregationId: string): string {
  return `cong_${congregationId}`;
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new HttpsError('invalid-argument', `Champ « ${field} » manquant.`);
  return value.trim();
}
