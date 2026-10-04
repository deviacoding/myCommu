import { ReligionSeed } from './types';
import { entriesFromHolidays } from './helpers';
import { liturgicalDate } from '../utils/religiousDate';
import { Holiday, Course, Question, AgendaEvent, Pledge, Donation, DonationCategory, DonationCause, SoulLevel, MemberDate, Congregation, UserProfile } from '../types';
import { Member } from '../mocks/members';

const PERE = 'Père Jean-Baptiste Morel';

export const christianUser: UserProfile = {
  id: 'u1',
  name: 'Marie Dupont',
  hebrewName: 'Baptisée le 12 juin 1988',
  email: 'marie.dupont@gmail.com',
  phone: '+33 6 22 41 87 30',
  city: 'Paris 17e',
  community: 'christian',
  synagogue: 'Paroisse Saint-Ferdinand',
  memberSince: '2022-09-04',
  birthDate: '1988-04-15',
  hebrewBirthDate: 'Sainte Marie, 15 août',
};

export const christianMembers: Member[] = [
  { id: 'm1', name: 'Marie Dupont' },
  { id: 'm2', name: 'Pierre Lefebvre' },
  { id: 'm3', name: 'Claire Martin' },
  { id: 'm4', name: 'Antoine Girard' },
  { id: 'm5', name: 'Sophie Nguyen' },
  { id: 'm6', name: 'Paul Okoro' },
  { id: 'm7', name: 'Élise Fontaine' },
  { id: 'm8', name: 'Thomas Rousseau' },
];

export const christianCongregations: Congregation[] = [
  { id: 'stferdinand', name: 'Paroisse Saint-Ferdinand', rite: 'Catholique', city: 'Paris 17e', address: '27 rue d’Armaillé', distance: '300 m', code: 'SF-1517', members: 900, rav: { name: PERE, title: 'Curé de la paroisse' } },
  { id: 'batignolles', name: 'Temple des Batignolles', rite: 'Protestant · Église unie', city: 'Paris 17e', address: '44 boulevard des Batignolles', distance: '1,1 km', code: 'TB-1517', members: 260, rav: { name: 'Pasteure Anne Delacroix', title: 'Pasteure' } },
  { id: 'stalexandre', name: 'Cathédrale Saint-Alexandre-Nevsky', rite: 'Orthodoxe', city: 'Paris 8e', address: '12 rue Daru', distance: '1,9 km', code: 'AN-0325', members: 340, rav: { name: 'Père Alexis Petrov', title: 'Recteur' } },
  { id: 'hillsong', name: 'Église Paris Centre', rite: 'Évangélique', city: 'Paris 10e', address: '18 rue de Paradis', distance: '3,4 km', code: 'EP-0316', members: 520, rav: { name: 'Pasteur David Kouassi', title: 'Pasteur principal' } },
];

export const christianHolidays: Holiday[] = [
  {
    id: 'rentree',
    name: 'Messe de rentrée paroissiale',
    hebrewName: 'Rentrée',
    kind: 'shabbat',
    start: '2026-09-13',
    end: '2026-09-13',
    hebrewDates: '24e dimanche du temps ordinaire',
    times: [
      { label: 'Messe de rentrée', value: '10:30' },
      { label: 'Apéritif paroissial', value: '11:45' },
    ],
  },
  {
    id: 'stfrancois',
    name: 'Saint François d’Assise',
    hebrewName: '4 octobre',
    kind: 'yomtov',
    start: '2026-10-04',
    end: '2026-10-04',
    hebrewDates: '27e dimanche du temps ordinaire',
    times: [
      { label: 'Messe avec bénédiction des animaux', value: '10:30' },
      { label: 'Vêpres', value: '18:00' },
    ],
    notes: ['Bénédiction des animaux sur le parvis après la messe, en souvenir du Poverello.'],
  },
  {
    id: 'rosaire',
    name: 'Notre-Dame du Rosaire',
    hebrewName: '7 octobre',
    kind: 'yomtov',
    start: '2026-10-07',
    end: '2026-10-07',
    hebrewDates: 'Mémoire',
    times: [
      { label: 'Chapelet médité', value: '18:00' },
      { label: 'Messe', value: '18:30' },
    ],
  },
  {
    id: 'toussaint',
    name: 'Toussaint',
    hebrewName: '1er novembre',
    kind: 'yomtov',
    start: '2026-11-01',
    end: '2026-11-02',
    hebrewDates: 'Solennité · Commémoration des défunts (2)',
    times: [
      { label: 'Messe de la Toussaint (1)', value: '10:30' },
      { label: 'Messe des défunts (2)', value: '19:00' },
      { label: 'Bénédiction au cimetière (2)', value: '15:00' },
    ],
    notes: ['Le 2 novembre, les noms des défunts de l’année sont lus pendant la messe.'],
  },
  {
    id: 'christ-roi',
    name: 'Christ Roi de l’univers',
    hebrewName: 'Fin de l’année liturgique',
    kind: 'shabbat',
    start: '2026-11-22',
    end: '2026-11-22',
    hebrewDates: '34e dimanche du temps ordinaire',
    times: [{ label: 'Messe solennelle', value: '10:30' }],
  },
  {
    id: 'avent',
    name: '1er dimanche de l’Avent',
    hebrewName: 'Nouvelle année liturgique (A)',
    kind: 'yomtov',
    start: '2026-11-29',
    end: '2026-11-29',
    hebrewDates: 'Avent',
    times: [
      { label: 'Messe et bénédiction des couronnes', value: '10:30' },
      { label: 'Veillée d’entrée en Avent (28)', value: '20:30' },
    ],
    notes: ['Quatre semaines de préparation à Noël. Première bougie de la couronne.'],
  },
  {
    id: 'immaculee',
    name: 'Immaculée Conception',
    hebrewName: '8 décembre',
    kind: 'yomtov',
    start: '2026-12-08',
    end: '2026-12-08',
    hebrewDates: 'Solennité',
    times: [
      { label: 'Messe', value: '19:00' },
      { label: 'Procession aux flambeaux', value: '20:00' },
    ],
  },
  {
    id: 'noel',
    name: 'Noël',
    hebrewName: 'Nativité du Seigneur',
    kind: 'yomtov',
    start: '2026-12-24',
    end: '2026-12-25',
    hebrewDates: 'Solennité',
    times: [
      { label: 'Veillée et messe de la nuit (24)', value: '22:00' },
      { label: 'Messe du jour (25)', value: '10:30' },
    ],
  },
];

export const christianCourses: Course[] = [
  {
    id: 'homelie-vigne',
    title: 'Les deux fils et la vigne : dire oui avec ses pieds',
    subtitle: 'Homélie du 26e dimanche du temps ordinaire, année A',
    teacher: PERE,
    category: 'Homélie',
    duration: '10 min',
    level: 'Tous niveaux',
    date: '2026-09-27',
    featured: true,
    sections: [
      {
        text: 'Un père demande à ses deux fils d’aller travailler à la vigne. Le premier dit non, puis y va. Le second dit « oui, Seigneur », et n’y va pas. Jésus demande : lequel a fait la volonté du père ? Nous connaissons la réponse. Mais nous savons aussi lequel des deux nous ressemble le plus souvent.',
      },
      {
        heading: 'L’Évangile',
        source: 'Matthieu 21, 28-32',
        text: '« Lequel des deux a fait la volonté du père ? » Ils lui répondent : « Le premier. » Jésus leur dit : « Amen, je vous le déclare : les publicains et les prostituées vous précèdent dans le royaume de Dieu. »',
      },
      {
        heading: 'Le oui des lèvres et le oui des pieds',
        source: 'Jacques 2, 17 ; Matthieu 7, 21',
        text: 'Saint Jacques le dit sans détour : « la foi, si elle n’est pas mise en œuvre, est bel et bien morte ». Et Jésus lui-même : « Ce n’est pas en me disant “Seigneur, Seigneur !” qu’on entrera dans le royaume des Cieux, mais c’est en faisant la volonté de mon Père. » Le premier fils a eu tort de dire non, mais il a eu le courage de se convertir. Le second a eu raison de dire oui, mais son oui n’a pas quitté sa bouche.',
      },
      {
        heading: 'Une bonne nouvelle pour ceux qui ont dit non',
        text: 'Cette parabole console. Elle dit que le passé ne nous enferme pas. Ceux qui ont dit non pendant des années, qui ont quitté l’Église, qui se croient trop loin, peuvent encore aller à la vigne. Le Père ne compte pas les refus : il regarde qui vient.',
      },
      {
        heading: 'Pour la semaine',
        text: '1. Repérer un « oui » que nous avons prononcé et jamais accompli, et le faire.\n2. Ne pas juger celui qui a dit non : il est peut-être déjà à la vigne.\n3. Faire une aumône concrète, avec les pieds et pas seulement avec le cœur.',
      },
    ],
  },
  {
    id: 'homelie-talents',
    title: 'La dîme, les talents et la joie de donner',
    subtitle: 'Pourquoi rendre à Dieu une part de ce qu’il nous confie',
    teacher: PERE,
    category: 'Vie chrétienne',
    duration: '8 min',
    level: 'Tous niveaux',
    date: '2026-09-20',
    sections: [
      {
        source: 'Malachie 3, 10 ; 2 Corinthiens 9, 7',
        text: '« Apportez la dîme tout entière à la maison du trésor… mettez-moi ainsi à l’épreuve, dit le Seigneur, et vous verrez si je n’ouvre pas pour vous les écluses du ciel. » Et saint Paul : « Que chacun donne comme il l’a décidé dans son cœur, sans regret et sans contrainte, car Dieu aime celui qui donne avec joie. »',
      },
      {
        heading: 'Dîme, denier, quête, aumône',
        text: 'La dîme est la part régulière, décidée à l’avance, un dixième dans la tradition biblique, selon ses moyens. Le denier de l’Église fait vivre les prêtres et la paroisse. La quête du dimanche est le geste de la communauté rassemblée. L’aumône est le don au pauvre, en personne, qui ne se calcule pas.',
      },
      {
        heading: 'Pour la semaine',
        text: 'Décider une fois d’un montant régulier, plutôt que de donner « ce qui reste ». Et ne jamais laisser une aumône attendre : le pauvre, lui, n’attend pas.',
      },
    ],
  },
];

export const christianQuestions: Question[] = [
  {
    id: 'cq1',
    subject: 'Peut-on faire baptiser notre enfant si nous ne sommes pas mariés à l’église ?',
    category: 'Sacrements',
    status: 'pending',
    askedBy: 'Sophie Nguyen',
    date: '2026-09-28',
    messages: [{ id: 'cq1-m1', author: 'member', name: 'Sophie Nguyen', date: '2026-09-28', text: 'Nous sommes mariés civilement seulement. Notre fille a six mois. Le baptême est-il possible, et que devons-nous préparer ?' }],
  },
  {
    id: 'cq2',
    subject: 'La dîme se calcule-t-elle sur le brut ou sur le net ?',
    category: 'Dîme',
    status: 'answered',
    askedBy: 'Marie Dupont',
    date: '2026-09-22',
    messages: [
      { id: 'cq2-m1', author: 'member', name: 'Marie Dupont', date: '2026-09-22', text: 'Je souhaite donner régulièrement à la paroisse. Faut-il compter 10 % du salaire brut ou du net ? Est-ce une obligation ?' },
      {
        id: 'cq2-m2',
        author: 'rav',
        name: PERE,
        date: '2026-09-23',
        text: 'Merci Marie pour ce désir de générosité. L’Église catholique ne fixe pas de pourcentage obligatoire : le précepte demande de « subvenir aux besoins matériels de l’Église, chacun selon ses possibilités » (Catéchisme, 2043). La dîme biblique, un dixième, reste un repère inspirant, calculé sur ce qui entre réellement dans votre foyer, donc le net. Beaucoup la répartissent entre le denier, la quête et les œuvres. Commencez par un montant tenable, et surtout régulier : la fidélité vaut plus que la somme.',
        sources: ['Catéchisme de l’Église catholique, 2043', 'Malachie 3, 10', '2 Corinthiens 9, 7', 'Code de droit canonique, can. 222'],
      },
    ],
  },
  {
    id: 'cq3',
    subject: 'Comment faire dire une messe pour un défunt ?',
    category: 'Deuil',
    status: 'answered',
    askedBy: 'Anonyme',
    anonymous: true,
    date: '2026-09-15',
    messages: [
      { id: 'cq3-m1', author: 'member', name: 'Anonyme', date: '2026-09-15', text: 'Mon père est décédé il y a un an. Puis-je faire célébrer une messe à son intention, et comment ?' },
      {
        id: 'cq3-m2',
        author: 'rav',
        name: PERE,
        date: '2026-09-15',
        text: 'Bien sûr, et c’est une belle façon de l’accompagner. Passez à l’accueil ou notez l’intention dans l’application, rubrique Dons → Intention de messe : nous fixons ensemble la date, souvent la messe anniversaire. L’offrande indicative est de 18 € en France ; elle n’est jamais une condition. Le nom de votre père sera cité à la prière universelle. Je prie déjà pour lui.',
        sources: ['Catéchisme de l’Église catholique, 1032 et 1371', 'Code de droit canonique, can. 945-958'],
      },
    ],
  },
];

export const christianAgenda: AgendaEvent[] = [
  { id: 'ca1', title: 'Catéchisme : rentrée des enfants', date: '2026-09-30', time: '17:00', place: 'Salle paroissiale', category: 'cours' },
  { id: 'ca2', title: 'Adoration eucharistique', date: '2026-10-01', time: '20:00', place: 'Église', category: 'office', description: 'Une heure devant le Saint-Sacrement, confessions possibles.' },
  { id: 'ca3', title: 'Messe de la Saint-François et bénédiction des animaux', date: '2026-10-04', time: '10:30', place: 'Église puis parvis', category: 'fete' },
  { id: 'ca4', title: 'Groupe de préparation au mariage', date: '2026-10-06', time: '20:30', place: 'Presbytère', category: 'cours' },
  { id: 'ca5', title: 'Repas paroissial de la Saint-Luc', date: '2026-10-18', time: '12:00', place: 'Salle paroissiale', category: 'communaute', description: 'Au profit des travaux du clocher. Réservation à l’accueil.' },
  { id: 'ca6', title: 'Concert d’orgue', date: '2026-10-25', time: '16:00', place: 'Église', category: 'communaute' },
  { id: 'ca7', title: 'Messe de la Toussaint', date: '2026-11-01', time: '10:30', place: 'Église', category: 'office' },
];

export const christianCategories: DonationCategory[] = [
  {
    id: 'messes',
    name: 'Messes',
    icon: 'church',
    items: [
      { id: 'me1', name: 'Intention de messe', amount: 18 },
      { id: 'me2', name: 'Messe anniversaire d’un défunt', amount: 18 },
      { id: 'me3', name: 'Neuvaine de messes', amount: 180 },
    ],
  },
  {
    id: 'sacrements',
    name: 'Sacrements',
    icon: 'water',
    items: [
      { id: 's1', name: 'Offrande de baptême', amount: 50 },
      { id: 's2', name: 'Offrande de mariage', amount: 300 },
      { id: 's3', name: 'Offrande de funérailles', amount: 200 },
      { id: 's4', name: 'Première communion', amount: 30 },
    ],
  },
  {
    id: 'denier',
    name: 'Denier et quête',
    icon: 'hand-coin',
    items: [
      { id: 'd1', name: 'Denier de l’Église (annuel)', amount: 250 },
      { id: 'd2', name: 'Quête dominicale', amount: 5 },
      { id: 'd3', name: 'Quête impérée (missions)', amount: 20 },
    ],
  },
  {
    id: 'eglise',
    name: 'Vie de la paroisse',
    icon: 'candle',
    items: [
      { id: 'e1', name: 'Cierges et fleurs', amount: 10 },
      { id: 'e2', name: 'Travaux du clocher', amount: 100 },
      { id: 'e3', name: 'Chauffage de l’église', amount: 40 },
    ],
  },
];

export const christianCauses: DonationCause[] = [
  { id: 'aumone', name: 'Aumône pour les pauvres', description: 'Secours catholique et conférence Saint-Vincent-de-Paul de la paroisse : colis, loyers, accueil.', icon: 'hand-heart' },
  { id: 'entretien', name: 'Entretien de l’église', description: 'Chauffage, électricité, toiture, orgue : faire vivre le lieu au quotidien.', icon: 'church' },
  { id: 'denier', name: 'Denier de l’Église', description: 'Rémunération des prêtres et des laïcs en mission, une fois par an.', icon: 'hand-coin' },
  { id: 'cate', name: 'Catéchisme et aumônerie', description: 'Livres, sorties et camps pour les enfants et les jeunes.', icon: 'book-open-variant' },
  { id: 'messes', name: 'Intentions de messe', description: 'Faire célébrer une messe pour un défunt, un malade, une action de grâce.', icon: 'candle' },
  { id: 'missions', name: 'Missions et solidarité', description: 'Œuvres pontificales missionnaires, CCFD, paroisses jumelées.', icon: 'earth' },
];

export const christianPledges: Pledge[] = [
  { id: 'cp1', member: 'Marie Dupont', category: 'Denier et quête', label: 'Denier de l’Église (annuel)', amount: 250, dueDate: '2026-12-15', origin: 'Campagne du denier 2026', status: 'due', note: 'Préfère un prélèvement en décembre.' },
  { id: 'cp2', member: 'Marie Dupont', category: 'Messes', label: 'Messe anniversaire d’un défunt', amount: 18, dueDate: '2026-10-12', origin: 'Pour son père, messe du 12 octobre', status: 'due' },
  { id: 'cp3', member: 'Pierre Lefebvre', category: 'Sacrements', label: 'Offrande de baptême', amount: 50, dueDate: '2026-10-11', origin: 'Baptême de Louis, 11 octobre', status: 'due' },
  { id: 'cp4', member: 'Antoine Girard', category: 'Vie de la paroisse', label: 'Travaux du clocher', amount: 100, dueDate: '2026-10-18', origin: 'Promesse faite au repas paroissial', status: 'due' },
  { id: 'cp5', member: 'Marie Dupont', category: 'Denier et quête', label: 'Quête dominicale', amount: 5, dueDate: '2026-09-27', origin: 'Dimanche 27 septembre', status: 'paid' },
];

export const christianDonations: Donation[] = [
  { id: 'cd1', type: 'engagement', amount: 5, cause: 'Quête dominicale', date: '2026-09-27' },
  { id: 'cd2', type: 'tsedaka', amount: 30, cause: 'Aumône pour les pauvres', date: '2026-09-18', dedication: 'Pour les familles du quartier' },
  { id: 'cd3', type: 'maasser', amount: 180, cause: 'Entretien de l’église', date: '2026-09-05', dedication: 'Dîme de septembre' },
  { id: 'cd4', type: 'maasser', amount: 180, cause: 'Entretien de l’église', date: '2026-08-05', dedication: 'Dîme d’août' },
  { id: 'cd5', type: 'tsedaka', amount: 18, cause: 'Intentions de messe', date: '2026-07-12', dedication: 'Pour Jacques, mon père' },
];

// Parabole des talents (Matthieu 25) et images évangéliques de la croissance.
export const christianLevels: SoulLevel[] = [
  { id: 'graine', name: 'Graine de sénevé', hebrew: 'Mt 13, 31', min: 0, description: 'La plus petite des graines. Votre flamme s’allume.' },
  { id: 'sarment', name: 'Sarment', hebrew: 'Jn 15, 5', min: 100, description: 'Attaché à la vigne, vous portez du fruit.' },
  { id: 'lampe', name: 'Lampe sur le lampadaire', hebrew: 'Mt 5, 15', min: 300, description: 'Votre lumière éclaire ceux de la maison.' },
  { id: 'sel', name: 'Sel de la terre', hebrew: 'Mt 5, 13', min: 900, description: 'Vous donnez du goût à la communauté.' },
  { id: 'serviteur', name: 'Bon et fidèle serviteur', hebrew: 'Mt 25, 21', min: 2500, description: 'Les talents reçus ont été multipliés.' },
];

export const christianMemberDates: MemberDate[] = [
  { id: 'cmd1', member: 'Marie Dupont', type: 'anniversaire', label: 'Anniversaire de Marie', date: '2026-04-15', hebrewDate: 'Fête : 15 août' },
  { id: 'cmd2', member: 'Marie Dupont', type: 'azkara', label: 'Anniversaire du décès de son père, Jacques', date: '2026-10-12', note: 'Messe anniversaire demandée le 12 octobre.' },
  { id: 'cmd3', member: 'Marie Dupont', type: 'autre', label: 'Anniversaire de baptême', date: '2026-06-12' },
  { id: 'cmd4', member: 'Pierre Lefebvre', type: 'autre', label: 'Baptême de Louis', date: '2026-10-11' },
  { id: 'cmd5', member: 'Claire Martin', type: 'anniversaire', label: 'Anniversaire de Claire', date: '2026-09-30' },
  { id: 'cmd6', member: 'Sophie Nguyen', type: 'autre', label: 'Anniversaire de mariage', date: '2026-10-20' },
  { id: 'cmd7', member: 'Paul Okoro', type: 'azkara', label: 'Anniversaire du décès de sa mère', date: '2026-11-03' },
];

export const christianSeed: Omit<ReligionSeed, 'currents' | 'groups'> = {
  leaderShort: 'Père',
  memberLabel: 'paroissien',
  teachingLabel: 'Homélie',
  teachingPlural: 'Homélies et méditations',
  teachingShareTitle: 'Partager une homélie',
  teachingLatestTitle: 'Dernière homélie',
  teachingPreviousTitle: 'Homélies précédentes',
  teachingSubtitle: (n) => `Homélies et méditations de ${n}`,
  questionTitle: 'Questions au prêtre',
  questionCategories: ['Sacrements', 'Liturgie', 'Dîme', 'Famille', 'Deuil', 'Foi', 'Autre'],
  sourceShortcuts: ['Évangile selon saint Matthieu', 'Évangile selon saint Jean', 'Saint Paul', 'Catéchisme de l’Église catholique', 'Code de droit canonique', 'Saint Augustin', 'Saint Thomas d’Aquin', 'Concile Vatican II'],
  themes: ['Homélie', 'Évangile du jour', 'Vie chrétienne', 'Sacrements', 'Saints', 'Prière'],
  scheduleTitle: 'Horaires des messes',
  seasonTitle: 'Temps ordinaire · année A',
  scheduleSource: 'calendrier liturgique',
  scheduleFetchLabel: 'Récupérer le calendrier liturgique de mon diocèse',
  scheduleQuickNames: ['Messe', 'Vêpres', 'Confessions', 'Adoration', 'Chapelet', 'Catéchisme', 'Baptême', 'Mariage'],
  serviceColumns: ['Semaine', 'Dimanche'],
  serviceSecondColumnDay: 0,
  quietMode: { label: 'Mode dimanche', hint: 'Aucune notification pendant les messes du dimanche' },
  religiousDate: liturgicalDate,
  dateTypeLabels: { anniversaire: 'Anniversaire', azkara: 'Anniversaire de décès', autre: 'Sacrement / autre' },
  memberDatesTitle: 'Dates des paroissiens',
  nextHolidayLabel: 'PROCHAINE FÊTE',
  birthdayAction: 'Envoyer un bon anniversaire',
  azkaraAction: 'Proposer une messe anniversaire',
  receiptFormats: ['cerfa'],
  currency: '€',
  tithe: {
    name: 'Dîme',
    rate: 0.1,
    mode: 'income',
    hint: 'Un dixième de ses revenus, selon la tradition biblique, réparti entre denier, quête et œuvres.',
    incomeLabel: 'Revenu net du mois',
    deductions: [
      { key: 'school', label: 'École catholique', icon: 'school-outline' },
      { key: 'talmudTorah', label: 'Catéchisme et aumônerie', icon: 'book-outline' },
      { key: 'other', label: 'Autres frais', icon: 'add-circle-outline' },
    ],
    period: 'ce mois',
    source: '« Apportez la dîme tout entière à la maison du trésor » (Malachie 3, 10).',
    advice: 'L’Église ne fixe pas de pourcentage obligatoire (Catéchisme 2043) : la dîme est un repère, à adapter à ses moyens. La régularité compte plus que la somme. La déduction des frais de scolarité est une pratique courante, pas une règle.',
  },
  alms: {
    name: 'Aumône',
    title: 'Faire l’aumône',
    quote: '« Quand tu fais l’aumône, que ta main gauche ignore ce que fait ta main droite » (Matthieu 6, 3).',
    amounts: [2, 5, 10, 20, 50],
    amountLabels: { 2: 'l’obole de la veuve', 5: 'la quête', 10: 'un repas', 20: 'un colis', 50: 'une semaine' },
    amountsNote: 'L’obole de la veuve valait plus que tous les autres dons (Marc 12, 41-44).',
  },
  causes: christianCauses,
  categories: christianCategories,
  pendingLabel: 'À régler',
  gamification: {
    name: 'flamme',
    title: 'MA FLAMME',
    icon: 'greek-cross',
    levels: christianLevels,
    growHint: 'Votre flamme grandit à chaque aumône, chaque homélie lue et chaque question posée.',
    ctaLabel: 'Faire grandir ma flamme',
  },
  user: christianUser,
  members: christianMembers,
  congregations: christianCongregations,
  defaultCongregation: 'stferdinand',
  courses: christianCourses,
  questions: christianQuestions,
  holidays: christianHolidays,
  services: [
    { name: 'Laudes', weekday: '08:00', shabbat: '08:30' },
    { name: 'Messe', weekday: '09:00', shabbat: '10:30' },
    { name: 'Confessions', weekday: '17:00', shabbat: '—' },
    { name: 'Vêpres', weekday: '18:00', shabbat: '18:00' },
    { name: 'Messe du soir', weekday: '19:00', shabbat: '19:00' },
  ],
  agenda: christianAgenda,
  dayEntries: entriesFromHolidays(christianHolidays),
  pledges: christianPledges,
  donations: christianDonations,
  memberDates: christianMemberDates,
};
