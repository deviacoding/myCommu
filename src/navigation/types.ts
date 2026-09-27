import { NavigatorScreenParams } from '@react-navigation/native';
import { CommunityId, DonationType, ReceiptFormat } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  DemoCommunity: undefined;
  DemoRole: { community: CommunityId };
};

export type RavStackParamList = {
  RavHome: undefined;
  RavDvarTorah: undefined;
  RavAnswers: undefined;
  RavAnswer: { questionId: string };
  RavSchedule: undefined;
  RavAgenda: undefined;
  RavDons: undefined;
  RavRecordDonation: undefined;
  RavCollect: undefined;
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
  Donate: { type: DonationType; amount?: number; pledgeId?: string };
  Receipt: { format: ReceiptFormat; year: number };
  JoinCommunity: { onboarding: boolean };
};
