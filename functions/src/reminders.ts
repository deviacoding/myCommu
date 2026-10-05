// Rappels d'engagement : « Ravive ton aura », « Sauvegarde ta série ».
// Chaque heure : les fidèles dont l'heure habituelle d'ouverture approche (prochaine heure, en UTC) et qui
// n'ont rien fait aujourd'hui reçoivent un rappel. Jamais le Chabbat ni les jours de fête (communautés juives),
// jamais plus d'un par jour. La veille d'une journée à points doublés, la communauté est prévenue à 18 h.
import './shared';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import { HebrewCalendar, flags } from '@hebcal/core';
import { db, todayISO } from './shared';
import { sendToUser, sendToCongregation } from './push';

const MESSAGES = [
  { title: 'Ravive ton aura ✨', body: 'Un cours, un horaire, une réponse : un seul geste et ton aura grandit aujourd’hui.' },
  { title: 'Sauvegarde ta série 🔥', body: 'Ta série t’attend : ouvre l’application quelques secondes pour la garder vivante.' },
  { title: 'Un geste aujourd’hui', body: 'Les horaires du jour sont prêts. Une tsedaka, même petite, fait grandir ton aura.' },
  { title: 'Ton aura t’appelle', body: 'Pas encore passé aujourd’hui ? Un cours de deux minutes suffit.' },
];

const TZ_BY_COUNTRY: Record<string, string> = { FR: 'Europe/Paris', BE: 'Europe/Brussels', CH: 'Europe/Zurich', GB: 'Europe/London', IL: 'Asia/Jerusalem', MA: 'Africa/Casablanca', CA: 'America/Toronto', US: 'America/New_York' };

// Date et heure locales d'un fuseau.
function localParts(tz: string, d = new Date()): { date: string; hour: number; weekday: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) % 24, weekday };
  } catch {
    return { date: todayISO(d), hour: d.getUTCHours(), weekday: d.getUTCDay() };
  }
}

// Chabbat ou fête (yom tov) à cette date locale, pour une communauté juive.
const quietCache = new Map<string, boolean>();
function isJewishQuietDay(date: string, il: boolean): boolean {
  const key = `${date}|${il}`;
  if (quietCache.has(key)) return quietCache.get(key)!;
  const d = new Date(date + 'T12:00:00Z');
  let quiet = d.getUTCDay() === 6;
  if (!quiet) {
    try {
      const events = HebrewCalendar.calendar({ start: d, end: d, il, mask: flags.CHAG, noModern: true });
      quiet = events.some((e) => e.getFlags() & flags.CHAG);
    } catch (e) {
      logger.warn('hebcal', e);
    }
  }
  quietCache.set(key, quiet);
  return quiet;
}

export const engagementReminders = onSchedule({ schedule: 'every 1 hours', timeZone: 'UTC' }, async () => {
  const now = new Date();
  const nextHourUtc = (now.getUTCHours() + 1) % 24;
  const users = await db.collection('users').where('usualHourUtc', '==', nextHourUtc).get();
  let sent = 0;
  for (const u of users.docs) {
    const data = u.data();
    if (data.reminderOptOut || !Array.isArray(data.fcmTokens) || data.fcmTokens.length === 0) continue;
    const tz: string = data.tz || 'Europe/Paris';
    const local = localParts(tz, now);
    if (data.lastReminderDate === local.date) continue; // un seul rappel par jour
    if (data.community === 'jewish' && isJewishQuietDay(local.date, tz === 'Asia/Jerusalem')) continue;
    // Rien fait aujourd'hui ? (une action comptable : horaires, agenda, cours, réponse)
    const acts = await db.collection('activity').where('uid', '==', u.id).where('date', '==', local.date).get();
    if (acts.docs.some((a) => ['schedule', 'agenda', 'course', 'answer'].includes(a.data().type))) continue;
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    try {
      await sendToUser(u.id, { ...msg, data: { type: 'reminder' } });
      await u.ref.set({ lastReminderDate: local.date }, { merge: true });
      sent++;
    } catch (e) {
      logger.warn('rappel', { uid: u.id, e });
    }
  }
  logger.info('Rappels d’engagement', { candidates: users.size, sent, nextHourUtc });

  // Veille d'une journée à points doublés : annonce à 18 h locale (heure de la communauté).
  const boosts = await db.collection('boosts').where('date', '>=', todayISO(now)).get();
  for (const b of boosts.docs) {
    const boost = b.data();
    if (boost.announcedAt) continue;
    const cong = (await db.doc(`congregations/${boost.congregationId}`).get()).data();
    const tz = TZ_BY_COUNTRY[cong?.country ?? ''] ?? 'Europe/Paris';
    const local = localParts(tz, now);
    const tomorrow = todayISO(new Date(new Date(local.date + 'T12:00:00Z').getTime() + 86400000));
    if (boost.date !== tomorrow || local.hour < 18) continue;
    try {
      await sendToCongregation(boost.congregationId, { title: 'Demain : points doublés ✨', body: `${boost.label || 'Journée spéciale'} : chaque geste et chaque don comptent double demain.`, data: { type: 'boost', date: boost.date } });
      await b.ref.set({ announcedAt: now.toISOString() }, { merge: true });
    } catch (e) {
      logger.warn('annonce boost', e);
    }
  }
});
