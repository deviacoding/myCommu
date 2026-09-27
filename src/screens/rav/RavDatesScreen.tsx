import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { AddDateForm, dateTypeMeta, daysUntil } from '../../components/MyDates';
import { MemberDateType } from '../../types';
import { RavScreen, RavCard, BigButton, BIG } from './RavUi';
import { capitalize, formatLong } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavDates'>;
type Filter = 'all' | MemberDateType;

export function RavDatesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { myMemberDates, removeMemberDate } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [reminded, setReminded] = useState<string | null>(null);

  const sorted = useMemo(() => [...myMemberDates].filter((d) => filter === 'all' || d.type === filter).sort((a, b) => daysUntil(a) - daysUntil(b)), [myMemberDates, filter]);
  const week = sorted.filter((d) => daysUntil(d) <= 7);
  const month = sorted.filter((d) => daysUntil(d) > 7 && daysUntil(d) <= 31);
  const later = sorted.filter((d) => daysUntil(d) > 31);
  const azkarot = myMemberDates.filter((d) => d.type === 'azkara').length;
  const birthdays = myMemberDates.filter((d) => d.type === 'anniversaire').length;

  const Section = ({ title, list }: { title: string; list: typeof sorted }) =>
    list.length ? (
      <>
        <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 18, marginBottom: 8 }}>{title}</Text>
        {list.map((d) => {
          const meta = dateTypeMeta[d.type];
          const n = daysUntil(d);
          return (
            <RavCard key={d.id} style={{ borderWidth: 2, borderColor: n <= 7 ? meta.color : c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={d.member} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{d.member}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
                    <Text style={{ color: c.text, fontSize: BIG.small, flex: 1 }}>{d.label}</Text>
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: 15, marginTop: 2 }}>
                    {capitalize(formatLong(d.date))}
                    {d.hebrewDate ? ` · ${d.hebrewDate}` : ''}
                  </Text>
                  {d.note ? <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 2 }}>{d.note}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: n <= 7 ? meta.color : c.primary, fontSize: 16, fontWeight: '900' }}>{n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : `J-${n}`}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    setReminded(`Message envoyé à ${d.member} : « ${d.type === 'azkara' ? 'Nous pensons à vous pour l’azkara' : 'Mazal tov'} : ${d.label} »`);
                    setTimeout(() => setReminded(null), 3500);
                  }}
                  style={({ pressed }) => [styles.action, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Ionicons name={d.type === 'azkara' ? 'flame' : 'gift'} size={20} color={c.textOnPrimary} />
                  <Text style={{ color: c.textOnPrimary, fontWeight: '800', fontSize: 15 }}>{d.type === 'azkara' ? 'Proposer une montée / Kaddich' : 'Envoyer un mazal tov'}</Text>
                </Pressable>
                <Pressable onPress={() => removeMemberDate(d.id)} hitSlop={8} style={[styles.trash, { backgroundColor: c.danger + '18' }]}>
                  <Ionicons name="trash" size={20} color={c.danger} />
                </Pressable>
              </View>
            </RavCard>
          );
        })}
      </>
    ) : null;

  return (
    <RavScreen title="Dates des fidèles" subtitle={`${birthdays} anniversaires · ${azkarot} azkarot`} onBack={() => navigation.goBack()}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['all', 'anniversaire', 'azkara', 'autre'] as Filter[]).map((f) => {
          const active = filter === f;
          const color = f === 'all' ? c.primary : dateTypeMeta[f].color;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, { backgroundColor: active ? color : c.surface, borderColor: active ? color : c.border }]}>
              <Text style={{ color: active ? '#fff' : c.text, fontSize: 16, fontWeight: '700' }}>{f === 'all' ? 'Toutes' : dateTypeMeta[f].label + 's'}</Text>
            </Pressable>
          );
        })}
      </View>

      {reminded ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="paper-plane" size={22} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{reminded}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 14 }}>
        <BigButton label={showForm ? 'Fermer le formulaire' : 'Ajouter une date pour un fidèle'} icon={showForm ? 'close' : 'add-circle'} color={c.primaryLight} textColor={c.primary} onPress={() => setShowForm((v) => !v)} />
      </View>
      {showForm ? (
        <RavCard style={{ marginTop: 12, borderColor: c.primary, borderWidth: 2 }}>
          <AddDateForm
            big
            onAdded={(l) => {
              setAdded(l);
              setShowForm(false);
              setTimeout(() => setAdded(null), 3000);
            }}
          />
        </RavCard>
      ) : null}
      {added ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>« {added} » enregistré.</Text>
        </View>
      ) : null}

      <Section title="Cette semaine" list={week} />
      <Section title="Ce mois-ci" list={month} />
      <Section title="Plus tard" list={later} />
      {sorted.length === 0 ? (
        <RavCard style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>Aucune date dans cette catégorie.</Text>
        </RavCard>
      ) : null}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, minHeight: 46, justifyContent: 'center' },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginTop: 12 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, minHeight: 50 },
  trash: { width: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
