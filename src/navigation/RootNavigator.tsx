import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { RavStack } from './RavStack';

export function RootNavigator() {
  const { mode } = useAuth();
  return (
    <NavigationContainer>
      {mode === 'rav' || mode === 'treasurer' ? <RavStack /> : mode === 'member' ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
