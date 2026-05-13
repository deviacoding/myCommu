import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export function RootNavigator() {
  const { isAuthenticated } = useAuth();
  return <NavigationContainer>{isAuthenticated ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}
