import { Linking, Platform } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { getFunctionsClient } from '../firebase/app';

// Paiements réels via les Cloud Functions (voir docs/FUNCTIONS.md) :
// - le responsable relie le compte Stripe de sa communauté (inscription hébergée par Stripe) ;
// - le fidèle paie son don sur une page Stripe Checkout créée sur le compte de la communauté.

export type StripeLinkResult = { url: string; accountId: string; status: 'pending' | 'active' };

export async function startStripeConnect(congregationId: string, associationId?: string): Promise<StripeLinkResult> {
  const fn = httpsCallable<{ congregationId: string; associationId?: string }, StripeLinkResult>(getFunctionsClient(), 'createStripeConnectLink');
  const { data } = await fn({ congregationId, associationId });
  return data;
}

export interface CheckoutInput {
  congregationId: string;
  associationId?: string;
  amount: number;
  currency: string; // '₪' ou '€'
  cause: string;
  dedication?: string;
  pledgeId?: string;
  type: string;
}

export async function startStripeCheckout(input: CheckoutInput): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable<CheckoutInput, { url: string; sessionId: string }>(getFunctionsClient(), 'createDonationCheckout');
  const { data } = await fn(input);
  return data;
}

// Ouvre une page Stripe. Sur le web, dans le même onglet : Stripe ramène ensuite sur l'application.
export async function openStripeUrl(url: string): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(url);
    return;
  }
  await Linking.openURL(url);
}

// Message d'erreur lisible pour une fonction qui refuse (droits, compte non relié, montant…).
export function stripeErrorMessage(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? '';
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'functions/unauthenticated') return 'Connectez-vous pour continuer.';
  if (code === 'functions/permission-denied') return 'Vous n’avez pas le droit de faire cette opération.';
  if (code === 'functions/failed-precondition') return msg || 'Le compte Stripe de la communauté n’est pas encore actif.';
  if (code === 'functions/unavailable' || code === 'functions/internal') return 'Service de paiement indisponible pour le moment. Réessayez dans un instant.';
  return msg || 'Une erreur est survenue avec le paiement.';
}

// Paramètres de retour Stripe dans l'URL de la page (web) : ?checkout=success|cancel, ?stripe=return|refresh.
export function readStripeReturn(): { checkout?: 'success' | 'cancel'; stripe?: 'return' | 'refresh'; congregationId?: string } {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const out: { checkout?: 'success' | 'cancel'; stripe?: 'return' | 'refresh'; congregationId?: string } = {};
  const co = q.get('checkout');
  if (co === 'success' || co === 'cancel') out.checkout = co;
  const st = q.get('stripe');
  if (st === 'return' || st === 'refresh') out.stripe = st;
  const cid = q.get('congregationId');
  if (cid) out.congregationId = cid;
  return out;
}

// Efface ces paramètres de l'URL une fois le message affiché (évite de le revoir au rechargement).
export function clearStripeReturn(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const q = new URLSearchParams(window.location.search);
  ['checkout', 'session_id', 'stripe', 'congregationId'].forEach((k) => q.delete(k));
  const next = window.location.pathname + (q.toString() ? `?${q}` : '');
  window.history.replaceState(null, '', next);
}
