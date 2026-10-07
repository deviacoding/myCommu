export interface Member {
  id: string;
  name: string;
  hebrewName?: string;
  joinedAt?: string; // date d'arrivée (adhésions en base) : le fil d'actualité du responsable signale les nouveaux
}

// Fidèles de la communauté (démo).
export const members: Member[] = [
  { id: 'm1', name: 'David Cohen', hebrewName: 'דוד בן אברהם' },
  { id: 'm2', name: 'Sarah Levy', hebrewName: 'שרה בת רחל' },
  { id: 'm3', name: 'Yossef Benhamou', hebrewName: 'יוסף בן משה' },
  { id: 'm4', name: 'Myriam Kalfon', hebrewName: 'מרים בת לאה' },
  { id: 'm5', name: 'Réouven Amar', hebrewName: 'ראובן בן יעקב' },
  { id: 'm6', name: 'Esther Toledano', hebrewName: 'אסתר בת שרה' },
  { id: 'm7', name: 'Michaël Dahan', hebrewName: 'מיכאל בן דוד' },
  { id: 'm8', name: 'Rivka Abitbol', hebrewName: 'רבקה בת מרים' },
  { id: 'm9', name: 'Chlomo Elbaz', hebrewName: 'שלמה בן יצחק' },
  { id: 'm10', name: 'Nathan Sebbag', hebrewName: 'נתן בן אליהו' },
];
