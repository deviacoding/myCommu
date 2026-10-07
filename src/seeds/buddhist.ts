import { ReligionSeed } from './types';
import { entriesFromHolidays, communityDemoDonations } from './helpers';
import { lunarDate } from '../utils/religiousDate';
import { Holiday, Course, Question, AgendaEvent, Pledge, Donation, DonationCategory, DonationCause, SoulLevel, MemberDate, Congregation, UserProfile } from '../types';
import { Member } from '../mocks/members';

const VEN = 'Vénérable Dhammika';

export const buddhistUser: UserProfile = {
  id: 'u1',
  name: 'Julien Moreau',
  hebrewName: 'Refuge pris le 26 mai 2021',
  email: 'julien.moreau@gmail.com',
  phone: '+33 6 78 90 12 34',
  city: 'Paris 13e',
  community: 'buddhist',
  synagogue: 'Pagode Khanh-Anh',
  memberSince: '2021-05-26',
  birthDate: '1992-11-08',
  hebrewBirthDate: 'Année du Singe',
};

export const buddhistMembers: Member[] = [
  { id: 'm1', name: 'Julien Moreau' },
  { id: 'm2', name: 'Linh Tran' },
  { id: 'm3', name: 'Camille Bernard' },
  { id: 'm4', name: 'Sopheap Chea' },
  { id: 'm5', name: 'Nicolas Petit' },
  { id: 'm6', name: 'Mai Nguyen' },
  { id: 'm7', name: 'Tenzin Dolma' },
  { id: 'm8', name: 'Hugo Laurent' },
];

export const buddhistCongregations: Congregation[] = [
  { id: 'khanhanh', name: 'Pagode Khanh-Anh', rite: 'Theravada · tradition vietnamienne', city: 'Évry', address: '8 rue François-Mauriac', distance: '600 m', code: 'KA-2564', members: 380, rav: { name: VEN, title: 'Moine résident' } },
  { id: 'dojo', name: 'Dojo Zen de Paris', rite: 'Zen Sōtō', city: 'Paris 13e', address: '175 rue de Tolbiac', distance: '1,4 km', code: 'DZ-1967', members: 210, rav: { name: 'Maître Jōshin Sensei', title: 'Enseignante zen' } },
  { id: 'kagyu', name: 'Centre Kagyu-Dzong', rite: 'Tibétain · Kagyu', city: 'Paris 12e', address: '40 route circulaire du Lac Daumesnil', distance: '2,8 km', code: 'KD-1974', members: 320, rav: { name: 'Lama Tenzin Wangyal', title: 'Lama résident' } },
];

// Nouvelle lune 11 septembre 2026 ; pleines lunes 26 septembre et 26 octobre 2026 (Pavāraṇā, fin de la retraite des pluies).
export const buddhistHolidays: Holiday[] = [
  {
    id: 'uposatha-sept',
    name: 'Uposatha de pleine lune',
    hebrewName: 'Pleine lune de septembre',
    kind: 'shabbat',
    start: '2026-09-26',
    end: '2026-09-26',
    hebrewDates: '15e jour lunaire',
    times: [
      { label: 'Prise des huit préceptes', value: '07:00' },
      { label: 'Méditation assise et marchée', value: '09:00' },
      { label: 'Enseignement du Dharma', value: '14:00' },
      { label: 'Récitation du soir', value: '18:30' },
    ],
    notes: ['Jour d’observance : les laïcs peuvent prendre les huit préceptes pour la journée (AN 8.41).'],
  },
  {
    id: 'uposatha-oct-nm',
    name: 'Uposatha de nouvelle lune',
    hebrewName: 'Nouvelle lune d’octobre',
    kind: 'shabbat',
    start: '2026-10-10',
    end: '2026-10-10',
    hebrewDates: '1er jour lunaire',
    times: [
      { label: 'Méditation assise', value: '07:00' },
      { label: 'Enseignement', value: '10:30' },
    ],
  },
  {
    id: 'pavarana',
    name: 'Pavāraṇā, fin de la retraite des pluies',
    hebrewName: 'Vassa',
    kind: 'yomtov',
    start: '2026-10-26',
    end: '2026-10-26',
    hebrewDates: 'Pleine lune d’octobre',
    times: [
      { label: 'Cérémonie de Pavāraṇā', value: '09:00' },
      { label: 'Offrande de nourriture aux moines', value: '11:00' },
      { label: 'Circumambulation aux bougies', value: '19:00' },
    ],
    notes: ['Les moines terminent trois mois de retraite (vassa) et s’invitent mutuellement à recevoir des remarques.'],
  },
  {
    id: 'kathina',
    name: 'Kathina, offrande des robes',
    hebrewName: 'Kaṭhina',
    kind: 'yomtov',
    start: '2026-11-08',
    end: '2026-11-08',
    hebrewDates: 'Dans le mois qui suit Pavāraṇā',
    times: [
      { label: 'Procession des robes', value: '10:00' },
      { label: 'Offrande de la robe de Kathina', value: '11:00' },
      { label: 'Repas partagé', value: '12:30' },
    ],
    notes: ['La plus grande cérémonie de dana de l’année : la communauté offre les robes et le nécessaire aux moines.'],
  },
  {
    id: 'sesshin',
    name: 'Sesshin d’automne',
    hebrewName: 'Retraite intensive',
    kind: 'holhamoed',
    start: '2026-11-20',
    end: '2026-11-22',
    hebrewDates: '3 jours',
    times: [
      { label: 'Premier zazen (20)', value: '06:30' },
      { label: 'Teishō (enseignement) (21)', value: '10:30' },
      { label: 'Cérémonie de clôture (22)', value: '16:00' },
    ],
  },
  {
    id: 'bodhi',
    name: 'Jour de l’Éveil (Bodhi)',
    hebrewName: 'Rōhatsu',
    kind: 'yomtov',
    start: '2026-12-08',
    end: '2026-12-08',
    hebrewDates: '8 décembre',
    times: [
      { label: 'Nuit de méditation (7 au 8)', value: '21:00' },
      { label: 'Cérémonie de l’Éveil', value: '07:00' },
    ],
  },
  {
    id: 'vesak',
    name: 'Vesak',
    hebrewName: 'Naissance, Éveil et parinirvāṇa du Bouddha',
    kind: 'yomtov',
    start: '2027-05-20',
    end: '2027-05-20',
    hebrewDates: 'Pleine lune de mai',
    times: [
      { label: 'Bain du Bouddha', value: '09:00' },
      { label: 'Enseignement et repas', value: '11:00' },
      { label: 'Lâcher de lanternes', value: '20:30' },
    ],
  },
];

export const buddhistCourses: Course[] = [
  {
    id: 'dharma-metta',
    title: 'Mettā : la bienveillance sans frontière',
    subtitle: 'Enseignement de la pleine lune sur le Karaṇīya Mettā Sutta',
    teacher: VEN,
    category: 'Sutta',
    duration: '12 min',
    level: 'Tous niveaux',
    date: '2026-09-26',
    featured: true,
    sections: [
      {
        text: 'Le Bouddha n’a pas demandé à ses disciples de croire en la bienveillance : il leur a demandé de la cultiver, comme on cultive un champ. Le Mettā Sutta est un manuel de culture. Il commence par une condition, et finit par un vœu.',
      },
      {
        heading: 'Le texte',
        source: 'Karaṇīya Mettā Sutta, Sutta Nipāta 1.8',
        text: '« Comme une mère protégerait son enfant unique au péril de sa vie, ainsi, envers tous les êtres, cultivons un cœur sans limite. Que tous les êtres soient heureux et en sécurité, que tous les êtres soient heureux dans leur cœur. »',
      },
      {
        heading: 'La condition : être droit et simple',
        text: 'Avant de parler d’amour universel, le sutta décrit celui qui le pratique : « capable, droit, honnête, doux dans ses paroles, humble, content de peu, avec peu d’obligations ». La bienveillance n’est pas un sentiment que l’on ajoute à une vie compliquée ; elle pousse dans une vie simplifiée.',
      },
      {
        heading: 'La pratique',
        source: 'Visuddhimagga IX ; AN 11.15',
        text: 'On commence par soi-même, puis un bienfaiteur, puis un ami, une personne neutre, une personne difficile, et enfin tous les êtres, dans les dix directions. Le Bouddha énumère onze bienfaits pour qui pratique mettā, dont un sommeil paisible, un visage serein et l’amitié des êtres humains et non humains.',
      },
      {
        heading: 'À emporter avec soi',
        text: '1. Trois minutes de mettā chaque matin, en commençant par soi.\n2. Un dana cette semaine pour quelqu’un que l’on ne connaît pas.\n3. Sur le chemin du travail, souhaiter silencieusement le bonheur à trois inconnus.',
      },
    ],
  },
  {
    id: 'dharma-dana',
    title: 'Dāna : la première des perfections',
    subtitle: 'Pourquoi le chemin commence par le don',
    teacher: VEN,
    category: 'Éthique',
    duration: '8 min',
    level: 'Débutant',
    date: '2026-09-19',
    sections: [
      {
        source: 'Dāna Sutta, AN 7.49 ; Dhammapada 177',
        text: '« Les avares ne vont pas au monde des dieux ; les sots ne louent pas la générosité. Mais le sage se réjouit du don et trouve ainsi le bonheur dans l’au-delà » (Dhammapada 177). Dāna est la première des dix pāramitās : sans elle, ni l’éthique ni la sagesse ne prennent racine.',
      },
      {
        heading: 'Trois façons de donner',
        text: 'Le Bouddha distingue le don fait avec attachement, le don fait par devoir, et le don fait « pour orner et parer l’esprit » (AN 7.49). Ce dernier ne cherche ni récompense ni reconnaissance : il purifie celui qui donne. Donner de la nourriture aux moines, du temps au temple, de l’attention à un proche : la forme importe moins que l’esprit.',
      },
      {
        heading: 'Pour la semaine',
        text: 'Choisir un don que personne ne saura, et observer ce que fait l’esprit quand il ne peut rien attendre en retour.',
      },
    ],
  },
];

export const buddhistQuestions: Question[] = [
  {
    id: 'bq1',
    subject: 'Comment continuer à méditer quand l’esprit est agité par le deuil ?',
    category: 'Méditation',
    status: 'pending',
    askedBy: 'Camille Bernard',
    date: '2026-09-28',
    messages: [{ id: 'bq1-m1', author: 'member', name: 'Camille Bernard', date: '2026-09-28', text: 'J’ai perdu ma mère il y a trois semaines. Dès que je m’assieds, les pensées et les larmes reviennent. Faut-il arrêter de méditer un temps ?' }],
  },
  {
    id: 'bq2',
    subject: 'Y a-t-il un montant attendu pour le dana ?',
    category: 'Dāna',
    status: 'answered',
    askedBy: 'Julien Moreau',
    date: '2026-09-22',
    messages: [
      { id: 'bq2-m1', author: 'member', name: 'Julien Moreau', date: '2026-09-22', text: 'Dans d’autres traditions il y a une dîme. Existe-t-il un pourcentage recommandé pour le dana au temple ?' },
      {
        id: 'bq2-m2',
        author: 'rav',
        name: VEN,
        date: '2026-09-23',
        text: 'Non, et c’est volontaire. Le dana n’a de valeur que s’il est libre : le Bouddha loue le don « fait avec un esprit confiant, sans regret avant, pendant ni après » (AN 6.37). Un pourcentage transformerait le don en taxe. Donnez ce qui vous laisse le cœur léger, régulièrement si vous le pouvez, et tournez plutôt votre attention vers l’intention au moment de donner. Le temple vit entièrement de dana, et il vit bien.',
        sources: ['Aṅguttara Nikāya 6.37', 'Dhammapada 177', 'Dāna Sutta, AN 7.49'],
      },
    ],
  },
  {
    id: 'bq3',
    subject: 'Quel rituel pour un défunt, et pourquoi 49 jours ?',
    category: 'Cérémonies',
    status: 'answered',
    askedBy: 'Anonyme',
    anonymous: true,
    date: '2026-09-15',
    messages: [
      { id: 'bq3-m1', author: 'member', name: 'Anonyme', date: '2026-09-15', text: 'Mon grand-père est décédé. Ma famille parle d’une cérémonie au 49e jour. Que se passe-t-il pendant ces 49 jours ?' },
      {
        id: 'bq3-m2',
        author: 'rav',
        name: VEN,
        date: '2026-09-15',
        text: 'Dans les traditions mahāyāna d’Asie de l’Est, on considère que la conscience traverse un état intermédiaire pouvant durer jusqu’à quarante-neuf jours avant une nouvelle naissance. La famille récite des sutras chaque septième jour et dédie les mérites au défunt, avec une cérémonie plus importante au 49e jour. Dans la tradition theravada, on offre plutôt un repas aux moines au 7e jour, puis à l’anniversaire. Ce qui compte dans les deux cas : la générosité et la récitation faites en son nom. Nous pouvons organiser la cérémonie à la pagode ; notez la date dans l’application.',
        sources: ['Tirokuḍḍa Sutta, Khp 7', 'Abhidharmakośa III', 'Sutra de Kṣitigarbha, ch. 7'],
      },
    ],
  },
];

export const buddhistAgenda: AgendaEvent[] = [
  { id: 'ba1', title: 'Méditation guidée pour débutants', date: '2026-09-29', time: '19:30', place: 'Salle de méditation', category: 'cours', description: 'Posture, souffle, mettā. Coussins fournis.' },
  { id: 'ba2', title: 'Récitation du Sutra du Cœur', date: '2026-09-30', time: '18:30', place: 'Grande salle', category: 'office' },
  { id: 'ba3', title: 'Journée de pratique (mini-retraite)', date: '2026-10-04', time: '08:00', place: 'Pagode', category: 'fete', description: 'Zazen, marche, repas en silence, enseignement. Dana libre.' },
  { id: 'ba4', title: 'Cours de Dharma : les quatre nobles vérités', date: '2026-10-06', time: '20:00', place: 'Salle d’étude', category: 'cours' },
  { id: 'ba5', title: 'Uposatha de nouvelle lune', date: '2026-10-10', time: '07:00', place: 'Pagode', category: 'office' },
  { id: 'ba6', title: 'Cérémonie de Pavāraṇā et offrande aux moines', date: '2026-10-26', time: '09:00', place: 'Pagode', category: 'fete' },
  { id: 'ba7', title: 'Kathina : offrande des robes', date: '2026-11-08', time: '10:00', place: 'Pagode', category: 'fete', description: 'Apportez les offrandes (robes, nécessaire) ou participez au dana collectif.' },
];

export const buddhistCategories: DonationCategory[] = [
  {
    id: 'ceremonies',
    name: 'Cérémonies',
    icon: 'candle',
    items: [
      { id: 'c1', name: 'Cérémonie du 49e jour', amount: 108 },
      { id: 'c2', name: 'Dédicace de mérites (anniversaire de décès)', amount: 50 },
      { id: 'c3', name: 'Bénédiction de mariage', amount: 200 },
      { id: 'c4', name: 'Prise de refuge', amount: 30 },
    ],
  },
  {
    id: 'retraites',
    name: 'Retraites',
    icon: 'meditation',
    items: [
      { id: 'r1', name: 'Journée de pratique', amount: 25 },
      { id: 'r2', name: 'Sesshin de 3 jours', amount: 120 },
      { id: 'r3', name: 'Bourse de retraite pour un pratiquant', amount: 120 },
    ],
  },
  {
    id: 'temple',
    name: 'Temple',
    icon: 'home-heart',
    items: [
      { id: 't1', name: 'Cotisation annuelle', amount: 100 },
      { id: 't2', name: 'Coussins et tatamis', amount: 40 },
      { id: 't3', name: 'Toiture de la pagode', amount: 150 },
    ],
  },
  {
    id: 'offrandes',
    name: 'Offrandes',
    icon: 'flower-lotus',
    items: [
      { id: 'o1', name: 'Repas des moines (un jour)', amount: 60 },
      { id: 'o2', name: 'Encens, fleurs et lampes', amount: 10 },
      { id: 'o3', name: 'Robe de Kathina', amount: 80 },
    ],
  },
];

export const buddhistCauses: DonationCause[] = [
  { id: 'moines', name: 'Nourriture et soins des moines', description: 'Les moines ne possèdent rien : la communauté pourvoit aux repas, aux robes et aux soins.', icon: 'bowl-mix' },
  { id: 'temple', name: 'Entretien du temple', description: 'Chauffage, toiture, salle de méditation : faire vivre le lieu au quotidien.', icon: 'home-heart' },
  { id: 'retraites', name: 'Bourses de retraite', description: 'Permettre à ceux qui n’en ont pas les moyens de participer aux retraites.', icon: 'meditation' },
  { id: 'dharma', name: 'Publications du Dharma', description: 'Traduction et impression des textes, distribués gratuitement.', icon: 'book-open-variant' },
  { id: 'aide', name: 'Aide aux pratiquants en difficulté', description: 'Fonds de solidarité discret pour les membres de la sangha.', icon: 'hand-heart' },
  { id: 'animaux', name: 'Libération et protection des animaux', description: 'Refuges et soins, dans l’esprit de la non-violence (ahiṃsā).', icon: 'paw' },
];

export const buddhistPledges: Pledge[] = [
  { id: 'bp1', member: 'Julien Moreau', category: 'Temple', label: 'Cotisation annuelle', amount: 100, dueDate: '2026-10-31', origin: 'Adhésion à l’association', status: 'due', note: 'Souhaite payer en deux fois.' },
  { id: 'bp2', member: 'Julien Moreau', category: 'Retraites', label: 'Sesshin de 3 jours', amount: 120, dueDate: '2026-11-15', origin: 'Inscription à la sesshin d’automne', status: 'due' },
  { id: 'bp3', member: 'Sopheap Chea', category: 'Cérémonies', label: 'Cérémonie du 49e jour', amount: 108, dueDate: '2026-10-20', origin: 'Pour son grand-père', status: 'due' },
  { id: 'bp4', member: 'Linh Tran', category: 'Offrandes', label: 'Robe de Kathina', amount: 80, dueDate: '2026-11-08', origin: 'Kathina 2026', status: 'due' },
  { id: 'bp5', member: 'Julien Moreau', category: 'Offrandes', label: 'Encens, fleurs et lampes', amount: 10, dueDate: '2026-09-26', origin: 'Uposatha de septembre', status: 'paid' },
];

export const buddhistDonations: Donation[] = [
  { id: 'bd1', type: 'engagement', amount: 10, cause: 'Encens, fleurs et lampes', date: '2026-09-26' },
  { id: 'bd2', type: 'tsedaka', amount: 20, cause: 'Nourriture et soins des moines', date: '2026-09-18', dedication: 'Mérites dédiés à ma grand-mère' },
  { id: 'bd3', type: 'tsedaka', amount: 50, cause: 'Bourses de retraite', date: '2026-09-05' },
  { id: 'bd4', type: 'tsedaka', amount: 30, cause: 'Publications du Dharma', date: '2026-08-14' },
  { id: 'bd5', type: 'tsedaka', amount: 25, cause: 'Entretien du temple', date: '2026-07-10' },
];

// Les pāramitās (perfections) de la voie theravāda, dans un ordre de progression.
export const buddhistLevels: SoulLevel[] = [
  { id: 'dana', name: 'Dāna', hebrew: 'générosité', min: 0, description: 'La générosité. Votre lotus s’ouvre.' },
  { id: 'sila', name: 'Sīla', hebrew: 'éthique', min: 100, description: 'La conduite juste. Vos actes prennent forme.' },
  { id: 'khanti', name: 'Khanti', hebrew: 'patience', min: 300, description: 'La patience. Votre calme rayonne autour de vous.' },
  { id: 'viriya', name: 'Vīriya', hebrew: 'énergie', min: 900, description: 'L’effort joyeux. Votre pratique porte la sangha.' },
  { id: 'panna', name: 'Paññā', hebrew: 'sagesse', min: 2500, description: 'La sagesse. Un cœur entièrement tourné vers le don.' },
];

export const buddhistMemberDates: MemberDate[] = [
  { id: 'bmd1', member: 'Julien Moreau', type: 'anniversaire', label: 'Anniversaire de Julien', date: '2026-11-08' },
  { id: 'bmd2', member: 'Julien Moreau', type: 'azkara', label: 'Anniversaire du décès de sa grand-mère', date: '2026-10-14', note: 'Dédicace de mérites, offrande de repas aux moines.' },
  { id: 'bmd3', member: 'Julien Moreau', type: 'autre', label: 'Anniversaire de prise de refuge', date: '2027-05-26' },
  { id: 'bmd4', member: 'Sopheap Chea', type: 'azkara', label: '49e jour de son grand-père', date: '2026-10-20', note: 'Cérémonie à la pagode.' },
  { id: 'bmd5', member: 'Linh Tran', type: 'anniversaire', label: 'Anniversaire de Linh', date: '2026-09-30' },
  { id: 'bmd6', member: 'Tenzin Dolma', type: 'autre', label: 'Anniversaire d’ordination de son frère', date: '2026-10-22' },
];

export const buddhistSeed: Omit<ReligionSeed, 'currents' | 'groups'> = {
  leaderShort: 'Vénérable',
  memberLabel: 'pratiquant',
  teachingLabel: 'Enseignement du Dharma',
  teachingPlural: 'Enseignements',
  teachingShareTitle: 'Partager un enseignement',
  teachingLatestTitle: 'Dernier enseignement',
  teachingPreviousTitle: 'Enseignements précédents',
  teachingSubtitle: (n) => `Enseignements du Dharma de ${n}`,
  questionTitle: 'Questions à l’enseignant',
  questionCategories: ['Méditation', 'Dāna', 'Cérémonies', 'Éthique', 'Famille', 'Deuil', 'Autre'],
  sourceShortcuts: ['Dhammapada', 'Majjhima Nikāya', 'Aṅguttara Nikāya', 'Sutta Nipāta', 'Sutra du Cœur', 'Sutra du Lotus', 'Visuddhimagga', 'Shōbōgenzō'],
  themes: ['Sutta', 'Méditation', 'Éthique', 'Sagesse', 'Cérémonies', 'Vie quotidienne'],
  scheduleTitle: 'Séances et cérémonies',
  seasonTitle: 'Fin de la retraite des pluies 2570',
  scheduleSource: 'calendrier lunaire',
  scheduleFetchLabel: 'Calculer les jours d’uposatha (calendrier lunaire) pour ma région',
  scheduleQuickNames: ['Zazen', 'Méditation guidée', 'Récitation', 'Enseignement', 'Cérémonie', 'Repas des moines', 'Uposatha', 'Retraite'],
  serviceColumns: ['Semaine', 'Week-end'],
  serviceSecondColumnDay: 0,
  quietMode: { label: 'Mode retraite', hint: 'Aucune notification pendant les séances et les retraites' },
  religiousDate: lunarDate,
  dateTypeLabels: { anniversaire: 'Anniversaire', azkara: 'Anniversaire de décès', autre: 'Autre' },
  memberDatesTitle: 'Dates des pratiquants',
  nextHolidayLabel: 'PROCHAINE OBSERVANCE',
  birthdayAction: 'Envoyer des vœux',
  azkaraAction: 'Proposer une dédicace de mérites',
  receiptFormats: ['cerfa'],
  currency: '€',
  tithe: null,
  alms: {
    name: 'Dana',
    title: 'Offrir un dana',
    quote: '« Le sage se réjouit du don et trouve ainsi le bonheur » (Dhammapada 177). Un don libre, sans attente.',
    amounts: [5, 10, 20, 50, 108],
    amountLabels: { 5: 'une fleur', 10: 'un repas de moine', 20: 'une lampe', 50: 'une journée', 108: 'nombre sacré' },
    amountsNote: '108 : le nombre de perles du mālā, des passions à apaiser. Le dana n’a pas de montant attendu.',
  },
  causes: buddhistCauses,
  categories: buddhistCategories,
  pendingLabel: 'Mes promesses',
  gamification: {
    name: 'pāramitā',
    title: 'MES PĀRAMITĀS',
    icon: 'dharmachakra',
    levels: buddhistLevels,
    growHint: 'Votre lotus s’ouvre à chaque dana, chaque enseignement lu et chaque question posée.',
    ctaLabel: 'Cultiver la générosité',
  },
  user: buddhistUser,
  members: buddhistMembers,
  congregations: buddhistCongregations,
  defaultCongregation: 'khanhanh',
  courses: buddhistCourses,
  questions: buddhistQuestions,
  holidays: buddhistHolidays,
  services: [
    { name: 'Méditation du matin', weekday: '07:00', shabbat: '09:00' },
    { name: 'Repas des moines', weekday: '11:00', shabbat: '11:00' },
    { name: 'Récitation', weekday: '18:30', shabbat: '17:00' },
    { name: 'Enseignement', weekday: '—', shabbat: '10:30' },
  ],
  agenda: buddhistAgenda,
  dayEntries: entriesFromHolidays(buddhistHolidays),
  pledges: buddhistPledges,
  donations: [...buddhistDonations, ...communityDemoDonations('bdc', buddhistMembers, ['Encens, fleurs et lampes', 'Nourriture et soins des moines', 'Bourses de retraite', 'Publications du Dharma', 'Entretien du temple'], 9000, buddhistDonations.reduce((s, d) => s + d.amount, 0))],
  memberDates: buddhistMemberDates,
};
