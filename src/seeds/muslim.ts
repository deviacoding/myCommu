import { ReligionSeed } from './types';
import { entriesFromHolidays } from './helpers';
import { hijriDate } from '../utils/religiousDate';
import { Holiday, Course, Question, AgendaEvent, Pledge, Donation, DonationCategory, DonationCause, SoulLevel, MemberDate, Congregation, UserProfile } from '../types';
import { Member } from '../mocks/members';

const IMAM = 'Imam Yassine Chakir';

export const muslimUser: UserProfile = {
  id: 'u1',
  name: 'Karim Benali',
  hebrewName: 'كريم بن علي',
  email: 'karim.benali@gmail.com',
  phone: '+33 6 45 12 78 90',
  city: 'Paris 19e',
  community: 'muslim',
  synagogue: 'Mosquée Al-Fath',
  memberSince: '2023-11-02',
  birthDate: '1989-03-21',
  hebrewBirthDate: '12 Rajab 1409',
};

export const muslimMembers: Member[] = [
  { id: 'm1', name: 'Karim Benali', hebrewName: 'كريم بن علي' },
  { id: 'm2', name: 'Fatima Zahra Idrissi', hebrewName: 'فاطمة الزهراء' },
  { id: 'm3', name: 'Youssef El Amrani', hebrewName: 'يوسف' },
  { id: 'm4', name: 'Amina Diallo', hebrewName: 'أمينة' },
  { id: 'm5', name: 'Bilal Haddad', hebrewName: 'بلال' },
  { id: 'm6', name: 'Nour Bensaïd', hebrewName: 'نور' },
  { id: 'm7', name: 'Omar Traoré', hebrewName: 'عمر' },
  { id: 'm8', name: 'Leïla Mansouri', hebrewName: 'ليلى' },
];

export const muslimCongregations: Congregation[] = [
  { id: 'alfath', name: 'Mosquée Al-Fath', rite: 'Sunnite · rite malikite', city: 'Paris 19e', address: '14 rue de Tanger', distance: '400 m', code: 'AF-1448', members: 650, rav: { name: IMAM, title: 'Imam de la mosquée' } },
  { id: 'assalam', name: 'Mosquée As-Salam', rite: 'Sunnite · rite hanafite', city: 'Paris 20e', address: '8 rue des Pyrénées', distance: '1,6 km', code: 'AS-0786', members: 420, rav: { name: 'Imam Mehmet Yilmaz', title: 'Imam de la mosquée' } },
  { id: 'annour', name: 'Centre An-Nour', rite: 'Sunnite', city: 'Pantin', address: '22 avenue Jean-Lolive', distance: '3,2 km', code: 'AN-0313', members: 280, rav: { name: 'Imam Abdallah Sow', title: 'Imam et enseignant' } },
];

// Approximation : 1 Rabi‘ al-thani 1448 ≈ 13 septembre 2026 ; Ramadan 1448 ≈ 8 février 2027.
export const muslimHolidays: Holiday[] = [
  {
    id: 'mawlid',
    name: 'Mawlid an-Nabi',
    hebrewName: 'المولد النبوي',
    kind: 'yomtov',
    start: '2026-08-25',
    end: '2026-08-25',
    hebrewDates: '12 Rabi‘ al-awwal',
    times: [
      { label: 'Veillée de rappel (24)', value: '20:30' },
      { label: 'Repas partagé (25)', value: '13:00' },
    ],
    notes: ['Naissance du Prophète ﷺ. Selon les avis, commémoration par la sira et la sadaqa.'],
  },
  {
    id: 'ayyam-bid',
    name: 'Ayyam al-Bid (jeûne des jours blancs)',
    hebrewName: 'الأيام البيض',
    kind: 'fast',
    start: '2026-09-26',
    end: '2026-09-28',
    hebrewDates: '13, 14, 15 Rabi‘ al-thani',
    times: [
      { label: 'Imsak (fin du sahur)', value: '06:25' },
      { label: 'Iftar (Maghrib)', value: '19:36' },
    ],
    notes: ['Jeûne recommandé (sunna) des 13, 14 et 15 de chaque mois lunaire (Abu Dawud 2449).'],
  },
  {
    id: 'jumua',
    name: 'Jumu‘a (prière du vendredi)',
    hebrewName: 'الجمعة',
    kind: 'shabbat',
    start: '2026-10-02',
    end: '2026-10-02',
    hebrewDates: '19 Rabi‘ al-thani',
    times: [
      { label: 'Khutba', value: '13:15' },
      { label: 'Salat al-Jumu‘a', value: '13:45' },
      { label: 'Cours après la prière', value: '14:30' },
    ],
    notes: ['Arriver tôt, faire le ghusl, éviter de parler pendant la khutba (Bukhari 934).'],
  },
  {
    id: 'lundi-jeudi',
    name: 'Jeûne du lundi et du jeudi',
    hebrewName: 'صيام الاثنين والخميس',
    kind: 'fast',
    start: '2026-10-05',
    end: '2026-10-08',
    hebrewDates: '22 et 25 Rabi‘ al-thani',
    times: [
      { label: 'Imsak', value: '06:35' },
      { label: 'Iftar', value: '19:20' },
    ],
    notes: ['Jeûne sunna : « les œuvres sont présentées le lundi et le jeudi » (Tirmidhi 747).'],
  },
  {
    id: 'ramadan',
    name: 'Ramadan 1448',
    hebrewName: 'رمضان',
    kind: 'yomtov',
    start: '2027-02-08',
    end: '2027-03-08',
    hebrewDates: '1 – 29/30 Ramadan',
    times: [
      { label: 'Premier sahur (8)', value: '05:40' },
      { label: 'Iftar collectif à la mosquée', value: 'Maghrib' },
      { label: 'Tarawih', value: '20:45' },
      { label: 'Laylat al-Qadr (27)', value: 'toute la nuit' },
    ],
    notes: ['Dates à confirmer par l’observation de la lune.'],
  },
  {
    id: 'aid-fitr',
    name: 'Aïd al-Fitr',
    hebrewName: 'عيد الفطر',
    kind: 'yomtov',
    start: '2027-03-09',
    end: '2027-03-09',
    hebrewDates: '1 Shawwal',
    times: [
      { label: 'Salat al-Aïd', value: '08:30' },
      { label: 'Zakat al-Fitr (avant la prière)', value: 'avant 08:30' },
    ],
  },
  {
    id: 'aid-adha',
    name: 'Aïd al-Adha',
    hebrewName: 'عيد الأضحى',
    kind: 'yomtov',
    start: '2027-05-16',
    end: '2027-05-19',
    hebrewDates: '10 – 13 Dhu al-Hijja',
    times: [
      { label: 'Salat al-Aïd', value: '08:00' },
      { label: 'Qurbani (sacrifice)', value: 'après la prière' },
    ],
  },
];

export const muslimCourses: Course[] = [
  {
    id: 'khutba-rahma',
    title: 'La miséricorde, cœur de la religion',
    subtitle: 'Khutba du vendredi : « Ma miséricorde embrasse toute chose »',
    teacher: IMAM,
    category: 'Khutba',
    duration: '11 min',
    level: 'Tous niveaux',
    date: '2026-09-25',
    featured: true,
    sections: [
      {
        text:
          'Chaque sourate, sauf une, s’ouvre par « Au nom d’Allah, le Tout-Miséricordieux, le Très-Miséricordieux ». Avant de nous parler de loi, de commerce ou de guerre, le Coran nous parle de miséricorde. C’est par là qu’il faut commencer, et c’est par là qu’il faut finir.',
      },
      {
        heading: 'Le verset',
        source: 'Coran, sourate Al-A‘raf (7), verset 156',
        text: '« Ma miséricorde embrasse toute chose. » — وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ',
      },
      {
        heading: 'Le hadith',
        source: 'Sahih al-Bukhari 6000, Sahih Muslim 2319',
        text:
          'Le Prophète ﷺ a dit : « Celui qui ne fait pas miséricorde ne recevra pas de miséricorde. » Et dans le hadith qudsi rapporté par Bukhari (7404) : « Ma miséricorde l’emporte sur Ma colère. » Un croyant qui juge durement son frère oublie que lui-même vit de la miséricorde divine chaque jour.',
      },
      {
        heading: 'La miséricorde en actes',
        text:
          'Elle commence à la maison : « Le meilleur d’entre vous est le meilleur envers sa famille » (Tirmidhi 3895). Elle continue avec le voisin, le pauvre, l’étranger. Elle s’étend même aux animaux : une femme a été punie pour un chat qu’elle avait enfermé, un homme pardonné pour un chien qu’il avait abreuvé (Bukhari 3321, 2363).',
      },
      {
        heading: 'À emporter avec soi',
        text:
          '1. Cette semaine, pardonner une offense sans qu’on nous le demande.\n2. Donner une sadaqa discrète, de la main gauche que la droite ignore.\n3. Réciter la Basmala en conscience avant chaque action, en se rappelant Qui nous fait vivre.',
      },
    ],
  },
  {
    id: 'khutba-salat',
    title: 'La prière, pilier et refuge',
    subtitle: 'Pourquoi cinq fois par jour, et comment retrouver la présence du cœur',
    teacher: IMAM,
    category: 'Fiqh',
    duration: '9 min',
    level: 'Débutant',
    date: '2026-09-18',
    sections: [
      {
        source: 'Coran, sourate Al-‘Ankabut (29), verset 45',
        text: '« Accomplis la prière. En vérité, la prière préserve de la turpitude et du blâmable. » La prière n’est pas seulement un devoir : elle est une protection.',
      },
      {
        heading: 'Le khushu‘, présence du cœur',
        source: 'Coran, sourate Al-Mu’minun (23), versets 1-2',
        text:
          '« Bienheureux sont les croyants, ceux qui sont humbles dans leur prière. » Les savants conseillent : connaître le sens de ce que l’on récite, prier comme si c’était la dernière fois, et se rappeler que l’on se tient devant Celui qui nous voit.',
      },
      {
        heading: 'En pratique',
        text: 'Utilisez les horaires de l’application, calculés pour votre position. Arrivez à la mosquée pour la prière en groupe quand vous le pouvez : elle vaut vingt-sept fois la prière individuelle (Bukhari 645).',
      },
    ],
  },
];

export const muslimQuestions: Question[] = [
  {
    id: 'mq1',
    subject: 'Puis-je regrouper Dhuhr et Asr au travail ?',
    category: 'Prière',
    status: 'pending',
    askedBy: 'Youssef El Amrani',
    date: '2026-09-28',
    messages: [
      { id: 'mq1-m1', author: 'member', name: 'Youssef El Amrani', date: '2026-09-28', text: 'Je travaille sur un chantier et je ne peux pas toujours m’arrêter à l’heure de Dhuhr. Est-il permis de regrouper Dhuhr et Asr le soir ?' },
    ],
  },
  {
    id: 'mq2',
    subject: 'La zakat se calcule-t-elle sur le salaire ou sur l’épargne ?',
    category: 'Zakat',
    status: 'answered',
    askedBy: 'Karim Benali',
    date: '2026-09-22',
    messages: [
      { id: 'mq2-m1', author: 'member', name: 'Karim Benali', date: '2026-09-22', text: 'Je gagne 2 400 € par mois et j’ai 9 000 € d’épargne depuis plus d’un an. Sur quoi dois-je calculer ma zakat ?' },
      {
        id: 'mq2-m2',
        author: 'rav',
        name: IMAM,
        date: '2026-09-23',
        text:
          'Barakallahu fik pour ta question. La zakat al-mal ne se calcule pas sur le salaire mensuel mais sur l’épargne (argent, or, marchandises) détenue pendant une année lunaire complète, si elle dépasse le nisab. Le nisab est la valeur de 85 g d’or, environ 6 500 € aujourd’hui. Tu retires tes dettes exigibles, et tu verses 2,5 % du reste. Avec 9 000 € d’épargne et sans dette, ta zakat est de 225 €. Le calculateur de l’application fait ce calcul pour toi.',
        sources: ['Coran, At-Tawba (9), 103', 'Sahih al-Bukhari 1454', 'Abu Dawud 1573'],
      },
    ],
  },
  {
    id: 'mq3',
    subject: 'Comment rattraper des jours de Ramadan manqués ?',
    category: 'Jeûne',
    status: 'answered',
    askedBy: 'Anonyme',
    anonymous: true,
    date: '2026-09-15',
    messages: [
      { id: 'mq3-m1', author: 'member', name: 'Anonyme', date: '2026-09-15', text: 'J’ai manqué six jours de Ramadan pour maladie. Dois-je les rattraper avant le prochain Ramadan ?' },
      {
        id: 'mq3-m2',
        author: 'rav',
        name: IMAM,
        date: '2026-09-15',
        text:
          'Oui, les jours manqués pour une excuse valable se rattrapent avant le Ramadan suivant, quand vous le pouvez, sans obligation de les enchaîner. Aïcha rapportait qu’elle rattrapait les siens en Sha‘ban (Bukhari 1950). Si la maladie est chronique et sans espoir de guérison, on nourrit un pauvre par jour manqué (fidya). Les jours blancs de ce mois sont une bonne occasion de commencer.',
        sources: ['Coran, Al-Baqara (2), 184-185', 'Sahih al-Bukhari 1950'],
      },
    ],
  },
];

export const muslimAgenda: AgendaEvent[] = [
  { id: 'ma1', title: 'Cours de tajwid pour adultes', date: '2026-09-29', time: '20:00', place: 'Salle d’étude', category: 'cours', description: 'Règles de récitation, niveau débutant. Apportez votre mushaf.' },
  { id: 'ma2', title: 'Repas de l’Ayyam al-Bid : iftar collectif', date: '2026-09-28', time: '19:30', place: 'Salle de la mosquée', category: 'communaute', description: 'Rupture du jeûne des jours blancs, ouverte aux familles.' },
  { id: 'ma3', title: 'Khutba et prière du vendredi', date: '2026-10-02', time: '13:15', place: 'Mosquée Al-Fath', category: 'office' },
  { id: 'ma4', title: 'Cercle de sira : la vie du Prophète ﷺ', date: '2026-10-04', time: '10:30', place: 'Salle d’étude', category: 'cours' },
  { id: 'ma5', title: 'Collecte pour la rénovation de la salle d’ablutions', date: '2026-10-09', time: '13:00', place: 'Mosquée Al-Fath', category: 'communaute', description: 'Objectif : 12 000 €. Reçus fiscaux disponibles.' },
  { id: 'ma6', title: 'École coranique : rentrée des enfants', date: '2026-10-11', time: '09:30', place: 'Salle des enfants', category: 'cours' },
  { id: 'ma7', title: 'Assemblée générale de l’association', date: '2026-10-18', time: '15:00', place: 'Salle de la mosquée', category: 'communaute' },
];

export const muslimCategories: DonationCategory[] = [
  {
    id: 'ramadan',
    name: 'Ramadan',
    icon: 'weather-night',
    items: [
      { id: 'r1', name: 'Iftar collectif (une table)', amount: 150 },
      { id: 'r2', name: 'Panier du Ramadan pour une famille', amount: 60 },
      { id: 'r3', name: 'Zakat al-Fitr (par personne)', amount: 7 },
      { id: 'r4', name: 'Laylat al-Qadr : sadaqa', amount: 100 },
    ],
  },
  {
    id: 'aid',
    name: 'Aïd',
    icon: 'sheep',
    items: [
      { id: 'a1', name: 'Qurbani (part de mouton)', amount: 180 },
      { id: 'a2', name: 'Cadeaux de l’Aïd pour les orphelins', amount: 30 },
    ],
  },
  {
    id: 'mosquee',
    name: 'Mosquée',
    icon: 'mosque',
    items: [
      { id: 'mo1', name: 'Cotisation annuelle', amount: 120 },
      { id: 'mo2', name: 'Tapis et entretien', amount: 50 },
      { id: 'mo3', name: 'Rénovation de la salle d’ablutions', amount: 200 },
      { id: 'mo4', name: 'Sadaqa jariya (aumône continue)', amount: 100 },
    ],
  },
  {
    id: 'vendredi',
    name: 'Vendredi',
    icon: 'hand-heart',
    items: [
      { id: 'v1', name: 'Sadaqa du vendredi', amount: 10 },
      { id: 'v2', name: 'Repas après la prière', amount: 80 },
    ],
  },
];

export const muslimCauses: DonationCause[] = [
  { id: 'fuqara', name: 'Sadaqa pour les pauvres', description: 'Aide discrète aux familles dans le besoin : loyer, factures, courses.', icon: 'hand-heart' },
  { id: 'iftar', name: 'Iftar et repas partagés', description: 'Offrir la rupture du jeûne ou le repas du vendredi.', icon: 'food' },
  { id: 'mosque', name: 'Entretien de la mosquée', description: 'Électricité, tapis, ablutions, ménage : faire vivre le lieu au quotidien.', icon: 'mosque' },
  { id: 'ecole', name: 'École coranique', description: 'Bourses et livres pour les enfants du samedi.', icon: 'book-open-variant' },
  { id: 'orphelins', name: 'Orphelins et veuves', description: 'Parrainage d’orphelins ici et à l’étranger.', icon: 'account-child-circle' },
  { id: 'janaza', name: 'Funérailles et rapatriement', description: 'Caisse de solidarité pour les frais d’inhumation.', icon: 'candle' },
];

export const muslimPledges: Pledge[] = [
  { id: 'mp1', member: 'Karim Benali', category: 'Mosquée', label: 'Cotisation annuelle', amount: 120, dueDate: '2026-10-31', origin: 'Adhésion à l’association', status: 'due', note: 'A promis de régler à la fin du mois.' },
  { id: 'mp2', member: 'Karim Benali', category: 'Mosquée', label: 'Rénovation de la salle d’ablutions', amount: 200, dueDate: '2026-10-09', origin: 'Promesse faite lors de la collecte', status: 'due' },
  { id: 'mp3', member: 'Youssef El Amrani', category: 'Ramadan', label: 'Iftar collectif (une table)', amount: 150, dueDate: '2027-02-08', origin: 'Ramadan 1448', status: 'due' },
  { id: 'mp4', member: 'Bilal Haddad', category: 'Aïd', label: 'Qurbani (part de mouton)', amount: 180, dueDate: '2027-05-10', origin: 'Aïd al-Adha 1448', status: 'due' },
  { id: 'mp5', member: 'Karim Benali', category: 'Vendredi', label: 'Sadaqa du vendredi', amount: 10, dueDate: '2026-09-25', origin: 'Vendredi 25 septembre', status: 'paid' },
];

export const muslimDonations: Donation[] = [
  { id: 'md1', type: 'engagement', amount: 10, cause: 'Sadaqa du vendredi', date: '2026-09-25' },
  { id: 'md2', type: 'tsedaka', amount: 20, cause: 'Sadaqa pour les pauvres', date: '2026-09-18', dedication: 'Pour la guérison de ma mère' },
  { id: 'md3', type: 'maasser', amount: 225, cause: 'Entretien de la mosquée', date: '2026-09-05', dedication: 'Zakat al-mal 1448' },
  { id: 'md4', type: 'tsedaka', amount: 50, cause: 'Orphelins et veuves', date: '2026-08-14' },
  { id: 'md5', type: 'tsedaka', amount: 30, cause: 'École coranique', date: '2026-07-10' },
];

// Progression islam → iman → ihsan (hadith de Jibril, Muslim 8).
export const muslimLevels: SoulLevel[] = [
  { id: 'niyya', name: 'Niyya', hebrew: 'نية', min: 0, description: 'L’intention. Votre lumière s’éveille.' },
  { id: 'islam', name: 'Islam', hebrew: 'إسلام', min: 100, description: 'La soumission. Vos actes prennent forme.' },
  { id: 'iman', name: 'Iman', hebrew: 'إيمان', min: 300, description: 'La foi. Votre lumière est visible autour de vous.' },
  { id: 'ihsan', name: 'Ihsan', hebrew: 'إحسان', min: 900, description: 'L’excellence : adorer Allah comme si vous Le voyiez.' },
  { id: 'taqwa', name: 'Taqwa', hebrew: 'تقوى', min: 2500, description: 'La piété. Un cœur entièrement tourné vers le don.' },
];

export const muslimMemberDates: MemberDate[] = [
  { id: 'mmd1', member: 'Karim Benali', type: 'anniversaire', label: 'Anniversaire de Karim', date: '2026-03-21', hebrewDate: '12 Rajab' },
  { id: 'mmd2', member: 'Karim Benali', type: 'azkara', label: 'Décès de son père, Ali Benali', date: '2026-10-06', hebrewDate: '23 Rabi‘ al-thani', note: 'Sadaqa jariya en son nom, du‘a après la prière.' },
  { id: 'mmd3', member: 'Karim Benali', type: 'autre', label: 'Aqiqa de sa fille Inès', date: '2026-10-17', note: 'Deux moutons, repas ouvert aux voisins.' },
  { id: 'mmd4', member: 'Fatima Zahra Idrissi', type: 'anniversaire', label: 'Anniversaire de Fatima Zahra', date: '2026-09-30' },
  { id: 'mmd5', member: 'Youssef El Amrani', type: 'azkara', label: 'Décès de sa mère', date: '2026-10-09', note: 'Repas des 40 jours selon la coutume familiale.' },
  { id: 'mmd6', member: 'Amina Diallo', type: 'autre', label: 'Nikah (mariage) d’Amina', date: '2026-10-24' },
];

export const muslimSeed: Omit<ReligionSeed, 'currents' | 'groups'> = {
  leaderShort: 'Imam',
  memberLabel: 'fidèle',
  teachingLabel: 'Khutba',
  teachingPlural: 'Khutbas et rappels',
  teachingShareTitle: 'Partager une khutba ou un rappel',
  teachingLatestTitle: 'Dernière khutba',
  teachingPreviousTitle: 'Khutbas et rappels précédents',
  teachingSubtitle: (n) => `Rappels de ${n}`,
  questionTitle: 'Questions à l’imam',
  questionCategories: ['Prière', 'Jeûne', 'Zakat', 'Halal', 'Famille', 'Deuil', 'Autre'],
  sourceShortcuts: ['Coran', 'Sahih al-Bukhari', 'Sahih Muslim', 'Abu Dawud', 'Tirmidhi', 'Mukhtasar al-Khalil', 'Fatawa al-Azhar', 'Al-Mawsu‘a al-Fiqhiyya'],
  themes: ['Khutba', 'Coran', 'Hadith', 'Fiqh', 'Sira', 'Ramadan'],
  scheduleTitle: 'Horaires de prière',
  seasonTitle: 'Rabi‘ al-thani 1448',
  scheduleSource: 'Aladhan',
  scheduleFetchLabel: 'Récupérer les horaires de prière (Aladhan) en me géolocalisant',
  scheduleQuickNames: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jumu‘a', 'Cours', 'Iftar'],
  serviceColumns: ['Adhan', 'Iqama'],
  serviceSecondColumnDay: -1,
  quietMode: { label: 'Mode prière', hint: 'Aucune notification pendant les cinq prières et la Jumu‘a' },
  religiousDate: hijriDate,
  dateTypeLabels: { anniversaire: 'Anniversaire', azkara: 'Décès', autre: 'Autre' },
  memberDatesTitle: 'Dates des fidèles',
  nextHolidayLabel: 'PROCHAINE OCCASION',
  birthdayAction: 'Envoyer un mabrouk',
  azkaraAction: 'Proposer une du‘a et une sadaqa',
  receiptFormats: ['cerfa'],
  currency: '€',
  tithe: {
    name: 'Zakat',
    rate: 0.025,
    mode: 'wealth',
    hint: '2,5 % de l’épargne détenue depuis une année lunaire, au-delà du nisab.',
    incomeLabel: 'Épargne détenue depuis un an (argent, or, marchandises)',
    deductions: [
      { key: 'school', label: 'Dettes exigibles', icon: 'card-outline' },
      { key: 'talmudTorah', label: 'Dépenses dues ce mois', icon: 'receipt-outline' },
      { key: 'other', label: 'Autres retenues', icon: 'add-circle-outline' },
    ],
    threshold: { label: 'Nisab (85 g d’or)', amount: 6500 },
    period: 'cette année',
    source: '« Prélève de leurs biens une sadaqa par laquelle tu les purifies » (Coran 9, 103).',
    advice: 'La zakat al-mal est due une fois par année lunaire sur l’épargne qui dépasse le nisab, après déduction des dettes. Le salaire n’est pas concerné tant qu’il est dépensé. Le nisab suit le cours de l’or : demandez sa valeur du jour à l’imam.',
  },
  alms: {
    name: 'Sadaqa',
    title: 'Donner une sadaqa',
    quote: '« La sadaqa éteint le péché comme l’eau éteint le feu » (Tirmidhi 614). Un don, même petit, chaque vendredi.',
    amounts: [5, 10, 20, 50, 100],
    amountLabels: { 5: 'un premier pas', 10: 'sadaqa du vendredi', 20: 'un repas', 50: 'un panier', 100: 'sadaqa jariya' },
    amountsNote: 'La meilleure sadaqa est celle que la main gauche ignore (Bukhari 660).',
  },
  causes: muslimCauses,
  categories: muslimCategories,
  pendingLabel: 'À payer',
  gamification: {
    name: 'nur',
    title: 'MON NUR (LUMIÈRE)',
    icon: 'star-crescent',
    levels: muslimLevels,
    growHint: 'Votre nur grandit à chaque sadaqa, chaque rappel écouté et chaque question posée.',
    ctaLabel: 'Faire grandir mon nur',
  },
  user: muslimUser,
  members: muslimMembers,
  congregations: muslimCongregations,
  defaultCongregation: 'alfath',
  courses: muslimCourses,
  questions: muslimQuestions,
  holidays: muslimHolidays,
  services: [
    { name: 'Fajr', weekday: '06:38', shabbat: '06:55' },
    { name: 'Dhuhr', weekday: '13:43', shabbat: '13:55' },
    { name: 'Asr', weekday: '17:02', shabbat: '17:15' },
    { name: 'Maghrib', weekday: '19:36', shabbat: '19:41' },
    { name: 'Isha', weekday: '21:03', shabbat: '21:15' },
  ],
  agenda: muslimAgenda,
  dayEntries: entriesFromHolidays(muslimHolidays),
  pledges: muslimPledges,
  donations: muslimDonations,
  memberDates: muslimMemberDates,
};
