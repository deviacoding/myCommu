import { DayEntry, Donation, Holiday } from '../types';

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

// Dons de démo de toute la communauté (hors utilisateur de démo, dont les dons n'ont pas de uid) :
// générés de façon déterministe sur les 6 derniers mois jusqu'à un total cible, pour que le tableau de bord
// du responsable (dons par mois, donateur du mois, podium, fiches des fidèles) ait de la matière.
export function communityDemoDonations(prefix: string, members: { id: string; name: string }[], causes: string[], target: number, existing = 0): Donation[] {
  const amounts = [18, 26, 36, 52, 52, 72, 100, 104, 120, 150, 180, 200, 260, 300, 360];
  const donors = members.slice(1); // le premier membre est l'utilisateur de démo
  const dayISO = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const out: Donation[] = [];
  let sum = 0;
  for (let i = 0; sum < target - existing && i < 120; i++) {
    const donor = donors[(i * 7) % donors.length];
    const daysAgo = i % 4 === 0 ? (i * 3) % 28 : (i * 13) % 180; // 6 mois, avec un mois en cours bien rempli
    let amount = amounts[(i * 5 + donor.id.length) % amounts.length];
    // Les deux plus gros donateurs reviennent souvent avec de gros montants : on voit un vrai podium.
    if (donor === donors[0] && i % 3 === 0) amount = 520;
    if (donor === donors[1] && i % 4 === 0) amount = 360;
    if (sum + amount > target - existing) amount = Math.max(18, target - existing - sum);
    const type = i % 5 === 0 ? 'maasser' : i % 7 === 0 ? 'engagement' : 'tsedaka';
    const date = dayISO(daysAgo);
    // Les dons de plus de 14 jours ont été remerciés ; parmi les récents, deux restent à remercier.
    const thankedAt = daysAgo > 14 || (daysAgo > 1 && i % 3 !== 1) ? dayISO(Math.max(0, daysAgo - 1)) : undefined;
    out.push({ id: `${prefix}${i}`, uid: donor.id, type, amount, cause: causes[(i * 3) % causes.length], date, thankedAt });
    sum += amount;
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
