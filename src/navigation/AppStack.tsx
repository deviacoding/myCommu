import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { CourseDetailScreen } from '../screens/courses/CourseDetailScreen';
import { QuestionDetailScreen } from '../screens/questions/QuestionDetailScreen';
import { AskQuestionScreen } from '../screens/questions/AskQuestionScreen';
import { DonateScreen } from '../screens/donations/DonateScreen';
import { ReceiptScreen } from '../screens/donations/ReceiptScreen';
import { JoinCommunityScreen } from '../screens/community/JoinCommunityScreen';
import { useAuth } from '../state/AuthContext';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { onboarded } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={onboarded ? 'MainTabs' : 'JoinCommunity'}>
      <Stack.Screen name="JoinCommunity" component={JoinCommunityScreen} initialParams={{ onboarding: true }} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
      <Stack.Screen name="AskQuestion" component={AskQuestionScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Donate" component={DonateScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
