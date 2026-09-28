import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { RavScreen, BIG } from './RavUi';
import { money, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavDons'>;

export function RavDonsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { myPledges: pledges, donations, categories, seed } = useAppState();
  const due = pledges.filter((p) => p.status === 'due');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);
  const month = todayISO().slice(0, 7);
  const monthTotal = donations.filter((d) => d.date.startsWith(month)).reduce((s, d) => s + d.amount, 0);
  const items = categories.reduce((s, cat) => s + cat.items.length, 0);

  return (
    <RavScreen title="Dons" subtitle={`${money(monthTotal)} reçus ce mois · ${money(dueTotal)} à récupérer`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14 }}>Que voulez-vous faire ?</Text>

      <Pressable onPress={() => navigation.navigate('RavRecordDonation')} style={({ pressed }) => [styles.big, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
        <View style={styles.icon}>
          <Ionicons name="add-circle" size={44} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bigTxt}>1. Enregistrer un nouveau don</Text>
          <Text style={styles.bigSub}>
            Attribuer un don à un {seed.memberLabel}. {categories.length} catégories, {items} types de dons préremplis.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={30} color="#fff" />
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('RavCollect')}
        style={({ pressed }) => [styles.big, { backgroundColor: c.surface, borderWidth: 2, borderColor: c.danger, opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={[styles.icon, { backgroundColor: c.danger + '18' }]}>
          <Ionicons name="cash" size={40} color={c.danger} />
          {due.length ? (
            <View style={[styles.badge, { backgroundColor: c.danger, borderColor: c.surface }]}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{due.length}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigTxt, { color: c.danger }]}>2. Dons à récupérer</Text>
          <Text style={[styles.bigSub, { color: c.textMuted, opacity: 1 }]}>
            {due.length ? `${due.length} don${due.length > 1 ? 's' : ''} en attente, ${money(dueTotal)} au total. Notes et rappels push.` : 'Rien en attente. Kol hakavod !'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={30} color={c.danger} />
      </Pressable>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  big: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 22, marginBottom: 16, minHeight: 130 },
  icon: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bigTxt: { color: '#fff', fontSize: 22, fontWeight: '900' },
  bigSub: { color: '#fff', opacity: 0.85, fontSize: 15, marginTop: 6, lineHeight: 21 },
  badge: { position: 'absolute', top: -6, right: -6, minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2 },
});
