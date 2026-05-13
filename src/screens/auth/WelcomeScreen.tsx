import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.top}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="people" size={48} color="#fff" />
        </View>
        <Text style={[styles.brand, { color: theme.colors.text }]}>myCommu</Text>
        <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
          Votre communauté, à portée de main
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ChooseCommunity')}
        >
          <Text style={[styles.btnTxt, { color: theme.colors.textOnPrimary }]}>Commencer</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.linkTxt, { color: theme.colors.primary }]}>J’ai déjà un compte</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 32 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 34, fontWeight: '800', marginTop: 20 },
  tagline: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  actions: { gap: 12 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnTxt: { fontSize: 16, fontWeight: '700' },
  linkBtn: { paddingVertical: 8, alignItems: 'center' },
  linkTxt: { fontSize: 15, fontWeight: '600' },
});
