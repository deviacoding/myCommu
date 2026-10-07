import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { AuthProvider } from './state/AuthContext';
import { AppStateProvider } from './state/AppState';
import { RootNavigator } from './navigation/RootNavigator';
import { getSeed } from './seeds';
import { I18nProvider } from './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';

// L'état de l'application est rechargé avec les contenus de la confession choisie (sans remonter la navigation).
function SeededApp() {
  const { community } = useTheme();
  return (
    <AppStateProvider seed={getSeed(community)}>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
    </AppStateProvider>
  );
}

export default function App() {
  // Les polices d'icônes sont chargées avant le premier rendu : sinon, sur le web, les icônes
  // apparaissent en carrés le temps du téléchargement (1,3 Mo pour MaterialCommunityIcons).
  // Si une police échoue (cache navigateur corrompu, réseau), on affiche quand même l'app plutôt qu'un spinner sans fin.
  const [fontsLoaded, fontError] = useFonts({ ...Ionicons.font, ...MaterialCommunityIcons.font });
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7FA' }}>
        <ActivityIndicator size="large" color="#2F3E5C" />
      </View>
    );
  }
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
