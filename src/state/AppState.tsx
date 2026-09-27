import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import {
  AgendaEvent,
  Course,
  CourseCategory,
  DailyService,
  Donation,
  DonationType,
  Holiday,
  Pledge,
  Question,
  QuestionCategory,
  SoulLevel,
} from '../types';
import { initialDonations, initialPledges, soulLevels } from '../mocks/donations';
import { initialQuestions } from '../mocks/questions';
import { courses as initialCourses } from '../mocks/courses';
import { tishreiHolidays, dailyServices as initialServices, agendaEvents } from '../mocks/schedule';
import { rav } from '../mocks/rav';
import { todayISO } from '../utils/time';

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
}

export interface NewEventInput {
  title: string;
  date: string;
  time: string;
  place: string;
  category: AgendaEvent['category'];
  description?: string;
}

export interface NewPledgeInput {
  member: string;
  label: string;
  amount: number;
  dueDate: string;
  origin: string;
}

interface AppStateValue {
  donations: Donation[];
  pledges: Pledge[];
  questions: Question[];
  courses: Course[];
  holidays: Holiday[];
  services: DailyService[];
  agenda: AgendaEvent[];
  readCourses: string[];
  maasserInput: MaasserInput;
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [pledges, setPledges] = useState<Pledge[]>(initialPledges);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [holidays, setHolidays] = useState<Holiday[]>(tishreiHolidays);
  const [services, setServices] = useState<DailyService[]>(initialServices);
  const [agenda, setAgenda] = useState<AgendaEvent[]>(agendaEvents);
  const [readCourses, setReadCourses] = useState<string[]>(['souccot-refuge']);
  const [maasserInput, setMaasserInput] = useState<MaasserInput>({ salary: 12000, school: 2500, talmudTorah: 300, other: 0 });

  const donate = useCallback(({ type, amount, cause, dedication, pledgeId }: DonateInput) => {
    const id = `d${seq++}`;
    setDonations((list) => [{ id, type, amount, cause, dedication, date: todayISO() }, ...list]);
    if (pledgeId) {
      setPledges((list) => list.map((p) => (p.id === pledgeId ? { ...p, status: 'paid' } : p)));
    }
    return amount;
  }, []);

  const askQuestion = useCallback(({ subject, category, text, anonymous, askedBy }: AskInput) => {
    const id = `q${seq++}`;
    const date = todayISO();
    const name = anonymous ? 'Anonyme' : askedBy;
    const q: Question = {
      id,
      subject,
      category,
      status: 'pending',
      askedBy: name,
      anonymous,
      date,
      messages: [{ id: `${id}-m1`, author: 'member', name, text, date }],
    };
    setQuestions((list) => [q, ...list]);
    return q;
  }, []);

  const answerQuestion = useCallback((id: string, text: string, sources: string[]) => {
    setQuestions((list) =>
      list.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'answered',
              messages: [
                ...q.messages,
                { id: `${id}-a${seq++}`, author: 'rav', name: rav.name, text, sources: sources.length ? sources : undefined, date: todayISO() },
              ],
            }
          : q
      )
    );
  }, []);

  const markCourseRead = useCallback((id: string) => {
    setReadCourses((list) => (list.includes(id) ? list : [...list, id]));
  }, []);

  const addCourse = useCallback(({ title, subtitle, category, text }: NewCourseInput) => {
    const course: Course = {
      id: `c${seq++}`,
      title,
      subtitle,
      category,
      teacher: rav.name,
      duration: `${Math.max(2, Math.round(text.split(/\s+/).length / 150))} min`,
      level: 'Tous niveaux',
      date: todayISO(),
      featured: true,
      sections: textToSections(text),
    };
    setCourses((list) => [course, ...list.map((c) => ({ ...c, featured: false }))]);
    return course;
  }, []);

  const updateHolidayTime = useCallback((holidayId: string, index: number, value: string) => {
    setHolidays((list) =>
      list.map((h) => (h.id === holidayId ? { ...h, times: h.times.map((t, i) => (i === index ? { ...t, value } : t)) } : h))
    );
  }, []);

  const updateService = useCallback((name: string, field: 'weekday' | 'shabbat', value: string) => {
    setServices((list) => list.map((s) => (s.name === name ? { ...s, [field]: value } : s)));
  }, []);

  const addEvent = useCallback((input: NewEventInput) => {
    setAgenda((list) => [...list, { id: `a${seq++}`, ...input }].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)));
  }, []);

  const removeEvent = useCallback((id: string) => setAgenda((list) => list.filter((e) => e.id !== id)), []);

  const addPledge = useCallback(({ member, label, amount, dueDate, origin }: NewPledgeInput) => {
    setPledges((list) => [{ id: `p${seq++}`, member, label, amount, dueDate, origin, status: 'due' }, ...list]);
  }, []);

  const removePledge = useCallback((id: string) => setPledges((list) => list.filter((p) => p.id !== id)), []);

  const updatePledgeNote = useCallback((id: string, note: string) => {
    setPledges((list) => list.map((p) => (p.id === id ? { ...p, note } : p)));
  }, []);

  const sendReminder = useCallback((id: string) => {
    setPledges((list) => list.map((p) => (p.id === id ? { ...p, lastReminder: todayISO() } : p)));
  }, []);

  const value = useMemo<AppStateValue>(() => {
    const month = todayISO().slice(0, 7);
    const totalGiven = donations.reduce((s, d) => s + d.amount, 0);
    const thisMonth = donations.filter((d) => d.date.startsWith(month));
    const givenThisMonth = thisMonth.reduce((s, d) => s + d.amount, 0);
    const maasserGivenThisMonth = thisMonth.filter((d) => d.type === 'maasser').reduce((s, d) => s + d.amount, 0);
    const points = totalGiven + readCourses.length * 18 + questions.filter((q) => !q.anonymous).length * 5;

    let levelIndex = 0;
    for (let i = 0; i < soulLevels.length; i++) {
      if (points >= soulLevels[i].min) levelIndex = i;
    }
    const level = soulLevels[levelIndex];
    const nextLevel = soulLevels[levelIndex + 1] ?? null;
    const levelProgress = nextLevel ? (points - level.min) / (nextLevel.min - level.min) : 1;

    const months = new Set(donations.map((d) => d.date.slice(0, 7)));
    let streakMonths = 0;
    const cursor = new Date();
    while (months.has(todayISO(cursor).slice(0, 7))) {
      streakMonths++;
      cursor.setMonth(cursor.getMonth() - 1);
    }

    return {
      donations,
      pledges,
      questions,
      courses,
      holidays,
      services,
      agenda,
      readCourses,
      maasserInput,
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
    };
  }, [
    donations,
    pledges,
    questions,
    courses,
    holidays,
    services,
    agenda,
    readCourses,
    maasserInput,
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
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
