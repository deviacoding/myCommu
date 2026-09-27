import React, { useState } from 'react';
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
import { Card, Segmented, SectionTitle, Pill, Muted, Button } from '../../components/ui';
import { quickAmounts } from '../../mocks/donations';
import { DonationType } from '../../types';
import { euros, formatShort, formatNumeric } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Tab = 'tsedaka' | 'maasser' | 'engagements';

const typeLabel: Record<DonationType, string> = { tsedaka: 'Tsedaka', maasser: 'Maasser', engagement: 'Engagement' };

export function DonationsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { donations, pledges, totalGiven, givenThisMonth, maasserGivenThisMonth, monthlyIncome, setMonthlyIncome } = useAppState();
  const [tab, setTab] = useState<Tab>('tsedaka');
  const [income, setIncome] = useState(monthlyIncome ? String(monthlyIncome) : '');

  const due = pledges.filter((p) => p.status === 'due');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);
  const maasserDue = monthlyIncome ? Math.round(monthlyIncome * 0.1) : 0;
  const maasserLeft = Math.max(0, maasserDue - maasserGivenThisMonth);

  const applyIncome = () => {
    const n = parseInt(income.replace(/\D/g, ''), 10);
    setMonthlyIncome(Number.isFinite(n) && n > 0 ? n : null);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Dons" subtitle={`${euros(givenThisMonth)} donnés ce mois · ${euros(totalGiven)} au total`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Segmented<Tab>
          options={[
            { value: 'tsedaka', label: 'Tsedaka' },
            { value: 'maasser', label: 'Maasser' },
            { value: 'engagements', label: due.length ? `À payer (${due.length})` : 'À payer' },
          ]}
          value={tab}
          onChange={setTab}
        />

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
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>{a} €</Text>
                  <Muted style={{ fontSize: 11 }}>{a % 18 !== 0 ? 'don libre' : a / 18 === 1 ? '‘haï' : `${a / 18} × ‘haï`}</Muted>
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
            <Muted style={{ marginTop: 4 }}>Les montants sont des multiples de 18, valeur numérique de ‘haï, « vivant ».</Muted>
          </>
        )}

        {tab === 'maasser' && (
          <>
            <Card style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="percent-circle" size={28} color={c.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 17 }}>Mon maasser du mois</Text>
                  <Muted>Un dixième de vos revenus nets, réservé à la tsedaka.</Muted>
                </View>
              </View>
              <Text style={[styles.label, { color: c.text, marginTop: 16 }]}>Revenu net mensuel</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={income}
                  onChangeText={setIncome}
                  onBlur={applyIncome}
                  keyboardType="number-pad"
                  placeholder="2500"
                  placeholderTextColor={c.textMuted}
                  style={[styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text, flex: 1 }]}
                />
                <Button label="Calculer" variant="secondary" onPress={applyIncome} />
              </View>
              {monthlyIncome ? (
                <View style={{ marginTop: 16 }}>
                  <View style={styles.kpis}>
                    <Kpi label="Maasser dû" value={euros(maasserDue)} color={c.text} />
                    <Kpi label="Déjà donné" value={euros(maasserGivenThisMonth)} color={c.success} />
                    <Kpi label="Reste" value={euros(maasserLeft)} color={maasserLeft > 0 ? c.warning : c.success} />
                  </View>
                  <ProgressBar progress={maasserDue ? maasserGivenThisMonth / maasserDue : 0} />
                  {maasserLeft > 0 ? (
                    <Button
                      label={`Donner le reste : ${euros(maasserLeft)}`}
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
              ) : null}
            </Card>
            <Card>
              <Text style={{ color: c.text, fontWeight: '700' }}>Bon à savoir</Text>
              <Muted style={{ marginTop: 6, lineHeight: 19 }}>
                Le maasser se calcule en général sur le revenu net, après impôts. Il est recommandé de le commencer « bli neder »,
                sans vœu formel. Voir la réponse du Rav dans l’onglet Questions.
              </Muted>
            </Card>
          </>
        )}

        {tab === 'engagements' && (
          <>
            <Card style={[styles.hero, { backgroundColor: due.length ? c.warning + '22' : c.success + '22', borderColor: 'transparent' }]}>
              <Ionicons name={due.length ? 'alert-circle' : 'checkmark-circle'} size={32} color={due.length ? c.warning : c.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>
                  {due.length ? `${euros(dueTotal)} à régler` : 'Tout est réglé'}
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
                    <Muted style={{ marginTop: 2 }}>
                      {p.status === 'paid' ? 'Réglé' : `Échéance : ${formatNumeric(p.dueDate)}`}
                    </Muted>
                  </View>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>{euros(p.amount)}</Text>
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
            <Text style={{ color: c.text, fontWeight: '800' }}>{euros(d.amount)}</Text>
          </Card>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
      <Text style={{ color, fontWeight: '800', fontSize: 17, marginTop: 2 }}>{value}</Text>
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
  kpis: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
  histIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
