// Simulation de la récupération automatique des horaires après géolocalisation.
// Juif : CalJ (allumage, sortie de Chabbat). Islam : Aladhan (cinq prières). Chrétien : calendrier liturgique
// (messes dominicales). Bouddhiste : calendrier lunaire (jours d'uposatha).
// Dans la version finale : géolocalisation du téléphone → appel à l'API correspondante → horaires exacts.

import { CommunityId } from '../types';
import { todayISO } from './time';

export interface ScheduleImport {
  place: string;
  coords: string;
  source: string;
  entries: { date: string; name: string; time: string }[];
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function fmt(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

// Coucher du soleil approximatif à Paris en automne : 19:31 le 2 octobre, puis −2 min par jour.
function sunsetMinutes(d: Date): number {
  const ref = new Date(2026, 9, 2).getTime();
  const days = Math.round((d.getTime() - ref) / 86400000);
  return 19 * 60 + 31 - 2 * days;
}

function sunriseMinutes(d: Date): number {
  const ref = new Date(2026, 9, 2).getTime();
  const days = Math.round((d.getTime() - ref) / 86400000);
  return 7 * 60 + 52 + Math.round(1.6 * days);
}

function nextWeekday(from: Date, weekday: number): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  return d;
}

export function simulateScheduleImport(religion: CommunityId): ScheduleImport {
  const entries: ScheduleImport['entries'] = [];
  const now = new Date();

  if (religion === 'jewish') {
    const d = nextWeekday(now, 5);
    for (let i = 0; i < 4; i++) {
      const fri = new Date(d);
      const sat = new Date(d);
      sat.setDate(sat.getDate() + 1);
      entries.push({ date: todayISO(fri), name: 'Allumage des bougies (CalJ)', time: fmt(sunsetMinutes(fri) - 18) });
      entries.push({ date: todayISO(fri), name: 'Minha de Chabbat (CalJ)', time: fmt(sunsetMinutes(fri) - 25) });
      entries.push({ date: todayISO(sat), name: 'Sortie de Chabbat (CalJ)', time: fmt(sunsetMinutes(sat) + 42) });
      entries.push({ date: todayISO(sat), name: 'Rabbénou Tam (CalJ)', time: fmt(sunsetMinutes(sat) + 72) });
      d.setDate(d.getDate() + 7);
    }
    return { place: 'Paris 17e, France', coords: '48.884° N, 2.312° E', source: 'CalJ', entries };
  }

  if (religion === 'muslim') {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const sunrise = sunriseMinutes(d);
      const sunset = sunsetMinutes(d);
      const noon = Math.round((sunrise + sunset) / 2) + 6;
      entries.push({ date: todayISO(d), name: 'Fajr (Aladhan)', time: fmt(sunrise - 78) });
      entries.push({ date: todayISO(d), name: 'Dhuhr (Aladhan)', time: fmt(noon) });
      entries.push({ date: todayISO(d), name: 'Asr (Aladhan)', time: fmt(Math.round((noon + sunset) / 2) + 20) });
      entries.push({ date: todayISO(d), name: 'Maghrib (Aladhan)', time: fmt(sunset + 3) });
      entries.push({ date: todayISO(d), name: 'Isha (Aladhan)', time: fmt(sunset + 85) });
      if (d.getDay() === 5) entries.push({ date: todayISO(d), name: 'Jumu‘a (Aladhan)', time: fmt(noon + 15) });
      d.setDate(d.getDate() + 1);
    }
    return { place: 'Paris 19e, France', coords: '48.887° N, 2.372° E', source: 'Aladhan (méthode UOIF)', entries };
  }

  if (religion === 'christian') {
    const d = nextWeekday(now, 0);
    for (let i = 0; i < 4; i++) {
      const sat = new Date(d);
      sat.setDate(sat.getDate() - 1);
      entries.push({ date: todayISO(sat), name: 'Messe anticipée (liturgie)', time: '18:30' });
      entries.push({ date: todayISO(d), name: 'Messe dominicale (liturgie)', time: '10:30' });
      entries.push({ date: todayISO(d), name: 'Vêpres (liturgie)', time: '18:00' });
      d.setDate(d.getDate() + 7);
    }
    return { place: 'Paris 17e, diocèse de Paris', coords: '48.879° N, 2.290° E', source: 'calendrier liturgique diocésain', entries };
  }

  // Bouddhiste : jours d'uposatha (nouvelle lune, premier quartier, pleine lune, dernier quartier) sur deux lunaisons.
  const newMoon = new Date(2026, 8, 11, 12);
  const step = 29.53 / 4;
  const t = new Date(newMoon);
  while (t.getTime() < now.getTime() - 86400000) t.setTime(t.getTime() + step * 86400000);
  const names = ['Uposatha · nouvelle lune', 'Uposatha · premier quartier', 'Uposatha · pleine lune', 'Uposatha · dernier quartier'];
  let idx = Math.round(((t.getTime() - newMoon.getTime()) / 86400000 / step) % 4);
  for (let i = 0; i < 8; i++) {
    entries.push({ date: todayISO(t), name: `${names[idx % 4]} (lunaire)`, time: '07:00' });
    if (idx % 4 === 2) entries.push({ date: todayISO(t), name: 'Enseignement de pleine lune (lunaire)', time: '14:00' });
    t.setTime(t.getTime() + step * 86400000);
    idx++;
  }
  return { place: 'Évry, France', coords: '48.624° N, 2.443° E', source: 'calendrier lunaire', entries };
}
