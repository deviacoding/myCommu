import { ReligionProfile } from './religions';

// Rôles de l'équipe d'une communauté et ce que chacun peut faire dans l'espace responsable.
export type StaffRole = 'leader' | 'deputy' | 'treasurer' | 'organizer';

export type Permission = 'teaching' | 'answers' | 'schedule' | 'agenda' | 'dates' | 'donations' | 'live' | 'qr' | 'team' | 'memberView';

export const rolePermissions: Record<StaffRole, Permission[]> = {
  leader: ['teaching', 'answers', 'schedule', 'agenda', 'dates', 'donations', 'live', 'qr', 'team', 'memberView'],
  deputy: ['teaching', 'answers', 'schedule', 'agenda', 'dates', 'donations', 'live', 'qr', 'memberView'],
  treasurer: ['donations'],
  organizer: ['schedule', 'agenda', 'dates'],
};

export function can(role: StaffRole, p: Permission): boolean {
  return rolePermissions[role].includes(p);
}

export function roleLabel(role: StaffRole, profile: ReligionProfile): string {
  const leader = profile.leaderTitle.split(' / ')[0];
  switch (role) {
    case 'leader':
      return leader;
    case 'deputy':
      return `${leader} bis`;
    case 'treasurer':
      return 'Trésorier';
    case 'organizer':
      return 'Organisateur';
  }
}

export function roleDescription(role: StaffRole, profile: ReligionProfile): string {
  const leader = profile.leaderTitle.split(' / ')[0].toLowerCase();
  switch (role) {
    case 'leader':
      return 'Tous les droits, dont la gestion des accès.';
    case 'deputy':
      return `Un deuxième ${leader} : enseignements, réponses aux questions, horaires, agenda, dates, dons et live. Idéal pour un secrétaire.`;
    case 'treasurer':
      return 'Uniquement la partie dons : enregistrer les dons, suivre et récupérer les dons, rappels et reçus.';
    case 'organizer':
      return 'Uniquement les horaires, l’agenda et les dates des fidèles.';
  }
}
