import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, Segmented, SectionTitle, Pill, Muted } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { LiveBanner } from '../../components/LiveBanner';
import { MyDates } from '../../components/MyDates';
import { AgendaCategory, Holiday, HolidayKind } from '../../types';
import { capitalize, daysBetween, formatLong, formatShort, parseISODate, todayISO } from '../../utils/time';

type Mode = 'horaires' | 'agenda';

const kindLabel: Record<HolidayKind, string> = {
  yomtov: 'Fête',
  fast: 'Jeûne',
  shabbat: 'Office',
  holhamoed: 'Période',
};

const categoryMeta: Record<AgendaCategory, { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  office: { label: 'Office', icon: 'book-outline' },
  cours: { label: 'Cours', icon: 'school-outline' },
  fete: { label: 'Fête', icon: 'sparkles-outline' },
  communaute: { label: 'Communauté', icon: 'people-outline' },
};

function holidayStatus(h: Holiday, today: Date): { label: string; tone: 'past' | 'now' | 'soon' } {
  const start = parseISODate(h.start);
  const end = parseISODate(h.end);
  if (daysBetween(end, today) > 0) return { label: 'Terminé', tone: 'past' };
  if (daysBetween(start, today) >= 0) return { label: 'En cours', tone: 'now' };
  const d = daysBetween(today, start);
  return { label: d === 1 ? 'Demain' : `Dans ${d} jours`, tone: 'soon' };
}

export function ScheduleScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useAuth();
  const { holidays: tishreiHolidays, services: dailyServices, myAgenda: agendaEvents, myDayEntries: dayEntries, congregation, seed } = useAppState();
  const [mode, setMode] = useState<Mode>('horaires');
  const [saved, setSaved] = useState<string[]>(['a3', 'a7']);
  const today = useMemo(() => new Date(), []);
  const hebrew = seed.religiousDate(today);
  const isShabbat = today.getDay() === seed.serviceSecondColumnDay;

  const nextLighting = useMemo(() => {
    const upcoming = tishreiHolidays.filter((h) => daysBetween(today, parseISODate(h.start)) >= 0 && h.kind !== 'fast' && h.kind !== 'holhamoed');
    return upcoming[0] ?? null;
  }, [today, tishreiHolidays]);

  const agendaByDate = useMemo(() => {
    const t = todayISO(today);
    const groups: { date: string; events: typeof agendaEvents }[] = [];
    agendaEvents
      .filter((e) => e.date >= t)
      .forEach((e) => {
        const g = groups.find((x) => x.date === e.date);
        if (g) g.events.push(e);
        else groups.push({ date: e.date, events: [e] });
      });
    return groups;
  }, [today, agendaEvents]);

  // Horaires publiés par le Rav dans son calendrier, pour les 7 prochains jours.
  const upcomingDays = useMemo(() => {
    const t = todayISO(today);
    const groups: { date: string; entries: typeof dayEntries }[] = [];
    [...dayEntries]
      .filter((e) => e.date >= t && daysBetween(today, parseISODate(e.date)) <= 7)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))
      .forEach((e) => {
        const g = groups.find((x) => x.date === e.date);
        if (g) g.entries.push(e);
        else groups.push({ date: e.date, entries: [e] });
      });
    return groups;
  }, [today, dayEntries]);

  const toggleSaved = (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader
        title={seed.scheduleTitle}
        subtitle={`${capitalize(formatLong(todayISO(today)))}${hebrew ? ` · ${hebrew}` : ''}`}
        communitySwitch
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Segmented<Mode>
          options={[
            { value: 'horaires', label: 'Horaires' },
            { value: 'agenda', label: 'Agenda' },
          ]}
          value={mode}
          onChange={setMode}
        />

        <View style={{ marginTop: 14 }}>
          <LiveBanner />
        </View>
        {mode === 'horaires' ? (
          <>
            {nextLighting && (
              <Card style={[styles.hero, { backgroundColor: c.primary, borderColor: c.primary }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.textOnPrimary, opacity: 0.8, fontSize: 12, fontWeight: '600' }}>{seed.nextHolidayLabel}</Text>
                  <Text style={{ color: c.textOnPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{nextLighting.name}</Text>
                  <Text style={{ color: c.textOnPrimary, opacity: 0.9, marginTop: 2 }}>
                    {capitalize(formatLong(nextLighting.start))} · {nextLighting.times[0].value}
                  </Text>
                </View>
                <MaterialCommunityIcons name="candle" size={44} color={c.secondary} />
              </Card>
            )}

            <SectionTitle title="Prochains horaires" />
            {upcomingDays.length === 0 ? <Muted style={{ marginBottom: 10 }}>Aucun horaire publié pour les jours à venir.</Muted> : null}
            {upcomingDays.map((g) => {
              const d = daysBetween(today, parseISODate(g.date));
              const dayLabel = d === 0 ? 'Aujourd’hui' : d === 1 ? 'Demain' : capitalize(formatLong(g.date));
              return (
                <Card key={g.date} style={{ paddingVertical: 12 }}>
                  <Text style={{ color: d === 0 ? c.primary : c.text, fontWeight: '800', marginBottom: 6 }}>{dayLabel}</Text>
                  {g.entries.map((e) => (
                    <View key={e.id} style={styles.timeRow}>
                      <Text style={{ color: c.text, fontSize: 14, flex: 1 }}>{e.name}</Text>
                      <Text style={{ color: c.text, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{e.time}</Text>
                    </View>
                  ))}
                </Card>
              );
            })}

            <SectionTitle title={seed.seasonTitle} />
            <Muted style={{ marginTop: -6, marginBottom: 10 }}>Horaires indicatifs · {congregation.name}</Muted>

            {tishreiHolidays.map((h) => {
              const st = holidayStatus(h, today);
              const tone = st.tone === 'now' ? c.success : st.tone === 'soon' ? c.primary : c.textMuted;
              return (
                <Card key={h.id} style={st.tone === 'past' ? { opacity: 0.6 } : undefined}>
                  <View style={styles.cardHead}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.holidayName, { color: c.text }]}>{h.name}</Text>
                        <Text style={{ color: c.textMuted, fontSize: 14 }}>{h.hebrewName}</Text>
                      </View>
                      <Muted style={{ marginTop: 2 }}>
                        {h.hebrewDates} · {capitalize(formatShort(h.start))}
                        {h.end !== h.start ? ` → ${formatShort(h.end)}` : ''}
                      </Muted>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Pill label={kindLabel[h.kind]} color={c.primary} />
                      <Pill label={st.label} color={tone} />
                    </View>
                  </View>
                  <View style={[styles.times, { borderTopColor: c.border }]}>
                    {h.times.map((t) => (
                      <View key={t.label} style={styles.timeRow}>
                        <Text style={{ color: c.textMuted, fontSize: 13, flex: 1 }}>{t.label}</Text>
                        <Text style={{ color: c.text, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{t.value}</Text>
                      </View>
                    ))}
                  </View>
                  {h.notes?.map((n) => (
                    <View key={n} style={styles.noteRow}>
                      <Ionicons name="information-circle-outline" size={15} color={c.primary} style={{ marginTop: 1 }} />
                      <Text style={{ color: c.textMuted, fontSize: 12, flex: 1 }}>{n}</Text>
                    </View>
                  ))}
                </Card>
              );
            })}

            <SectionTitle title="Offices quotidiens" />
            <Card>
              <View style={[styles.timeRow, { marginBottom: 8 }]}>
                <Text style={{ flex: 1 }} />
                <Text style={[styles.colHead, { color: c.textMuted }]}>{seed.serviceColumns[0]}</Text>
                <Text style={[styles.colHead, { color: c.textMuted }]}>{seed.serviceColumns[1]}</Text>
              </View>
              {dailyServices.map((s) => (
                <View key={s.name} style={styles.timeRow}>
                  <Text style={{ color: c.text, fontWeight: '600', flex: 1 }}>{s.name}</Text>
                  <Text style={[styles.col, { color: isShabbat ? c.textMuted : c.text }]}>{s.weekday}</Text>
                  <Text style={[styles.col, { color: isShabbat ? c.text : c.textMuted }]}>{s.shabbat}</Text>
                </View>
              ))}
              <Muted style={{ marginTop: 10 }}>{congregation.name} · {congregation.address}, {congregation.city}</Muted>
            </Card>
          </>
        ) : (
          <>
            <SectionTitle title="À venir" action={`${saved.length} dans mon agenda`} />
            {agendaByDate.map((g) => {
              const d = daysBetween(today, parseISODate(g.date));
              const dayLabel = d === 0 ? 'Aujourd’hui' : d === 1 ? 'Demain' : capitalize(formatLong(g.date));
              return (
                <View key={g.date} style={{ marginBottom: 6 }}>
                  <Text style={[styles.dayLabel, { color: d === 0 ? c.primary : c.textMuted }]}>{dayLabel}</Text>
                  {g.events.map((e) => {
                    const meta = categoryMeta[e.category];
                    const isSaved = saved.includes(e.id);
                    return (
                      <Card key={e.id} style={{ gap: 12 }}>
                        {e.poster ? (
                          <View style={{ backgroundColor: e.poster.color, height: 110, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, textAlign: 'center', paddingHorizontal: 12 }}>{e.title}</Text>
                          </View>
                        ) : null}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ alignItems: 'center', width: 48 }}>
                          <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{e.time}</Text>
                          <View style={[styles.catIcon, { backgroundColor: c.primaryLight }]}>
                            <Ionicons name={meta.icon} size={16} color={c.primary} />
                          </View>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{e.title}</Text>
                          <Muted style={{ marginTop: 2 }}>
                            {meta.label} · {e.place}
                          </Muted>
                          {e.description ? <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6 }}>{e.description}</Text> : null}
                        </View>
                        <Pressable onPress={() => toggleSaved(e.id)} hitSlop={8}>
                          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={isSaved ? c.primary : c.textMuted} />
                        </Pressable>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              );
            })}
            <MyDates />
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  avatarDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  holidayName: { fontSize: 17, fontWeight: '800' },
  times: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 10, gap: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  noteRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  colHead: { width: 70, textAlign: 'right', fontSize: 12, fontWeight: '600' },
  col: { width: 70, textAlign: 'right', fontWeight: '700', fontVariant: ['tabular-nums'] },
  dayLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  catIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});
