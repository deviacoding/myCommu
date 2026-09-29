import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { Avatar } from '../../components/Avatar';
import { getSeed } from '../../seeds';
import { CommunityId } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'DemoRole'>;

const labels: Record<CommunityId, { community: string; leader: string; leaderSub: string; member: string; memberSub: string }> = {
  jewish: {
    community: 'Communauté juive',
    leader: 'Accès rabbin',
    leaderSub: 'Publier les divré Torah, répondre aux questions, gérer horaires, agenda et dons',
    member: 'Accès fidèle',
    memberSub: 'Horaires, dvar Torah, questions au Rav, dons, mon compte',
  },
  muslim: {
    community: 'Communauté musulmane',
    leader: 'Accès imam',
    leaderSub: 'Publier les khutbas, répondre aux questions, gérer horaires de prière, agenda et dons',
    member: 'Accès fidèle',
    memberSub: 'Horaires de prière, khutbas, questions à l’imam, zakat et sadaqa, mon compte',
  },
  buddhist: {
    community: 'Communauté bouddhiste',
    leader: 'Accès enseignant',
    leaderSub: 'Publier les enseignements, répondre aux questions, gérer séances, agenda et dana',
    member: 'Accès pratiquant',
    memberSub: 'Séances et cérémonies, enseignements, questions, dana, mon compte',
  },
  christian: {
    community: 'Communauté chrétienne',
    leader: 'Accès prêtre',
    leaderSub: 'Publier les homélies, répondre aux questions, gérer messes, agenda, dîme et offrandes',
    member: 'Accès paroissien',
    memberSub: 'Messes et fêtes, homélies, questions au prêtre, dîme et aumône, mon compte',
  },
};

export function DemoRoleScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { enterDemo } = useAuth();
  const { community } = route.params;
  const l = labels[community];
  const leader = getSeed(community).congregations[0].rav;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ alignSelf: 'flex-start' }}>
          <Ionicons name="chevron-back" size={30} color={c.text} />
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>{l.community}</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>Avec quel rôle souhaitez-vous entrer ?</Text>

        <Pressable onPress={() => enterDemo(community, 'rav')} style={({ pressed }) => [styles.big, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
          {leader.photo ? (
            <Avatar source={leader.photo} name={leader.name} size={64} ring />
          ) : (
            <View style={styles.bigIcon}>
              <MaterialCommunityIcons name="account-tie" size={36} color="#fff" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.bigTxt}>{l.leader}</Text>
            <Text style={styles.bigSub}>{l.leaderSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color="#fff" />
        </Pressable>

        <Pressable
          onPress={() => enterDemo(community, 'member')}
          style={({ pressed }) => [styles.big, { backgroundColor: c.surface, borderWidth: 2, borderColor: c.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.bigIcon, { backgroundColor: c.primaryLight }]}>
            <Ionicons name="people" size={34} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigTxt, { color: c.primary }]}>{l.member}</Text>
            <Text style={[styles.bigSub, { color: c.textMuted, opacity: 1 }]}>{l.memberSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color={c.primary} />
        </Pressable>

        <Pressable
          onPress={() => enterDemo(community, 'treasurer')}
          style={({ pressed }) => [styles.big, { backgroundColor: c.surface, borderWidth: 2, borderColor: '#BE123C', opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.bigIcon, { backgroundColor: '#BE123C1A' }]}>
            <Ionicons name="cash" size={34} color="#BE123C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigTxt, { color: '#BE123C' }]}>Accès trésorier</Text>
            <Text style={[styles.bigSub, { color: c.textMuted, opacity: 1 }]}>Ne voit que la partie dons : enregistrer, suivre et récupérer les dons</Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color="#BE123C" />
        </Pressable>

        <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          Démo : les données sont fictives et remises à zéro à chaque rechargement.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '900', marginTop: 16 },
  sub: { fontSize: 16, marginTop: 6, marginBottom: 26 },
  big: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 20, marginBottom: 16, minHeight: 110 },
  bigIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bigTxt: { color: '#fff', fontSize: 23, fontWeight: '900' },
  bigSub: { color: '#fff', opacity: 0.85, fontSize: 13, marginTop: 4 },
});
