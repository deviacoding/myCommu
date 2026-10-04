import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { RavScreen, BigInput, BigButton, RavCard, BIG } from './RavUi';
import { capitalize, formatLong, parseISODate, todayISO } from '../../utils/time';
import { simulateScheduleImport } from '../../utils/calj';
import { HebcalSuggestions } from '../../components/HebcalSuggestions';
import { useTheme as useThemeCtx } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RavStackParamList, 'RavSchedule'>;

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const QUICK_NAMES_FALLBACK = ['Office', 'Cours'];

function monthLabel(y: number, m: number): string {
  return capitalize(new Date(y, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
}

function isoOf(y: number, m: number, d: number): string {
  return todayISO(new Date(y, m, d));
}

export function RavScheduleScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { myDayEntries: dayEntries, addDayEntry, addDayEntries, removeDayEntry, seed } = useAppState();
  const { community } = useThemeCtx();
  const [calj, setCalj] = useState<'idle' | 'locating' | 'fetching' | 'done'>('idle');
  const [caljResult, setCaljResult] = useState<{ place: string; coords: string; count: number } | null>(null);

  const fetchCalJ = () => {
    setCalj('locating');
    setTimeout(() => {
      setCalj('fetching');
      setTimeout(() => {
        const r = simulateScheduleImport(community);
        const count = addDayEntries(r.entries);
        setCaljResult({ place: r.place, coords: r.coords, count });
        setCalj('done');
      }, 1300);
    }, 1200);
  };
  const today = todayISO();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string>(today);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [added, setAdded] = useState<string | null>(null);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    dayEntries.forEach((e) => {
      map[e.date] = (map[e.date] ?? 0) + 1;
    });
    return map;
  }, [dayEntries]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(isoOf(year, month, d));
    while (list.length % 7) list.push(null);
    return list;
  }, [year, month]);

  const dayItems = dayEntries.filter((e) => e.date === selected).sort((a, b) => (a.time < b.time ? -1 : 1));
  const validTime = /^\d{1,2}[:h]\d{2}$/.test(time.trim()) || /^après \d{1,2}[:h]\d{2}$/.test(time.trim());
  const canAdd = name.trim().length > 1 && validTime;

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const submit = () => {
    addDayEntry(selected, name.trim(), time.trim().replace('h', ':'));
    setAdded(`${name.trim()} à ${time.trim()}`);
    setName('');
    setTime('');
    setTimeout(() => setAdded(null), 3000);
  };

  const selDate = parseISODate(selected);
  const religious = seed.religiousDate(selDate);

  return (
    <RavScreen title={seed.scheduleTitle} subtitle="Touchez un jour, puis ajoutez un horaire" onBack={() => navigation.goBack()}>
      {/* Juif : propositions calculées hors ligne (Hebcal). Autres confessions : import simulé. */}
      {community === 'jewish' ? <HebcalSuggestions /> : null}
      {community !== 'jewish' ? (
      <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="location" size={30} color={c.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Horaires automatiques avec {seed.scheduleSource}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>
              {calj === 'idle' ? 'Horaires récupérés pour votre ville, sans rien taper.' : null}
              {calj === 'locating' ? 'Géolocalisation en cours…' : null}
              {calj === 'fetching' ? `Connexion à ${seed.scheduleSource}, calcul des horaires…` : null}
              {calj === 'done' && caljResult ? `${caljResult.count} horaires importés pour ${caljResult.place} (${caljResult.coords}).` : null}
            </Text>
          </View>
        </View>
        <BigButton
          label={calj === 'idle' ? seed.scheduleFetchLabel : calj === 'done' ? 'Horaires importés · relancer' : 'Patientez…'}
          icon={calj === 'done' ? 'checkmark-circle' : 'navigate'}
          disabled={calj === 'locating' || calj === 'fetching'}
          color={calj === 'done' ? c.success : c.primary}
          onPress={fetchCalJ}
          style={{ marginTop: 12 }}
        />
      </RavCard>
      ) : null}

      {/* Calendrier */}
      <RavCard style={{ padding: 12 }}>
        <View style={styles.monthRow}>
          <Pressable onPress={prev} style={[styles.nav, { backgroundColor: c.primaryLight }]} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color={c.primary} />
          </Pressable>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', flex: 1, textAlign: 'center' }}>{monthLabel(year, month)}</Text>
          <Pressable onPress={next} style={[styles.nav, { backgroundColor: c.primaryLight }]} hitSlop={8}>
            <Ionicons name="chevron-forward" size={28} color={c.primary} />
          </Pressable>
        </View>
        <View style={styles.week}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={[styles.weekday, { color: WEEKDAYS.indexOf(d) === (seed.serviceSecondColumnDay + 6) % 7 ? c.primary : c.textMuted }]}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((iso, i) => {
            if (!iso) return <View key={`empty-${i}`} style={[styles.cell, { borderColor: 'transparent' }]} />;
            const d = parseISODate(iso);
            const isSel = iso === selected;
            const isToday = iso === today;
            const isShabbat = d.getDay() === seed.serviceSecondColumnDay;
            const count = countByDate[iso] ?? 0;
            return (
              <Pressable
                key={iso}
                onPress={() => setSelected(iso)}
                style={[
                  styles.cell,
                  { backgroundColor: isSel ? c.primary : isShabbat ? c.primaryLight : 'transparent', borderColor: isToday ? c.secondary : 'transparent' },
                ]}
              >
                <Text style={{ color: isSel ? c.textOnPrimary : c.text, fontSize: 18, fontWeight: isToday || isSel ? '900' : '600' }}>{d.getDate()}</Text>
                {count ? (
                  <View style={[styles.dot, { backgroundColor: isSel ? c.secondary : c.primary }]}>
                    <Text style={{ color: isSel ? c.primaryDark : '#fff', fontSize: 10, fontWeight: '800' }}>{count}</Text>
                  </View>
                ) : (
                  <View style={{ height: 16 }} />
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          <Legend color={c.primaryLight} label={seed.serviceColumns[1]} border={c.border} />
          <Legend color="transparent" label="Aujourd’hui" border={c.secondary} />
          <Legend color={c.primary} label="Jour choisi" border={c.primary} />
        </View>
      </RavCard>

      {/* Jour sélectionné */}
      <Text style={{ color: c.text, fontSize: 24, fontWeight: '900', marginTop: 8 }}>{capitalize(formatLong(selected))}</Text>
      {religious ? <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{religious}</Text> : null}

      <RavCard style={{ marginTop: 12 }}>
        {dayItems.length === 0 ? (
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>Aucun horaire ce jour. Ajoutez-en un ci-dessous.</Text>
        ) : null}
        {dayItems.map((e) => (
          <View key={e.id} style={[styles.entry, { borderBottomColor: c.border }]}>
            <Text style={{ color: c.primary, fontSize: 22, fontWeight: '900', width: 110, fontVariant: ['tabular-nums'] }}>{e.time}</Text>
            <Text style={{ color: c.text, fontSize: BIG.text, flex: 1 }}>{e.name}</Text>
            <Pressable onPress={() => removeDayEntry(e.id)} hitSlop={8} style={[styles.trash, { backgroundColor: c.danger + '18' }]}>
              <Ionicons name="trash" size={20} color={c.danger} />
            </Pressable>
          </View>
        ))}
      </RavCard>

      {/* Ajouter */}
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 8, marginBottom: 8 }}>Ajouter un horaire ce jour</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {(seed.scheduleQuickNames ?? QUICK_NAMES_FALLBACK).map((q) => (
          <Pressable key={q} onPress={() => setName(q)} style={[styles.chip, { backgroundColor: name === q ? c.primary : c.surface, borderColor: name === q ? c.primary : c.border }]}>
            <Text style={{ color: name === q ? c.textOnPrimary : c.text, fontSize: 16, fontWeight: '700' }}>{q}</Text>
          </Pressable>
        ))}
      </View>
      <BigInput value={name} onChangeText={setName} placeholder="Nom de l’horaire, ex. : Allumage, Minha…" />
      <BigInput value={time} onChangeText={setTime} placeholder="Heure, ex. : 19:13" style={{ marginTop: 8 }} />
      {time && !validTime ? <Text style={{ color: c.danger, fontSize: 15, marginTop: 4 }}>Écrivez l’heure comme 19:13</Text> : null}
      <View style={{ marginTop: 12 }}>
        <BigButton label={`Ajouter au ${formatLong(selected)}`} icon="add-circle" disabled={!canAdd} onPress={submit} />
      </View>
      {added ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{added} ajouté. La communauté le voit dans ses horaires.</Text>
        </View>
      ) : null}
    </RavScreen>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: color, borderWidth: 2, borderColor: border }} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  nav: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '800', paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 0.95, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 2, gap: 2 },
  dot: { minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  trash: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, minHeight: 46, justifyContent: 'center' },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 12 },
});
