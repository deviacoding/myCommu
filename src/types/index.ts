import { ImageSourcePropType } from 'react-native';

export type CommunityId = 'jewish' | 'christian' | 'muslim' | 'buddhist';

export interface UserProfile {
  id: string;
  intent?: 'member' | 'leader'; // à l'inscription : fidèle, ou responsable qui va créer sa communauté
  needsSetup?: boolean; // première connexion (Google) : la confession n'a pas encore été choisie
  lang?: string;
  readCourses?: string[];
  maasserInput?: { salary: number; school: number; talmudTorah: number; other: number };
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
  congregationId?: string;
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
  authorUid?: string;
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

export type QuestionCategory = string; // catégories propres à chaque confession (voir seeds)

export interface Question {
  id: string;
  congregationId?: string; // communauté ; absent = sefarade
  subject: string;
  category: QuestionCategory;
  status: 'answered' | 'pending';
  askedBy: string;
  askerUid?: string;
  anonymous?: boolean;
  isPublic?: boolean; // visible par toute la communauté (après anonymisation par le Rav)
  date: string;
  messages: QaMessage[];
}

export type DonationType = 'tsedaka' | 'maasser' | 'engagement';

export interface Donation {
  id: string;
  congregationId?: string;
  uid?: string; // donateur
  paymentLinkId?: string;
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
  memberUid?: string;
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
  congregationId?: string;
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
  religion?: CommunityId; // renseigné en base ; absent dans les seeds de démo (déduit de la confession)
  leaderUid?: string;
  themes?: string[]; // thèmes d'enseignement propres à la communauté (base)
  services?: DailyService[]; // horaires réguliers (base)
  createdAt?: string;
  name: string;
  rite: string;
  city: string;
  country?: string; // code ISO (FR, IL…) ou nom saisi
  address: string;
  distance: string;
  code: string;
  members: number;
  rav: { name: string; title: string; photo?: ImageSourcePropType };
  logo?: ImageSourcePropType;
  coords?: { lat: number; lng: number };
  createdByMe?: boolean;
  isPrivate?: boolean; // privée : absente de « Autour de moi », rejointe seulement par code ou QR code
  currentId?: string; // courant religieux (séfarade, sunnite, catholique…)
  groupId?: string; // groupe / fédération de rattachement (consistoire, Beth Loubavitch…)
}

// Courant religieux : séfarade, ashkénaze, habad… ; sunnite, chiite… ; catholique, protestant…
export interface ReligiousCurrent {
  id: string;
  religion?: CommunityId;
  name: string;
  custom?: boolean; // ajouté par un responsable
}

// Groupe de communautés (fédération, réseau). Le chef de groupe est la communauté qui l'a créé.
export interface CommunityGroup {
  id: string;
  religion?: CommunityId;
  name: string;
  description?: string;
  currentId?: string;
  headCongregationId: string;
}

export type MemberDateType = 'anniversaire' | 'azkara' | 'autre';

// Date importante d'un fidèle : anniversaire, azkara (souvenir d'un défunt), autre.
export interface MemberDate {
  id: string;
  congregationId?: string;
  uid?: string; // fidèle concerné, quand il a un compte
  member: string;
  type: MemberDateType;
  label: string;
  date: string; // ISO (grégorien)
  hebrewDate?: string;
  note?: string;
}

export interface StaffMember {
  id: string;
  congregationId?: string;
  name: string;
  contact: string;
  role: 'deputy' | 'treasurer' | 'organizer';
  code: string; // code d'accès personnel
  status: 'invited' | 'active';
  claimedBy?: string; // uid de la personne qui a utilisé le code
  createdBy?: string;
}

// Appartenance d'un utilisateur à une communauté, avec son rôle. Id du document : `${congregationId}_${uid}`.
export type MembershipRole = 'member' | 'leader' | 'deputy' | 'treasurer' | 'organizer';
export interface Membership {
  id: string;
  uid: string;
  congregationId: string;
  role: MembershipRole;
  name: string; // nom affiché (dénormalisé)
  joinedAt: string;
  joinedVia?: 'nearby' | 'qr' | 'code' | 'created' | 'staff';
  inviteCode?: string; // code d'accès utilisé pour un rôle d'équipe
}

// Compte de paiement (Stripe, Bit, Lemon Squeezy…) relié à une communauté pour recevoir les dons.
export interface PaymentLink {
  id: string;
  congregationId: string;
  provider: 'stripe' | 'bit' | 'lemonsqueezy';
  account: string; // e-mail, téléphone ou nom de boutique affiché
  accountId: string; // identifiant chez le prestataire (acct_…, store_…)
  connectedAt: string; // ISO
  isDefault: boolean;
  testPayments: number;
  status?: 'pending' | 'active'; // Stripe réel : inscription en cours, ou compte prêt à encaisser
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
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
