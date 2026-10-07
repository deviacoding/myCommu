import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthContext';
import { can, StaffRole } from '../../config/roles';
import { donorTier, isoDaysAgo } from '../../config/gamification';
import { todayISO } from '../../utils/time';
import { Donation } from '../../types';

export const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86400000);

// Rôle effectif du membre de l'équipe sur la communauté courante.
export function useRavRole(): StaffRole {
  const { mode, staffRoleFor } = useAuth();
  const { congregationId } = useAppState();
  return staffRoleFor(congregationId) ?? (mode === 'treasurer' ? 'treasurer' : mode === 'organizer' ? 'organizer' : 'leader');
}

// Ce que le responsable a à traiter : dons à remercier (14 derniers jours) et vainqueur de ligue à féliciter.
// Partagé entre l'accueil (pastille rouge) et le fil d'actualité (liste complète), pour que le compte soit le même.
export function useRavFeed() {
  const role = useRavRole();
  const { congregationId, donations, members, seed, league } = useAppState();
  const congDonations = donations.filter((d) => (d.congregationId ?? congregationId) === congregationId);
  const toThank = can(role, 'donations') ? congDonations.filter((d) => !d.thankedAt && daysSince(d.date) <= 14).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const winner = can(role, 'answers') ? league.pendingWinner : null;
  const todo = toThank.length + (winner ? 1 : 0);

  const donorKey = (d: Donation) => d.uid ?? d.dedication ?? 'inconnu';
  const donorName = (d: Donation) => members.find((m) => m.id === d.uid)?.name ?? d.dedication ?? seed.user.name;
  // Palier du donateur sur 12 mois : un gros donateur se reconnaît tout de suite.
  const since12m = isoDaysAgo(todayISO(), 365);
  const tierOf = (d: Donation) => {
    const key = donorKey(d);
    const total = congDonations.filter((x) => x.date >= since12m && donorKey(x) === key).reduce((s, x) => s + x.amount, 0);
    return donorTier(total, seed.currency);
  };
  const kindOf = (d: Donation) => (d.streakRepair ? 'Rachat de série' : d.box ? 'Boîte de tsedaka' : d.type === 'maasser' ? seed.tithe?.name ?? 'Maasser' : d.type === 'engagement' ? 'Promesse réglée' : seed.alms.name);

  return { role, congDonations, toThank, winner, todo, donorKey, donorName, tierOf, kindOf };
}
