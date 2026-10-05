import { NavigatorScreenParams } from '@react-navigation/native';
import { CommunityId, DonationType, ReceiptFormat } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  DemoCommunity: undefined;
  DemoRole: { community: CommunityId };
};

export type RavStackParamList = {
  RavStart: undefined;
  RavHome: undefined;
  RavDvarTorah: undefined;
  RavAnswers: undefined;
  RavAnswer: { questionId: string };
  RavSchedule: undefined;
  RavAgenda: undefined;
  RavDons: undefined;
  RavRecordDonation: undefined;
  RavCollect: undefined;
  RavLive: undefined;
  RavCreateCommunity: undefined;
  RavShareQr: undefined;
  RavTeam: undefined;
  RavAffiliation: undefined;
  RavPayments: undefined;
  RavAssociations: undefined;
  RavEngagement: undefined;
  RavPaymentConnect: { provider: 'stripe' | 'bit' | 'lemonsqueezy'; associationId?: string };
  RavDates: undefined;
  RavFunds: undefined;
};

export type MainTabsParamList = {
  ScheduleTab: undefined;
  CoursesTab: undefined;
  QuestionsTab: undefined;
  DonationsTab: undefined;
  AccountTab: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  CourseDetail: { courseId: string };
  QuestionDetail: { questionId: string };
  AskQuestion: undefined;
  Donate: { type: DonationType; amount?: number; pledgeId?: string; cause?: string; campaignId?: string; repair?: { from: string; to: string; days: number; cost: number } };
  Receipt: { format: ReceiptFormat; year: number; associationId?: string };
  Attestation: undefined;
  Leaderboard: { mode?: 'points' | 'assiduity' | 'league' } | undefined;
  Badges: undefined;
  JoinCommunity: { onboarding: boolean };
};
