import {
  AgendaEvent,
  Congregation,
  Course,
  DailyService,
  DayEntry,
  Donation,
  DonationCategory,
  DonationCause,
  Holiday,
  MemberDate,
  MemberDateType,
  Pledge,
  Question,
  QuestionCategory,
  ReceiptFormat,
  SoulLevel,
  UserProfile,
} from '../types';
import { Member } from '../mocks/members';

// Mode de calcul de la « part obligatoire » : sur le revenu (maasser, dîme) ou sur l'épargne (zakat).
export interface TitheConfig {
  name: string; // Maasser, Zakat, Dîme
  rate: number; // 0.1, 0.025
  mode: 'income' | 'wealth';
  hint: string;
  incomeLabel: string; // « Salaire net du mois » / « Épargne détenue depuis un an »
  deductions: { key: string; label: string; icon: string }[]; // frais à retirer (income) ou dettes (wealth)
  threshold?: { label: string; amount: number }; // nisab
  period: string; // « ce mois » / « cette année »
  source: string; // phrase d'accroche avec source
  advice: string; // « Bon à savoir »
}

export interface AlmsConfig {
  name: string; // Tsedaka, Sadaqa, Aumône, Dana
  title: string; // « Donner la tsedaka »
  quote: string; // citation sourcée
  amounts: number[];
  amountLabels: Record<number, string>;
  amountsNote: string;
}

export interface GamificationConfig {
  name: string; // ora, nur, flamme, pāramitā
  title: string; // « MON ORA »
  icon: string; // MaterialCommunityIcons
  levels: SoulLevel[];
  growHint: string; // « Votre ora grandit à chaque don… »
  ctaLabel: string; // « Faire grandir mon ora »
}

export interface ReligionSeed {
  // Vocabulaire
  leaderShort: string; // Rav, Imam, Père, Vénérable (pour « Bonjour Rav »)
  memberLabel: string; // fidèle / pratiquant
  teachingLabel: string; // Dvar Torah
  teachingPlural: string; // Divré Torah
  teachingShareTitle: string; // « Partager un dvar Torah »
  teachingLatestTitle: string; // « Dernier dvar Torah »
  teachingPreviousTitle: string; // « Divré Torah précédents »
  teachingSubtitle: (leaderName: string) => string; // « Paroles de Torah de … »
  questionTitle: string; // « Questions au Rav »
  questionCategories: QuestionCategory[];
  sourceShortcuts: string[];
  themes: string[];
  scheduleTitle: string; // « Horaires »
  seasonTitle: string; // « Tichri 5787 »
  scheduleSource: string; // CalJ
  scheduleFetchLabel: string; // « Récupérer les horaires depuis CalJ en me géolocalisant »
  scheduleQuickNames: string[];
  serviceColumns: [string, string]; // ['Semaine', 'Chabbat']
  serviceSecondColumnDay: number; // jour de la semaine où la 2e colonne s'applique (6 = samedi, 0 = dimanche, 5 = vendredi)
  quietMode: { label: string; hint: string }; // Mode Chabbat
  religiousDate: (d: Date) => string | null;
  dateTypeLabels: Record<MemberDateType, string>; // anniversaire / azkara / autre
  memberDatesTitle: string; // « Dates des fidèles »
  nextHolidayLabel: string; // « PROCHAIN ALLUMAGE »
  birthdayAction: string; // « Envoyer un mazal tov »
  azkaraAction: string; // « Proposer une montée / Kaddich »
  receiptFormats: ReceiptFormat[];
  currency: string;
  // Dons
  tithe: TitheConfig | null;
  alms: AlmsConfig;
  causes: DonationCause[];
  categories: DonationCategory[];
  pendingLabel: string; // « À payer » / « Mes promesses »
  gamification: GamificationConfig;
  // Données
  user: UserProfile;
  members: Member[];
  congregations: Congregation[];
  defaultCongregation: string;
  courses: Course[];
  questions: Question[];
  holidays: Holiday[];
  services: DailyService[];
  agenda: AgendaEvent[];
  dayEntries: DayEntry[];
  pledges: Pledge[];
  donations: Donation[];
  memberDates: MemberDate[];
}
