import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { themes } from '../../theme/themes';
import { CommunityId } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'DemoCommunity'>;
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const communities: { id: CommunityId; label: string; icon: MciName; ready: boolean }[] = [
  { id: 'jewish', label: 'Juif', icon: 'star-david', ready: true },
  { id: 'muslim', label: 'Musulman', icon: 'star-crescent', ready: false },
  { id: 'christian', label: 'Chrétien', icon: 'cross', ready: false },
];

export function DemoCommunityScreen({ navigation }: Props) {
  const { theme, setCommunity } = useTheme();
  const c = theme.colors;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ alignSelf: 'flex-start' }}>
          <Ionicons name="chevron-back" size={30} color={c.text} />
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Accès démo</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>Choisissez une communauté pour découvrir l’application.</Text>

        {communities.map((k) => {
          const tint = themes[k.id].colors.primary;
          return (
            <Pressable
              key={k.id}
              onPress={() => {
                setCommunity(k.id);
                navigation.navigate('DemoRole', { community: k.id });
              }}
              style={({ pressed }) => [styles.big, { backgroundColor: tint, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.bigIcon}>
                <MaterialCommunityIcons name={k.icon} size={40} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bigTxt}>{k.label}</Text>
                <Text style={styles.bigSub}>{k.ready ? 'Démo complète disponible' : 'Contenus en préparation'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#fff" />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '900', marginTop: 16 },
  sub: { fontSize: 16, marginTop: 6, marginBottom: 26 },
  big: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 20, marginBottom: 16, minHeight: 96 },
  bigIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bigTxt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  bigSub: { color: '#fff', opacity: 0.85, fontSize: 13, marginTop: 2 },
});
