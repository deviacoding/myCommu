import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RavStackParamList } from './types';
import { RavHomeScreen } from '../screens/rav/RavHomeScreen';
import { RavDvarTorahScreen } from '../screens/rav/RavDvarTorahScreen';
import { RavAnswersScreen } from '../screens/rav/RavAnswersScreen';
import { RavAnswerScreen } from '../screens/rav/RavAnswerScreen';
import { RavScheduleScreen } from '../screens/rav/RavScheduleScreen';
import { RavAgendaScreen } from '../screens/rav/RavAgendaScreen';
import { RavPledgesScreen } from '../screens/rav/RavPledgesScreen';

const Stack = createNativeStackNavigator<RavStackParamList>();

export function RavStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RavHome" component={RavHomeScreen} />
      <Stack.Screen name="RavDvarTorah" component={RavDvarTorahScreen} />
      <Stack.Screen name="RavAnswers" component={RavAnswersScreen} />
      <Stack.Screen name="RavAnswer" component={RavAnswerScreen} />
      <Stack.Screen name="RavSchedule" component={RavScheduleScreen} />
      <Stack.Screen name="RavAgenda" component={RavAgendaScreen} />
      <Stack.Screen name="RavPledges" component={RavPledgesScreen} />
    </Stack.Navigator>
  );
}
