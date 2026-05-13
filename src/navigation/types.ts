import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  ChooseCommunity: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabsParamList = {
  FeedTab: undefined;
  EventsTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  PostDetail: { postId: string };
  CreatePost: undefined;
  EventDetail: { eventId: string };
  ChatRoom: { chatId: string };
  Notifications: undefined;
  Search: undefined;
  Groups: undefined;
  GroupDetail: { groupId: string };
  Leaderboard: undefined;
  Badges: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};
