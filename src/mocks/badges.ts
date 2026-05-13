import { Badge, LeaderboardEntry } from '../types';

export const badges: Badge[] = [
  { id: 'b1', name: 'Premier pas', description: 'A créé son premier post', icon: 'foot-print', rarity: 'common', earned: true },
  { id: 'b2', name: 'Sociable', description: 'A reçu 100 likes au total', icon: 'heart', rarity: 'common', earned: true },
  { id: 'b3', name: 'Bienfaiteur', description: 'A participé à 5 actions de solidarité', icon: 'hand-heart', rarity: 'rare', earned: true },
  { id: 'b4', name: 'Pilier', description: 'A organisé un événement', icon: 'star', rarity: 'rare' },
  { id: 'b5', name: 'Mentor', description: 'A aidé 10 nouveaux membres', icon: 'school', rarity: 'epic', earned: true },
  { id: 'b6', name: 'Légende', description: 'Niveau 15 atteint', icon: 'trophy', rarity: 'legendary' },
  { id: 'b7', name: 'Fidèle', description: 'A participé à 20 prières communes', icon: 'praying-hands', rarity: 'rare' },
  { id: 'b8', name: 'Voisin de l’année', description: 'Élu par la communauté', icon: 'medal', rarity: 'legendary' },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u3', name: 'Yusuf Aslan', avatar: 'https://i.pravatar.cc/200?img=14', points: 7800, level: 15 },
  { rank: 2, userId: 'u1', name: 'Sarah Cohen', avatar: 'https://i.pravatar.cc/200?img=5', points: 5120, level: 12 },
  { rank: 3, userId: 'u6', name: 'Amina Benali', avatar: 'https://i.pravatar.cc/200?img=47', points: 4200, level: 10 },
  { rank: 4, userId: 'u2', name: 'Marie Dubois', avatar: 'https://i.pravatar.cc/200?img=10', points: 3420, level: 9 },
  { rank: 5, userId: 'u-me', name: 'Daniel Levy', avatar: 'https://i.pravatar.cc/200?img=12', points: 2840, level: 7 },
  { rank: 6, userId: 'u5', name: 'Pierre Martin', avatar: 'https://i.pravatar.cc/200?img=52', points: 2100, level: 6 },
  { rank: 7, userId: 'u4', name: 'David Azoulay', avatar: 'https://i.pravatar.cc/200?img=33', points: 1620, level: 5 },
];

export function pointsForNextLevel(level: number): number {
  return level * 500;
}
