import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { collection, documentId, getDocs, limit, query, Query, where } from 'firebase/firestore';
import * as Location from 'expo-location';
import {
  AgendaEvent,
  CommunityGroup,
  Congregation,
  Course,
  CourseCategory,
  DailyService,
  DayEntry,
  Donation,
  DonationCategory,
  DonationType,
  Holiday,
  LiveSession,
  MediaAttachment,
  MemberDate,
  MemberDateType,
  Membership,
  StaffMember,
  PaymentLink,
  Pledge,
  Question,
  QuestionCategory,
  ReligiousCurrent,
  SoulLevel,
} from '../types';
import { Member } from '../mocks/members';
import { ReligionSeed } from '../seeds/types';
import { entriesFromHolidays } from '../seeds/helpers';
import { setCurrency, todayISO } from '../utils/time';
import { uploadImage } from '../utils/images';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { chunks, Db, demoDb, FIELD_DELETE, FIELD_INCREMENT, firebaseDb, listenMerged } from '../data/db';
import { firebaseConfigured, getDb } from '../firebase/app';

interface DonateInput {
  type: DonationType;
  amount: number;
  cause: string;
  dedication?: string;
  pledgeId?: string;
  paymentLinkId?: string;
}

interface AskInput {
  subject: string;
  category: QuestionCategory;
  text: string;
  anonymous: boolean;
  askedBy: string;
}

export interface MaasserInput {
  salary: number;
  school: number;
  talmudTorah: number;
  other: number;
}

export interface NewCourseInput {
  title: string;
  subtitle: string;
  category: CourseCategory;
  text: string;
  media?: MediaAttachment;
}

export interface NewMemberDateInput {
  member: string;
  memberUid?: string;
  type: MemberDateType;
  label: string;
  date: string;
  hebrewDate?: string;
  note?: string;
}

export interface NewEventInput {
  title: string;
  date: string;
  time: string;
  place: string;
  category: AgendaEvent['category'];
  description?: string;
  poster?: AgendaEvent['poster'];
}

export interface NewStaffInput {
  name: string;
  contact: string;
  role: StaffMember['role'];
}

export interface NewCongregationInput {
  name: string;
  rite: string;
  leaderName: string;
  leaderTitle: string;
  leaderPhoto?: string; // uri
  logo?: string; // uri
  address: string;
  city: string;
  country: string;
  coords?: { lat: number; lng: number };
  isPrivate: boolean;
  currentId?: string;
  groupId?: string; // groupe à rejoindre
  newGroupName?: string; // ou groupe à créer, dont la communauté devient chef
}

export interface NewPledgeInput {
  member: string;
  memberUid?: string;
  category?: string;
  label: string;
  amount: number;
  dueDate: string;
  origin: string;
}

interface AppStateValue {
  seed: ReligionSeed;
  backendMode: 'demo' | 'firebase';
  members: Member[];
  // Communautés
  congregations: Congregation[];
  congregation: Congregation; // communauté affichée
  congregationId: string;
  myCongregations: string[]; // adhésions du fidèle
  setCongregation: (id: string) => void;
  joinCongregation: (id: string, via?: 'nearby' | 'qr' | 'code') => void;
  leaveCongregation: (id: string) => void;
  createCongregation: (input: NewCongregationInput) => Congregation;
  lookupCongregationByCode: (code: string) => Promise<Congregation | null>;
  userCoords: { lat: number; lng: number } | null;
  locateMe: () => Promise<boolean>;
  currents: ReligiousCurrent[];
  groups: CommunityGroup[];
  currentOf: (k: Congregation) => ReligiousCurrent | undefined;
  groupOf: (k: Congregation) => CommunityGroup | undefined;
  addCurrent: (name: string) => ReligiousCurrent;
  setCongregationCurrent: (congregationId: string, currentId: string) => void;
  joinGroup: (congregationId: string, groupId: string) => void;
  leaveGroup: (congregationId: string) => void;
  createGroup: (congregationId: string, name: string, description?: string) => CommunityGroup;
  myStaff: StaffMember[];
  myPaymentLinks: PaymentLink[];
  connectPayment: (input: { provider: PaymentLink['provider']; account: string; accountId: string }) => PaymentLink;
  disconnectPayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;
  testPayment: (id: string) => void;
  addStaff: (input: NewStaffInput) => StaffMember;
  removeStaff: (id: string) => void;
  // Données brutes (toutes communautés)
  donations: Donation[];
  pledges: Pledge[];
  questions: Question[];
  courses: Course[];
  holidays: Holiday[];
  services: DailyService[];
  agenda: AgendaEvent[];
  dayEntries: DayEntry[];
  // Données de la communauté affichée
  myPledges: Pledge[];
  myQuestions: Question[];
  myCourses: Course[];
  myAgenda: AgendaEvent[];
  myDayEntries: DayEntry[];
  readCourses: string[];
  maasserInput: MaasserInput;
  categories: DonationCategory[];
  totalGiven: number;
  givenThisMonth: number;
  maasserGivenThisMonth: number;
  points: number;
  level: SoulLevel;
  levelIndex: number;
  nextLevel: SoulLevel | null;
  levelProgress: number;
  streakMonths: number;
  donate: (input: DonateInput) => number;
  askQuestion: (input: AskInput) => Question;
  answerQuestion: (id: string, text: string, sources: string[]) => void;
  markCourseRead: (id: string) => void;
  setMaasserInput: (m: MaasserInput) => void;
  addCourse: (input: NewCourseInput) => Course;
  updateHolidayTime: (holidayId: string, index: number, value: string) => void;
  updateService: (name: string, field: 'weekday' | 'shabbat', value: string) => void;
  addEvent: (input: NewEventInput) => void;
  removeEvent: (id: string) => void;
  addPledge: (input: NewPledgeInput) => void;
  removePledge: (id: string) => void;
  updatePledgeNote: (id: string, note: string) => void;
  sendReminder: (id: string) => void;
  settlePledge: (id: string) => void;
  addCategory: (name: string) => DonationCategory;
  addSubcategory: (categoryId: string, name: string, amount: number) => void;
  addDayEntry: (date: string, name: string, time: string) => void;
  addDayEntries: (entries: { date: string; name: string; time: string }[]) => number;
  removeDayEntry: (id: string) => void;
  courseThemes: string[];
  addTheme: (name: string) => void;
  publishQuestion: (id: string, anonymize: boolean) => void;
  live: LiveSession | null;
  startLive: (title: string) => void;
  endLive: () => void;
  memberDates: MemberDate[];
  myMemberDates: MemberDate[];
  addMemberDate: (input: NewMemberDateInput) => void;
  removeMemberDate: (id: string) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

// Découpe un texte libre en sections : une ligne seule courte devient un titre de section.
function textToSections(text: string): Course['sections'] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const sections: Course['sections'] = [];
  let pendingHeading: string | undefined;
  for (const b of blocks) {
    if (b.length < 60 && !/[.!?]$/.test(b) && !b.includes('\n')) {
      pendingHeading = b;
      continue;
    }
    sections.push({ heading: pendingHeading, text: b });
    pendingHeading = undefined;
  }
  if (pendingHeading) sections.push({ text: pendingHeading });
  return sections.length ? sections : [{ text }];
}

function joinCode(name: string): string {
  const prefix = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'CM';
  return `${prefix}-${String(1000 + Math.floor(Math.random() * 9000))}`;
}

function distanceLabel(a: { lat: number; lng: number } | null, b?: { lat: number; lng: number }): string {
  if (!a || !b) return '—';
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const m = 2 * R * Math.asin(Math.sqrt(h));
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

function distanceMeters(label: string): number {
  const n = parseFloat(label.replace(',', '.'));
  if (Number.isNaN(n)) return Number.POSITIVE_INFINITY;
  return label.endsWith('km') ? n * 1000 : n;
}

const defaultMaasser = (seed: ReligionSeed): MaasserInput =>
  seed.tithe?.mode === 'wealth' ? { salary: 9000, school: 0, talmudTorah: 0, other: 0 } : { salary: seed.currency === '₪' ? 12000 : 2400, school: seed.currency === '₪' ? 2500 : 0, talmudTorah: seed.currency === '₪' ? 300 : 0, other: 0 };

// Une liste alimentée soit par la démo (valeur initiale, remise à zéro quand la confession change),
// soit par Firestore (abonnement aux requêtes construites par `build`, resouscrit quand `key` change).
function useLiveList<T extends { id: string }>(real: boolean, demoValue: T[], resetToken: unknown, build: () => Query[], key: string): [T[], Dispatch<SetStateAction<T[]>>] {
  const [list, setList] = useState<T[]>(real ? [] : demoValue);
  useEffect(() => {
    if (real) return;
    setList(demoValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [real, resetToken]);
  useEffect(() => {
    if (!real) return;
    return listenMerged<T>(build(), setList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [real, key]);
  return [list, setList];
}

export function AppStateProvider({ children, seed }: { children: ReactNode; seed: ReligionSeed }) {
  const { uid, memberships, staffRoleFor, user, updateUser } = useAuth();
  const { community: religion } = useTheme();
  const real = !!uid && firebaseConfigured;
  const db: Db = real ? firebaseDb : demoDb;
  const defaultCongregation = seed.defaultCongregation;
  const col = (name: string) => collection(getDb(), name);

  // Adhésions : en base, elles viennent des memberships ; en démo, de l'état local.
  const [demoMy, setDemoMy] = useState<string[]>([]);
  const [localJoined, setLocalJoined] = useState<string[]>([]);
  const membershipIds = useMemo(() => memberships.map((m) => m.congregationId), [memberships]);
  const myCongregations = useMemo(() => (real ? [...new Set([...membershipIds, ...localJoined])] : demoMy), [real, membershipIds, localJoined, demoMy]);
  const staffIds = useMemo(() => (real ? memberships.filter((m) => m.role !== 'member').map((m) => m.congregationId) : []), [real, memberships]);
  // Périmètres par rôle, alignés sur firestore.rules.
  const idsWhere = (roles: string[]) => (real ? memberships.filter((m) => roles.includes(m.role)).map((m) => m.congregationId) : []);
  const leaderIds = useMemo(() => idsWhere(['leader', 'deputy']), [real, memberships]); // eslint-disable-line react-hooks/exhaustive-deps
  const financeIds = useMemo(() => idsWhere(['leader', 'deputy', 'treasurer']), [real, memberships]); // eslint-disable-line react-hooks/exhaustive-deps
  const calendarIds = useMemo(() => idsWhere(['leader', 'deputy', 'organizer']), [real, memberships]); // eslint-disable-line react-hooks/exhaustive-deps
  const myKey = myCongregations.join(',');
  const staffKey = staffIds.join(',');

  const ofCongregation = useCallback(
    (id: string) => (item: { congregationId?: string }) => (item.congregationId ?? (real ? '' : defaultCongregation)) === id,
    [defaultCongregation, real]
  );

  const inMine = (field = 'congregationId') => chunks(myCongregations).map((ids) => query(col(''), where(field, 'in', ids)));
  // Requêtes « communautés où je suis responsable » et « ce qui me concerne » (fidèle).
  const staffQueries = (name: string, ids: string[] = staffIds) => chunks(ids).map((set) => query(col(name), where('congregationId', 'in', set)));
  const mineQueries = (name: string) => chunks(myCongregations).map((ids) => query(col(name), where('congregationId', 'in', ids)));
  void inMine;

  // ---- Communautés
  const [createdCongregations, setCreatedCongregations] = useState<Congregation[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fbCongregations] = useLiveList<Congregation>(
    real,
    [],
    seed,
    () => [
      ...chunks(myCongregations).map((ids) => query(col('congregations'), where(documentId(), 'in', ids))),
      query(col('congregations'), where('religion', '==', religion), where('isPrivate', '==', false), limit(60)),
    ],
    `${myKey}|${religion}`
  );
  const [congregationPatches, setCongregationPatches] = useState<Record<string, Partial<Congregation>>>({});
  const [fbCurrents] = useLiveList<ReligiousCurrent>(real, [], seed, () => [query(col('currents'), where('religion', '==', religion))], religion);
  const [fbGroups] = useLiveList<CommunityGroup>(real, [], seed, () => [query(col('groups'), where('religion', '==', religion))], religion);
  const [demoCurrents, setDemoCurrents] = useState<ReligiousCurrent[]>(seed.currents);
  const [demoGroups, setDemoGroups] = useState<CommunityGroup[]>(seed.groups);
  const currents = useMemo(() => (real ? [...seed.currents, ...fbCurrents.filter((c) => !seed.currents.some((s) => s.id === c.id))] : demoCurrents), [real, seed, fbCurrents, demoCurrents]);
  const groups = useMemo(() => (real ? [...seed.groups, ...fbGroups.filter((g) => !seed.groups.some((s) => s.id === g.id))] : demoGroups), [real, seed, fbGroups, demoGroups]);

  const allCongregations = useMemo(() => {
    const base = real ? [...createdCongregations.filter((k) => !fbCongregations.some((f) => f.id === k.id)), ...fbCongregations] : [...createdCongregations, ...seed.congregations];
    return base
      .map((k) => {
        const p = congregationPatches[k.id];
        const merged = p ? { ...k, ...p } : k;
        const cur = currents.find((c) => c.id === merged.currentId);
        const withRite = cur ? { ...merged, rite: cur.name } : merged;
        return real ? { ...withRite, distance: myCongregations.includes(k.id) && !userCoords ? 'ici' : distanceLabel(userCoords, k.coords) } : withRite;
      })
      .sort((a, b) => (real ? distanceMeters(a.distance) - distanceMeters(b.distance) : 0));
  }, [real, createdCongregations, fbCongregations, seed, congregationPatches, currents, userCoords, myCongregations]);

  const placeholder = useMemo<Congregation>(() => ({ id: '', name: '—', rite: '', city: '', address: '', distance: '', code: '', members: 0, rav: { name: '', title: '' } }), []);
  const findCongregation = useCallback((id: string) => allCongregations.find((c) => c.id === id) ?? (real ? placeholder : allCongregations[0]), [allCongregations, real, placeholder]);

  const [congregationId, setCongregationState] = useState<string>(real ? '' : defaultCongregation);
  const setCongregation = useCallback((id: string) => setCongregationState(id), []);
  // En base : on affiche d'abord une communauté où l'on est responsable, sinon la première rejointe.
  useEffect(() => {
    if (!real) return;
    if (congregationId && myCongregations.includes(congregationId)) return;
    const next = staffIds[0] ?? myCongregations[0];
    if (next) setCongregationState(next);
  }, [real, congregationId, myCongregations, staffIds]);

  // ---- Listes de contenu
  const [staff, setStaff] = useLiveList<StaffMember>(real, [], seed, () => staffQueries('staffInvites', leaderIds), leaderIds.join(','));
  const [paymentLinks, setPaymentLinks] = useLiveList<PaymentLink>(real, [], seed, () => mineQueries('paymentLinks'), myKey);
  const [donations, setDonations] = useLiveList<Donation>(real, seed.donations, seed, () => [...staffQueries('donations', financeIds), query(col('donations'), where('uid', '==', uid ?? '-'))], `${financeIds.join(',')}|${uid}`);
  const [pledges, setPledges] = useLiveList<Pledge>(real, seed.pledges, seed, () => [...staffQueries('pledges', financeIds), query(col('pledges'), where('memberUid', '==', uid ?? '-'))], `${financeIds.join(',')}|${uid}`);
  const [questions, setQuestions] = useLiveList<Question>(
    real,
    seed.questions,
    seed,
    () => [...staffQueries('questions', leaderIds), ...chunks(myCongregations).map((ids) => query(col('questions'), where('congregationId', 'in', ids), where('isPublic', '==', true))), query(col('questions'), where('askerUid', '==', uid ?? '-'))],
    `${leaderIds.join(',')}|${myKey}|${uid}`
  );
  const latestQuestions = useRef(questions);
  latestQuestions.current = questions;
  const [courses, setCourses] = useLiveList<Course>(real, seed.courses, seed, () => mineQueries('courses'), myKey);
  const [holidays, setHolidays] = useLiveList<Holiday>(real, seed.holidays, seed, () => mineQueries('holidays'), myKey);
  const [agenda, setAgenda] = useLiveList<AgendaEvent>(real, seed.agenda, seed, () => mineQueries('agenda'), myKey);
  const [categories, setCategories] = useLiveList<DonationCategory>(real, seed.categories, seed, () => mineQueries('donationCategories'), myKey);
  const [dayEntries, setDayEntries] = useLiveList<DayEntry>(real, seed.dayEntries, seed, () => mineQueries('dayEntries'), myKey);
  const [memberDates, setMemberDates] = useLiveList<MemberDate>(real, seed.memberDates, seed, () => [...staffQueries('memberDates', calendarIds), query(col('memberDates'), where('uid', '==', uid ?? '-'))], `${calendarIds.join(',')}|${uid}`);
  const [lives, setLives] = useLiveList<LiveSession & { id: string; active?: boolean }>(real, [], seed, () => mineQueries('lives'), myKey);
  const [congMembers] = useLiveList<Membership>(real, [], seed, () => (congregationId && staffIds.includes(congregationId) ? [query(col('memberships'), where('congregationId', '==', congregationId))] : []), `${congregationId}|${staffKey}`);

  // Horaires réguliers et thèmes : sur le document de la communauté en base, sinon ceux de la confession.
  const [demoServices, setDemoServices] = useState<DailyService[]>(seed.services);
  const [demoThemes, setDemoThemes] = useState<string[]>(seed.themes);
  const [demoLive, setDemoLive] = useState<LiveSession | null>(null);
  const [demoRead, setDemoRead] = useState<string[]>(seed.courses.filter((c) => c.featured).map((c) => c.id).slice(0, 1));
  const [demoMaasser, setDemoMaasser] = useState<MaasserInput>(defaultMaasser(seed));
  const [demoStaff, setDemoStaff] = useState<StaffMember[]>([]);
  const [demoPayments, setDemoPayments] = useState<PaymentLink[]>([]);

  // Changement de confession en démo : on recharge toutes les données du nouveau seed.
  const [loadedSeed, setLoadedSeed] = useState(seed);
  useEffect(() => {
    setCurrency(seed.currency);
    if (seed === loadedSeed) return;
    setLoadedSeed(seed);
    setCreatedCongregations([]);
    setCongregationPatches({});
    if (real) return;
    setCongregationState(seed.defaultCongregation);
    setDemoMy([]);
    setDemoCurrents(seed.currents);
    setDemoGroups(seed.groups);
    setDemoServices(seed.services);
    setDemoThemes(seed.themes);
    setDemoLive(null);
    setDemoRead(seed.courses.filter((c) => c.featured).map((c) => c.id).slice(0, 1));
    setDemoMaasser(defaultMaasser(seed));
    setDemoStaff(demoStaffFor(seed));
    setDemoPayments(demoPaymentsFor(seed));
  }, [seed, loadedSeed, real]);

  // Équipe et paiement de démo de la communauté principale.
  const demoStaffFor = (s: ReligionSeed): StaffMember[] => [
    { id: 'st1', name: s.members[2]?.name ?? 'Trésorier', contact: '+33 6 11 22 33 44', role: 'treasurer', code: 'TR-4821', status: 'active' },
    { id: 'st2', name: s.members[5]?.name ?? 'Organisateur', contact: 'organisation@mycommu.app', role: 'organizer', code: 'OR-3317', status: 'active' },
  ];
  const demoPaymentsFor = (s: ReligionSeed): PaymentLink[] => {
    const slug = (s.congregations.find((k) => k.id === s.defaultCongregation)?.name ?? 'communaute').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
    return [{ id: 'pay1', congregationId: s.defaultCongregation, provider: 'stripe', account: `tresorerie@${slug}.org`, accountId: 'acct_1QmC' + s.defaultCongregation.slice(0, 4).toUpperCase() + '7Kz', connectedAt: '2026-03-02T10:00:00', isDefault: true, testPayments: 0 }];
  };
  useEffect(() => {
    if (real) return;
    setDemoStaff(demoStaffFor(seed));
    setDemoPayments(demoPaymentsFor(seed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [real]);

  const congregation = findCongregation(congregationId);
  const services = real ? (congregation.services ?? seed.services) : demoServices;
  const courseThemes = real ? (congregation.themes ?? seed.themes) : demoThemes;
  const readCourses = real ? (user.readCourses ?? []) : demoRead;
  const maasserInput = real ? ((user as { maasserInput?: MaasserInput }).maasserInput ?? defaultMaasser(seed)) : demoMaasser;
  const live = real ? (lives.find((l) => l.id === congregationId && l.active) ?? null) : demoLive;
  const myStaff = real ? staff.filter((s) => s.congregationId === congregationId) : demoStaff;
  const myPaymentLinks = real ? paymentLinks.filter((p) => p.congregationId === congregationId) : demoPayments.filter((p) => p.congregationId === congregationId);
  const members: Member[] = real ? congMembers.filter((m) => m.role === 'member' || true).map((m) => ({ id: m.uid, name: m.name })) : seed.members;

  // ---- Communautés : rejoindre, créer, chercher
  const joinCongregation = useCallback(
    (id: string, via: 'nearby' | 'qr' | 'code' = 'nearby') => {
      if (real && uid) {
        if (!membershipIds.includes(id)) {
          // Les abonnements aux contenus ne partent qu'une fois l'adhésion écrite : avant, les règles les refuseraient.
          db.batch([
            { type: 'set', coll: 'memberships', id: `${id}_${uid}`, data: { uid, congregationId: id, role: 'member', name: user.name, joinedAt: todayISO(), joinedVia: via } },
            { type: 'update', coll: 'congregations', id, data: { members: FIELD_INCREMENT(1) } },
          ]).then(() => setLocalJoined((l) => (l.includes(id) ? l : [...l, id])));
        }
      } else {
        setDemoMy((list) => (list.includes(id) ? list : [...list, id]));
      }
      setCongregationState(id);
    },
    [real, uid, membershipIds, db, user.name]
  );

  const leaveCongregation = useCallback(
    (id: string) => {
      if (real && uid) {
        setLocalJoined((l) => l.filter((x) => x !== id));
        db.batch([
          { type: 'delete', coll: 'memberships', id: `${id}_${uid}` },
          { type: 'update', coll: 'congregations', id, data: { members: FIELD_INCREMENT(-1) } },
        ]);
        return;
      }
      setDemoMy((list) => {
        const next = list.filter((x) => x !== id);
        if (congregationId === id && next.length) setCongregationState(next[0]);
        return next;
      });
    },
    [real, uid, db, congregationId]
  );

  const createCongregation = useCallback(
    (input: NewCongregationInput) => {
      const id = db.newId('k');
      const k: Congregation = {
        id,
        religion,
        leaderUid: uid ?? undefined,
        name: input.name,
        rite: input.rite,
        city: input.city,
        country: input.country,
        address: input.address,
        distance: 'ici',
        code: joinCode(input.name),
        members: 1,
        rav: { name: input.leaderName, title: input.leaderTitle, photo: input.leaderPhoto ? { uri: input.leaderPhoto } : undefined },
        logo: input.logo ? { uri: input.logo } : undefined,
        coords: input.coords,
        isPrivate: input.isPrivate,
        currentId: input.currentId,
        groupId: input.groupId,
        createdByMe: true,
        createdAt: new Date().toISOString(),
      };
      let group: CommunityGroup | undefined;
      if (input.newGroupName) {
        group = { id: db.newId('grp'), religion, name: input.newGroupName, currentId: input.currentId, headCongregationId: id };
        k.groupId = group.id;
        if (!real) setDemoGroups((list) => [...list, group!]);
      }
      setCreatedCongregations((list) => [k, ...list]);
      if (real && uid) {
        const seededHolidays = seed.holidays.map((h) => ({ ...h, id: db.newId('h'), congregationId: id }));
        db.batch([
          { type: 'set', coll: 'congregations', id, data: { ...k, rav: { name: k.rav.name, title: k.rav.title }, logo: undefined, themes: seed.themes, services: seed.services } },
          { type: 'set', coll: 'memberships', id: `${id}_${uid}`, data: { uid, congregationId: id, role: 'leader', name: user.name, joinedAt: todayISO(), joinedVia: 'created' } },
          ...(group ? [{ type: 'set' as const, coll: 'groups' as const, id: group.id, data: group }] : []),
          ...seededHolidays.map((h) => ({ type: 'set' as const, coll: 'holidays' as const, id: h.id, data: h })),
          ...entriesFromHolidays(seededHolidays, id).map((e) => ({ type: 'set' as const, coll: 'dayEntries' as const, id: db.newId('e'), data: { ...e, id: undefined } })),
          ...seed.categories.map((c) => ({ type: 'set' as const, coll: 'donationCategories' as const, id: db.newId('cat'), data: { ...c, id: undefined, congregationId: id } })),
        ]).then(() => {
          setLocalJoined((l) => [...l, id]);
          // Les photos sont réduites puis envoyées dans Cloud Storage, après le batch : les règles Storage
          // exigent l'adhésion « leader » écrite juste au-dessus. L'URL obtenue est ajoutée au document.
          if (input.leaderPhoto) uploadImage(`congregations/${id}/rav.jpg`, input.leaderPhoto).then((uri) => db.update('congregations', id, { 'rav.photo': { uri } }));
          if (input.logo) uploadImage(`congregations/${id}/logo.jpg`, input.logo).then((uri) => db.update('congregations', id, { logo: { uri } }));
        });
      }
      setCongregationState(id);
      return k;
    },
    [db, real, uid, religion, seed, user.name]
  );

  const lookupCongregationByCode = useCallback(
    async (raw: string): Promise<Congregation | null> => {
      const norm = raw.replace(/[\s-]/g, '').toUpperCase();
      const local = allCongregations.find((k) => k.code.replace(/[\s-]/g, '').toUpperCase() === norm);
      if (local || !real) return local ?? null;
      const code = norm.replace(/^([A-Z]{2})(\d{4})$/, '$1-$2');
      const snap = await getDocs(query(col('congregations'), where('code', '==', code), limit(1)));
      const d = snap.docs[0];
      return d ? ({ ...(d.data() as Congregation), id: d.id, distance: '—' } as Congregation) : null;
    },
    [allCongregations, real]
  );

  const locateMe = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') return false;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      return true;
    } catch {
      return false;
    }
  }, []);

  const patchCongregation = useCallback(
    (id: string, p: Partial<Congregation>) => {
      setCongregationPatches((all) => ({ ...all, [id]: { ...all[id], ...p } }));
      db.update('congregations', id, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === undefined ? FIELD_DELETE() : v])));
    },
    [db]
  );

  const addCurrent = useCallback(
    (name: string) => {
      const c: ReligiousCurrent = { id: db.newId('cur'), religion, name, custom: true };
      setDemoCurrents((list) => [...list, c]);
      db.set('currents', c.id, c);
      return c;
    },
    [db, religion]
  );

  const setCongregationCurrent = useCallback((id: string, currentId: string) => patchCongregation(id, { currentId }), [patchCongregation]);
  const joinGroup = useCallback((id: string, groupId: string) => patchCongregation(id, { groupId }), [patchCongregation]);
  const leaveGroup = useCallback((id: string) => patchCongregation(id, { groupId: undefined }), [patchCongregation]);

  const createGroup = useCallback(
    (id: string, name: string, description?: string) => {
      const k = allCongregations.find((x) => x.id === id);
      const g: CommunityGroup = { id: db.newId('grp'), religion, name, description, currentId: k?.currentId, headCongregationId: id };
      setDemoGroups((list) => [...list, g]);
      db.set('groups', g.id, g);
      patchCongregation(id, { groupId: g.id });
      return g;
    },
    [allCongregations, patchCongregation, db, religion]
  );

  // ---- Équipe : un code d'accès par personne, utilisé ensuite à la connexion.
  const addStaff = useCallback(
    (input: NewStaffInput) => {
      const prefix = { deputy: 'RB', treasurer: 'TR', organizer: 'OR' }[input.role];
      const code = `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`;
      const s: StaffMember = { id: real ? code : db.newId('st'), congregationId, ...input, code, status: 'invited', createdBy: uid ?? undefined };
      (real ? setStaff : setDemoStaff)((list) => [...list, s]);
      db.set('staffInvites', code, s);
      return s;
    },
    [congregationId, db, real, uid, setStaff]
  );

  const removeStaff = useCallback(
    (id: string) => {
      const s = staff.find((x) => x.id === id) ?? demoStaff.find((x) => x.id === id);
      (real ? setStaff : setDemoStaff)((list) => list.filter((x) => x.id !== id));
      if (real && s) {
        db.batch([{ type: 'delete', coll: 'staffInvites', id: s.code }, ...(s.claimedBy ? [{ type: 'delete' as const, coll: 'memberships' as const, id: `${s.congregationId}_${s.claimedBy}` }] : [])]);
      }
    },
    [staff, demoStaff, real, db, setStaff]
  );

  // ---- Moyens de paiement
  const setPayments = real ? setPaymentLinks : setDemoPayments;
  const connectPayment = useCallback(
    (input: { provider: PaymentLink['provider']; account: string; accountId: string }) => {
      const all = real ? paymentLinks : demoPayments;
      const others = all.filter((p) => !(p.congregationId === congregationId && p.provider === input.provider));
      const hasDefault = others.some((p) => p.congregationId === congregationId && p.isDefault);
      const created: PaymentLink = { id: db.newId('pay'), congregationId, ...input, connectedAt: new Date().toISOString(), isDefault: !hasDefault, testPayments: 0 };
      setPayments([...others, created]);
      const replaced = all.filter((p) => p.congregationId === congregationId && p.provider === input.provider);
      db.batch([...replaced.map((p) => ({ type: 'delete' as const, coll: 'paymentLinks' as const, id: p.id })), { type: 'set', coll: 'paymentLinks', id: created.id, data: created }]);
      return created;
    },
    [real, paymentLinks, demoPayments, congregationId, db, setPayments]
  );
  const disconnectPayment = useCallback(
    (id: string) => {
      const all = real ? paymentLinks : demoPayments;
      const gone = all.find((p) => p.id === id);
      const rest = all.filter((p) => p.id !== id);
      // Le premier compte restant devient le compte par défaut.
      const next = gone?.isDefault ? rest.find((p) => p.congregationId === gone.congregationId) : undefined;
      setPayments(rest.map((p) => (next && p.id === next.id ? { ...p, isDefault: true } : p)));
      db.batch([{ type: 'delete', coll: 'paymentLinks', id }, ...(next ? [{ type: 'update' as const, coll: 'paymentLinks' as const, id: next.id, data: { isDefault: true } }] : [])]);
    },
    [real, paymentLinks, demoPayments, db, setPayments]
  );
  const setDefaultPayment = useCallback(
    (id: string) => {
      const all = real ? paymentLinks : demoPayments;
      setPayments(all.map((p) => (p.congregationId === congregationId ? { ...p, isDefault: p.id === id } : p)));
      db.batch(all.filter((p) => p.congregationId === congregationId).map((p) => ({ type: 'update' as const, coll: 'paymentLinks' as const, id: p.id, data: { isDefault: p.id === id } })));
    },
    [real, paymentLinks, demoPayments, congregationId, db, setPayments]
  );
  const testPayment = useCallback(
    (id: string) => {
      setPayments((list) => list.map((p) => (p.id === id ? { ...p, testPayments: p.testPayments + 1 } : p)));
      db.update('paymentLinks', id, { testPayments: FIELD_INCREMENT(1) });
    },
    [db, setPayments]
  );

  // ---- Dons
  const donate = useCallback(
    ({ type, amount, cause, dedication, pledgeId, paymentLinkId }: DonateInput) => {
      const id = db.newId('d');
      const d: Donation = { id, congregationId, uid: uid ?? undefined, type, amount, cause, dedication, date: todayISO(), pledgeId: pledgeId, paymentLinkId } as Donation;
      setDonations((list) => [d, ...list]);
      db.set('donations', id, d);
      if (pledgeId) {
        setPledges((list) => list.map((p) => (p.id === pledgeId ? { ...p, status: 'paid', settledAt: todayISO() } : p)));
        db.update('pledges', pledgeId, { status: 'paid', settledAt: todayISO() });
      }
      return amount;
    },
    [db, congregationId, uid, setDonations, setPledges]
  );

  const askQuestion = useCallback(
    ({ subject, category, text, anonymous, askedBy }: AskInput) => {
      const id = db.newId('q');
      const date = todayISO();
      const name = anonymous ? 'Anonyme' : askedBy;
      const q: Question = {
        id,
        congregationId,
        askerUid: uid ?? undefined,
        subject,
        category,
        status: 'pending',
        askedBy: name,
        anonymous,
        isPublic: false,
        date,
        messages: [{ id: `${id}-m1`, author: 'member', name, text, date }],
      };
      setQuestions((list) => [q, ...list]);
      db.set('questions', id, q);
      return q;
    },
    [db, congregationId, uid, setQuestions]
  );

  const answerQuestion = useCallback(
    (id: string, text: string, sources: string[]) => {
      const ravName = findCongregation(congregationId).rav.name;
      const answer = { id: `${id}-a${Date.now()}`, author: 'rav' as const, name: ravName, text, sources: sources.length ? sources : undefined, date: todayISO() };
      const q = latestQuestions.current.find((x) => x.id === id);
      if (!q) return;
      const next: Question = { ...q, status: 'answered', messages: [...q.messages, answer] };
      latestQuestions.current = latestQuestions.current.map((x) => (x.id === id ? next : x));
      setQuestions(latestQuestions.current);
      db.update('questions', id, { status: 'answered', messages: next.messages });
    },
    [congregationId, findCongregation, db, setQuestions]
  );

  const markCourseRead = useCallback(
    (id: string) => {
      if (readCourses.includes(id)) return;
      if (real) updateUser({ readCourses: [...readCourses, id] });
      else setDemoRead((list) => [...list, id]);
    },
    [real, readCourses, updateUser]
  );

  const setMaasserInput = useCallback(
    (m: MaasserInput) => {
      if (real) updateUser({ maasserInput: m } as Partial<typeof user>);
      else setDemoMaasser(m);
    },
    [real, updateUser]
  );

  const addCourse = useCallback(
    ({ title, subtitle, category, text, media }: NewCourseInput) => {
      const course: Course = {
        id: db.newId('c'),
        congregationId,
        authorUid: uid ?? undefined,
        title,
        subtitle,
        category,
        teacher: findCongregation(congregationId).rav.name,
        duration: `${Math.max(2, Math.round(text.split(/\s+/).length / 150))} min`,
        level: 'Tous niveaux',
        date: todayISO(),
        featured: true,
        media,
        sections: textToSections(text),
      };
      const previous = courses.filter((c) => ofCongregation(congregationId)(c) && c.featured);
      setCourses((list) => [course, ...list.map((c) => (ofCongregation(congregationId)(c) ? { ...c, featured: false } : c))]);
      db.batch([{ type: 'set', coll: 'courses', id: course.id, data: course }, ...previous.map((c) => ({ type: 'update' as const, coll: 'courses' as const, id: c.id, data: { featured: false } }))]);
      return course;
    },
    [db, congregationId, uid, findCongregation, ofCongregation, courses, setCourses]
  );

  const updateHolidayTime = useCallback(
    (holidayId: string, index: number, value: string) => {
      const h = holidays.find((x) => x.id === holidayId);
      if (!h) return;
      const next = { ...h, congregationId: h.congregationId ?? congregationId, times: h.times.map((t, i) => (i === index ? { ...t, value } : t)) };
      setHolidays((list) => list.map((x) => (x.id === holidayId ? next : x)));
      db.set('holidays', holidayId, next, true);
    },
    [holidays, congregationId, db, setHolidays]
  );

  const updateService = useCallback(
    (name: string, field: 'weekday' | 'shabbat', value: string) => {
      const next = services.map((s) => (s.name === name ? { ...s, [field]: value } : s));
      if (real) patchCongregation(congregationId, { services: next });
      else setDemoServices(next);
    },
    [services, real, patchCongregation, congregationId]
  );

  const addEvent = useCallback(
    (input: NewEventInput) => {
      const e: AgendaEvent = { id: db.newId('a'), congregationId, ...input };
      setAgenda((list) => [...list, e].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)));
      db.set('agenda', e.id, e);
    },
    [db, congregationId, setAgenda]
  );

  const removeEvent = useCallback(
    (id: string) => {
      setAgenda((list) => list.filter((e) => e.id !== id));
      db.remove('agenda', id);
    },
    [db, setAgenda]
  );

  const addPledge = useCallback(
    ({ member, memberUid, category, label, amount, dueDate, origin }: NewPledgeInput) => {
      const p: Pledge = { id: db.newId('p'), congregationId, member, memberUid, category, label, amount, dueDate, origin, status: 'due' };
      setPledges((list) => [p, ...list]);
      db.set('pledges', p.id, p);
    },
    [db, congregationId, setPledges]
  );

  const removePledge = useCallback(
    (id: string) => {
      setPledges((list) => list.filter((p) => p.id !== id));
      db.remove('pledges', id);
    },
    [db, setPledges]
  );

  const updatePledgeNote = useCallback(
    (id: string, note: string) => {
      setPledges((list) => list.map((p) => (p.id === id ? { ...p, note } : p)));
      db.update('pledges', id, { note });
    },
    [db, setPledges]
  );

  // Le responsable marque un don comme acquitté : il passe dans « Réglés » et entre dans l'historique des dons.
  const settlePledge = useCallback(
    (id: string) => {
      const p = pledges.find((x) => x.id === id);
      if (!p) return;
      const ops: Parameters<Db['batch']>[0] = [{ type: 'update', coll: 'pledges', id, data: { status: 'paid', settledAt: todayISO() } }];
      if (p.status === 'due') {
        const d: Donation = { id: db.newId('d'), congregationId: p.congregationId ?? congregationId, uid: p.memberUid, type: 'engagement', amount: p.amount, cause: p.label, date: todayISO(), dedication: p.member, pledgeId: id } as Donation;
        setDonations((list) => [d, ...list]);
        ops.push({ type: 'set', coll: 'donations', id: d.id, data: d });
      }
      setPledges((list) => list.map((x) => (x.id === id ? { ...x, status: 'paid', settledAt: todayISO() } : x)));
      db.batch(ops);
    },
    [pledges, db, congregationId, setDonations, setPledges]
  );

  const addCategory = useCallback(
    (name: string) => {
      const cat: DonationCategory = { id: db.newId('cat'), congregationId, name, icon: 'folder-star', items: [] };
      setCategories((list) => [...list, cat]);
      db.set('donationCategories', cat.id, cat);
      return cat;
    },
    [db, congregationId, setCategories]
  );

  const addSubcategory = useCallback(
    (categoryId: string, name: string, amount: number) => {
      const item = { id: db.newId('item'), name, amount };
      const cat = categories.find((c) => c.id === categoryId);
      setCategories((list) => list.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, item] } : c)));
      if (cat) db.update('donationCategories', categoryId, { items: [...cat.items, item] });
    },
    [db, categories, setCategories]
  );

  const addDayEntry = useCallback(
    (date: string, name: string, time: string) => {
      const e: DayEntry = { id: db.newId('e'), congregationId, date, name, time };
      setDayEntries((list) => [...list, e]);
      db.set('dayEntries', e.id, e);
    },
    [db, congregationId, setDayEntries]
  );

  const addDayEntries = useCallback(
    (entries: { date: string; name: string; time: string }[]) => {
      const fresh = entries.filter((e) => !dayEntries.some((x) => x.date === e.date && x.name === e.name && ofCongregation(congregationId)(x))).map((e) => ({ id: db.newId('e'), congregationId, ...e }));
      setDayEntries((list) => [...list, ...fresh]);
      db.batch(fresh.map((e) => ({ type: 'set' as const, coll: 'dayEntries' as const, id: e.id, data: e })));
      return entries.length;
    },
    [dayEntries, ofCongregation, congregationId, db, setDayEntries]
  );

  const removeDayEntry = useCallback(
    (id: string) => {
      setDayEntries((list) => list.filter((e) => e.id !== id));
      db.remove('dayEntries', id);
    },
    [db, setDayEntries]
  );

  const addTheme = useCallback(
    (name: string) => {
      if (courseThemes.includes(name)) return;
      if (real) patchCongregation(congregationId, { themes: [...courseThemes, name] });
      else setDemoThemes((list) => [...list, name]);
    },
    [courseThemes, real, patchCongregation, congregationId]
  );

  // Le responsable rend une question-réponse publique, en l'anonymisant si demandé.
  const publishQuestion = useCallback(
    (id: string, anonymize: boolean) => {
      const q = latestQuestions.current.find((x) => x.id === id);
      if (!q) return;
      const next: Question = {
        ...q,
        isPublic: true,
        anonymous: anonymize ? true : q.anonymous,
        askedBy: anonymize ? 'Anonyme' : q.askedBy,
        messages: q.messages.map((m) => (anonymize && m.author === 'member' ? { ...m, name: 'Anonyme' } : m)),
      };
      latestQuestions.current = latestQuestions.current.map((x) => (x.id === id ? next : x));
      setQuestions(latestQuestions.current);
      db.update('questions', id, { isPublic: true, anonymous: next.anonymous, askedBy: next.askedBy, messages: next.messages });
    },
    [db, setQuestions]
  );

  const startLive = useCallback(
    (title: string) => {
      const session: LiveSession = { title, startedAt: new Date().toISOString(), viewers: 0, notified: findCongregation(congregationId).members };
      if (real) {
        setLives((list) => [...list.filter((l) => l.id !== congregationId), { ...session, id: congregationId, active: true }]);
        db.set('lives', congregationId, { ...session, congregationId, active: true, hostUid: uid });
      } else setDemoLive(session);
    },
    [real, congregationId, findCongregation, db, uid, setLives]
  );

  const endLive = useCallback(() => {
    if (real) {
      setLives((list) => list.map((l) => (l.id === congregationId ? { ...l, active: false } : l)));
      db.update('lives', congregationId, { active: false, endedAt: new Date().toISOString() });
    } else setDemoLive(null);
  }, [real, congregationId, db, setLives]);

  const addMemberDate = useCallback(
    (input: NewMemberDateInput) => {
      const d: MemberDate = { id: db.newId('md'), congregationId, uid: input.memberUid, ...input };
      setMemberDates((list) => [...list, d]);
      db.set('memberDates', d.id, d);
    },
    [db, congregationId, setMemberDates]
  );

  const removeMemberDate = useCallback(
    (id: string) => {
      setMemberDates((list) => list.filter((d) => d.id !== id));
      db.remove('memberDates', id);
    },
    [db, setMemberDates]
  );

  const sendReminder = useCallback(
    (id: string) => {
      setPledges((list) => list.map((p) => (p.id === id ? { ...p, lastReminder: todayISO() } : p)));
      db.update('pledges', id, { lastReminder: todayISO() });
    },
    [db, setPledges]
  );

  const value = useMemo<AppStateValue>(() => {
    const mine = ofCongregation(congregationId);
    const month = todayISO().slice(0, 7);
    // Les dons du fidèle : les siens (en base, ceux portant son uid ; en démo, tous).
    const myDonations = real ? donations.filter((d) => d.uid === uid) : donations;
    const totalGiven = myDonations.reduce((s, d) => s + d.amount, 0);
    const thisMonth = myDonations.filter((d) => d.date.startsWith(month));
    const givenThisMonth = thisMonth.reduce((s, d) => s + d.amount, 0);
    const maasserGivenThisMonth = thisMonth.filter((d) => d.type === 'maasser').reduce((s, d) => s + d.amount, 0);
    const myAsked = real ? questions.filter((q) => q.askerUid === uid) : questions;
    const points = totalGiven + readCourses.length * 18 + myAsked.filter((q) => !q.anonymous).length * 5;

    const levels = seed.gamification.levels;
    let levelIndex = 0;
    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].min) levelIndex = i;
    }
    const level = levels[levelIndex];
    const nextLevel = levels[levelIndex + 1] ?? null;
    const levelProgress = nextLevel ? (points - level.min) / (nextLevel.min - level.min) : 1;

    const months = new Set(myDonations.map((d) => d.date.slice(0, 7)));
    let streakMonths = 0;
    const cursor = new Date();
    while (months.has(todayISO(cursor).slice(0, 7))) {
      streakMonths++;
      cursor.setMonth(cursor.getMonth() - 1);
    }

    return {
      seed,
      backendMode: db.mode,
      members,
      congregations: allCongregations,
      congregation,
      congregationId,
      myCongregations,
      setCongregation,
      joinCongregation,
      leaveCongregation,
      createCongregation,
      lookupCongregationByCode,
      userCoords,
      locateMe,
      myStaff,
      myPaymentLinks,
      connectPayment,
      disconnectPayment,
      setDefaultPayment,
      testPayment,
      currents,
      groups,
      currentOf: (k: Congregation) => currents.find((c) => c.id === k.currentId),
      groupOf: (k: Congregation) => groups.find((g) => g.id === k.groupId),
      addCurrent,
      setCongregationCurrent,
      joinGroup,
      leaveGroup,
      createGroup,
      addStaff,
      removeStaff,
      donations,
      pledges,
      questions,
      courses,
      holidays,
      services,
      agenda,
      dayEntries,
      myPledges: pledges.filter(mine),
      myQuestions: questions.filter(mine),
      myCourses: courses.filter(mine),
      myAgenda: agenda.filter(mine),
      myDayEntries: dayEntries.filter(mine),
      readCourses,
      maasserInput,
      categories: real ? categories.filter(mine) : categories,
      totalGiven,
      givenThisMonth,
      maasserGivenThisMonth,
      points,
      level,
      levelIndex,
      nextLevel,
      levelProgress,
      streakMonths,
      donate,
      askQuestion,
      answerQuestion,
      markCourseRead,
      setMaasserInput,
      addCourse,
      updateHolidayTime,
      updateService,
      addEvent,
      removeEvent,
      addPledge,
      removePledge,
      updatePledgeNote,
      sendReminder,
      settlePledge,
      addCategory,
      addSubcategory,
      addDayEntry,
      addDayEntries,
      removeDayEntry,
      courseThemes,
      addTheme,
      publishQuestion,
      live,
      startLive,
      endLive,
      memberDates,
      myMemberDates: memberDates.filter(mine),
      addMemberDate,
      removeMemberDate,
    };
  }, [
    seed,
    db.mode,
    real,
    uid,
    members,
    ofCongregation,
    congregation,
    congregationId,
    myCongregations,
    setCongregation,
    joinCongregation,
    leaveCongregation,
    createCongregation,
    lookupCongregationByCode,
    userCoords,
    locateMe,
    allCongregations,
    myStaff,
    myPaymentLinks,
    connectPayment,
    disconnectPayment,
    setDefaultPayment,
    testPayment,
    currents,
    groups,
    addCurrent,
    setCongregationCurrent,
    joinGroup,
    leaveGroup,
    createGroup,
    addStaff,
    removeStaff,
    donations,
    pledges,
    questions,
    courses,
    holidays,
    services,
    agenda,
    dayEntries,
    readCourses,
    maasserInput,
    categories,
    donate,
    askQuestion,
    answerQuestion,
    markCourseRead,
    setMaasserInput,
    addCourse,
    updateHolidayTime,
    updateService,
    addEvent,
    removeEvent,
    addPledge,
    removePledge,
    updatePledgeNote,
    sendReminder,
    settlePledge,
    addCategory,
    addSubcategory,
    addDayEntry,
    addDayEntries,
    removeDayEntry,
    courseThemes,
    addTheme,
    publishQuestion,
    live,
    startLive,
    endLive,
    memberDates,
    addMemberDate,
    removeMemberDate,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
