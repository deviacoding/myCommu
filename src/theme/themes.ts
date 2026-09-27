import { CommunityId } from '../types';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
}

export interface CommunityTheme {
  id: CommunityId;
  name: string;
  colors: ThemeColors;
}

const baseNeutrals = {
  background: '#F7F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  shadow: '#000000',
};

export const themes: Record<CommunityId, CommunityTheme> = {
  jewish: {
    id: 'jewish',
    name: 'Communauté juive',
    colors: {
      ...baseNeutrals,
      primary: '#1E3A8A',
      primaryDark: '#172554',
      primaryLight: '#DBEAFE',
      secondary: '#FACC15',
    },
  },
  christian: {
    id: 'christian',
    name: 'Communauté chrétienne',
    colors: {
      ...baseNeutrals,
      primary: '#8B4513',
      primaryDark: '#5C2C0C',
      primaryLight: '#F5E6D3',
      secondary: '#D4A373',
    },
  },
  buddhist: {
    id: 'buddhist',
    name: 'Communauté bouddhiste',
    colors: {
      ...baseNeutrals,
      primary: '#B45309',
      primaryDark: '#78350F',
      primaryLight: '#FEF3C7',
      secondary: '#F59E0B',
    },
  },
  muslim: {
    id: 'muslim',
    name: 'Communauté islamique',
    colors: {
      ...baseNeutrals,
      primary: '#0E7490',
      primaryDark: '#083F4B',
      primaryLight: '#CFFAFE',
      secondary: '#14B8A6',
    },
  },
};

export const defaultCommunity: CommunityId = 'jewish';
