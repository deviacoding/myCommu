// Simulation de la récupération des horaires depuis CalJ après géolocalisation.
// Dans la version finale : géolocalisation du téléphone → appel à l'API CalJ (ou Hebcal) → horaires exacts.

import { todayISO } from './time';

export interface CalJImport {
  place: string;
  coords: string;
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

export function simulateCalJ(weeks = 4): CalJImport {
  const entries: CalJImport['entries'] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  // prochain vendredi
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  for (let i = 0; i < weeks; i++) {
    const friday = new Date(d);
    const saturday = new Date(d);
    saturday.setDate(saturday.getDate() + 1);
    const sunsetFri = sunsetMinutes(friday);
    const sunsetSat = sunsetMinutes(saturday);
    entries.push({ date: todayISO(friday), name: 'Allumage des bougies (CalJ)', time: fmt(sunsetFri - 18) });
    entries.push({ date: todayISO(friday), name: 'Minha de Chabbat (CalJ)', time: fmt(sunsetFri - 25) });
    entries.push({ date: todayISO(saturday), name: 'Sortie de Chabbat (CalJ)', time: fmt(sunsetSat + 42) });
    entries.push({ date: todayISO(saturday), name: 'Rabbénou Tam (CalJ)', time: fmt(sunsetSat + 72) });
    d.setDate(d.getDate() + 7);
  }
  return { place: 'Paris 17e, France', coords: '48.884° N, 2.312° E', entries };
}
