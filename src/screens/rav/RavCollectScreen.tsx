import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { Pledge } from '../../types';
import { RavScreen, BigButton, RavCard, BIG } from './RavUi';
import { money, formatNumeric, daysBetween, parseISODate } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavCollect'>;
type ViewMode = 'dons' | 'donateurs';

const SHORT: Record<string, string> = {
  'Dons de fêtes juives': 'Fêtes juives',
  'Dons de Chabbat': 'Chabbat',
};

export function RavCollectScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { pledges, categories, removePledge, updatePledgeNote, sendReminder } = useAppState();
  const [mode, setMode] = useState<ViewMode>('dons');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [reminded, setReminded] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [openMember, setOpenMember] = useState<string | null>(null);

  const allDue = pledges.filter((p) => p.status === 'due');
  const paid = pledges.filter((p) => p.status === 'paid');

  // Filtres : recherche par donateur + catégorie.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allDue.filter((p) => (!q || (p.member ?? '').toLowerCase().includes(q)) && (!category || p.category === category));
  }, [allDue, search, category]);

  // Vue « par don » : du plus grand au plus petit montant.
  const byDon = useMemo(() => [...filtered].sort((a, b) => b.amount - a.amount), [filtered]);

  // Vue « par donateur » : total dû par fidèle, du plus endetté au moins endetté.
  const byDonor = useMemo(() => {
    const map = new Map<string, Pledge[]>();
    filtered.forEach((p) => {
      const k = p.member ?? 'Fidèle';
      map.set(k, [...(map.get(k) ?? []), p]);
    });
    return [...map.entries()]
      .map(([member, list]) => ({ member, list: list.sort((a, b) => b.amount - a.amount), total: list.reduce((s, p) => s + p.amount, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const filteredTotal = filtered.reduce((s, p) => s + p.amount, 0);
  const categoryNames = categories.map((x) => x.name).filter((name) => allDue.some((p) => p.category === name));
  const countFor = (name: string | null) => allDue.filter((p) => !name || p.category === name).length;

  const remind = (ids: string[], who: string, what: string, amt: number) => {
    ids.forEach(sendReminder);
    setReminded(`Notification push envoyée à ${who} : « Rappel : ${what}, ${money(amt)} ».`);
    setTimeout(() => setReminded(null), 4000);
  };

  return (
    <RavScreen title="Dons à récupérer" subtitle={`${allDue.length} en attente · ${money(allDue.reduce((s, p) => s + p.amount, 0))}`} onBack={() => navigation.goBack()}>
      {/* Classement */}
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 8 }}>Classer</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <ModeButton active={mode === 'dons'} icon="cash" label="Par don" sub="du plus grand au plus petit" onPress={() => setMode('dons')} />
        <ModeButton active={mode === 'donateurs'} icon="people" label="Par donateur" sub="de celui qui doit le plus au moins" onPress={() => setMode('donateurs')} />
      </View>

      {/* Recherche */}
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 18, marginBottom: 8 }}>Chercher un donateur</Text>
      <View style={[styles.search, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Ionicons name="search" size={22} color={c.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Nom du fidèle qui doit de l’argent…"
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, fontSize: 18, color: c.text, paddingVertical: 4 }}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Catégories */}
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 18, marginBottom: 8 }}>Par catégorie</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <FilterChip label="Toutes" count={countFor(null)} active={category === null} onPress={() => setCategory(null)} />
        {categoryNames.map((name) => (
          <FilterChip key={name} label={SHORT[name] ?? name} count={countFor(name)} active={category === name} onPress={() => setCategory(category === name ? null : name)} />
        ))}
      </View>

      {/* Résumé du filtre */}
      <View style={[styles.summary, { backgroundColor: c.primaryLight }]}>
        <Text style={{ color: c.primary, fontSize: BIG.small, fontWeight: '700', flex: 1 }}>
          {filtered.length} don{filtered.length > 1 ? 's' : ''}
          {category ? ` · ${SHORT[category] ?? category}` : ''}
          {search.trim() ? ` · « ${search.trim()} »` : ''}
          {mode === 'donateurs' ? ` · ${byDonor.length} donateur${byDonor.length > 1 ? 's' : ''}` : ''}
        </Text>
        <Text style={{ color: c.primary, fontSize: 20, fontWeight: '900' }}>{money(filteredTotal)}</Text>
      </View>

      {reminded ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="notifications" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{reminded}</Text>
        </View>
      ) : null}

      {filtered.length === 0 ? (
        <RavCard style={{ alignItems: 'center' }}>
          <Ionicons name={allDue.length ? 'search' : 'checkmark-circle'} size={40} color={allDue.length ? c.textMuted : c.success} />
          <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
            {allDue.length ? 'Aucun don ne correspond à cette recherche' : 'Tout est encaissé'}
          </Text>
        </RavCard>
      ) : null}

      {/* ---- Vue par don ---- */}
      {mode === 'dons' &&
        byDon.map((p, i) => {
          const late = daysBetween(parseISODate(p.dueDate), new Date()) > 0;
          const who = p.member ?? 'Fidèle';
          return (
            <RavCard key={p.id} style={{ borderWidth: 2, borderColor: i === 0 ? c.danger : c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.rank, { backgroundColor: i === 0 ? c.danger : c.primaryLight }]}>
                  <Text style={{ color: i === 0 ? '#fff' : c.primary, fontWeight: '900', fontSize: 18 }}>{i + 1}</Text>
                </View>
                <Avatar name={who} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{who}</Text>
                  <Text style={{ color: c.textMuted, fontSize: BIG.small }}>
                    {p.label}
                    {p.category ? ` · ${SHORT[p.category] ?? p.category}` : ''}
                  </Text>
                  <Text style={{ color: late ? c.danger : c.textMuted, fontSize: 15, fontWeight: late ? '800' : '400', marginTop: 2 }}>
                    {late ? 'En retard · ' : ''}échéance {formatNumeric(p.dueDate)}
                    {p.lastReminder ? ` · dernier rappel ${formatNumeric(p.lastReminder)}` : ' · jamais rappelé'}
                  </Text>
                </View>
                <Text style={{ color: c.text, fontSize: 26, fontWeight: '900' }}>{money(p.amount)}</Text>
              </View>

              <View style={[styles.noteWrap, { borderColor: c.border, backgroundColor: c.background }]}>
                <Ionicons name="create-outline" size={20} color={c.textMuted} style={{ marginTop: 2 }} />
                <TextInput
                  value={p.note ?? ''}
                  onChangeText={(v) => updatePledgeNote(p.id, v)}
                  placeholder="Où en est-on ? Ex. : a promis de payer après Chabbat…"
                  placeholderTextColor={c.textMuted}
                  multiline
                  style={[styles.note, { color: c.text }]}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable onPress={() => remind([p.id], who, p.label, p.amount)} style={({ pressed }) => [styles.remind, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
                  <Ionicons name="notifications" size={24} color={c.textOnPrimary} />
                  <Text style={{ color: c.textOnPrimary, fontSize: 17, fontWeight: '800' }}>Envoyer un rappel push</Text>
                </Pressable>
                {confirmId === p.id ? (
                  <Pressable onPress={() => { removePledge(p.id); setConfirmId(null); }} style={[styles.trash, { backgroundColor: c.danger, width: undefined, paddingHorizontal: 12 }]}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setConfirmId(p.id)} hitSlop={8} style={[styles.trash, { backgroundColor: c.danger + '18' }]}>
                    <Ionicons name="trash" size={22} color={c.danger} />
                  </Pressable>
                )}
              </View>
            </RavCard>
          );
        })}

      {/* ---- Vue par donateur ---- */}
      {mode === 'donateurs' &&
        byDonor.map((d, i) => {
          const open = openMember === d.member;
          const lateCount = d.list.filter((p) => daysBetween(parseISODate(p.dueDate), new Date()) > 0).length;
          return (
            <RavCard key={d.member} style={{ borderWidth: 2, borderColor: i === 0 ? c.danger : c.border }}>
              <Pressable onPress={() => setOpenMember(open ? null : d.member)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.rank, { backgroundColor: i === 0 ? c.danger : c.primaryLight }]}>
                  <Text style={{ color: i === 0 ? '#fff' : c.primary, fontWeight: '900', fontSize: 18 }}>{i + 1}</Text>
                </View>
                <Avatar name={d.member} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 21, fontWeight: '900' }}>{d.member}</Text>
                  <Text style={{ color: c.textMuted, fontSize: BIG.small }}>
                    {d.list.length} don{d.list.length > 1 ? 's' : ''} en attente
                    {lateCount ? ` · ${lateCount} en retard` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: c.danger, fontSize: 26, fontWeight: '900' }}>{money(d.total)}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={c.textMuted} />
                </View>
              </Pressable>

              {open ? (
                <View style={{ marginTop: 10 }}>
                  {d.list.map((p) => (
                    <View key={p.id} style={[styles.line, { borderTopColor: c.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>{p.label}</Text>
                        <Text style={{ color: c.textMuted, fontSize: 14 }}>
                          {p.category ? `${SHORT[p.category] ?? p.category} · ` : ''}échéance {formatNumeric(p.dueDate)}
                          {p.note ? ` · ${p.note}` : ''}
                        </Text>
                      </View>
                      <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{money(p.amount)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <Pressable
                onPress={() => remind(d.list.map((p) => p.id), d.member, d.list.length > 1 ? `${d.list.length} dons en attente` : d.list[0].label, d.total)}
                style={({ pressed }) => [styles.remind, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1, marginTop: 12 }]}
              >
                <Ionicons name="notifications" size={24} color={c.textOnPrimary} />
                <Text style={{ color: c.textOnPrimary, fontSize: 17, fontWeight: '800' }}>Rappel push pour {money(d.total)}</Text>
              </Pressable>
            </RavCard>
          );
        })}

      <View style={{ marginTop: 10 }}>
        <BigButton label="Enregistrer un nouveau don" icon="add-circle" color={c.primaryLight} textColor={c.primary} onPress={() => navigation.replace('RavRecordDonation')} />
      </View>

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 30, marginBottom: 10 }}>Réglés ({paid.length})</Text>
      {paid.map((p) => (
        <RavCard key={p.id} style={{ opacity: 0.7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="checkmark-circle" size={28} color={c.success} />
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', flex: 1 }}>
              {p.member ?? 'Fidèle'} · {p.label}
            </Text>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{money(p.amount)}</Text>
          </View>
        </RavCard>
      ))}
    </RavScreen>
  );
}

function ModeButton({ active, icon, label, sub, onPress }: { active: boolean; icon: React.ComponentProps<typeof Ionicons>['name']; label: string; sub: string; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mode, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border, opacity: pressed ? 0.85 : 1 }]}>
      <Ionicons name={icon} size={26} color={active ? c.textOnPrimary : c.primary} />
      <Text style={{ color: active ? c.textOnPrimary : c.text, fontSize: 17, fontWeight: '800', marginTop: 4 }}>{label}</Text>
      <Text style={{ color: active ? c.textOnPrimary : c.textMuted, opacity: active ? 0.85 : 1, fontSize: 12, textAlign: 'center' }}>{sub}</Text>
    </Pressable>
  );
}

function FilterChip({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? c.secondary : c.surface, borderColor: active ? c.secondary : c.border }]}>
      <Text style={{ color: active ? c.primaryDark : c.text, fontSize: 16, fontWeight: '700' }}>{label}</Text>
      <View style={[styles.count, { backgroundColor: active ? c.primaryDark : c.primaryLight }]}>
        <Text style={{ color: active ? '#fff' : c.primary, fontSize: 12, fontWeight: '800' }}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mode: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 2, minHeight: 84 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, minHeight: 48 },
  count: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginTop: 16, marginBottom: 12 },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 12 },
  rank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  noteWrap: { flexDirection: 'row', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 10, marginTop: 12 },
  note: { flex: 1, fontSize: 16, lineHeight: 22, minHeight: 44, padding: 0 },
  remind: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, minHeight: 56 },
  trash: { width: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
});
