import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { AiBanner } from '../../components/AiAssist';
import { rav } from '../../mocks/rav';
import { RavScreen, BigButton, BIG } from './RavUi';
import { capitalize, formatLong, hebrewDateLabel, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavHome'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function RavHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signOut, switchRole } = useAuth();
  const { questions, courses, pledges, agenda } = useAppState();
  const pending = questions.filter((q) => q.status === 'pending').length;
  const due = pledges.filter((p) => p.status === 'due').length;
  const upcoming = agenda.filter((e) => e.date >= todayISO()).length;
  const hebrew = hebrewDateLabel();

  const tiles: { key: keyof RavStackParamList; icon: IoniconName; title: string; sub: string; badge?: number; color: string }[] = [
    { key: 'RavDvarTorah', icon: 'create', title: 'Écrire un dvar Torah', sub: `${courses.length} publiés · le dernier s’affiche en premier chez les fidèles`, color: c.primary },
    { key: 'RavAnswers', icon: 'chatbubbles', title: 'Répondre aux questions', sub: pending ? `${pending} question${pending > 1 ? 's' : ''} sans réponse` : 'Toutes les questions ont une réponse', badge: pending, color: '#B45309' },
    { key: 'RavSchedule', icon: 'time', title: 'Horaires des fêtes et offices', sub: 'Allumages, fins de fête, Chaharit, Minha, Arvit', color: '#0F766E' },
    { key: 'RavAgenda', icon: 'calendar', title: 'Agenda de la communauté', sub: `${upcoming} événements à venir`, color: '#7C3AED' },
    { key: 'RavPledges', icon: 'cash', title: 'Dons et engagements', sub: due ? `${due} engagement${due > 1 ? 's' : ''} à encaisser` : 'Aucun engagement en attente', badge: due, color: '#BE123C' },
  ];

  return (
    <RavScreen
      title="Bonjour Rav"
      subtitle={`${capitalize(formatLong(todayISO()))}${hebrew ? ` · ${hebrew}` : ''}`}
      right={<Avatar source={rav.photo} name={rav.name} size={54} ring />}
    >
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14 }}>Que souhaitez-vous faire aujourd’hui ? Touchez une case.</Text>

      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => navigation.navigate(t.key as never)}
          style={({ pressed }) => [styles.tile, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.tileIcon, { backgroundColor: t.color }]}>
            <Ionicons name={t.icon} size={32} color="#fff" />
            {t.badge ? (
              <View style={[styles.badge, { backgroundColor: c.danger, borderColor: c.surface }]}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{t.badge}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 21, fontWeight: '900' }}>{t.title}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{t.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={30} color={c.textMuted} />
        </Pressable>
      ))}

      <View style={{ marginTop: 10 }}>
        <AiBanner />
      </View>

      <View style={{ marginTop: 20, gap: 12 }}>
        <BigButton label="Voir l’application comme un fidèle" icon="eye" color={c.primaryLight} textColor={c.primary} onPress={() => switchRole('member')} />
        <BigButton label="Quitter la démo" icon="log-out-outline" color={c.surface} textColor={c.textMuted} onPress={signOut} style={{ borderWidth: 1, borderColor: c.border }} />
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  tile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12, minHeight: 96 },
  tileIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -6, right: -6, minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2 },
});
