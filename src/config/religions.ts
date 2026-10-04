import { CommunityId } from '../types';

// Profil par confession : vocabulaire et particularités que l'application adapte.
// La logique (contenus, questions, horaires, dons, dates, live) est commune ; seuls ces libellés et
// ces paramètres changent. Voir docs/MULTI-CONFESSIONS.md pour le modèle de données complet.
export interface ReligionProfile {
  id: CommunityId;
  label: string; // « Juif », « Musulman »…
  communityLabel: string; // « Communauté juive »
  placeLabel: string; // synagogue, mosquée, église, temple
  leaderTitle: string; // rabbin, imam, prêtre, moine
  leaderAccess: string; // « Accès rabbin »
  teachingLabel: string; // dvar Torah, khutba, homélie, enseignement du Dharma
  teachingPlural: string;
  questionLabel: string; // « Questions au Rav »
  scheduleLabel: string; // horaires des offices / des prières / des messes / des séances
  scheduleSource: string; // CalJ, Aladhan, calendrier liturgique, calendrier lunaire
  donationLabel: string; // dons / zakat & sadaqa / dîme & offrandes / dana
  tithe: { name: string; rate: number; hint: string } | null; // maasser 10 %, zakat 2,5 %, dîme 10 %, dana libre
  currency: string;
  calendar: string; // hébraïque, hégirien, liturgique, lunaire
  icon: string; // MaterialCommunityIcons, ou 'greek-cross' (croix à bras égaux, voir components/ReligionIcon)
  ready: boolean; // contenus de démo disponibles
}

export const religions: Record<CommunityId, ReligionProfile> = {
  jewish: {
    id: 'jewish',
    label: 'Juif',
    communityLabel: 'Communauté juive',
    placeLabel: 'Synagogue',
    leaderTitle: 'Rabbin',
    leaderAccess: 'Accès rabbin',
    teachingLabel: 'Dvar Torah',
    teachingPlural: 'Divré Torah',
    questionLabel: 'Questions au Rav',
    scheduleLabel: 'Horaires des offices et des fêtes',
    scheduleSource: 'CalJ',
    donationLabel: 'Dons, tsedaka et maasser',
    tithe: { name: 'Maasser', rate: 0.1, hint: 'Un dixième du revenu net' },
    currency: '₪',
    calendar: 'Calendrier hébraïque',
    icon: 'star-david',
    ready: true,
  },
  muslim: {
    id: 'muslim',
    label: 'Musulman',
    communityLabel: 'Communauté musulmane',
    placeLabel: 'Mosquée',
    leaderTitle: 'Imam',
    leaderAccess: 'Accès imam',
    teachingLabel: 'Khutba',
    teachingPlural: 'Khutbas et rappels',
    questionLabel: 'Questions à l’imam',
    scheduleLabel: 'Horaires des cinq prières et du vendredi',
    scheduleSource: 'Aladhan / Mawaqit',
    donationLabel: 'Zakat et sadaqa',
    tithe: { name: 'Zakat', rate: 0.025, hint: '2,5 % de l’épargne au-delà du nisab, une fois par an' },
    currency: '€',
    calendar: 'Calendrier hégirien',
    icon: 'star-crescent',
    ready: false,
  },
  christian: {
    id: 'christian',
    label: 'Chrétien',
    communityLabel: 'Communauté chrétienne',
    placeLabel: 'Église',
    leaderTitle: 'Prêtre / Pasteur',
    leaderAccess: 'Accès prêtre',
    teachingLabel: 'Homélie',
    teachingPlural: 'Homélies et méditations',
    questionLabel: 'Questions au prêtre',
    scheduleLabel: 'Horaires des messes et des célébrations',
    scheduleSource: 'Calendrier liturgique',
    donationLabel: 'Dîme et offrandes',
    tithe: { name: 'Dîme', rate: 0.1, hint: 'Un dixième des revenus, selon la tradition' },
    currency: '€',
    calendar: 'Calendrier liturgique',
    icon: 'greek-cross',
    ready: false,
  },
  buddhist: {
    id: 'buddhist',
    label: 'Bouddhiste',
    communityLabel: 'Communauté bouddhiste',
    placeLabel: 'Temple / Centre',
    leaderTitle: 'Moine / Enseignant',
    leaderAccess: 'Accès enseignant',
    teachingLabel: 'Enseignement du Dharma',
    teachingPlural: 'Enseignements',
    questionLabel: 'Questions à l’enseignant',
    scheduleLabel: 'Séances de méditation et cérémonies',
    scheduleSource: 'Calendrier lunaire (uposatha)',
    donationLabel: 'Dana (générosité)',
    tithe: null,
    currency: '€',
    calendar: 'Calendrier lunaire',
    icon: 'meditation',
    ready: false,
  },
};
