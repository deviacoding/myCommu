import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { Donation, DonationType, Pledge, Question, QuestionCategory, SoulLevel } from '../types';
import { initialDonations, initialPledges, soulLevels } from '../mocks/donations';
import { initialQuestions } from '../mocks/questions';
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

interface AppStateValue {
  donations: Donation[];
  pledges: Pledge[];
  questions: Question[];
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
  markCourseRead: (id: string) => void;
  setMaasserInput: (m: MaasserInput) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let seq = 100;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [pledges, setPledges] = useState<Pledge[]>(initialPledges);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
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

  const markCourseRead = useCallback((id: string) => {
    setReadCourses((list) => (list.includes(id) ? list : [...list, id]));
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
      markCourseRead,
      setMaasserInput,
    };
  }, [donations, pledges, questions, readCourses, maasserInput, donate, askQuestion, markCourseRead]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
