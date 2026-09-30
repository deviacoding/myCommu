import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
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
import { setCurrency, todayISO } from '../utils/time';

interface DonateInput {
  type: DonationType;
  amount: number;
  cause: string;
  dedication?: string;
  pledgeId?: string;
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
  category?: string;
  label: string;
  amount: number;
  dueDate: string;
  origin: string;
}

interface AppStateValue {
  seed: ReligionSeed;
  members: Member[];
  // Communautés
  congregations: Congregation[];
  congregation: Congregation; // communauté affichée
  congregationId: string;
  myCongregations: string[]; // adhésions du fidèle
  setCongregation: (id: string) => void;
  joinCongregation: (id: string) => void;
  leaveCongregation: (id: string) => void;
  createCongregation: (input: NewCongregationInput) => Congregation;
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

let seq = 100;

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

export function AppStateProvider({ children, seed }: { children: ReactNode; seed: ReligionSeed }) {
  const defaultCongregation = seed.defaultCongregation;
  const ofCongregation = useCallback(
    (id: string) => (item: { congregationId?: string }) => (item.congregationId ?? defaultCongregation) === id,
    [defaultCongregation]
  );
  // Communautés créées dans l'application par un responsable, en plus de celles de la démo.
  const [createdCongregations, setCreatedCongregations] = useState<Congregation[]>([]);
  // Équipe de démo de la communauté principale : un trésorier et un organisateur déjà actifs.
  const demoStaff = useCallback(
    (s: ReligionSeed): StaffMember[] => [
      { id: 'st1', name: s.members[2]?.name ?? 'Trésorier', contact: '+33 6 11 22 33 44', role: 'treasurer', code: 'TR-4821', status: 'active' },
      { id: 'st2', name: s.members[5]?.name ?? 'Organisateur', contact: 'organisation@mycommu.app', role: 'organizer', code: 'OR-3317', status: 'active' },
    ],
    []
  );
  const [staff, setStaff] = useState<StaffMember[]>(() => demoStaff(seed));
  // Paiement de démo : la communauté principale a déjà relié son compte Stripe.
  const demoPayments = useCallback(
    (s: ReligionSeed): PaymentLink[] => [
      { id: 'pay1', congregationId: s.defaultCongregation, provider: 'stripe', account: 'tresorerie@' + (s.congregations.find((k) => k.id === s.defaultCongregation)?.name ?? 'communaute').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '') + '.org', accountId: 'acct_1QmC' + s.defaultCongregation.slice(0, 4).toUpperCase() + '7Kz', connectedAt: '2026-03-02T10:00:00', isDefault: true, testPayments: 0 },
    ],
    []
  );
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(() => demoPayments(seed));
  const [currents, setCurrents] = useState<ReligiousCurrent[]>(seed.currents);
  const [groups, setGroups] = useState<CommunityGroup[]>(seed.groups);
  // Modifications apportées aux communautés (courant, groupe) : appliquées par-dessus les données de démo.
  const [congregationPatches, setCongregationPatches] = useState<Record<string, Partial<Congregation>>>({});
  const allCongregations = useMemo(
    () =>
      [...createdCongregations, ...seed.congregations].map((k) => {
        const p = congregationPatches[k.id];
        const merged = p ? { ...k, ...p } : k;
        const cur = currents.find((c) => c.id === merged.currentId);
        return cur ? { ...merged, rite: cur.name } : merged;
      }),
    [createdCongregations, seed, congregationPatches, currents]
  );
  const findCongregation = useCallback((id: string) => allCongregations.find((c) => c.id === id) ?? allCongregations[0], [allCongregations]);

  // Changement de confession : on recharge toutes les données du nouveau seed sans remonter la navigation.
  const [loadedSeed, setLoadedSeed] = useState(seed);
  useEffect(() => {
    setCurrency(seed.currency);
    if (seed === loadedSeed) return;
    setLoadedSeed(seed);
    setCongregation(seed.defaultCongregation);
    setMyCongregations([]);
    setCreatedCongregations([]);
    setCurrents(seed.currents);
    setGroups(seed.groups);
    setCongregationPatches({});
    setStaff(demoStaff(seed));
    setPaymentLinks(demoPayments(seed));
    setDonations(seed.donations);
    setPledges(seed.pledges);
    setQuestions(seed.questions);
    setCourses(seed.courses);
    setHolidays(seed.holidays);
    setServices(seed.services);
    setAgenda(seed.agenda);
    setCategories(seed.categories);
    setDayEntries(seed.dayEntries);
    setReadCourses(seed.courses.filter((c) => c.featured).map((c) => c.id).slice(0, 1));
    setCourseThemes(seed.themes);
    setLive(null);
    setMemberDates(seed.memberDates);
    setMaasserInput(seed.tithe?.mode === 'wealth' ? { salary: 9000, school: 0, talmudTorah: 0, other: 0 } : { salary: seed.currency === '₪' ? 12000 : 2400, school: seed.currency === '₪' ? 2500 : 0, talmudTorah: seed.currency === '₪' ? 300 : 0, other: 0 });
  }, [seed, loadedSeed]);

  const [congregationId, setCongregation] = useState<string>(defaultCongregation);
  const [myCongregations, setMyCongregations] = useState<string[]>([]);
  const [donations, setDonations] = useState<Donation[]>(seed.donations);
  const [pledges, setPledges] = useState<Pledge[]>(seed.pledges);
  const [questions, setQuestions] = useState<Question[]>(seed.questions);
  const [courses, setCourses] = useState<Course[]>(seed.courses);
  const [holidays, setHolidays] = useState<Holiday[]>(seed.holidays);
  const [services, setServices] = useState<DailyService[]>(seed.services);
  const [agenda, setAgenda] = useState<AgendaEvent[]>(seed.agenda);
  const [categories, setCategories] = useState<DonationCategory[]>(seed.categories);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>(seed.dayEntries);
  const [readCourses, setReadCourses] = useState<string[]>(seed.courses.filter((c) => c.featured).map((c) => c.id).slice(0, 1));
  const [courseThemes, setCourseThemes] = useState<string[]>(seed.themes);
  const [live, setLive] = useState<LiveSession | null>(null);
  const [memberDates, setMemberDates] = useState<MemberDate[]>(seed.memberDates);
  const [maasserInput, setMaasserInput] = useState<MaasserInput>(
    seed.tithe?.mode === 'wealth' ? { salary: 9000, school: 0, talmudTorah: 0, other: 0 } : { salary: seed.currency === '₪' ? 12000 : 2400, school: seed.currency === '₪' ? 2500 : 0, talmudTorah: seed.currency === '₪' ? 300 : 0, other: 0 }
  );

  const joinCongregation = useCallback((id: string) => {
    setMyCongregations((list) => (list.includes(id) ? list : [...list, id]));
    setCongregation(id);
  }, []);

  const createCongregation = useCallback((input: NewCongregationInput) => {
    const prefix = input.name.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 2).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || 'CM';
    const k: Congregation = {
      id: 'k' + seq++,
      name: input.name,
      rite: input.rite,
      city: input.city,
      country: input.country,
      address: input.address,
      distance: 'ici',
      code: `${prefix}-${String(1000 + Math.floor(Math.random() * 9000))}`,
      members: 1,
      rav: { name: input.leaderName, title: input.leaderTitle, photo: input.leaderPhoto ? { uri: input.leaderPhoto } : undefined },
      logo: input.logo ? { uri: input.logo } : undefined,
      coords: input.coords,
      isPrivate: input.isPrivate,
      currentId: input.currentId,
      groupId: input.groupId,
      createdByMe: true,
    };
    setCreatedCongregations((list) => [k, ...list]);
    if (input.newGroupName) {
      const g: CommunityGroup = { id: 'grp' + seq++, name: input.newGroupName, currentId: input.currentId, headCongregationId: k.id };
      setGroups((list) => [...list, g]);
      k.groupId = g.id;
    }
    setCongregation(k.id);
    return k;
  }, []);

  const patchCongregation = useCallback((id: string, p: Partial<Congregation>) => {
    setCongregationPatches((all) => ({ ...all, [id]: { ...all[id], ...p } }));
  }, []);

  const addCurrent = useCallback((name: string) => {
    const c: ReligiousCurrent = { id: 'cur' + seq++, name, custom: true };
    setCurrents((list) => [...list, c]);
    return c;
  }, []);

  const setCongregationCurrent = useCallback((id: string, currentId: string) => patchCongregation(id, { currentId }), [patchCongregation]);
  const joinGroup = useCallback((id: string, groupId: string) => patchCongregation(id, { groupId }), [patchCongregation]);
  const leaveGroup = useCallback((id: string) => patchCongregation(id, { groupId: undefined }), [patchCongregation]);

  const createGroup = useCallback(
    (id: string, name: string, description?: string) => {
      const k = allCongregations.find((x) => x.id === id);
      const g: CommunityGroup = { id: 'grp' + seq++, name, description, currentId: k?.currentId, headCongregationId: id };
      setGroups((list) => [...list, g]);
      patchCongregation(id, { groupId: g.id });
      return g;
    },
    [allCongregations, patchCongregation]
  );

  const addStaff = useCallback(
    (input: NewStaffInput) => {
      const prefix = { deputy: 'RB', treasurer: 'TR', organizer: 'OR' }[input.role];
      const s: StaffMember = { id: 'st' + seq++, congregationId, ...input, code: `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`, status: 'invited' };
      setStaff((list) => [...list, s]);
      return s;
    },
    [congregationId]
  );

  const removeStaff = useCallback((id: string) => setStaff((list) => list.filter((s) => s.id !== id)), []);

  const connectPayment = useCallback(
    (input: { provider: PaymentLink['provider']; account: string; accountId: string }) => {
      const others = paymentLinks.filter((p) => !(p.congregationId === congregationId && p.provider === input.provider));
      const hasDefault = others.some((p) => p.congregationId === congregationId && p.isDefault);
      const created: PaymentLink = { id: 'pay' + seq++, congregationId, ...input, connectedAt: new Date().toISOString(), isDefault: !hasDefault, testPayments: 0 };
      setPaymentLinks([...others, created]);
      return created;
    },
    [congregationId, paymentLinks]
  );
  const disconnectPayment = useCallback(
    (id: string) =>
      setPaymentLinks((list) => {
        const gone = list.find((p) => p.id === id);
        const rest = list.filter((p) => p.id !== id);
        // Le premier compte restant devient le compte par défaut.
        if (gone?.isDefault) {
          const next = rest.find((p) => p.congregationId === gone.congregationId);
          if (next) return rest.map((p) => (p.id === next.id ? { ...p, isDefault: true } : p));
        }
        return rest;
      }),
    []
  );
  const setDefaultPayment = useCallback(
    (id: string) => setPaymentLinks((list) => list.map((p) => (p.congregationId === congregationId ? { ...p, isDefault: p.id === id } : p))),
    [congregationId]
  );
  const testPayment = useCallback((id: string) => setPaymentLinks((list) => list.map((p) => (p.id === id ? { ...p, testPayments: p.testPayments + 1 } : p))), []);

  const leaveCongregation = useCallback(
    (id: string) => {
      setMyCongregations((list) => {
        const next = list.filter((x) => x !== id);
        if (congregationId === id && next.length) setCongregation(next[0]);
        return next;
      });
    },
    [congregationId]
  );

  const donate = useCallback(({ type, amount, cause, dedication, pledgeId }: DonateInput) => {
    const id = `d${seq++}`;
    setDonations((list) => [{ id, type, amount, cause, dedication, date: todayISO() }, ...list]);
    if (pledgeId) {
      setPledges((list) => list.map((p) => (p.id === pledgeId ? { ...p, status: 'paid' } : p)));
    }
    return amount;
  }, []);

  const askQuestion = useCallback(
    ({ subject, category, text, anonymous, askedBy }: AskInput) => {
      const id = `q${seq++}`;
      const date = todayISO();
      const name = anonymous ? 'Anonyme' : askedBy;
      const q: Question = {
        id,
        congregationId,
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
      return q;
    },
    [congregationId]
  );

  const answerQuestion = useCallback(
    (id: string, text: string, sources: string[]) => {
      const ravName = findCongregation(congregationId).rav.name;
      setQuestions((list) =>
        list.map((q) =>
          q.id === id
            ? {
                ...q,
                status: 'answered',
                messages: [
                  ...q.messages,
                  { id: `${id}-a${seq++}`, author: 'rav', name: ravName, text, sources: sources.length ? sources : undefined, date: todayISO() },
                ],
              }
            : q
        )
      );
    },
    [congregationId, findCongregation]
  );

  const markCourseRead = useCallback((id: string) => {
    setReadCourses((list) => (list.includes(id) ? list : [...list, id]));
  }, []);

  const addCourse = useCallback(
    ({ title, subtitle, category, text, media }: NewCourseInput) => {
      const course: Course = {
        id: `c${seq++}`,
        congregationId,
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
      setCourses((list) => [course, ...list.map((c) => (ofCongregation(congregationId)(c) ? { ...c, featured: false } : c))]);
      return course;
    },
    [congregationId, findCongregation, ofCongregation]
  );

  const updateHolidayTime = useCallback((holidayId: string, index: number, value: string) => {
    setHolidays((list) =>
      list.map((h) => (h.id === holidayId ? { ...h, times: h.times.map((t, i) => (i === index ? { ...t, value } : t)) } : h))
    );
  }, []);

  const updateService = useCallback((name: string, field: 'weekday' | 'shabbat', value: string) => {
    setServices((list) => list.map((s) => (s.name === name ? { ...s, [field]: value } : s)));
  }, []);

  const addEvent = useCallback(
    (input: NewEventInput) => {
      setAgenda((list) => [...list, { id: `a${seq++}`, congregationId, ...input }].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)));
    },
    [congregationId]
  );

  const removeEvent = useCallback((id: string) => setAgenda((list) => list.filter((e) => e.id !== id)), []);

  const addPledge = useCallback(
    ({ member, category, label, amount, dueDate, origin }: NewPledgeInput) => {
      setPledges((list) => [{ id: `p${seq++}`, congregationId, member, category, label, amount, dueDate, origin, status: 'due' }, ...list]);
    },
    [congregationId]
  );

  const removePledge = useCallback((id: string) => setPledges((list) => list.filter((p) => p.id !== id)), []);

  const updatePledgeNote = useCallback((id: string, note: string) => {
    setPledges((list) => list.map((p) => (p.id === id ? { ...p, note } : p)));
  }, []);

  // Le responsable marque un don comme acquitté : il passe dans « Réglés » et entre dans l'historique des dons.
  const settlePledge = useCallback((id: string) => {
    setPledges((list) => {
      const p = list.find((x) => x.id === id);
      if (p && p.status === 'due') {
        setDonations((d) => [{ id: `d${seq++}`, type: 'engagement', amount: p.amount, cause: p.label, date: todayISO(), dedication: p.member }, ...d]);
      }
      return list.map((x) => (x.id === id ? { ...x, status: 'paid', settledAt: todayISO() } : x));
    });
  }, []);

  const addCategory = useCallback((name: string) => {
    const cat: DonationCategory = { id: 'cat' + seq++, name, icon: 'folder-star', items: [] };
    setCategories((list) => [...list, cat]);
    return cat;
  }, []);

  const addSubcategory = useCallback((categoryId: string, name: string, amount: number) => {
    setCategories((list) => list.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, { id: 'item' + seq++, name, amount }] } : c)));
  }, []);

  const addDayEntry = useCallback(
    (date: string, name: string, time: string) => {
      setDayEntries((list) => [...list, { id: 'e' + seq++, congregationId, date, name, time }]);
    },
    [congregationId]
  );

  const addDayEntries = useCallback(
    (entries: { date: string; name: string; time: string }[]) => {
      setDayEntries((list) => {
        const fresh = entries.filter((e) => !list.some((x) => x.date === e.date && x.name === e.name && (x.congregationId ?? defaultCongregation) === congregationId));
        return [...list, ...fresh.map((e) => ({ id: 'e' + seq++, congregationId, ...e }))];
      });
      return entries.length;
    },
    [congregationId, defaultCongregation]
  );

  const removeDayEntry = useCallback((id: string) => setDayEntries((list) => list.filter((e) => e.id !== id)), []);

  const addTheme = useCallback((name: string) => {
    setCourseThemes((list) => (list.includes(name) ? list : [...list, name]));
  }, []);

  // Le responsable rend une question-réponse publique, en l'anonymisant si demandé.
  const publishQuestion = useCallback((id: string, anonymize: boolean) => {
    setQuestions((list) =>
      list.map((q) =>
        q.id === id
          ? {
              ...q,
              isPublic: true,
              anonymous: anonymize ? true : q.anonymous,
              askedBy: anonymize ? 'Anonyme' : q.askedBy,
              messages: q.messages.map((m) => (anonymize && m.author === 'member' ? { ...m, name: 'Anonyme' } : m)),
            }
          : q
      )
    );
  }, []);

  const startLive = useCallback(
    (title: string) => {
      setLive({ title, startedAt: new Date().toISOString(), viewers: 0, notified: findCongregation(congregationId).members });
    },
    [congregationId, findCongregation]
  );

  const endLive = useCallback(() => setLive(null), []);

  const addMemberDate = useCallback(
    (input: NewMemberDateInput) => {
      setMemberDates((list) => [...list, { id: 'md' + seq++, congregationId, ...input }]);
    },
    [congregationId]
  );

  const removeMemberDate = useCallback((id: string) => setMemberDates((list) => list.filter((d) => d.id !== id)), []);

  const sendReminder = useCallback((id: string) => {
    setPledges((list) => list.map((p) => (p.id === id ? { ...p, lastReminder: todayISO() } : p)));
  }, []);

  const value = useMemo<AppStateValue>(() => {
    const mine = ofCongregation(congregationId);
    const month = todayISO().slice(0, 7);
    const totalGiven = donations.reduce((s, d) => s + d.amount, 0);
    const thisMonth = donations.filter((d) => d.date.startsWith(month));
    const givenThisMonth = thisMonth.reduce((s, d) => s + d.amount, 0);
    const maasserGivenThisMonth = thisMonth.filter((d) => d.type === 'maasser').reduce((s, d) => s + d.amount, 0);
    const points = totalGiven + readCourses.length * 18 + questions.filter((q) => !q.anonymous).length * 5;

    const levels = seed.gamification.levels;
    let levelIndex = 0;
    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].min) levelIndex = i;
    }
    const level = levels[levelIndex];
    const nextLevel = levels[levelIndex + 1] ?? null;
    const levelProgress = nextLevel ? (points - level.min) / (nextLevel.min - level.min) : 1;

    const months = new Set(donations.map((d) => d.date.slice(0, 7)));
    let streakMonths = 0;
    const cursor = new Date();
    while (months.has(todayISO(cursor).slice(0, 7))) {
      streakMonths++;
      cursor.setMonth(cursor.getMonth() - 1);
    }

    return {
      seed,
      members: seed.members,
      congregations: allCongregations,
      congregation: findCongregation(congregationId),
      congregationId,
      myCongregations,
      setCongregation,
      joinCongregation,
      leaveCongregation,
      createCongregation,
      myStaff: staff.filter(mine),
      myPaymentLinks: paymentLinks.filter((p) => p.congregationId === congregationId),
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
      categories,
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
    ofCongregation,
    findCongregation,
    congregationId,
    myCongregations,
    joinCongregation,
    leaveCongregation,
    createCongregation,
    allCongregations,
    staff,
    paymentLinks,
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
