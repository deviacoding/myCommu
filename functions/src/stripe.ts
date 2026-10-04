// Paiements : Stripe Connect (comptes Express) — un compte connecté par communauté,
// les dons des fidèles partent directement vers le compte de la communauté.
import './shared';
import Stripe from 'stripe';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { db, FieldValue, FINANCE_ROLES, requireRole, getCongregation, currencyOf, todayISO, requireString } from './shared';

// Secrets (créés avec `firebase functions:secrets:set …`, jamais dans le dépôt).
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
// URL publique de l'application (retour après l'onboarding Stripe et après un paiement).
const APP_URL = defineString('APP_URL', { default: 'https://mycommunity-b13de.web.app' });

function stripeClient(): Stripe {
  return new Stripe(STRIPE_SECRET_KEY.value(), { typescript: true });
}

// Document paymentLinks pour Stripe : un par association bénéficiaire (ou par communauté à défaut).
function stripeLinkId(congregationId: string, associationId?: string): string {
  return `${associationId ?? congregationId}_stripe`;
}

// Association bénéficiaire : son pays décide du compte Stripe (pays du compte Express) et du reçu.
async function getAssociation(congregationId: string, associationId?: string): Promise<{ id?: string; name?: string; country?: string } | undefined> {
  if (!associationId) return undefined;
  const snap = await db.doc(`associations/${associationId}`).get();
  const a = snap.data();
  if (!a || a.congregationId !== congregationId) throw new HttpsError('invalid-argument', 'Association inconnue pour cette communauté.');
  return { id: snap.id, name: a.name, country: a.country };
}

const MAX_AMOUNT = 100_000; // garde-fou : montant maximal d'un don en ligne

// ---------------------------------------------------------------------------
// createStripeConnectLink({ congregationId }) → { url, accountId, status }
// Le responsable / adjoint / trésorier relie sa communauté à Stripe : création (ou réutilisation)
// d'un compte Express, puis lien d'onboarding. Le paymentLink passe à « active » via le webhook account.updated.
// ---------------------------------------------------------------------------
export const createStripeConnectLink = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const uid = request.auth.uid;
  const congregationId = requireString(request.data?.congregationId, 'congregationId');
  const associationId: string | undefined = typeof request.data?.associationId === 'string' && request.data.associationId ? request.data.associationId : undefined;

  await requireRole(uid, congregationId, FINANCE_ROLES);
  const congregation = await getCongregation(congregationId);
  const association = await getAssociation(congregationId, associationId);
  const stripe = stripeClient();

  const linkRef = db.doc(`paymentLinks/${stripeLinkId(congregationId, associationId)}`);
  const linkSnap = await linkRef.get();
  let accountId: string | undefined = linkSnap.data()?.accountId;
  const email = request.auth.token.email ?? undefined;

  if (!accountId) {
    const wanted = association?.country ?? congregation.country ?? '';
    const country = /^[A-Z]{2}$/.test(wanted) ? wanted : 'FR';
    let account: Stripe.Account;
    try {
      account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      business_type: 'non_profit',
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { name: association?.name ?? congregation.name },
      metadata: { congregationId, createdBy: uid, ...(associationId ? { associationId } : {}) },
      });
    } catch (err) {
      // Pays non couvert par Stripe (Israël, par exemple) : message clair plutôt qu'une erreur interne.
      const code = (err as { code?: string }).code;
      if (code === 'country_unsupported') {
        throw new HttpsError('failed-precondition', `Stripe n'est pas disponible dans le pays de la communauté (${country}). Utilisez un autre moyen de paiement (Bit en Israël).`);
      }
      throw err;
    }
    accountId = account.id;

    // Premier moyen de paiement de la communauté → par défaut.
    const others = await db.collection('paymentLinks').where('congregationId', '==', congregationId).limit(1).get();
    await linkRef.set({
      id: stripeLinkId(congregationId, associationId),
      congregationId,
      ...(associationId ? { associationId } : {}),
      provider: 'stripe',
      account: email ?? association?.name ?? congregation.name,
      accountId,
      connectedAt: new Date().toISOString(),
      isDefault: others.empty,
      testPayments: 0,
      status: 'pending',
      createdBy: uid,
    });
    logger.info('Compte Stripe Express créé', { congregationId, accountId });
  }

  // Compte déjà opérationnel : lien vers le tableau de bord Express plutôt qu'un nouvel onboarding.
  const account = await stripe.accounts.retrieve(accountId);
  if (account.charges_enabled && account.details_submitted) {
    await linkRef.set({ status: 'active' }, { merge: true });
    const login = await stripe.accounts.createLoginLink(accountId);
    return { url: login.url, accountId, status: 'active' as const };
  }

  const base = APP_URL.value().replace(/\/$/, '');
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: `${base}/?stripe=refresh&congregationId=${encodeURIComponent(congregationId)}`,
    return_url: `${base}/?stripe=return&congregationId=${encodeURIComponent(congregationId)}`,
  });
  return { url: link.url, accountId, status: 'pending' as const };
});

// ---------------------------------------------------------------------------
// createDonationCheckout({ congregationId, amount, currency?, cause, dedication?, pledgeId?, type? }) → { url, sessionId }
// Un fidèle paie un don : Checkout Session en mode paiement, fonds transférés au compte connecté de la communauté.
// ---------------------------------------------------------------------------
export const createDonationCheckout = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const uid = request.auth.uid;
  const data = request.data ?? {};
  const congregationId = requireString(data.congregationId, 'congregationId');
  const associationId: string | undefined = typeof data.associationId === 'string' && data.associationId ? data.associationId : undefined;
  const cause = requireString(data.cause, 'cause');
  const dedication: string | undefined = typeof data.dedication === 'string' && data.dedication.trim() ? data.dedication.trim() : undefined;
  const pledgeId: string | undefined = typeof data.pledgeId === 'string' && data.pledgeId ? data.pledgeId : undefined;
  const type: string = typeof data.type === 'string' && data.type ? data.type : pledgeId ? 'engagement' : 'tsedaka';

  const amount = Number(data.amount);
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new HttpsError('invalid-argument', `Montant invalide (entier entre 1 et ${MAX_AMOUNT}).`);
  }

  await requireRole(uid, congregationId, 'any');
  const congregation = await getCongregation(congregationId);

  // Devise : celle demandée (« ₪ », « € », « ils », « eur ») sinon celle de la confession.
  const requested = typeof data.currency === 'string' ? data.currency.trim().toLowerCase() : '';
  const currency = requested === '₪' || requested === 'ils' ? 'ils' : requested === '€' || requested === 'eur' ? 'eur' : currencyOf(congregation.religion).code;

  // Compte Stripe connecté de l'association choisie (ou de la communauté).
  const linkId = stripeLinkId(congregationId, associationId);
  const linkSnap = await db.doc(`paymentLinks/${linkId}`).get();
  const link = linkSnap.data();
  if (!link?.accountId) throw new HttpsError('failed-precondition', "Cette communauté n'a pas encore relié de compte Stripe.");
  if (link.status && link.status !== 'active') throw new HttpsError('failed-precondition', "Le compte Stripe de la communauté n'est pas encore activé.");

  // Si une promesse est réglée, elle doit appartenir au donateur et être encore due.
  if (pledgeId) {
    const pledge = (await db.doc(`pledges/${pledgeId}`).get()).data();
    if (!pledge || pledge.congregationId !== congregationId) throw new HttpsError('not-found', 'Promesse introuvable.');
    if (pledge.memberUid && pledge.memberUid !== uid) throw new HttpsError('permission-denied', "Cette promesse n'est pas la vôtre.");
    if (pledge.status === 'paid') throw new HttpsError('failed-precondition', 'Cette promesse est déjà réglée.');
  }

  const stripe = stripeClient();
  const base = APP_URL.value().replace(/\/$/, '');
  // Les métadonnées Stripe n'acceptent que des chaînes : on retire les champs vides.
  const metadata: Record<string, string> = { congregationId, uid, cause, type, paymentLinkId: linkId };
  if (associationId) metadata.associationId = associationId;
  if (dedication) metadata.dedication = dedication;
  if (pledgeId) metadata.pledgeId = pledgeId;

  // Paiement « direct » (choix Connect : les communautés encaissent directement) : la session est créée
  // sur le compte connecté de la communauté ; les fonds n'arrivent jamais sur le compte de la plateforme.
  const session = await stripe.checkout.sessions.create(
    {
    mode: 'payment',
    client_reference_id: uid,
    customer_email: request.auth.token.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount * 100, // euros → centimes, shekels → agorot
          product_data: { name: `${cause} — ${congregation.name}`, description: dedication },
        },
      },
    ],
    payment_intent_data: {
      // Pas de commission myCommu pour l'instant. Pour en prélever une (en centimes), décommenter :
      // application_fee_amount: Math.round(amount * 100 * 0.02),
      metadata,
      description: `Don ${cause} — ${congregation.name}`,
    },
    metadata,
    success_url: `${base}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&congregationId=${encodeURIComponent(congregationId)}`,
    cancel_url: `${base}/?checkout=cancel&congregationId=${encodeURIComponent(congregationId)}`,
    },
    { stripeAccount: link.accountId }
  );

  logger.info('Checkout créé', { congregationId, uid, amount, currency, sessionId: session.id });
  return { url: session.url, sessionId: session.id };
});

// ---------------------------------------------------------------------------
// stripeWebhook — POST depuis Stripe, signature vérifiée.
// checkout.session.completed → document donations (+ promesse réglée) ; account.updated → paymentLink actif.
// ---------------------------------------------------------------------------
export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).send('Signature manquante');
    return;
  }

  // Un endpoint Stripe par source (compte plateforme pour checkout.*, comptes connectés pour account.updated),
  // chacun avec son secret : STRIPE_WEBHOOK_SECRET accepte plusieurs secrets séparés par des virgules.
  const stripe = stripeClient();
  const secrets = STRIPE_WEBHOOK_SECRET.value().split(',').map((s) => s.trim()).filter(Boolean);
  let event: Stripe.Event | undefined;
  let lastError = 'aucun secret configuré';
  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
      break;
    } catch (err) {
      lastError = (err as Error).message;
    }
  }
  if (!event) {
    logger.warn('Webhook Stripe : signature invalide', { message: lastError });
    res.status(400).send('Signature invalide');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await recordDonation(event.data.object as Stripe.Checkout.Session);
        break;
      case 'account.updated':
        await syncAccountStatus(event.data.object as Stripe.Account);
        break;
      default:
        logger.debug('Webhook Stripe ignoré', { type: event.type });
    }
    res.json({ received: true });
  } catch (err) {
    // 500 → Stripe réessaiera l'envoi.
    logger.error('Webhook Stripe : traitement en échec', { type: event.type, id: event.id, err });
    res.status(500).send('Erreur de traitement');
  }
});

// Écrit le don à partir de la session Checkout payée. Idempotent : id du don = id de session.
async function recordDonation(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== 'paid') {
    logger.info('Session non payée pour le moment', { sessionId: session.id, status: session.payment_status });
    return;
  }
  const m = session.metadata ?? {};
  const congregationId = m.congregationId;
  const uid = m.uid ?? session.client_reference_id ?? undefined;
  if (!congregationId) {
    logger.warn('Session sans congregationId, ignorée', { sessionId: session.id });
    return;
  }

  const donationId = `stripe_${session.id}`;
  const donationRef = db.doc(`donations/${donationId}`);
  if ((await donationRef.get()).exists) return; // événement déjà traité

  const amount = Math.round((session.amount_total ?? 0) / 100);
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  const pledgeId = m.pledgeId || undefined;

  const donation: Record<string, unknown> = {
    id: donationId,
    congregationId,
    uid,
    type: m.type || (pledgeId ? 'engagement' : 'tsedaka'),
    amount,
    currency: session.currency ?? 'eur',
    cause: m.cause || 'Don',
    date: todayISO(),
    paymentLinkId: m.paymentLinkId || stripeLinkId(congregationId),
    provider: 'stripe',
    paymentRef: session.id,
    createdAt: FieldValue.serverTimestamp(),
  };
  if (m.dedication) donation.dedication = m.dedication;
  if (m.associationId) donation.associationId = m.associationId;
  if (pledgeId) donation.pledgeId = pledgeId;
  if (paymentIntent) donation.paymentIntent = paymentIntent;

  const batch = db.batch();
  batch.set(donationRef, donation);
  if (pledgeId) {
    batch.set(db.doc(`pledges/${pledgeId}`), { status: 'paid', settledAt: todayISO(), donationId }, { merge: true });
  }
  await batch.commit();
  logger.info('Don enregistré', { donationId, congregationId, uid, amount, pledgeId });
}

// Le compte connecté peut encaisser → le paymentLink devient « active ».
async function syncAccountStatus(account: Stripe.Account): Promise<void> {
  const congregationId = account.metadata?.congregationId;
  const associationId = account.metadata?.associationId || undefined;
  let ref = congregationId ? db.doc(`paymentLinks/${stripeLinkId(congregationId, associationId)}`) : undefined;
  if (!ref) {
    const q = await db.collection('paymentLinks').where('accountId', '==', account.id).limit(1).get();
    if (q.empty) {
      logger.warn('account.updated sans paymentLink associé', { accountId: account.id });
      return;
    }
    ref = q.docs[0].ref;
  }
  const active = Boolean(account.charges_enabled && account.details_submitted);
  await ref.set(
    {
      status: active ? 'active' : 'pending',
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      ...(account.email ? { account: account.email } : {}),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  logger.info('Statut du compte Stripe synchronisé', { accountId: account.id, active });
}
