import { daysBetween, formatShort } from './time';

// Calendriers religieux, approximations suffisantes pour la maquette.

// --- Hébraïque : 1 Tichri 5787 = 12 septembre 2026.
export function hebrewDate(d: Date): string | null {
  const day = daysBetween(new Date(2026, 8, 12), d) + 1;
  if (day >= 1 && day <= 30) return `${day} Tichri 5787`;
  if (day >= 31 && day <= 59) return `${day - 30} Hechvan 5787`;
  if (day >= 60 && day <= 89) return `${day - 59} Kislev 5787`;
  return null;
}

// --- Hégirien : 1 Muharram 1448 ≈ 16 juin 2026 ; mois de 30 et 29 jours en alternance.
const HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabi‘ al-awwal', 'Rabi‘ al-thani', 'Jumada al-ula', 'Jumada al-akhira', 'Rajab', 'Sha‘ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi‘da', 'Dhu al-Hijja'];
export function hijriDate(d: Date): string | null {
  let days = daysBetween(new Date(2026, 5, 16), d);
  let year = 1448;
  while (days < 0) {
    days += 354;
    year -= 1;
  }
  while (days >= 354) {
    days -= 354;
    year += 1;
  }
  let m = 0;
  while (days >= (m % 2 === 0 ? 30 : 29)) {
    days -= m % 2 === 0 ? 30 : 29;
    m++;
  }
  return `${days + 1} ${HIJRI_MONTHS[m]} ${year}`;
}

// --- Liturgique (catholique, année A 2026-2027) : 26e dimanche du temps ordinaire = 27 septembre 2026, Avent = 29 novembre 2026.
export function liturgicalDate(d: Date): string | null {
  const advent = new Date(2026, 10, 29);
  const christmas = new Date(2026, 11, 25);
  if (daysBetween(christmas, d) >= 0 && daysBetween(christmas, d) < 14) return 'Temps de Noël';
  if (daysBetween(advent, d) >= 0) {
    const week = Math.floor(daysBetween(advent, d) / 7) + 1;
    return `${week}${week === 1 ? 'er' : 'e'} semaine de l’Avent`;
  }
  const ot26 = new Date(2026, 8, 27);
  const week = 26 + Math.floor(daysBetween(ot26, d) / 7);
  if (week < 1 || week > 34) return 'Temps ordinaire';
  return `${week}e semaine du temps ordinaire`;
}

// --- Lunaire (bouddhiste) : nouvelle lune 11 septembre 2026, pleine lune 26 septembre 2026, lunaison 29,53 jours.
export function lunarDate(d: Date): string | null {
  const newMoon = new Date(2026, 8, 11, 12);
  const age = ((d.getTime() - newMoon.getTime()) / 86400000) % 29.53;
  const day = Math.floor((age + 29.53) % 29.53) + 1;
  const phase = day <= 2 || day >= 29 ? 'nouvelle lune' : day >= 14 && day <= 16 ? 'pleine lune' : day < 14 ? 'lune croissante' : 'lune décroissante';
  const uposatha = day === 1 || day === 8 || day === 15 || day === 23 ? ' · jour d’uposatha' : '';
  return `${day}e jour lunaire · ${phase}${uposatha}`;
}

export function nextFullMoonLabel(from: Date): string {
  const fm = new Date(2026, 8, 26, 12);
  const t = new Date(fm);
  while (daysBetween(from, t) < 0) t.setTime(t.getTime() + 29.53 * 86400000);
  return formatShort(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
}
