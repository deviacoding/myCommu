import { ActivityEvent, Donation, Question, SoulLevel } from '../types';

// « L'ora qui grandit » : barème, niveaux infinis, titres, série unique avec gels et rachat, badges, ligues.
// Tout part d'événements (activity), de dons confirmés et de contenus lus ; les points se recalculent à
// chaque fois, donc le barème peut changer sans perdre l'historique. Voir docs/GAMIFICATION.md.

export type ActivityType = 'open' | 'schedule' | 'agenda' | 'course' | 'answer';

// Points des actions quotidiennes (une fois par jour et par type).
export const DAILY_POINTS: Record<ActivityType, number> = { open: 1, schedule: 1, agenda: 1, course: 0, answer: 1 };

// Actions qui comptent pour la série : l'application doit être *utilisée* (ouvrir ne suffit pas).
export const STREAK_TYPES: ActivityType[] = ['schedule', 'agenda', 'course', 'answer'];

export const RULES = {
  courseRead: 2, // par cours, une fois
  questionAsked: 2, // 1 question comptée par jour
  questionAnswered: 1, // quand le responsable répond
  streak7: 5, // 7 jours d'utilisation d'affilée (par semaine)
  streak30: 20, // 30 jours d'affilée (par mois)
  streakFreezeEvery: 7, // un gel de série gagné tous les 7 jours de série
  streakFreezeMax: 2, // réserve maximale de gels
  streakRepairMaxDays: 30, // au-delà, la série ne se rachète plus
  almsPerBracket: 4, // tsedaka, sadaqa, offrande, dana, promesse réglée : par tranche
  tithePerBracket: 10, // maasser, zakat, dîme : par tranche
  monthlyDonorBonus: 15, // 3 mois d'affilée avec au moins un don
  // Grands dons : un gros donateur avance beaucoup. Bonus par don, selon le montant (en € ; ×4 en ₪).
  bigGifts: [
    { eur: 180, bonus: 20 },
    { eur: 500, bonus: 60 },
    { eur: 1000, bonus: 150 },
    { eur: 5000, bonus: 800 },
  ],
  // Série de tsedaka : un don (même petit) chaque jour ; le jour de repos ne casse pas la série.
  tsedakaStreakDay: 1, // chaque jour de série au-delà du premier
  tsedakaStreak7: 10,
  tsedakaStreak30: 40,
  tsedakaStreak100: 150,
  firstCommunity: 5,
  profileComplete: 2,
  boostMultiplier: 2, // journée à points doublés
  boostMaxPerYear: 30, // 30 journées sur 365 jours glissants
  leagueWin: 30, // victoire de ligue (quinzaine)
};

// Tranches de don selon la devise (10 € / 100 € ; 40 ₪ / 400 ₪).
export function brackets(currency: string): { alms: number; tithe: number } {
  return currency === '₪' ? { alms: 40, tithe: 400 } : { alms: 10, tithe: 100 };
}
// Équivalent approximatif des seuils en shekels (1 € ≈ 4 ₪), pour les communautés israéliennes.
export const toCurrency = (eur: number, currency: string) => (currency === '₪' ? eur * 4 : eur);

// Rachat de série : la somme minimale de tsedaka par jour manqué (10 agorot / 10 centimes).
export function streakRepairUnit(_currency: string): number {
  return 0.1;
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

// Reconnaissance rapide d'un donateur par le responsable (montant sur 12 mois, seuils en €, ×4 en ₪).
export type DonorTier = 'small' | 'regular' | 'major' | 'pillar';
export interface DonorTierInfo { tier: DonorTier; label: string; minEur: number; color: string; icon: string }
export const DONOR_TIERS: DonorTierInfo[] = [
  { tier: 'pillar', label: 'Pilier', minEur: 2000, color: '#7C3AED', icon: 'crown' },
  { tier: 'major', label: 'Grand donateur', minEur: 500, color: '#D4A017', icon: 'star-circle' },
  { tier: 'regular', label: 'Donateur régulier', minEur: 100, color: '#2563EB', icon: 'hand-heart' },
  { tier: 'small', label: 'Petit donateur', minEur: 0.01, color: '#6B7280', icon: 'hand-coin' },
];
export function donorTier(amount12m: number, currency: string): DonorTierInfo | null {
  return DONOR_TIERS.find((t) => amount12m >= toCurrency(t.minEur, currency)) ?? null;
}

// Points d'un don : tranches + bonus grand don.
export function donationPoints(d: Pick<Donation, 'type' | 'amount'>, currency: string): number {
  const b = brackets(currency);
  const tithe = d.type === 'maasser';
  let pts = tithe ? Math.floor(d.amount / b.tithe) * RULES.tithePerBracket : Math.floor(d.amount / b.alms) * RULES.almsPerBracket;
  for (const g of RULES.bigGifts) if (d.amount >= toCurrency(g.eur, currency)) pts += g.bonus;
  return pts;
}

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
  quietDays?: Set<string>; // Chabbat et fêtes : jours neutres (ne comptent ni ne cassent, pas de notification)
  boostDays?: Set<string>; // journées à points doublés décidées par le responsable
  leagueWins?: number; // victoires de ligue (quinzaines) déjà acquises
}

export interface StreakRepair { lostDays: number; missedDays: number; from: string; to: string; cost: number }

export interface StreakState {
  days: number; // série en cours
  best: number;
  freezes: number; // gels en réserve
  freezesUsed: number; // gels consommés sur la série en cours
  todayDone: boolean; // une action comptable aujourd'hui
  todayQuiet: boolean; // aujourd'hui est un jour neutre
  repairable: StreakRepair | null; // série cassée récemment et rachetable : jours manqués et coût
  nextFreezeIn: number; // jours de série avant le prochain gel
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
  streak: StreakState; // série unique d'utilisation (horaires, agenda, cours, réponses, dons)
  streakDays: number; // = streak.days (compatibilité)
  tsedakaStreak: number; // jours consécutifs avec une tsedaka
  tsedakaStreakBest: number;
  tsedakaStreakPoints: number;
  tsedakaToday: boolean;
  activeDays12m: number;
  activeDaysTotal: number;
  coursesRead: number;
  questionsAsked: number;
  given12m: number;
  donorTier: DonorTierInfo | null;
  maasserMonths: number; // mois consécutifs avec un maasser (jusqu'au mois courant ou précédent)
  maasserMonthsBest: number;
  assiduityTitle: string | null;
  generosityTitle: string | null;
  nextAssiduityTitle: { name: string; days: number } | null;
  nextGenerosityTitle: { name: string; amount: number } | null;
  nextStep: string;
  badges: Badge[];
  badgesEarned: number;
}

export const isoDaysAgo = (today: string, days: number) => {
  const d = new Date(today + 'T12:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
export const isoDaysAfter = (iso: string, days: number) => isoDaysAgo(iso, -days);

function romanSuffix(n: number): string {
  return ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'][n] ?? ` ${n + 1}`;
}

// Série d'utilisation, jour par jour, avec gels (gagnés tous les 7 jours, max 2, consommés automatiquement),
// jours neutres (Chabbat, fêtes) et rachats (dons « rachat de série » qui couvrent des jours manqués).
export function computeStreak(activeDays: Set<string>, repairedDays: Set<string>, quiet: Set<string>, today: string, currency: string): StreakState {
  const isQuiet = (d: string) => quiet.has(d);
  const all = [...activeDays].filter((d) => d <= today).sort();
  const empty: StreakState = { days: 0, best: 0, freezes: 0, freezesUsed: 0, todayDone: activeDays.has(today), todayQuiet: isQuiet(today), repairable: null, nextFreezeIn: RULES.streakFreezeEvery };
  if (all.length === 0) return empty;
  const first = all[0] < isoDaysAgo(today, 400) ? isoDaysAgo(today, 400) : all[0];
  let run = 0;
  let best = 0;
  let freezes = 0;
  let freezesUsed = 0;
  let lastBreak: { lostDays: number; missedFrom: string; missedDays: number; resumedOn: string | null } | null = null;
  let day = first;
  while (day <= today) {
    if (isQuiet(day)) { day = isoDaysAfter(day, 1); continue; }
    if (activeDays.has(day) || repairedDays.has(day)) {
      if (run === 0 && lastBreak && !lastBreak.resumedOn) lastBreak.resumedOn = day;
      run++;
      if (run % RULES.streakFreezeEvery === 0 && freezes < RULES.streakFreezeMax) freezes++;
      best = Math.max(best, run);
    } else if (day === today) {
      // pas encore d'action aujourd'hui : rien n'est cassé
    } else if (freezes > 0 && run > 0) {
      freezes--;
      freezesUsed++;
    } else {
      if (run > 0) {
        lastBreak = { lostDays: run, missedFrom: day, missedDays: 0, resumedOn: null };
        freezesUsed = 0;
      }
      run = 0;
      if (lastBreak && !lastBreak.resumedOn) lastBreak.missedDays++;
    }
    day = isoDaysAfter(day, 1);
  }
  // Rachat : la dernière cassure est récente, et la série actuelle est plus courte que celle perdue.
  let repairable: StreakRepair | null = null;
  if (lastBreak && lastBreak.lostDays >= 2 && lastBreak.missedDays > 0 && lastBreak.missedDays <= RULES.streakRepairMaxDays && run < lastBreak.lostDays) {
    const to = lastBreak.resumedOn ? isoDaysAgo(lastBreak.resumedOn, 1) : isoDaysAgo(today, 1);
    if (to >= lastBreak.missedFrom) {
      const unit = streakRepairUnit(currency);
      repairable = { lostDays: lastBreak.lostDays, missedDays: lastBreak.missedDays, from: lastBreak.missedFrom, to, cost: Math.round(lastBreak.missedDays * unit * 100) / 100 };
    }
  }
  return { days: run, best, freezes, freezesUsed, todayDone: activeDays.has(today), todayQuiet: isQuiet(today), repairable, nextFreezeIn: RULES.streakFreezeEvery - (run % RULES.streakFreezeEvery) };
}

// Jours couverts par un rachat de série.
export function repairedDaysOf(donations: Donation[]): Set<string> {
  const out = new Set<string>();
  for (const d of donations) {
    if (!d.streakRepair) continue;
    let day = d.streakRepair.from;
    let guard = 0;
    while (day <= d.streakRepair.to && guard++ < 60) { out.add(day); day = isoDaysAfter(day, 1); }
  }
  return out;
}

// Mois consécutifs avec un maasser, en remontant depuis le mois courant (ou le précédent).
function monthKey(iso: string) { return iso.slice(0, 7); }
function prevMonthKey(m: string) { const [y, mo] = m.split('-').map(Number); return `${mo === 1 ? y - 1 : y}-${String(mo === 1 ? 12 : mo - 1).padStart(2, '0')}`; }
export function consecutiveMaasserMonths(donations: Donation[], today: string): { current: number; best: number } {
  const months = new Set(donations.filter((d) => d.type === 'maasser').map((d) => monthKey(d.date)));
  let cur = monthKey(today);
  if (!months.has(cur)) cur = prevMonthKey(cur);
  let current = 0;
  while (months.has(cur)) { current++; cur = prevMonthKey(cur); }
  let best = 0;
  for (const m of months) {
    let run = 0;
    let k = m;
    while (months.has(k)) { run++; k = prevMonthKey(k); }
    best = Math.max(best, run);
  }
  return { current, best };
}

// ---------------------------------------------------------------------------
// Badges : tout est récompensé. Calculés à partir du résumé, jamais stockés (sauf « vus »).
// ---------------------------------------------------------------------------
export type BadgeGroup = 'debut' | 'serie' | 'tsedaka' | 'maasser' | 'etude' | 'ligue' | 'niveau';
export const BADGE_GROUPS: { key: BadgeGroup; label: string }[] = [
  { key: 'debut', label: 'Premiers pas' },
  { key: 'serie', label: 'Série' },
  { key: 'tsedaka', label: 'Tsedaka' },
  { key: 'maasser', label: 'Maasser' },
  { key: 'etude', label: 'Étude' },
  { key: 'ligue', label: 'Ligue' },
  { key: 'niveau', label: 'Niveaux' },
];
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // MaterialCommunityIcons
  color: string;
  group: BadgeGroup;
  earned: boolean;
  progress: string; // « 3 / 7 »
  ratio: number; // 0..1
}

export function computeBadges(s: Omit<GamificationSummary, 'badges' | 'badgesEarned' | 'nextStep'>, input: GamificationInput): Badge[] {
  const alms = input.donations.filter((d) => d.type !== 'maasser');
  const maasser = input.donations.filter((d) => d.type === 'maasser');
  const chains = new Set(input.donations.filter((d) => d.campaignId).map((d) => d.campaignId)).size;
  const wins = input.leagueWins ?? 0;
  const cur = input.currency;
  const b = (id: string, name: string, description: string, icon: string, color: string, group: BadgeGroup, value: number, goal: number): Badge => ({
    id, name, description, icon, color, group, earned: value >= goal, ratio: Math.min(1, value / goal),
    progress: goal > 1 ? `${Math.min(Math.floor(value), goal)} / ${goal}` : value >= goal ? 'Obtenu' : 'À venir',
  });
  const gold = '#D4A017';
  const flame = '#F59E0B';
  const blue = '#2563EB';
  const green = '#16A34A';
  const violet = '#7C3AED';
  return [
    b('firstDay', 'Premier jour', 'Une première action dans l’application', 'sprout', green, 'debut', s.activeDaysTotal, 1),
    b('firstWeek', 'Première semaine', '7 jours d’utilisation, d’affilée ou non', 'calendar-week', green, 'debut', s.activeDaysTotal, 7),
    b('firstTsedaka', 'Première tsedaka', 'Un premier don, même petit', 'hand-heart', flame, 'debut', alms.length, 1),
    b('firstMaasser', 'Premier maasser', 'Un premier maasser versé', 'percent-circle', gold, 'debut', maasser.length, 1),
    b('streak7', 'Flamme de 7 jours', '7 jours d’utilisation d’affilée', 'fire', flame, 'serie', s.streak.best, 7),
    b('streak30', 'Flamme de 30 jours', 'Un mois sans manquer un jour', 'fire', '#EA580C', 'serie', s.streak.best, 30),
    b('streak100', 'Flamme de 100 jours', '100 jours d’affilée', 'fire', '#DC2626', 'serie', s.streak.best, 100),
    b('streak365', 'Flamme de l’année', '365 jours d’affilée', 'fire', violet, 'serie', s.streak.best, 365),
    b('tsedaka7', 'Tsedaka 7 jours', 'Une tsedaka par jour pendant 7 jours', 'hand-coin', flame, 'tsedaka', s.tsedakaStreakBest, 7),
    b('tsedaka30', 'Tsedaka 30 jours', 'Une tsedaka par jour pendant 30 jours', 'hand-coin', '#EA580C', 'tsedaka', s.tsedakaStreakBest, 30),
    b('tsedaka100', 'Tsedaka 100 jours', 'Une tsedaka par jour pendant 100 jours', 'hand-coin', '#DC2626', 'tsedaka', s.tsedakaStreakBest, 100),
    b('chain', 'Maillon', 'Participation à une chaîne de tsedaka', 'link-variant', blue, 'tsedaka', chains, 1),
    b('chain5', 'Chaîne solide', '5 chaînes de tsedaka', 'link-variant', violet, 'tsedaka', chains, 5),
    b('donorRegular', 'Donateur régulier', `${toCurrency(100, cur)} ${cur} donnés sur 12 mois`, 'hand-heart', blue, 'tsedaka', s.given12m, toCurrency(100, cur)),
    b('donorMajor', 'Grand donateur', `${toCurrency(500, cur)} ${cur} donnés sur 12 mois`, 'star-circle', gold, 'tsedaka', s.given12m, toCurrency(500, cur)),
    b('donorPillar', 'Pilier', `${toCurrency(2000, cur)} ${cur} donnés sur 12 mois`, 'crown', violet, 'tsedaka', s.given12m, toCurrency(2000, cur)),
    b('maasser1', 'Maasser du mois', 'Un maasser ce mois-ci', 'percent-circle', gold, 'maasser', s.maasserMonthsBest, 1),
    b('maasser3', 'Maasser 3 mois', '3 mois de maasser d’affilée', 'percent-circle', gold, 'maasser', s.maasserMonthsBest, 3),
    b('maasser6', 'Maasser 6 mois', '6 mois de maasser d’affilée', 'percent-circle', '#B45309', 'maasser', s.maasserMonthsBest, 6),
    b('maasser9', 'Maasser 9 mois', '9 mois de maasser d’affilée', 'percent-circle', '#B45309', 'maasser', s.maasserMonthsBest, 9),
    b('maasser12', 'Maasser de l’année', '12 mois de maasser d’affilée', 'percent-circle', violet, 'maasser', s.maasserMonthsBest, 12),
    b('course1', 'Premier cours', 'Un cours lu en entier', 'book-open-variant', blue, 'etude', s.coursesRead, 1),
    b('course10', 'Étudiant', '10 cours lus', 'book-open-variant', blue, 'etude', s.coursesRead, 10),
    b('course50', 'Érudit', '50 cours lus', 'book-open-page-variant', violet, 'etude', s.coursesRead, 50),
    b('question1', 'Première question', 'Une question posée au responsable', 'chat-question', blue, 'etude', s.questionsAsked, 1),
    b('league1', 'Vainqueur de ligue', 'Premier de la quinzaine', 'trophy', gold, 'ligue', wins, 1),
    b('league3', 'Triple vainqueur', '3 ligues gagnées', 'trophy-variant', violet, 'ligue', wins, 3),
    b('level10', 'Niveau 10', 'Dix niveaux franchis', 'star-four-points', blue, 'niveau', s.level, 10),
    b('level25', 'Niveau 25', 'Vingt-cinq niveaux', 'star-four-points', gold, 'niveau', s.level, 25),
    b('level50', 'Niveau 50', 'Cinquante niveaux', 'star-four-points', violet, 'niveau', s.level, 50),
  ];
}

// ---------------------------------------------------------------------------
// Ligues : une quinzaine, du lundi au dimanche d'après. Points gagnés sur la période.
// ---------------------------------------------------------------------------
const LEAGUE_EPOCH = '2026-01-05'; // un lundi
export interface LeaguePeriod { key: string; from: string; to: string; daysLeft: number; index: number }
export function leaguePeriod(today: string, offset = 0): LeaguePeriod {
  const days = Math.floor((new Date(today + 'T12:00:00').getTime() - new Date(LEAGUE_EPOCH + 'T12:00:00').getTime()) / 86400000);
  const index = Math.floor(days / 14) + offset;
  const from = isoDaysAfter(LEAGUE_EPOCH, index * 14);
  const to = isoDaysAfter(from, 13);
  const daysLeft = Math.max(0, Math.floor((new Date(to + 'T12:00:00').getTime() - new Date(today + 'T12:00:00').getTime()) / 86400000) + 1);
  return { key: `L${index}`, from, to, daysLeft, index };
}

// Points gagnés dans une fenêtre de dates (pour la ligue) : actions quotidiennes, dons, questions.
export function pointsInWindow(input: Pick<GamificationInput, 'activity' | 'donations' | 'questions' | 'currency' | 'boostDays'>, from: string, to: string): number {
  const boost = input.boostDays ?? new Set<string>();
  const mult = (d: string) => (boost.has(d) ? RULES.boostMultiplier : 1);
  let pts = 0;
  for (const e of input.activity) if (e.date >= from && e.date <= to && e.type in DAILY_POINTS) pts += DAILY_POINTS[e.type as ActivityType] * mult(e.date);
  for (const d of input.donations) if (d.date >= from && d.date <= to) pts += donationPoints(d, input.currency) * mult(d.date);
  const askedDays = new Set(input.questions.filter((q) => q.date >= from && q.date <= to).map((q) => q.date));
  pts += askedDays.size * RULES.questionAsked;
  return pts;
}

export function computeGamification(input: GamificationInput): GamificationSummary {
  const { activity, donations, questions, readCourses, currency, levels, today } = input;
  const since12m = isoDaysAgo(today, 365);
  const quiet = input.quietDays ?? new Set<string>();
  const boost = input.boostDays ?? new Set<string>();
  const mult = (d: string) => (boost.has(d) ? RULES.boostMultiplier : 1);

  // ---- Assiduité
  const byType = new Map<ActivityType, Set<string>>();
  for (const e of activity) {
    const t = e.type as ActivityType;
    if (!(t in DAILY_POINTS)) continue;
    if (!byType.has(t)) byType.set(t, new Set());
    byType.get(t)!.add(e.date);
  }
  let assiduity = 0;
  for (const [type, days] of byType) for (const d of days) assiduity += DAILY_POINTS[type] * mult(d);
  // Jours d'utilisation : une action comptable (horaires, agenda, cours, réponse) ou un don.
  const activeDays = new Set<string>();
  for (const t of STREAK_TYPES) for (const d of byType.get(t) ?? []) activeDays.add(d);
  for (const d of donations) if (!d.streakRepair) activeDays.add(d.date);
  const repaired = repairedDaysOf(donations);
  const streak = computeStreak(activeDays, repaired, quiet, today, currency);
  // Bonus de série : toutes les séries passées, par tranches de 7 et 30 jours (gels et rachats inclus).
  let streakBonus = 0;
  {
    let run = 0;
    let day = isoDaysAgo(today, 400);
    let freezes = 0;
    while (day <= today) {
      if (quiet.has(day)) { day = isoDaysAfter(day, 1); continue; }
      if (activeDays.has(day) || repaired.has(day)) {
        run++;
        if (run % RULES.streakFreezeEvery === 0 && freezes < RULES.streakFreezeMax) freezes++;
        if (run % 7 === 0) streakBonus += RULES.streak7;
        if (run % 30 === 0) streakBonus += RULES.streak30;
      } else if (day !== today) {
        if (freezes > 0 && run > 0) freezes--;
        else run = 0;
      }
      day = isoDaysAfter(day, 1);
    }
  }
  assiduity += streakBonus;
  assiduity += readCourses.length * RULES.courseRead;
  const askedDays = new Set(questions.map((q) => q.date));
  assiduity += askedDays.size * RULES.questionAsked + questions.filter((q) => q.status === 'answered').length * RULES.questionAnswered;

  // ---- Générosité (dons confirmés) : tranches, grands dons, jours doublés
  let generosity = 0;
  for (const d of donations) generosity += donationPoints(d, currency) * mult(d.date);
  const months = [...new Set(donations.map((d) => d.date.slice(0, 7)))].sort();
  let mrun = 0;
  let mprev: string | null = null;
  for (const m of months) {
    mrun = mprev === prevMonthKey(m) ? mrun + 1 : 1;
    if (mrun % 3 === 0) generosity += RULES.monthlyDonorBonus;
    mprev = m;
  }
  generosity += (input.leagueWins ?? 0) * RULES.leagueWin;

  // ---- Série de tsedaka : un don par jour (jours neutres : ni comptés ni cassants).
  const almsDays = new Set(donations.filter((d) => d.type !== 'maasser').map((d) => d.date));
  const skip = (iso: string) => quiet.has(iso) || new Date(iso + 'T12:00:00').getDay() === 6;
  const prevDay = (iso: string) => { let p = isoDaysAgo(iso, 1); while (skip(p)) p = isoDaysAgo(p, 1); return p; };
  let tsedakaStreakPoints = 0;
  let tsedakaStreakBest = 0;
  const almsSorted = [...almsDays].sort();
  let arun = 0;
  let aprev: string | null = null;
  for (const d of almsSorted) {
    if (skip(d)) continue;
    arun = aprev && prevDay(d) === aprev ? arun + 1 : 1;
    if (arun > 1) tsedakaStreakPoints += RULES.tsedakaStreakDay;
    if (arun === 7) tsedakaStreakPoints += RULES.tsedakaStreak7;
    if (arun === 30) tsedakaStreakPoints += RULES.tsedakaStreak30;
    if (arun === 100) tsedakaStreakPoints += RULES.tsedakaStreak100;
    tsedakaStreakBest = Math.max(tsedakaStreakBest, arun);
    aprev = d;
  }
  generosity += tsedakaStreakPoints;
  let tsedakaStreak = 0;
  let cur = skip(today) ? prevDay(today) : today;
  if (!almsDays.has(cur)) cur = prevDay(cur);
  while (almsDays.has(cur)) { tsedakaStreak++; cur = prevDay(cur); }
  const tsedakaToday = almsDays.has(today);

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
  const openDays = byType.get('open') ?? new Set<string>();
  const presentDays = new Set([...openDays, ...activeDays]);
  const activeDays12m = [...presentDays].filter((d) => d >= since12m).length;
  const given12m = donations.filter((d) => d.date >= since12m).reduce((s, d) => s + d.amount, 0);
  const assiduityTitle = [...ASSIDUITY_TITLES].reverse().find((t) => activeDays12m >= t.days)?.name ?? null;
  const nextAssiduityTitle = ASSIDUITY_TITLES.find((t) => activeDays12m < t.days) ?? null;
  const genTitles = GENEROSITY_TITLES.map((t) => ({ name: t.name, amount: toCurrency(t.amountEur, currency) }));
  const generosityTitle = [...genTitles].reverse().find((t) => given12m >= t.amount)?.name ?? null;
  const nextGenerosityTitle = genTitles.find((t) => given12m < t.amount) ?? null;
  const mm = consecutiveMaasserMonths(donations, today);

  const partial = {
    points, assiduityPoints: assiduity, generosityPoints: generosity, startPoints: start, level, levelStart, nextLevelPoints, progress, tier, tierIndex,
    streak, streakDays: streak.days, tsedakaStreak, tsedakaStreakBest, tsedakaStreakPoints, tsedakaToday,
    activeDays12m, activeDaysTotal: activeDays.size, coursesRead: readCourses.length, questionsAsked: questions.length, given12m,
    donorTier: donorTier(given12m, currency), maasserMonths: mm.current, maasserMonthsBest: mm.best,
    assiduityTitle, generosityTitle, nextAssiduityTitle, nextGenerosityTitle,
  };
  const badges = computeBadges(partial, input);

  // ---- Prochain pas : la suggestion la plus utile aujourd'hui (jamais une angoisse : un seul geste suffit)
  const missing = nextLevelPoints - points;
  let nextStep: string;
  if (streak.repairable) nextStep = `Votre série de ${streak.repairable.lostDays} jours s’est arrêtée : rachetez-la avec une tsedaka de ${streak.repairable.cost} ${currency} (${streak.repairable.missedDays} jour${streak.repairable.missedDays > 1 ? 's' : ''} manqué${streak.repairable.missedDays > 1 ? 's' : ''}).`;
  else if (streak.todayQuiet) nextStep = `Jour de repos : la série est en pause, rien à faire aujourd’hui.`;
  else if (!streak.todayDone && streak.days > 0) nextStep = `Un seul geste aujourd’hui (horaires, un cours, une réponse, un don) et la série passe à ${streak.days + 1} jours${streak.freezes > 0 ? ` · ${streak.freezes} gel${streak.freezes > 1 ? 's' : ''} en réserve` : ''}.`;
  else if (tsedakaStreak > 0 && !tsedakaToday) nextStep = `Une tsedaka aujourd’hui, même petite, et votre série de tsedaka passe à ${tsedakaStreak + 1} jour${tsedakaStreak + 1 > 1 ? 's' : ''}.`;
  else if (!streak.todayDone) nextStep = `Consultez les horaires ou lisez un cours : votre série commence aujourd’hui.`;
  else if (streak.days > 0 && streak.nextFreezeIn <= 2) nextStep = `Encore ${streak.nextFreezeIn} jour${streak.nextFreezeIn > 1 ? 's' : ''} et vous gagnez un gel de série (+${RULES.streak7} points au 7e jour).`;
  else if (missing <= RULES.courseRead) nextStep = `Un cours lu en entier (+${RULES.courseRead}) et vous passez au niveau ${level + 1}.`;
  else nextStep = `Il manque ${missing} point${missing > 1 ? 's' : ''} pour le niveau ${level + 1} : un cours lu (+${RULES.courseRead}), une question (+${RULES.questionAsked}), ou un don.`;

  return { ...partial, nextStep, badges, badgesEarned: badges.filter((x) => x.earned).length };
}

// Événements de démo : une présence régulière sur les 45 derniers jours, avec une série cassée il y a peu
// (3 jours manqués la semaine dernière) pour montrer le rachat.
export function demoActivity(uid: string, today: string): ActivityEvent[] {
  const out: ActivityEvent[] = [];
  for (let i = 0; i < 45; i++) {
    const date = isoDaysAgo(today, i);
    const weekday = new Date(date + 'T12:00:00').getDay();
    if (weekday === 6 || (i >= 4 && i <= 6)) continue; // pas de Chabbat, 3 jours manqués
    (['open', 'schedule', 'agenda', 'course'] as ActivityType[]).forEach((type, k) => {
      if (k === 2 && i % 3 !== 0) return;
      if (k === 3 && i % 5 !== 0) return;
      out.push({ id: `${uid}_${date}_${type}`, uid, type, date });
    });
  }
  return out;
}
