export type CommunityId = 'jewish' | 'christian' | 'muslim';

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
  title: string;
  date: string; // ISO date
  time: string;
  place: string;
  category: AgendaCategory;
  description?: string;
}

export interface CourseSection {
  heading?: string;
  source?: string;
  text: string;
}

export type CourseCategory = 'Fête' | 'Paracha' | 'Halakha' | 'Moussar' | 'Michna';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  teacher: string;
  category: CourseCategory;
  duration: string;
  level: string;
  date: string;
  featured?: boolean;
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
  subject: string;
  category: QuestionCategory;
  status: 'answered' | 'pending';
  askedBy: string;
  anonymous?: boolean;
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
  member?: string;
  label: string;
  amount: number;
  dueDate: string;
  origin: string;
  status: 'due' | 'paid';
  note?: string;
  lastReminder?: string;
}

export interface SoulLevel {
  id: string;
  name: string;
  hebrew: string;
  min: number;
  description: string;
}

export type ReceiptFormat = 'seif46' | 'cerfa';
