import { Donation, DonationCategory, DonationCause, Pledge, SoulLevel } from '../types';

export const causes = [
  'Synagogue Beth Yaacov',
  'Familles dans le besoin',
  'Talmud Torah',
  'Hevra Kadicha',
  'Bourses d’études (Yechiva)',
  'Israël : familles de soldats',
];

export const quickAmounts = [1, 5, 18, 26, 52];

export const amountLabels: Record<number, string> = {
  1: 'un premier pas',
  5: 'les 5 livres',
  18: '‘haï, « vivant »',
  26: 'valeur du Nom',
  52: '2 × 26',
};

// Date relative : la démo montre toujours un maasser récent à remercier côté responsable.
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export const initialDonations: Donation[] = [
  { id: 'd0', type: 'maasser', amount: 920, cause: 'Synagogue Beth Yaacov', date: daysAgo(1) },
  { id: 'd1', type: 'engagement', amount: 36, cause: 'Kapparot', date: '2026-09-18' },
  { id: 'd2', type: 'tsedaka', amount: 36, cause: 'Familles dans le besoin', date: '2026-09-18', dedication: 'Refoua chelema pour Rivka bat Sarah' },
  { id: 'd3', type: 'engagement', amount: 120, cause: 'Places de Yom Kippour', date: '2026-09-15' },
  { id: 'd4', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-09-01' },
  { id: 'd5', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-08-05' },
  { id: 'd6', type: 'tsedaka', amount: 18, cause: 'Hevra Kadicha', date: '2026-07-14', dedication: 'Leilouy nichmat Avraham ben Moché' },
  { id: 'd7', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-07-02' },
];

export const initialPledges: Pledge[] = [
  { id: 'p7', member: 'Yossef Benhamou', category: 'Apéritif', label: 'Kiddouch du Chabbat', amount: 500, dueDate: '2026-10-10', origin: 'Chabbat Berechit', status: 'due', note: 'Kiddouch en l’honneur de la naissance de sa fille.' },
  { id: 'p8', member: 'Yossef Benhamou', category: 'Dons de Chabbat', label: 'Haftara', amount: 180, dueDate: '2026-10-03', origin: 'Chabbat Chouva', status: 'due' },
  { id: 'p9', member: 'Sarah Levy', category: 'Dons de fêtes juives', label: 'Yom Kippour : Neïla', amount: 360, dueDate: '2026-10-05', origin: 'Yom Kippour 5787', status: 'due', lastReminder: '2026-09-25' },
  { id: 'p10', member: 'Réouven Amar', category: 'Dons de Chabbat', label: 'Chlichi', amount: 104, dueDate: '2026-09-26', origin: 'Chabbat Haazinou', status: 'due' },
  { id: 'p11', member: 'Michaël Dahan', category: 'Apéritif', label: 'Séouda chlichit', amount: 250, dueDate: '2026-10-17', origin: 'Chabbat Noa’h', status: 'due' },
  {
    id: 'p5',
    member: 'David Cohen',
    category: 'Dons de Chabbat',
    label: 'Chéni, paracha Berechit',
    amount: 104,
    dueDate: '2026-10-10',
    origin: 'Montée à la Torah (2e montée), Chabbat Berechit',
    status: 'due',
  },
  {
    id: 'p6',
    member: 'David Cohen',
    category: 'Divers',
    label: 'Chaise à l’année 5787',
    amount: 350,
    dueDate: '2026-10-31',
    origin: 'Place réservée à la synagogue pour toute l’année',
    status: 'due',
  },
  {
    id: 'p1',
    member: 'David Cohen',
    category: 'Divers',
    label: 'Nédava de Roch Hachana',
    amount: 52,
    dueDate: '2026-10-15',
    origin: 'Promesse faite lors de votre montée à la Torah, 2e jour',
    status: 'due',
  },
  {
    id: 'p2',
    member: 'David Cohen',
    category: 'Divers',
    label: 'Cotisation annuelle 5787',
    amount: 360,
    dueDate: '2026-10-31',
    origin: 'Adhésion à la communauté, année 5787',
    status: 'due',
    note: 'A promis de régler après les fêtes, rappeler début Hechvan.',
    lastReminder: '2026-09-22',
  },
  {
    id: 'p3',
    member: 'David Cohen',
    category: 'Dons de fêtes juives',
    label: 'Kapparot',
    amount: 36,
    dueDate: '2026-09-20',
    origin: 'Veille de Yom Kippour',
    status: 'paid',
  },
  {
    id: 'p4',
    member: 'David Cohen',
    category: 'Dons de fêtes juives',
    label: 'Places de Yom Kippour',
    amount: 120,
    dueDate: '2026-09-20',
    origin: 'Réservation de 2 places',
    status: 'paid',
  },
];

// Les cinq niveaux de l’âme selon la tradition (Berechit Rabba 14, 9).
export const soulLevels: SoulLevel[] = [
  { id: 'nefesh', name: 'Nefech', hebrew: 'נפש', min: 0, description: 'Le souffle de vie. Votre ora s’éveille.' },
  { id: 'ruah', name: 'Roua’h', hebrew: 'רוח', min: 180, description: 'L’esprit. Votre générosité prend forme.' },
  { id: 'neshama', name: 'Nechama', hebrew: 'נשמה', min: 540, description: 'L’âme. Votre lumière est visible autour de vous.' },
  { id: 'haya', name: '’Haya', hebrew: 'חיה', min: 1800, description: 'La vivante. Votre ora porte la communauté.' },
  { id: 'yehida', name: 'Ye’hida', hebrew: 'יחידה', min: 5400, description: 'L’unique. Une âme entièrement tournée vers le don.' },
];

// Catégories et sous-catégories de dons enregistrées par le Rav. Modifiables dans l'application.
export const initialCategories: DonationCategory[] = [
  {
    id: 'aperitif',
    name: 'Apéritif',
    icon: 'glass-wine',
    items: [
      { id: 'ap1', name: 'Kiddouch du Chabbat', amount: 500 },
      { id: 'ap2', name: 'Séouda chlichit', amount: 250 },
      { id: 'ap3', name: 'Mélavé Malka', amount: 300 },
      { id: 'ap4', name: 'Apéritif de fête', amount: 800 },
    ],
  },
  {
    id: 'chabbat',
    name: 'Dons de Chabbat',
    icon: 'candle',
    items: [
      { id: 'ch1', name: 'Richone', amount: 104 },
      { id: 'ch2', name: 'Chéni', amount: 104 },
      { id: 'ch3', name: 'Chlichi', amount: 104 },
      { id: 'ch4', name: 'Revihi', amount: 104 },
      { id: 'ch5', name: 'Hamichi', amount: 104 },
      { id: 'ch6', name: 'Chichi', amount: 104 },
      { id: 'ch7', name: 'Chevihi', amount: 104 },
      { id: 'ch8', name: 'Haftara', amount: 180 },
      { id: 'ch9', name: 'Hagbaha', amount: 52 },
      { id: 'ch10', name: 'Port du Séfer', amount: 52 },
    ],
  },
  {
    id: 'fetes',
    name: 'Dons de fêtes juives',
    icon: 'star-david',
    items: [
      { id: 'f1', name: 'Roch Hachana : montée à la Torah', amount: 180 },
      { id: 'f2', name: 'Yom Kippour : Kol Nidré', amount: 260 },
      { id: 'f3', name: 'Yom Kippour : Neïla', amount: 360 },
      { id: 'f4', name: 'Sim’hat Torah : Hatan Torah', amount: 520 },
      { id: 'f5', name: 'Sim’hat Torah : Hatan Berechit', amount: 520 },
      { id: 'f6', name: 'Hanouka : allumage', amount: 100 },
      { id: 'f7', name: 'Pourim : Matanot laévyonim', amount: 72 },
      { id: 'f8', name: 'Pessah : Kimha dépis’ha', amount: 180 },
    ],
  },
  {
    id: 'divers',
    name: 'Divers',
    icon: 'hand-heart',
    items: [
      { id: 'd1', name: 'Nédava', amount: 52 },
      { id: 'd2', name: 'Chaise à l’année', amount: 350 },
      { id: 'd3', name: 'Cotisation annuelle', amount: 360 },
      { id: 'd4', name: 'Mi chébérakh (refoua chelema)', amount: 36 },
      { id: 'd5', name: 'Azkara (souvenir d’un défunt)', amount: 100 },
    ],
  },
];

// Où va votre don ? Destinations proposées au fidèle.
export const causeDetails: DonationCause[] = [
  { id: 'pauvres', name: 'Dons pour les pauvres', description: 'Aide discrète aux familles de la communauté en difficulté : courses, loyer, factures.', icon: 'hand-heart' },
  { id: 'aperitif', name: 'Apéritif', description: 'Offrir le kiddouch ou la séouda chlichit d’un Chabbat, en l’honneur d’une occasion.', icon: 'glass-wine' },
  { id: 'entretien', name: 'Entretien de la synagogue', description: 'Électricité, chauffage, réparations, ménage : faire vivre le lieu au quotidien.', icon: 'home-heart' },
  { id: 'talmud-torah', name: 'Talmud Torah', description: 'Bourses et matériel pour l’école du dimanche des enfants.', icon: 'book-open-variant' },
  { id: 'hevra', name: 'Hevra Kadicha', description: 'Accompagnement des familles endeuillées et frais d’inhumation.', icon: 'candle' },
  { id: 'israel', name: 'Israël : familles de soldats', description: 'Soutien aux familles de soldats de la communauté.', icon: 'star-david' },
];
