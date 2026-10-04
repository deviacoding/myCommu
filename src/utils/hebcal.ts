import { HebrewCalendar, Location, Event, flags } from '@hebcal/core';
import '@hebcal/locales';
import { todayISO } from './time';

// Horaires et dates du calendrier juif calculés hors ligne avec @hebcal/core (hebcal.com),
// à partir de la position de la communauté : allumage, sortie de Chabbat et de fête, jeûnes,
// fêtes, Roch H̲odech et paracha. Le responsable choisit ensuite ce qu'il publie.

export type SuggestionKind = 'candles' | 'havdalah' | 'fast' | 'holiday' | 'roshchodesh' | 'parasha';

export interface ScheduleSuggestion {
  key: string; // date + nom, pour repérer ce qui est déjà publié
  date: string; // ISO AAAA-MM-JJ
  name: string;
  time: string; // HH:MM, ou '' pour une date sans horaire (fête, paracha)
  kind: SuggestionKind;
}

export interface SuggestionOptions {
  lat: number;
  lng: number;
  country?: string; // code ISO : règle le fuseau et la règle « en Israël »
  weeks?: number; // horizon, 4 semaines par défaut
  from?: Date;
}

// Fuseau horaire déduit du pays ; à défaut celui de l'appareil du responsable.
const TZ_BY_COUNTRY: Record<string, string> = {
  FR: 'Europe/Paris',
  BE: 'Europe/Brussels',
  LU: 'Europe/Luxembourg',
  CH: 'Europe/Zurich',
  DE: 'Europe/Berlin',
  GB: 'Europe/London',
  IL: 'Asia/Jerusalem',
  MA: 'Africa/Casablanca',
  TN: 'Africa/Tunis',
  DZ: 'Africa/Algiers',
  CA: 'America/Toronto',
  US: 'America/New_York',
};

export function timezoneFor(country?: string): string {
  if (country && TZ_BY_COUNTRY[country]) return TZ_BY_COUNTRY[country];
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';
  } catch {
    return 'Europe/Paris';
  }
}

const isJerusalem = (lat: number, lng: number) => Math.abs(lat - 31.78) < 0.15 && Math.abs(lng - 35.22) < 0.15;

function localISO(d: Date): string {
  return todayISO(d);
}

// Libellé en français, sans l'horaire que Hebcal ajoute après « : ».
function label(ev: Event): string {
  return ev.render('fr').replace(/:\s*\d{1,2}:\d{2}\s*$/, '').trim();
}

export function jewishSuggestions({ lat, lng, country, weeks = 4, from = new Date() }: SuggestionOptions): ScheduleSuggestion[] {
  const il = country === 'IL';
  const tzid = timezoneFor(country);
  const location = new Location(lat, lng, il, tzid);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + weeks * 7);

  const events = HebrewCalendar.calendar({
    start,
    end,
    location,
    candlelighting: true,
    candleLightingMins: isJerusalem(lat, lng) ? 40 : 18,
    havdalahMins: 42, // usage courant en France ; le responsable peut corriger l'horaire proposé
    sedrot: true,
    il,
    locale: 'fr',
    noMinorFast: false,
    noModern: false,
    noRoshChodesh: false,
    noSpecialShabbat: true,
  });

  const out: ScheduleSuggestion[] = [];
  for (const ev of events) {
    const date = localISO(ev.getDate().greg());
    const cats = ev.getCategories();
    const timed = ev as Event & { eventTimeStr?: string };
    const time = timed.eventTimeStr ?? '';
    let kind: SuggestionKind;
    let name = label(ev);
    if (cats.includes('candles')) {
      kind = 'candles';
      name = 'Allumage des bougies';
    } else if (cats.includes('havdalah')) {
      kind = 'havdalah';
      const d = ev.getDate().greg();
      name = d.getDay() === 6 ? 'Sortie de Chabbat' : 'Sortie de fête';
    } else if (cats.includes('zmanim')) {
      kind = 'fast';
    } else if (cats.includes('roshchodesh')) {
      kind = 'roshchodesh';
    } else if (cats.includes('parashat')) {
      kind = 'parasha';
    } else if (ev.getFlags() & (flags.CHAG | flags.MINOR_HOLIDAY | flags.MAJOR_FAST | flags.MINOR_FAST | flags.MODERN_HOLIDAY | flags.CHOL_HAMOED | flags.EREV)) {
      kind = 'holiday';
    } else {
      continue;
    }
    out.push({ key: `${date}|${name}`, date, name, time, kind });
  }
  return out;
}

export const SUGGESTION_LABELS: Record<SuggestionKind, string> = {
  candles: 'Allumage',
  havdalah: 'Sortie',
  fast: 'Jeûne',
  holiday: 'Fête',
  roshchodesh: 'Roch H̲odech',
  parasha: 'Paracha',
};
