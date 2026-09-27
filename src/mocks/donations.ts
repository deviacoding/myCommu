import { Donation, Pledge, SoulLevel } from '../types';

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

export const initialDonations: Donation[] = [
  { id: 'd1', type: 'engagement', amount: 36, cause: 'Kapparot', date: '2026-09-18' },
  { id: 'd2', type: 'tsedaka', amount: 36, cause: 'Familles dans le besoin', date: '2026-09-18', dedication: 'Refoua chelema pour Rivka bat Sarah' },
  { id: 'd3', type: 'engagement', amount: 120, cause: 'Places de Yom Kippour', date: '2026-09-15' },
  { id: 'd4', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-09-01' },
  { id: 'd5', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-08-05' },
  { id: 'd6', type: 'tsedaka', amount: 18, cause: 'Hevra Kadicha', date: '2026-07-14', dedication: 'Leilouy nichmat Avraham ben Moché' },
  { id: 'd7', type: 'maasser', amount: 180, cause: 'Synagogue Beth Yaacov', date: '2026-07-02' },
];

export const initialPledges: Pledge[] = [
  {
    id: 'p5',
    label: 'Chéni, paracha Berechit',
    amount: 104,
    dueDate: '2026-10-10',
    origin: 'Montée à la Torah (2e montée), Chabbat Berechit',
    status: 'due',
  },
  {
    id: 'p6',
    label: 'Chaise à l’année 5787',
    amount: 350,
    dueDate: '2026-10-31',
    origin: 'Place réservée à la synagogue pour toute l’année',
    status: 'due',
  },
  {
    id: 'p1',
    label: 'Nédava de Roch Hachana',
    amount: 52,
    dueDate: '2026-10-15',
    origin: 'Promesse faite lors de votre montée à la Torah, 2e jour',
    status: 'due',
  },
  {
    id: 'p2',
    label: 'Cotisation annuelle 5787',
    amount: 360,
    dueDate: '2026-10-31',
    origin: 'Adhésion à la communauté, année 5787',
    status: 'due',
  },
  {
    id: 'p3',
    label: 'Kapparot',
    amount: 36,
    dueDate: '2026-09-20',
    origin: 'Veille de Yom Kippour',
    status: 'paid',
  },
  {
    id: 'p4',
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
