import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { CreatePostScreen } from '../screens/feed/CreatePostScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { ChatRoomScreen } from '../screens/chat/ChatRoomScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { GroupDetailScreen } from '../screens/groups/GroupDetailScreen';
import { LeaderboardScreen } from '../screens/profile/LeaderboardScreen';
import { BadgesScreen } from '../screens/profile/BadgesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
