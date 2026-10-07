import { ReligionSeed } from './types';
import { defaultUser } from '../mocks/user';
import { members } from '../mocks/members';
import { congregations } from '../mocks/congregations';
import { courses } from '../mocks/courses';
import { initialQuestions } from '../mocks/questions';
import { tishreiHolidays, dailyServices, agendaEvents, initialDayEntries } from '../mocks/schedule';
import { habadAgenda, habadCourses, habadDayEntries, habadPledges, habadQuestions } from '../mocks/habad';
import { initialDonations, initialPledges, initialCategories, causeDetails, causes, quickAmounts, amountLabels, soulLevels } from '../mocks/donations';
import { initialMemberDates } from '../mocks/memberDates';
import { communityDemoDonations } from './helpers';
import { hebrewDate } from '../utils/religiousDate';

export const jewishSeed: Omit<ReligionSeed, 'currents' | 'groups'> = {
  leaderShort: 'Rav',
  memberLabel: 'fidèle',
  teachingLabel: 'Dvar Torah',
  teachingPlural: 'Divré Torah',
  teachingShareTitle: 'Partager un dvar Torah',
  teachingLatestTitle: 'Dernier dvar Torah',
  teachingPreviousTitle: 'Divré Torah précédents',
  teachingSubtitle: (n) => `Paroles de Torah de ${n}`,
  questionTitle: 'Questions au Rav',
  questionCategories: ['Fêtes', 'Cacherout', 'Chabbat', 'Tsedaka', 'Deuil', 'Famille', 'Autre'],
  sourceShortcuts: ['Choulhan Aroukh, Orah Haïm', 'Choulhan Aroukh, Yoré Déa', 'Michna Beroura', 'Rama', 'Rambam, Michné Torah', 'Igrot Moché', 'Yalkout Yossef', 'Ben Ich Haï'],
  themes: ['Paracha', 'Fête', 'Halakha', 'Moussar', 'Michna'],
  scheduleTitle: 'Horaires',
  seasonTitle: 'Tichri 5787',
  scheduleSource: 'Hebcal',
  scheduleFetchLabel: 'Proposer les horaires de ma ville (Hebcal)',
  scheduleQuickNames: ['Allumage', 'Sortie de Chabbat', 'Chaharit', 'Minha', 'Arvit', 'Cours du Rav', 'Kiddouch', 'Séli’hot'],
  serviceColumns: ['Semaine', 'Chabbat'],
  serviceSecondColumnDay: 6,
  quietMode: { label: 'Mode Chabbat', hint: 'Aucune notification du vendredi soir au samedi soir' },
  religiousDate: hebrewDate,
  dateTypeLabels: { anniversaire: 'Anniversaire', azkara: 'Azkara', autre: 'Autre' },
  memberDatesTitle: 'Dates des fidèles',
  nextHolidayLabel: 'PROCHAIN ALLUMAGE',
  birthdayAction: 'Envoyer un mazal tov',
  azkaraAction: 'Proposer une montée / Kaddich',
  receiptFormats: ['seif46', 'cerfa'],
  currency: '₪',
  tithe: {
    name: 'Maasser',
    rate: 0.1,
    mode: 'income',
    hint: 'Un dixième de ses revenus réservé à la tsedaka.',
    incomeLabel: 'Salaire net du mois',
    deductions: [
      { key: 'school', label: 'École juive', icon: 'school-outline' },
      { key: 'talmudTorah', label: 'Cours de Talmud Torah', icon: 'book-outline' },
      { key: 'other', label: 'Autres frais', icon: 'add-circle-outline' },
    ],
    period: 'ce mois',
    source: '« Asser téasser » : prélève la dîme afin de t’enrichir (Taanit 9a).',
    advice: 'Le maasser se calcule en général sur le revenu net, après impôts. Il est recommandé de le commencer « bli neder », sans vœu formel. La déduction des frais de scolarité fait l’objet d’avis différents : voir la réponse du Rav dans l’onglet Questions.',
  },
  alms: {
    name: 'Tsedaka',
    title: 'Donner la tsedaka',
    quote: '« La tsedaka sauve de la mort » (Michlé 10, 2). Un don, même petit, chaque jour.',
    amounts: quickAmounts,
    amountLabels,
    amountsNote: '18 = ‘haï, « vivant » · 26 = valeur numérique du Nom divin.',
  },
  causes: causeDetails,
  categories: initialCategories,
  pendingLabel: 'À payer',
  gamification: {
    name: 'ora',
    title: 'MON ORA',
    icon: 'star-david',
    levels: soulLevels,
    growHint: 'Votre ora grandit à chaque don, chaque dvar Torah lu et chaque question posée.',
    ctaLabel: 'Faire grandir mon ora',
  },
  user: defaultUser,
  members,
  congregations,
  defaultCongregation: 'sefarade',
  courses: [...courses, ...habadCourses],
  questions: [...initialQuestions, ...habadQuestions],
  holidays: tishreiHolidays,
  services: dailyServices,
  agenda: [...agendaEvents, ...habadAgenda],
  dayEntries: [...initialDayEntries, ...habadDayEntries],
  pledges: [...initialPledges, ...habadPledges],
  // Démo : les dons du fidèle (sans uid) + ceux de toute la communauté, 9 000 ₪ récoltés au total.
  donations: [...initialDonations, ...communityDemoDonations('jd', members, causes, 9000, initialDonations.reduce((s, d) => s + d.amount, 0))],
  memberDates: initialMemberDates,
};
