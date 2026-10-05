// Notifications push (FCM).
// Jetons : users/{uid}.fcmTokens: string[]. Chaque membre est abonné au sujet cong_{congregationId}.
import './shared';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten, onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import type { Message, MulticastMessage } from 'firebase-admin/messaging';
import { db, messaging, FieldValue, FINANCE_ROLES, getCongregation, currencyOf, formatAmount, todayISO, addDays, topicOf, requireString } from './shared';

// Codes d'erreur FCM qui signifient « jeton mort » : on le retire du profil.
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

type Payload = { title: string; body: string; data?: Record<string, string> };

// Options communes : son par défaut sur Android/iOS, icône sur le web.
function build(payload: Payload): Omit<Message, 'token' | 'topic' | 'condition'> {
  return {
    notification: { title: payload.title, body: payload.body },
    data: payload.data,
    android: { priority: 'high', notification: { sound: 'default', channelId: 'default' } },
    apns: { payload: { aps: { sound: 'default' } } },
    webpush: { notification: { icon: '/favicon.png' } },
  };
}

async function tokensOf(uid: string): Promise<string[]> {
  const snap = await db.doc(`users/${uid}`).get();
  const tokens = snap.data()?.fcmTokens;
  return Array.isArray(tokens) ? tokens.filter((t): t is string => typeof t === 'string' && t.length > 0) : [];
}

// Envoie à tous les appareils d'un utilisateur ; nettoie les jetons invalides.
export async function sendToUser(uid: string, payload: Payload): Promise<number> {
  const tokens = await tokensOf(uid);
  if (tokens.length === 0) return 0;
  const message: MulticastMessage = { tokens, ...build(payload) };
  const result = await messaging.sendEachForMulticast(message);
  const dead: string[] = [];
  result.responses.forEach((r, i) => {
    if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) dead.push(tokens[i]);
  });
  if (dead.length > 0) {
    await db.doc(`users/${uid}`).set({ fcmTokens: FieldValue.arrayRemove(...dead) }, { merge: true });
    logger.info('Jetons FCM invalides retirés', { uid, count: dead.length });
  }
  return result.successCount;
}

// Envoie à tous les membres d'une communauté (sujet FCM).
export async function sendToCongregation(congregationId: string, payload: Payload): Promise<string> {
  const message: Message = { topic: topicOf(congregationId), ...build(payload) };
  return messaging.send(message);
}

async function congregationIdsOf(uid: string): Promise<string[]> {
  const q = await db.collection('memberships').where('uid', '==', uid).get();
  return q.docs.map((d) => d.data().congregationId as string).filter(Boolean);
}

// ---------------------------------------------------------------------------
// registerPushToken({ token }) : ajoute le jeton au profil et l'abonne aux sujets des communautés du membre.
// À appeler à chaque démarrage de l'application (le jeton peut changer).
// ---------------------------------------------------------------------------
export const registerPushToken = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const uid = request.auth.uid;
  const token = requireString(request.data?.token, 'token');

  await db.doc(`users/${uid}`).set({ fcmTokens: FieldValue.arrayUnion(token), pushUpdatedAt: new Date().toISOString() }, { merge: true });
  const congregations = await congregationIdsOf(uid);
  await Promise.all(congregations.map((id) => messaging.subscribeToTopic([token], topicOf(id))));
  return { topics: congregations.map(topicOf) };
});

// unregisterPushToken({ token }) : à la déconnexion.
export const unregisterPushToken = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion requise.');
  const uid = request.auth.uid;
  const token = requireString(request.data?.token, 'token');
  await db.doc(`users/${uid}`).set({ fcmTokens: FieldValue.arrayRemove(token) }, { merge: true });
  const congregations = await congregationIdsOf(uid);
  await Promise.all(congregations.map((id) => messaging.unsubscribeFromTopic([token], topicOf(id))));
  return { ok: true };
});

// Rejoindre / quitter une communauté → abonner / désabonner les jetons déjà enregistrés du membre.
export const onMembershipWritten = onDocumentWritten('memberships/{membershipId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const data = after ?? before;
  if (!data?.uid || !data?.congregationId) return;
  const tokens = await tokensOf(data.uid);
  if (tokens.length === 0) return;
  const topic = topicOf(data.congregationId);
  if (after && !before) await messaging.subscribeToTopic(tokens, topic);
  else if (before && !after) await messaging.unsubscribeFromTopic(tokens, topic);
});

// ---------------------------------------------------------------------------
// onLiveStarted : lives/{congregationId}.active passe à true → tous les membres.
// ---------------------------------------------------------------------------
export const onLiveStarted = onDocumentWritten('lives/{congregationId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!after || after.active !== true || before?.active === true) return;
  const congregationId = event.params.congregationId;
  const congregation = await getCongregation(congregationId);
  const title: string = after.title || 'Direct';
  await sendToCongregation(congregationId, {
    title: `🔴 ${congregation.name} est en direct`,
    body: `${congregation.name} est en direct : ${title}`,
    data: { type: 'live', congregationId },
  });
  logger.info('Notification direct envoyée', { congregationId, title });
});

// ---------------------------------------------------------------------------
// onQuestionAnswered : questions/{id}.status pending → answered → l'auteur de la question.
// ---------------------------------------------------------------------------
export const onQuestionAnswered = onDocumentUpdated('questions/{questionId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after || before.status !== 'pending' || after.status !== 'answered') return;
  const askerUid: string | undefined = after.askerUid;
  if (!askerUid) return;

  const messages: Array<{ author?: string; text?: string }> = Array.isArray(after.messages) ? after.messages : [];
  const lastAnswer = [...messages].reverse().find((m) => m.author === 'rav')?.text;
  const body = lastAnswer ? lastAnswer.slice(0, 140) + (lastAnswer.length > 140 ? '…' : '') : `Votre question « ${after.subject ?? ''} » a reçu une réponse.`;
  const sent = await sendToUser(askerUid, {
    title: 'Réponse à votre question',
    body,
    data: { type: 'question', questionId: event.params.questionId, congregationId: after.congregationId ?? '' },
  });
  logger.info('Notification réponse envoyée', { questionId: event.params.questionId, askerUid, sent });
});

// ---------------------------------------------------------------------------
// onEventCreated : nouvel événement d'agenda → tous les membres de la communauté.
// ---------------------------------------------------------------------------
export const onEventCreated = onDocumentCreated('agenda/{eventId}', async (event) => {
  const data = event.data?.data();
  const congregationId: string | undefined = data?.congregationId;
  if (!data || !congregationId) return;
  const congregation = await getCongregation(congregationId);
  const when = [data.date, data.time].filter(Boolean).join(' à ');
  const where = data.place ? ` — ${data.place}` : '';
  await sendToCongregation(congregationId, {
    title: `${congregation.name} : nouvel événement`,
    body: `${data.title ?? 'Événement'}${when ? ` · ${when}` : ''}${where}`,
    data: { type: 'agenda', eventId: event.params.eventId, congregationId },
  });
});

// ---------------------------------------------------------------------------
// onDonationCreated : un don arrive → le responsable et le trésorier sont prévenus pour remercier.
// ---------------------------------------------------------------------------
export const onDonationCreated = onDocumentCreated('donations/{donationId}', async (event) => {
  const d = event.data?.data();
  if (!d || !d.congregationId) return;
  const staff = await db.collection('memberships').where('congregationId', '==', d.congregationId).where('role', 'in', FINANCE_ROLES).get();
  const donor = d.uid ? (await db.doc(`users/${d.uid}`).get()).data()?.name : undefined;
  const congregation = await getCongregation(d.congregationId);
  const amount = formatAmount(Number(d.amount) || 0, currencyOf(congregation.religion).symbol);
  await Promise.all(
    staff.docs.map((m) =>
      sendToUser(m.data().uid, {
        title: d.type === 'maasser' ? 'Nouveau maasser reçu' : d.streakRepair ? 'Rachat de série' : 'Nouveau don reçu',
        body: `${donor ?? 'Un fidèle'} vient de verser ${amount}${d.cause ? ` · ${d.cause}` : ''}. Un mot de remerciement ?`,
        data: { type: 'donation', id: event.params.donationId, congregationId: d.congregationId },
      }).catch((e) => logger.warn('push maasser', e))
    )
  );
});

// ---------------------------------------------------------------------------
// pledgeReminders : chaque jour à 9 h (Paris). Promesses « due » dont l'échéance est dans 3 jours ou dépassée,
// sans rappel depuis 7 jours → notification au fidèle, lastReminder mis à jour.
// ---------------------------------------------------------------------------
export const pledgeReminders = onSchedule({ schedule: 'every day 09:00', timeZone: 'Europe/Paris' }, async () => {
  const now = new Date();
  const today = todayISO(now);
  const horizon = todayISO(addDays(now, 3));
  const reminderCutoff = todayISO(addDays(now, -7));

  const due = await db.collection('pledges').where('status', '==', 'due').where('dueDate', '<=', horizon).get();
  const congregationCache = new Map<string, { name: string; symbol: string }>();
  let sent = 0;

  for (const doc of due.docs) {
    const p = doc.data();
    if (!p.memberUid) continue;
    if (typeof p.lastReminder === 'string' && p.lastReminder > reminderCutoff) continue;

    let info = congregationCache.get(p.congregationId);
    if (!info) {
      try {
        const c = await getCongregation(p.congregationId);
        info = { name: c.name, symbol: currencyOf(c.religion).symbol };
      } catch {
        info = { name: 'Votre communauté', symbol: '€' };
      }
      congregationCache.set(p.congregationId, info);
    }

    const late = typeof p.dueDate === 'string' && p.dueDate < today;
    const amount = formatAmount(Number(p.amount) || 0, info.symbol);
    const body = late
      ? `Votre promesse « ${p.label} » (${amount}) est arrivée à échéance le ${p.dueDate}.`
      : `Votre promesse « ${p.label} » (${amount}) arrive à échéance le ${p.dueDate}.`;

    const ok = await sendToUser(p.memberUid, {
      title: `${info.name} : rappel de promesse`,
      body,
      data: { type: 'pledge', pledgeId: doc.id, congregationId: p.congregationId ?? '' },
    });
    await doc.ref.update({ lastReminder: today, lastReminderBy: 'auto' });
    if (ok > 0) sent += 1;
  }
  logger.info('Rappels de promesses envoyés', { candidates: due.size, sent });
});
