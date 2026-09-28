import { DayEntry, Holiday } from '../types';

// Replace les horaires des fêtes jour par jour dans le calendrier : le jour est lu dans « (vendredi 11) », sinon premier jour.
function toDate(h: Holiday, label: string): string {
  const [y, m, d] = h.start.split('-').map(Number);
  const found = label.match(/\((?:[^\d)]*)(\d{1,2})\)/);
  if (!found) return h.start;
  const day = Number(found[1]);
  const month = day < d ? m + 1 : m;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function entriesFromHolidays(holidays: Holiday[], congregationId?: string): DayEntry[] {
  return holidays.flatMap((h) =>
    h.times.map((t, i) => ({
      id: `${h.id}-${i}`,
      congregationId,
      date: toDate(h, t.label),
      name: `${h.name} · ${t.label.replace(/\s*\([^)]*\)/, '')}`,
      time: t.value,
    }))
  );
}
