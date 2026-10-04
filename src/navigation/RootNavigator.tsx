import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { RavStack } from './RavStack';
import { ChooseReligionScreen } from '../screens/auth/ChooseReligionScreen';

export function RootNavigator() {
  const { mode, authReady } = useAuth();
  const { theme } = useTheme();
  // Session Firebase en cours de restauration : on attend avant de choisir l'écran d'entrée.
  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  const staff = mode === 'rav' || mode === 'treasurer' || mode === 'organizer';
  return <NavigationContainer>{mode === 'setup' ? <ChooseReligionScreen /> : staff ? <RavStack /> : mode === 'member' ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}
