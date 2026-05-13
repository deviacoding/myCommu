import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabsParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          let name: any = 'home';
          if (route.name === 'FeedTab') name = focused ? 'home' : 'home-outline';
          else if (route.name === 'EventsTab') name = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'ChatTab') name = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'ProfileTab') name = focused ? 'person' : 'person-outline';
          return <Ionicons name={name} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="EventsTab" component={EventsScreen} options={{ tabBarLabel: 'Événements' }} />
      <Tab.Screen name="ChatTab" component={ChatListScreen} options={{ tabBarLabel: 'Messages', tabBarBadge: 7 }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
