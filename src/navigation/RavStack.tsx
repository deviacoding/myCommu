import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RavStackParamList } from './types';
import { RavHomeScreen } from '../screens/rav/RavHomeScreen';
import { RavStartScreen } from '../screens/rav/RavStartScreen';
import { RavDvarTorahScreen } from '../screens/rav/RavDvarTorahScreen';
import { RavAnswersScreen } from '../screens/rav/RavAnswersScreen';
import { RavAnswerScreen } from '../screens/rav/RavAnswerScreen';
import { RavScheduleScreen } from '../screens/rav/RavScheduleScreen';
import { RavAgendaScreen } from '../screens/rav/RavAgendaScreen';
import { RavDonsScreen } from '../screens/rav/RavDonsScreen';
import { RavRecordDonationScreen } from '../screens/rav/RavRecordDonationScreen';
import { RavCollectScreen } from '../screens/rav/RavCollectScreen';
import { RavLiveScreen } from '../screens/rav/RavLiveScreen';
import { RavCreateCommunityScreen } from '../screens/rav/RavCreateCommunityScreen';
import { RavShareQrScreen } from '../screens/rav/RavShareQrScreen';
import { RavTeamScreen } from '../screens/rav/RavTeamScreen';
import { RavAffiliationScreen } from '../screens/rav/RavAffiliationScreen';
import { RavPaymentsScreen } from '../screens/rav/RavPaymentsScreen';
import { RavPaymentConnectScreen } from '../screens/rav/RavPaymentConnectScreen';
import { useAuth } from '../state/AuthContext';
import { RavDatesScreen } from '../screens/rav/RavDatesScreen';

const Stack = createNativeStackNavigator<RavStackParamList>();

export function RavStack() {
  const { mode } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={mode === 'treasurer' ? 'RavHome' : 'RavStart'}>
      <Stack.Screen name="RavStart" component={RavStartScreen} />
      <Stack.Screen name="RavHome" component={RavHomeScreen} />
      <Stack.Screen name="RavDvarTorah" component={RavDvarTorahScreen} />
      <Stack.Screen name="RavAnswers" component={RavAnswersScreen} />
      <Stack.Screen name="RavAnswer" component={RavAnswerScreen} />
      <Stack.Screen name="RavSchedule" component={RavScheduleScreen} />
      <Stack.Screen name="RavAgenda" component={RavAgendaScreen} />
      <Stack.Screen name="RavDons" component={RavDonsScreen} />
      <Stack.Screen name="RavRecordDonation" component={RavRecordDonationScreen} />
      <Stack.Screen name="RavCollect" component={RavCollectScreen} />
      <Stack.Screen name="RavLive" component={RavLiveScreen} />
      <Stack.Screen name="RavCreateCommunity" component={RavCreateCommunityScreen} />
      <Stack.Screen name="RavShareQr" component={RavShareQrScreen} />
      <Stack.Screen name="RavTeam" component={RavTeamScreen} />
      <Stack.Screen name="RavAffiliation" component={RavAffiliationScreen} />
      <Stack.Screen name="RavPayments" component={RavPaymentsScreen} />
      <Stack.Screen name="RavPaymentConnect" component={RavPaymentConnectScreen} />
      <Stack.Screen name="RavDates" component={RavDatesScreen} />
    </Stack.Navigator>
  );
}
