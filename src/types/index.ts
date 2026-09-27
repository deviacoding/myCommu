import { ImageSourcePropType } from 'react-native';

export type CommunityId = 'jewish' | 'christian' | 'muslim' | 'buddhist';

export interface UserProfile {
  id: string;
  name: string;
  hebrewName?: string;
  email: string;
  phone?: string;
  city?: string;
  community: CommunityId;
  synagogue?: string;
  memberSince: string;
  birthDate?: string;
  hebrewBirthDate?: string;
}

export type HolidayKind = 'yomtov' | 'fast' | 'shabbat' | 'holhamoed';

export interface HolidayTime {
  label: string;
  value: string;
}

export interface Holiday {
  id: string;
  name: string;
  hebrewName: string;
  kind: HolidayKind;
  start: string; // ISO date de la veille (allumage)
  end: string; // ISO date du dernier jour
  hebrewDates: string;
  times: HolidayTime[];
  notes?: string[];
}

export interface DailyService {
  name: string;
  weekday: string;
  shabbat: string;
}

export type AgendaCategory = 'office' | 'cours' | 'fete' | 'communaute';

export interface AgendaEvent {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  title: string;
  date: string; // ISO date
  time: string;
  place: string;
  category: AgendaCategory;
  description?: string;
  poster?: { color: string; label: string }; // affiche de l'événement (simulée)
}

export interface CourseSection {
  heading?: string;
  source?: string;
  text: string;
}

export type CourseCategory = string; // thèmes modifiables par le Rav (Fête, Paracha, Halakha, Moussar, Michna, …)

export type MediaType = 'video' | 'photo' | 'audio';

export interface MediaAttachment {
  type: MediaType;
  name: string;
  duration?: string;
}

export interface Course {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  title: string;
  subtitle: string;
  teacher: string;
  category: CourseCategory;
  duration: string;
  level: string;
  date: string;
  featured?: boolean;
  media?: MediaAttachment;
  sections: CourseSection[];
}

export interface QaMessage {
  id: string;
  author: 'member' | 'rav';
  name: string;
  text: string;
  sources?: string[];
  date: string;
}

export type QuestionCategory = 'Fêtes' | 'Cacherout' | 'Chabbat' | 'Tsedaka' | 'Deuil' | 'Famille' | 'Autre';

export interface Question {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  subject: string;
  category: QuestionCategory;
  status: 'answered' | 'pending';
  askedBy: string;
  anonymous?: boolean;
  isPublic?: boolean; // visible par toute la communauté (après anonymisation par le Rav)
  date: string;
  messages: QaMessage[];
}

export type DonationType = 'tsedaka' | 'maasser' | 'engagement';

export interface Donation {
  id: string;
  type: DonationType;
  amount: number;
  cause: string;
  date: string;
  dedication?: string;
}

export interface Pledge {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  member?: string;
  category?: string; // nom de la catégorie de don (Apéritif, Dons de Chabbat…)
  label: string;
  amount: number;
  dueDate: string;
  origin: string;
  status: 'due' | 'paid';
  note?: string;
  lastReminder?: string;
  settledAt?: string;
}

export interface SoulLevel {
  id: string;
  name: string;
  hebrew: string;
  min: number;
  description: string;
}

export type ReceiptFormat = 'seif46' | 'cerfa';

export interface DonationItem {
  id: string;
  name: string;
  amount: number; // montant habituel, modifiable
}

export interface DonationCategory {
  id: string;
  name: string;
  icon: string;
  items: DonationItem[];
}

// Un horaire nommé sur un jour du calendrier (ex. « Allumage » à 19:13).
export interface DayEntry {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  date: string; // ISO
  name: string;
  time: string;
}

export interface Congregation {
  id: string;
  name: string;
  rite: string;
  city: string;
  address: string;
  distance: string;
  code: string;
  members: number;
  rav: { name: string; title: string; photo?: ImageSourcePropType };
}

export type MemberDateType = 'anniversaire' | 'azkara' | 'autre';

// Date importante d'un fidèle : anniversaire, azkara (souvenir d'un défunt), autre.
export interface MemberDate {
  id: string;
  congregationId?: string;
  member: string;
  type: MemberDateType;
  label: string;
  date: string; // ISO (grégorien)
  hebrewDate?: string;
  note?: string;
}

export interface LiveSession {
  title: string;
  startedAt: string; // ISO datetime
  viewers: number;
  notified: number;
}

export interface DonationCause {
  id: string;
  name: string;
  description: string;
  icon: string;
}
