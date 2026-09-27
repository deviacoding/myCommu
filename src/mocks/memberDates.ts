import { MemberDate } from '../types';

// Dates importantes des fidèles (anniversaires, azkarot). Visibles par le Rav de la communauté ; chaque fidèle voit les siennes.
export const initialMemberDates: MemberDate[] = [
  { id: 'md1', member: 'David Cohen', type: 'anniversaire', label: 'Anniversaire de David', date: '2026-06-14', hebrewDate: '2 Tamouz', note: 'Né en 5751' },
  { id: 'md2', member: 'David Cohen', type: 'azkara', label: 'Azkara de son père, Avraham ben Moché', date: '2026-10-05', hebrewDate: '24 Tichri', note: 'Monter à la Torah le Chabbat précédent, allumer une bougie de 24 h.' },
  { id: 'md3', member: 'David Cohen', type: 'anniversaire', label: 'Anniversaire de Léa (fille)', date: '2026-10-12', hebrewDate: '1 Hechvan' },
  { id: 'md4', member: 'Sarah Levy', type: 'anniversaire', label: 'Anniversaire de Sarah', date: '2026-09-30', hebrewDate: '19 Tichri' },
  { id: 'md5', member: 'Yossef Benhamou', type: 'azkara', label: 'Azkara de sa mère, Rivka bat Sarah', date: '2026-10-08', hebrewDate: '27 Tichri' },
  { id: 'md6', member: 'Myriam Kalfon', type: 'autre', label: 'Anniversaire de mariage', date: '2026-10-20', hebrewDate: '9 Hechvan' },
  { id: 'md7', member: 'Réouven Amar', type: 'azkara', label: 'Azkara de son grand-père, Chlomo ben Yaacov', date: '2026-11-02', hebrewDate: '22 Hechvan' },
  { id: 'md8', member: 'Esther Toledano', type: 'anniversaire', label: 'Bat-mitsva de Noa', date: '2026-10-17', hebrewDate: '6 Hechvan' },
];
