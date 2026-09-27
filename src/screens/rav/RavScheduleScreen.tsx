import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { RavScreen, RavCard, BigButton, BIG } from './RavUi';
import { formatShort, capitalize } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavSchedule'>;

export function RavScheduleScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { holidays, services, updateHolidayTime, updateService } = useAppState();
  const [saved, setSaved] = useState(false);

  const timeInput = [styles.time, { borderColor: c.border, backgroundColor: c.background, color: c.text }];

  return (
    <RavScreen title="Horaires" subtitle="Touchez une heure pour la modifier" onBack={() => navigation.goBack()}>
      <View style={[styles.tip, { backgroundColor: c.primaryLight }]}>
        <Ionicons name="information-circle" size={24} color={c.primary} />
        <Text style={{ color: c.primary, fontSize: BIG.small, fontWeight: '700', flex: 1 }}>
          Chaque changement est enregistré tout de suite et visible par les fidèles dans l’onglet Horaires.
        </Text>
      </View>

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 18, marginBottom: 10 }}>Offices quotidiens</Text>
      <RavCard>
        <View style={[styles.row, { marginBottom: 6 }]}>
          <Text style={{ flex: 1 }} />
          <Text style={[styles.colHead, { color: c.textMuted }]}>Semaine</Text>
          <Text style={[styles.colHead, { color: c.textMuted }]}>Chabbat</Text>
        </View>
        {services.map((s) => (
          <View key={s.name} style={styles.row}>
            <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '800', flex: 1 }}>{s.name}</Text>
            <TextInput value={s.weekday} onChangeText={(v) => updateService(s.name, 'weekday', v)} onBlur={() => setSaved(true)} style={timeInput} />
            <TextInput value={s.shabbat} onChangeText={(v) => updateService(s.name, 'shabbat', v)} onBlur={() => setSaved(true)} style={timeInput} />
          </View>
        ))}
      </RavCard>

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 18, marginBottom: 10 }}>Fêtes de Tichri 5787</Text>
      {holidays.map((h) => (
        <RavCard key={h.id}>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>
            {h.name} <Text style={{ color: c.textMuted, fontSize: 18, fontWeight: '400' }}>{h.hebrewName}</Text>
          </Text>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 8 }}>
            {h.hebrewDates} · {capitalize(formatShort(h.start))}
            {h.end !== h.start ? ` → ${formatShort(h.end)}` : ''}
          </Text>
          {h.times.map((t, i) => (
            <View key={t.label} style={[styles.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingVertical: 8 }]}>
              <Text style={{ color: c.text, fontSize: 17, flex: 1 }}>{t.label}</Text>
              <TextInput value={t.value} onChangeText={(v) => updateHolidayTime(h.id, i, v)} onBlur={() => setSaved(true)} style={[...timeInput, { width: 120 }]} />
            </View>
          ))}
        </RavCard>
      ))}

      {saved ? (
        <View style={[styles.tip, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>Horaires enregistrés</Text>
        </View>
      ) : null}
      <View style={{ marginTop: 16 }}>
        <BigButton label="Terminé" icon="checkmark" onPress={() => navigation.goBack()} />
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colHead: { width: 96, textAlign: 'center', fontSize: 14, fontWeight: '700' },
  time: { width: 96, borderWidth: 2, borderRadius: 12, paddingVertical: 12, fontSize: 20, fontWeight: '800', textAlign: 'center', marginVertical: 4 },
});
