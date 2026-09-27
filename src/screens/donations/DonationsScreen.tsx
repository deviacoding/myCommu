import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { Card, Segmented, SectionTitle, Muted, Button } from '../../components/ui';
import { quickAmounts, amountLabels } from '../../mocks/donations';
import { DonationType } from '../../types';
import { money, formatShort, formatNumeric, CURRENCY } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Tab = 'tsedaka' | 'maasser' | 'engagements';

const typeLabel: Record<DonationType, string> = { tsedaka: 'Tsedaka', maasser: 'Maasser', engagement: 'Engagement' };

function toInt(v: string): number {
  const n = parseInt(v.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function DonationsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { donations, pledges, totalGiven, givenThisMonth, maasserGivenThisMonth, maasserInput, setMaasserInput } = useAppState();
  // L'onglet Maasser s'ouvre par défaut.
  const [tab, setTab] = useState<Tab>('maasser');
  const [salary, setSalary] = useState(maasserInput.salary ? String(maasserInput.salary) : '');
  const [school, setSchool] = useState(maasserInput.school ? String(maasserInput.school) : '');
  const [talmudTorah, setTalmudTorah] = useState(maasserInput.talmudTorah ? String(maasserInput.talmudTorah) : '');
  const [other, setOther] = useState(maasserInput.other ? String(maasserInput.other) : '');

  const calc = useMemo(() => {
    const s = toInt(salary);
    const fees = toInt(school) + toInt(talmudTorah) + toInt(other);
    const base = Math.max(0, s - fees);
    return { salary: s, fees, base, maasser: Math.round(base * 0.1) };
  }, [salary, school, talmudTorah, other]);

  const maasserLeft = Math.max(0, calc.maasser - maasserGivenThisMonth);
  const due = pledges.filter((p) => p.status === 'due');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);

  const saveInputs = () =>
    setMaasserInput({ salary: toInt(salary), school: toInt(school), talmudTorah: toInt(talmudTorah), other: toInt(other) });

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Dons" subtitle={`${money(givenThisMonth)} donnés ce mois · ${money(totalGiven)} au total`} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented<Tab>
          options={[
            { value: 'maasser', label: 'Maasser' },
            { value: 'tsedaka', label: 'Tsedaka' },
            { value: 'engagements', label: due.length ? `À payer (${due.length})` : 'À payer' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'maasser' && (
          <>
            <Card style={[styles.hero, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <MaterialCommunityIcons name="percent-circle" size={40} color={c.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textOnPrimary, fontSize: 18, fontWeight: '800' }}>Donner son maasser</Text>
                <Text style={{ color: c.textOnPrimary, opacity: 0.85, fontSize: 13, marginTop: 4 }}>
                  Un dixième de ses revenus réservé à la tsedaka. « Asser téasser » : prélève la dîme afin de t’enrichir (Taanit 9a).
                </Text>
              </View>
            </Card>

            <SectionTitle title="Calculer mon maasser à donner" />
            <Card>
              <Text style={[styles.label, { color: c.text }]}>Salaire net du mois</Text>
              <TextInput
                value={salary}
                onChangeText={setSalary}
                onBlur={saveInputs}
                keyboardType="number-pad"
                placeholder={`Ex. : 12 000 ${CURRENCY}`}
                placeholderTextColor={c.textMuted}
                style={inputStyle}
              />

              <Text style={[styles.label, { color: c.text, marginTop: 16 }]}>Frais à retirer avant le calcul</Text>
              <Muted style={{ marginBottom: 8 }}>Les frais d’éducation juive peuvent être déduits du revenu, selon l’avis de votre Rav.</Muted>
              <FeeRow icon="school-outline" label="École juive" value={school} onChange={setSchool} onBlur={saveInputs} />
              <FeeRow icon="book-outline" label="Cours de Talmud Torah" value={talmudTorah} onChange={setTalmudTorah} onBlur={saveInputs} />
              <FeeRow icon="add-circle-outline" label="Autres frais" value={other} onChange={setOther} onBlur={saveInputs} />

              <View style={[styles.result, { backgroundColor: c.primaryLight }]}>
                <View style={styles.resultRow}>
                  <Muted>Salaire net</Muted>
                  <Text style={{ color: c.text, fontWeight: '600' }}>{money(calc.salary)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Muted>− Frais déduits</Muted>
                  <Text style={{ color: c.text, fontWeight: '600' }}>− {money(calc.fees)}</Text>
                </View>
                <View style={[styles.resultRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.primary + '55', paddingTop: 8 }]}>
                  <Muted>Base de calcul</Muted>
                  <Text style={{ color: c.text, fontWeight: '700' }}>{money(calc.base)}</Text>
                </View>
                <View style={[styles.resultRow, { marginTop: 4 }]}>
                  <Text style={{ color: c.primary, fontWeight: '800', fontSize: 16 }}>Maasser à donner (10 %)</Text>
                  <Text style={{ color: c.primary, fontWeight: '900', fontSize: 22 }}>{money(calc.maasser)}</Text>
                </View>
              </View>

              {calc.maasser > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <View style={styles.kpis}>
                    <Kpi label="À donner ce mois" value={money(calc.maasser)} color={c.text} />
                    <Kpi label="Déjà donné" value={money(maasserGivenThisMonth)} color={c.success} />
                    <Kpi label="Reste" value={money(maasserLeft)} color={maasserLeft > 0 ? c.warning : c.success} />
                  </View>
                  <ProgressBar progress={Math.min(1, maasserGivenThisMonth / calc.maasser)} />
                  {maasserLeft > 0 ? (
                    <Button
                      label={`Donner le reste : ${money(maasserLeft)}`}
                      icon="checkmark-circle-outline"
                      onPress={() => navigation.navigate('Donate', { type: 'maasser', amount: maasserLeft })}
                      style={{ marginTop: 14 }}
                    />
                  ) : (
                    <View style={[styles.done, { backgroundColor: c.success + '22' }]}>
                      <Ionicons name="checkmark-circle" size={18} color={c.success} />
                      <Text style={{ color: c.success, fontWeight: '700' }}>Maasser du mois complet</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Muted style={{ marginTop: 12, textAlign: 'center' }}>Saisissez votre salaire pour calculer votre maasser.</Muted>
              )}
            </Card>

            <Card>
              <Text style={{ color: c.text, fontWeight: '700' }}>Bon à savoir</Text>
              <Muted style={{ marginTop: 6, lineHeight: 19 }}>
                Le maasser se calcule en général sur le revenu net, après impôts. Il est recommandé de le commencer « bli neder »,
                sans vœu formel. La déduction des frais de scolarité fait l’objet d’avis différents : voir la réponse du Rav dans l’onglet
                Questions.
              </Muted>
            </Card>
          </>
        )}

        {tab === 'tsedaka' && (
          <>
            <Card style={[styles.hero, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <MaterialCommunityIcons name="hand-heart" size={40} color={c.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textOnPrimary, fontSize: 18, fontWeight: '800' }}>Donner la tsedaka</Text>
                <Text style={{ color: c.textOnPrimary, opacity: 0.85, fontSize: 13, marginTop: 4 }}>
                  « La tsedaka sauve de la mort » (Michlé 10, 2). Un don, même petit, chaque jour.
                </Text>
              </View>
            </Card>
            <SectionTitle title="Montant rapide" />
            <View style={styles.amounts}>
              {quickAmounts.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => navigation.navigate('Donate', { type: 'tsedaka', amount: a })}
                  style={({ pressed }) => [styles.amount, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>{a} {CURRENCY}</Text>
                  <Muted style={{ fontSize: 11 }}>{amountLabels[a] ?? ''}</Muted>
                </Pressable>
              ))}
              <Pressable
                onPress={() => navigation.navigate('Donate', { type: 'tsedaka' })}
                style={({ pressed }) => [styles.amount, { backgroundColor: c.primaryLight, borderColor: c.primaryLight, opacity: pressed ? 0.8 : 1 }]}
              >
                <Ionicons name="create-outline" size={20} color={c.primary} />
                <Text style={{ color: c.primary, fontWeight: '700', fontSize: 12 }}>Autre</Text>
              </Pressable>
            </View>
            <Muted style={{ marginTop: 4 }}>18 = ‘haï, « vivant » · 26 = valeur numérique du Nom divin.</Muted>
          </>
        )}

        {tab === 'engagements' && (
          <>
            <Card style={[styles.hero, { backgroundColor: due.length ? c.warning + '22' : c.success + '22', borderColor: 'transparent' }]}>
              <Ionicons name={due.length ? 'alert-circle' : 'checkmark-circle'} size={32} color={due.length ? c.warning : c.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>
                  {due.length ? `${money(dueTotal)} à régler` : 'Tout est réglé'}
                </Text>
                <Muted>{due.length ? `${due.length} engagement${due.length > 1 ? 's' : ''} en attente` : 'Aucun engagement en attente'}</Muted>
              </View>
            </Card>
            {pledges.map((p) => (
              <Card key={p.id} style={p.status === 'paid' ? { opacity: 0.6 } : undefined}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{p.label}</Text>
                    <Muted style={{ marginTop: 2 }}>{p.origin}</Muted>
                    <Muted style={{ marginTop: 2 }}>{p.status === 'paid' ? 'Réglé' : `Échéance : ${formatNumeric(p.dueDate)}`}</Muted>
                  </View>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>{money(p.amount)}</Text>
                </View>
                {p.status === 'due' ? (
                  <Button
                    label="Payer maintenant"
                    icon="card-outline"
                    onPress={() => navigation.navigate('Donate', { type: 'engagement', amount: p.amount, pledgeId: p.id })}
                    style={{ marginTop: 12 }}
                  />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    <Ionicons name="checkmark-circle" size={16} color={c.success} />
                    <Text style={{ color: c.success, fontWeight: '600', fontSize: 13 }}>Payé</Text>
                  </View>
                )}
              </Card>
            ))}
          </>
        )}

        <SectionTitle title="Historique" />
        {donations.map((d) => (
          <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
            <View style={[styles.histIcon, { backgroundColor: c.primaryLight }]}>
              <MaterialCommunityIcons
                name={d.type === 'maasser' ? 'percent' : d.type === 'engagement' ? 'file-document-check' : 'hand-heart'}
                size={18}
                color={c.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '600' }}>{d.cause}</Text>
              <Muted>
                {typeLabel[d.type]} · {formatShort(d.date)}
                {d.dedication ? ` · ${d.dedication}` : ''}
              </Muted>
            </View>
            <Text style={{ color: c.text, fontWeight: '800' }}>{money(d.amount)}</Text>
          </Card>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeeRow({
  icon,
  label,
  value,
  onChange,
  onBlur,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.feeRow}>
      <Ionicons name={icon} size={18} color={c.primary} />
      <Text style={{ color: c.text, flex: 1, fontWeight: '600' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={c.textMuted}
        style={[styles.feeInput, { borderColor: c.border, backgroundColor: c.surface, color: c.text }]}
      />
      <Muted>{CURRENCY}</Muted>
    </View>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
      <Text style={{ color, fontWeight: '800', fontSize: 16, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amount: { width: '30%', flexGrow: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  feeInput: { width: 96, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, textAlign: 'right' },
  result: { borderRadius: 12, padding: 12, marginTop: 12, gap: 6 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpis: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
  histIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
