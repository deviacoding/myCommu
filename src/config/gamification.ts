import { ActivityEvent, Donation, Question, SoulLevel } from '../types';

// « L'ora qui grandit » : barème, niveaux infinis, titres. Tout part d'événements (activity), de dons
// confirmés et de contenus lus ; les points se recalculent à chaque fois, donc le barème peut changer
// sans perdre l'historique. Voir la proposition validée : docs/GAMIFICATION.md.

export type ActivityType = 'open' | 'schedule' | 'agenda';

// Points des actions quotidiennes (une fois par jour et par type).
export const DAILY_POINTS: Record<ActivityType, number> = { open: 1, schedule: 1, agenda: 1 };

export const RULES = {
  courseRead: 2, // par cours, une fois
  questionAsked: 2, // 1 question comptée par jour
  questionAnswered: 1, // quand le responsable répond
  streak7: 5, // 7 jours d'ouverture d'affilée (par semaine)
  streak30: 20, // 30 jours d'affilée (par mois)
  almsPerBracket: 4, // tsedaka, sadaqa, offrande, dana, promesse réglée : par tranche
  tithePerBracket: 10, // maasser, zakat, dîme : par tranche
  monthlyDonorBonus: 15, // 3 mois d'affilée avec au moins un don
  firstCommunity: 5,
  profileComplete: 2,
};

// Tranches de don selon la devise (10 € / 100 € ; 40 ₪ / 400 ₪).
export function brackets(currency: string): { alms: number; tithe: number } {
  return currency === '₪' ? { alms: 40, tithe: 400 } : { alms: 10, tithe: 100 };
}

// Niveau n : coûte n + 4 points de plus que le précédent ; total T(n) = n(n+9)/2.
export const pointsForLevel = (n: number) => (n * (n + 9)) / 2;
export function levelFor(points: number): number {
  let n = 0;
  while (pointsForLevel(n + 1) <= points) n++;
  return n;
}

// Titres (12 mois glissants).
export const ASSIDUITY_TITLES: { name: string; days: number }[] = [
  { name: 'Régulier', days: 30 },
  { name: 'Fidèle', days: 100 },
  { name: 'Pilier', days: 365 },
];
export const GENEROSITY_TITLES: { name: string; amountEur: number }[] = [
  { name: 'Généreux', amountEur: 180 },
  { name: 'Bienfaiteur', amountEur: 1000 },
  { name: 'Mécène', amountEur: 5000 },
];
// Équivalent approximatif des seuils en shekels (1 € ≈ 4 ₪), pour les communautés israéliennes.
const toCurrency = (eur: number, currency: string) => (currency === '₪' ? eur * 4 : eur);

export interface GamificationInput {
  activity: ActivityEvent[]; // événements quotidiens de l'utilisateur
  donations: Donation[]; // dons de l'utilisateur
  questions: Question[]; // questions posées par l'utilisateur
  readCourses: string[];
  joinedCommunity: boolean;
  profileComplete: boolean;
  currency: string;
  levels: SoulLevel[]; // paliers nommés de la confession (un nom tous les 10 niveaux, puis II, III…)
  today: string; // ISO
}

export interface GamificationSummary {
  points: number;
  assiduityPoints: number;
  generosityPoints: number;
  startPoints: number;
  level: number; // niveau courant (0 au départ)
  levelStart: number; // points au début du niveau courant
  nextLevelPoints: number; // points pour le niveau suivant
  progress: number; // 0..1 dans le niveau courant
  tier: SoulLevel; // palier nommé
  tierIndex: number; // 0..levels.length-1 (pour l'aura)
  streakDays: number; // jours d'ouverture consécutifs (hors jours sans application)
  activeDays12m: number;
  coursesRead: number;
  questionsAsked: number;
  given12m: number;
  assiduityTitle: string | null;
  generosityTitle: string | null;
  nextAssiduityTitle: { name: string; days: number } | null;
  nextGenerosityTitle: { name: string; amount: number } | null;
  nextStep: string;
}

const isoDaysAgo = (today: string, days: number) => {
  const d = new Date(today + 'T12:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

function romanSuffix(n: number): string {
  return ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'][n] ?? ` ${n + 1}`;
}

// Jours d'affilée en remontant depuis aujourd'hui (ou hier, si aujourd'hui n'est pas encore ouvert).
function streakFrom(days: Set<string>, today: string): number {
  let streak = 0;
  let cursor = days.has(today) ? today : isoDaysAgo(today, 1);
  while (days.has(cursor)) {
    streak++;
    cursor = isoDaysAgo(cursor, 1);
  }
  return streak;
}

export function computeGamification(input: GamificationInput): GamificationSummary {
  const { activity, donations, questions, readCourses, currency, levels, today } = input;
  const since12m = isoDaysAgo(today, 365);
  const b = brackets(currency);

  // ---- Assiduité
  const byType = new Map<ActivityType, Set<string>>();
  for (const e of activity) {
    if (!byType.has(e.type)) byType.set(e.type, new Set());
    byType.get(e.type)!.add(e.date);
  }
  let assiduity = 0;
  for (const [type, days] of byType) assiduity += days.size * DAILY_POINTS[type];
  const openDays = byType.get('open') ?? new Set<string>();
  // Séries : on compte toutes les séries passées par tranches de 7 et de 30 jours.
  const sortedDays = [...openDays].sort();
  let run = 0;
  let prev: string | null = null;
  let streakBonus = 0;
  for (const d of sortedDays) {
    run = prev && isoDaysAgo(d, 1) === prev ? run + 1 : 1;
    if (run % 7 === 0) streakBonus += RULES.streak7;
    if (run % 30 === 0) streakBonus += RULES.streak30;
    prev = d;
  }
  assiduity += streakBonus;
  assiduity += readCourses.length * RULES.courseRead;
  const askedDays = new Set(questions.map((q) => q.date));
  assiduity += askedDays.size * RULES.questionAsked + questions.filter((q) => q.status === 'answered').length * RULES.questionAnswered;

  // ---- Générosité (dons confirmés)
  let generosity = 0;
  for (const d of donations) {
    const tithe = d.type === 'maasser';
    generosity += tithe ? Math.floor(d.amount / b.tithe) * RULES.tithePerBracket : Math.floor(d.amount / b.alms) * RULES.almsPerBracket;
  }
  const months = [...new Set(donations.map((d) => d.date.slice(0, 7)))].sort();
  let mrun = 0;
  let mprev: string | null = null;
  for (const m of months) {
    const [y, mo] = m.split('-').map(Number);
    const prevMonth = `${mo === 1 ? y - 1 : y}-${String(mo === 1 ? 12 : mo - 1).padStart(2, '0')}`;
    mrun = mprev === prevMonth ? mrun + 1 : 1;
    if (mrun % 3 === 0) generosity += RULES.monthlyDonorBonus;
    mprev = m;
  }

  // ---- Départ
  const start = (input.joinedCommunity ? RULES.firstCommunity : 0) + (input.profileComplete ? RULES.profileComplete : 0);

  const points = assiduity + generosity + start;
  const level = levelFor(points);
  const levelStart = pointsForLevel(level);
  const nextLevelPoints = pointsForLevel(level + 1);
  const progress = Math.max(0, Math.min(1, (points - levelStart) / (nextLevelPoints - levelStart)));
  const tierRaw = Math.floor(Math.max(0, level - 1) / 10);
  const tierIndex = tierRaw % levels.length;
  const base = levels[tierIndex];
  const tier: SoulLevel = { ...base, name: base.name + romanSuffix(Math.floor(tierRaw / levels.length)), min: pointsForLevel(tierRaw * 10 + 1) };

  // ---- Titres
  const activeDays12m = [...openDays].filter((d) => d >= since12m).length;
  const given12m = donations.filter((d) => d.date >= since12m).reduce((s, d) => s + d.amount, 0);
  const assiduityTitle = [...ASSIDUITY_TITLES].reverse().find((t) => activeDays12m >= t.days)?.name ?? null;
  const nextAssiduityTitle = ASSIDUITY_TITLES.find((t) => activeDays12m < t.days) ?? null;
  const genTitles = GENEROSITY_TITLES.map((t) => ({ name: t.name, amount: toCurrency(t.amountEur, currency) }));
  const generosityTitle = [...genTitles].reverse().find((t) => given12m >= t.amount)?.name ?? null;
  const nextGenerosityTitle = genTitles.find((t) => given12m < t.amount) ?? null;

  // ---- Prochain pas : la suggestion la plus utile aujourd'hui
  const streakDays = streakFrom(openDays, today);
  const missing = nextLevelPoints - points;
  let nextStep: string;
  if (!openDays.has(today)) nextStep = `Ouvrez l’application aujourd’hui pour garder votre série (${streakDays} jour${streakDays > 1 ? 's' : ''}).`;
  else if (streakDays > 0 && streakDays % 7 >= 5) nextStep = `Encore ${7 - (streakDays % 7)} jour${7 - (streakDays % 7) > 1 ? 's' : ''} de suite pour le bonus de série (+${RULES.streak7}).`;
  else if (missing <= RULES.courseRead) nextStep = `Un cours lu en entier (+${RULES.courseRead}) et vous passez au niveau ${level + 1}.`;
  else nextStep = `Il manque ${missing} point${missing > 1 ? 's' : ''} pour le niveau ${level + 1} : un cours lu (+${RULES.courseRead}), une question (+${RULES.questionAsked}), ou un don.`;

  return {
    points,
    assiduityPoints: assiduity,
    generosityPoints: generosity,
    startPoints: start,
    level,
    levelStart,
    nextLevelPoints,
    progress,
    tier,
    tierIndex,
    streakDays,
    activeDays12m,
    coursesRead: readCourses.length,
    questionsAsked: questions.length,
    given12m,
    assiduityTitle,
    generosityTitle,
    nextAssiduityTitle,
    nextGenerosityTitle,
    nextStep,
  };
}

// Événements de démo : une présence régulière sur les 45 derniers jours.
export function demoActivity(uid: string, today: string): ActivityEvent[] {
  const out: ActivityEvent[] = [];
  for (let i = 0; i < 45; i++) {
    const date = isoDaysAgo(today, i);
    const weekday = new Date(date + 'T12:00:00').getDay();
    if (weekday === 6 || i % 9 === 4) continue; // pas de Chabbat, quelques jours manqués
    (['open', 'schedule', 'agenda'] as ActivityType[]).forEach((type, k) => {
      if (k === 2 && i % 3 !== 0) return;
      out.push({ id: `${uid}_${date}_${type}`, uid, type, date });
    });
  }
  return out;
}
