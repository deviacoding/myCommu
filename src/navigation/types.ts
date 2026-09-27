import { NavigatorScreenParams } from '@react-navigation/native';
import { DonationType } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
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
};
