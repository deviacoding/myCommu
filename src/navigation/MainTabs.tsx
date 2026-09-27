import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabsParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { ScheduleScreen } from '../screens/schedule/ScheduleScreen';
import { CoursesScreen } from '../screens/courses/CoursesScreen';
import { QuestionsScreen } from '../screens/questions/QuestionsScreen';
import { DonationsScreen } from '../screens/donations/DonationsScreen';
import { AccountScreen } from '../screens/account/AccountScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const icons: Record<keyof MainTabsParamList, [IoniconName, IoniconName]> = {
  ScheduleTab: ['time', 'time-outline'],
  CoursesTab: ['book', 'book-outline'],
  QuestionsTab: ['help-circle', 'help-circle-outline'],
  DonationsTab: ['heart', 'heart-outline'],
  AccountTab: ['person', 'person-outline'],
};

export function MainTabs() {
  const { theme } = useTheme();
  const { pledges } = useAppState();
  const due = pledges.filter((p) => p.status === 'due').length;
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
          const [on, off] = icons[route.name as keyof MainTabsParamList];
          return <Ionicons name={focused ? on : off} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ScheduleTab" component={ScheduleScreen} options={{ tabBarLabel: 'Horaires' }} />
      <Tab.Screen name="CoursesTab" component={CoursesScreen} options={{ tabBarLabel: 'Cours' }} />
      <Tab.Screen name="QuestionsTab" component={QuestionsScreen} options={{ tabBarLabel: 'Questions' }} />
      <Tab.Screen
        name="DonationsTab"
        component={DonationsScreen}
        options={{ tabBarLabel: 'Dons', tabBarBadge: due > 0 ? due : undefined }}
      />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={{ tabBarLabel: 'Compte' }} />
    </Tab.Navigator>
  );
}
