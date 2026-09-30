import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { AuthProvider } from './state/AuthContext';
import { AppStateProvider } from './state/AppState';
import { RootNavigator } from './navigation/RootNavigator';
import { getSeed } from './seeds';
import { I18nProvider } from './i18n';

// L'état de l'application est rechargé avec les contenus de la confession choisie (sans remonter la navigation).
function SeededApp() {
  const { community } = useTheme();
  return (
    <AppStateProvider seed={getSeed(community)}>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <SeededApp />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
