const DAY = 86400000;
const TISHREI_1_5787 = new Date(2026, 8, 12); // 1 Tichri 5787 = 12 septembre 2026

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}

export function hebrewDateLabel(d: Date = new Date()): string | null {
  const day = daysBetween(TISHREI_1_5787, d) + 1;
  if (day >= 1 && day <= 30) return `${day} Tichri 5787`;
  if (day >= 31 && day <= 59) return `${day - 30} Hechvan 5787`;
  if (day >= 60 && day <= 89) return `${day - 59} Kislev 5787`;
  return null;
}

// Langue des dates (fr-FR par défaut), mise à jour par le module multilingue.
let DATE_LOCALE = 'fr-FR';
export function setDateLocale(l: string) {
  DATE_LOCALE = l;
}

export function formatLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString(DATE_LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString(DATE_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatNumeric(iso: string): string {
  return parseISODate(iso).toLocaleDateString(DATE_LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function todayISO(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function eurosLegacy(n: number): string {
  return `${n.toLocaleString('fr-FR')} €`;
}

// Monnaie de la confession courante (₪ pour la démo juive, € pour les autres). Mise à jour par AppStateProvider.
export let CURRENCY = '₪';

export function setCurrency(symbol: string) {
  CURRENCY = symbol;
}

export function money(n: number): string {
  return `${n.toLocaleString(DATE_LOCALE)} ${CURRENCY}`;
}
