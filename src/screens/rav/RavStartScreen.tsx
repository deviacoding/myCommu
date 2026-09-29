import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { useReligion } from '../../state/useReligion';
import { Avatar } from '../../components/Avatar';
import { RavScreen, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavStart'>;

// Premier écran de l'accès responsable : créer sa communauté ou ouvrir une communauté existante.
export function RavStartScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signOut } = useAuth();
  const { seed, setCongregation } = useAppState();
  const { profile } = useReligion();
  const demo = seed.congregations.find((k) => k.id === seed.defaultCongregation) ?? seed.congregations[0];

  return (
    <RavScreen title={`Bonjour ${seed.leaderShort}`} subtitle={profile.communityLabel} onBack={signOut}>
      <Text style={{ color: c.textMuted, fontSize: BIG.text, marginBottom: 18 }}>Que voulez-vous faire ?</Text>

      <Pressable onPress={() => navigation.navigate('RavCreateCommunity')} style={({ pressed }) => [styles.big, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
        <View style={styles.icon}>
          <Ionicons name="add-circle" size={48} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bigTxt}>Créer ma communauté</Text>
          <Text style={styles.bigSub}>Nom, photo du {profile.leaderTitle.toLowerCase()}, logo et adresse</Text>
        </View>
        <Ionicons name="chevron-forward" size={30} color="#fff" />
      </Pressable>

      <Pressable
        onPress={() => {
          setCongregation(demo.id);
          navigation.navigate('RavHome');
        }}
        style={({ pressed }) => [styles.big, { backgroundColor: c.surface, borderWidth: 2, borderColor: c.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Avatar source={demo.rav.photo} name={demo.rav.name} size={72} ring />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigTxt, { color: c.primary }]}>Voir une communauté déjà créée</Text>
          <Text style={[styles.bigSub, { color: c.textMuted, opacity: 1 }]}>
            {demo.name} · {demo.rav.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={30} color={c.primary} />
      </Pressable>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  big: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 22, borderRadius: 22, marginBottom: 18, minHeight: 130 },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bigTxt: { color: '#fff', fontSize: 23, fontWeight: '900' },
  bigSub: { color: '#fff', opacity: 0.85, fontSize: 16, marginTop: 6 },
});
