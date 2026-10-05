import React, { useEffect, useMemo, useState } from 'react';
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
import { EmptyState } from '../../components/EmptyState';
import { DonationType } from '../../types';
import { money, formatShort, formatNumeric } from '../../utils/time';
import { clearStripeReturn, readStripeReturn } from '../../utils/stripe';
import { StreakCard } from '../../components/StreakCard';
import { todayISO } from '../../utils/time';
import { isoDaysAfter } from '../../config/gamification';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Tab = 'tithe' | 'alms' | 'engagements';
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function toInt(v: string): number {
  const n = parseInt(v.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function DonationsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { seed, donations, myPledges: pledges, totalGiven, givenThisMonth, maasserGivenThisMonth, maasserInput, setMaasserInput, myAssociations, campaigns, campaignProgress, boosts, boostDays } = useAppState();
  // Journée à points doublés aujourd'hui ou demain
  const today = todayISO();
  const tomorrow = isoDaysAfter(today, 1);
  const boostToday = boostDays.has(today) ? boosts.find((b) => b.date === today) : undefined;
  const boostTomorrow = !boostToday && boostDays.has(tomorrow) ? boosts.find((b) => b.date === tomorrow) : undefined;
  const tithe = seed.tithe;
  const alms = seed.alms;
  const cur = seed.currency;
  const typeLabel: Record<DonationType, string> = { tsedaka: alms.name, maasser: tithe?.name ?? alms.name, engagement: 'Engagement' };

  // L'onglet « part obligatoire » (maasser, zakat, dîme) s'ouvre par défaut quand il existe ; sinon l'aumône (dana).
  const [tab, setTab] = useState<Tab>(tithe ? 'tithe' : 'alms');
  const [stripeNotice, setStripeNotice] = useState<'success' | 'cancel' | null>(null);
  useEffect(() => {
    const r = readStripeReturn();
    if (r.checkout) {
      setStripeNotice(r.checkout);
      clearStripeReturn();
    }
  }, []);
  const [salary, setSalary] = useState(maasserInput.salary ? String(maasserInput.salary) : '');
  const [d1, setD1] = useState(maasserInput.school ? String(maasserInput.school) : '');
  const [d2, setD2] = useState(maasserInput.talmudTorah ? String(maasserInput.talmudTorah) : '');
  const [d3, setD3] = useState(maasserInput.other ? String(maasserInput.other) : '');

  const calc = useMemo(() => {
    const s = toInt(salary);
    const fees = toInt(d1) + toInt(d2) + toInt(d3);
    const base = Math.max(0, s - fees);
    const belowThreshold = !!tithe?.threshold && base < tithe.threshold.amount;
    const due = tithe && !belowThreshold ? Math.round(base * tithe.rate) : 0;
    return { salary: s, fees, base, due, belowThreshold };
  }, [salary, d1, d2, d3, tithe]);

  const left = Math.max(0, calc.due - maasserGivenThisMonth);
  const due = pledges.filter((p) => p.status === 'due');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);
  const currentYear = new Date().getFullYear();
  const givenThisYear = donations.filter((d) => d.date.startsWith(String(currentYear))).reduce((s, d) => s + d.amount, 0);

  const saveInputs = () => setMaasserInput({ salary: toInt(salary), school: toInt(d1), talmudTorah: toInt(d2), other: toInt(d3) });
  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const deductionSetters = [setD1, setD2, setD3];
  const deductionValues = [d1, d2, d3];
  const ratePct = tithe ? `${(tithe.rate * 100).toLocaleString('fr-FR')} %` : '';

  const options: { value: Tab; label: string }[] = [
    ...(tithe ? [{ value: 'tithe' as Tab, label: tithe.name }] : []),
    { value: 'alms', label: alms.name },
    { value: 'engagements', label: due.length ? `${seed.pendingLabel} (${due.length})` : seed.pendingLabel },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Dons" subtitle={`${money(givenThisMonth)} donnés ce mois · ${money(totalGiven)} au total`} communitySwitch />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {stripeNotice ? (
          <Card style={{ borderColor: stripeNotice === 'success' ? c.success : c.border, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={stripeNotice === 'success' ? 'checkmark-circle' : 'close-circle'} size={24} color={stripeNotice === 'success' ? c.success : c.textMuted} />
            <Text style={{ color: c.text, fontWeight: '700', flex: 1 }}>{stripeNotice === 'success' ? 'Merci ! Votre don est confirmé par Stripe et apparaît dans votre historique.' : 'Paiement annulé : aucun montant n’a été prélevé.'}</Text>
          </Card>
        ) : null}
        <Segmented<Tab> options={options} value={tab} onChange={setTab} />

        {tab === 'tithe' && tithe && (
          <>
            <Card style={[styles.hero, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <MaterialCommunityIcons name="percent-circle" size={40} color={c.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textOnPrimary, fontSize: 18, fontWeight: '800' }}>Donner sa {tithe.name.toLowerCase()}</Text>
                <Text style={{ color: c.textOnPrimary, opacity: 0.85, fontSize: 13, marginTop: 4 }}>
                  {tithe.hint} {tithe.source}
                </Text>
              </View>
            </Card>

            <SectionTitle title={`Calculer ma ${tithe.name.toLowerCase()} à donner`} />
            <Card>
              <Text style={[styles.label, { color: c.text }]}>{tithe.incomeLabel}</Text>
              <TextInput
                value={salary}
                onChangeText={setSalary}
                onBlur={saveInputs}
                keyboardType="number-pad"
                placeholder={`Ex. : ${tithe.mode === 'wealth' ? '9 000' : '2 400'} ${cur}`}
                placeholderTextColor={c.textMuted}
                style={inputStyle}
              />

              <Text style={[styles.label, { color: c.text, marginTop: 16 }]}>{tithe.mode === 'wealth' ? 'À retirer avant le calcul' : 'Frais à retirer avant le calcul'}</Text>
              <Muted style={{ marginBottom: 8 }}>{tithe.mode === 'wealth' ? 'Les dettes exigibles se déduisent de l’épargne.' : 'Selon l’avis de votre responsable, certains frais peuvent être déduits du revenu.'}</Muted>
              {tithe.deductions.map((d, i) => (
                <FeeRow key={d.key} icon={d.icon as React.ComponentProps<typeof Ionicons>['name']} label={d.label} value={deductionValues[i]} onChange={deductionSetters[i]} onBlur={saveInputs} currency={cur} />
              ))}

              <View style={[styles.result, { backgroundColor: c.primaryLight }]}>
                <View style={styles.resultRow}>
                  <Muted>{tithe.mode === 'wealth' ? 'Épargne' : 'Revenu net'}</Muted>
                  <Text style={{ color: c.text, fontWeight: '600' }}>{money(calc.salary)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Muted>− Déductions</Muted>
                  <Text style={{ color: c.text, fontWeight: '600' }}>− {money(calc.fees)}</Text>
                </View>
                <View style={[styles.resultRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.primary + '55', paddingTop: 8 }]}>
                  <Muted>Base de calcul</Muted>
                  <Text style={{ color: c.text, fontWeight: '700' }}>{money(calc.base)}</Text>
                </View>
                {tithe.threshold ? (
                  <View style={styles.resultRow}>
                    <Muted>{tithe.threshold.label}</Muted>
                    <Text style={{ color: calc.belowThreshold ? c.warning : c.success, fontWeight: '700' }}>
                      {calc.belowThreshold ? `sous le seuil (${money(tithe.threshold.amount)})` : 'seuil dépassé'}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.resultRow, { marginTop: 4 }]}>
                  <Text style={{ color: c.primary, fontWeight: '800', fontSize: 16 }}>
                    {tithe.name} à donner ({ratePct})
                  </Text>
                  <Text style={{ color: c.primary, fontWeight: '900', fontSize: 22 }}>{money(calc.due)}</Text>
                </View>
              </View>

              {calc.due > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <View style={styles.kpis}>
                    <Kpi label={`À donner ${tithe.period}`} value={money(calc.due)} color={c.text} />
                    <Kpi label="Déjà donné" value={money(maasserGivenThisMonth)} color={c.success} />
                    <Kpi label="Reste" value={money(left)} color={left > 0 ? c.warning : c.success} />
                  </View>
                  <ProgressBar progress={Math.min(1, maasserGivenThisMonth / calc.due)} />
                  {left > 0 ? (
                    <Button label={`Donner le reste : ${money(left)}`} icon="checkmark-circle-outline" onPress={() => navigation.navigate('Donate', { type: 'maasser', amount: left })} style={{ marginTop: 14 }} />
                  ) : (
                    <View style={[styles.done, { backgroundColor: c.success + '22' }]}>
                      <Ionicons name="checkmark-circle" size={18} color={c.success} />
                      <Text style={{ color: c.success, fontWeight: '700' }}>
                        {tithe.name} complète {tithe.period}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Muted style={{ marginTop: 12, textAlign: 'center' }}>
                  {calc.belowThreshold
                    ? `Sous le ${tithe.threshold?.label.toLowerCase()}, la ${tithe.name.toLowerCase()} n’est pas due. Une ${alms.name.toLowerCase()} reste toujours possible.`
                    : `Saisissez votre montant pour calculer votre ${tithe.name.toLowerCase()}.`}
                </Muted>
              )}
            </Card>

            <Card>
              <Text style={{ color: c.text, fontWeight: '700' }}>Bon à savoir</Text>
              <Muted style={{ marginTop: 6, lineHeight: 19 }}>{tithe.advice}</Muted>
            </Card>
          </>
        )}

        {boostToday || boostTomorrow ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.secondary, borderWidth: 2, marginTop: 14 }}>
            <MaterialCommunityIcons name="star-four-points" size={30} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>Points doublés {boostToday ? 'aujourd’hui' : 'demain'}</Text>
              <Muted>{(boostToday ?? boostTomorrow)?.label} : chaque geste et chaque don comptent double.</Muted>
            </View>
          </Card>
        ) : null}
        {tab === 'alms' && (
          <View style={{ marginTop: 14 }}>
            <StreakCard onRepair={(r) => navigation.navigate('Donate', { type: 'tsedaka', amount: r.cost, cause: 'Rachat de série', repair: { from: r.from, to: r.to, days: r.missedDays, cost: r.cost } })} />
          </View>
        )}
        {tab === 'alms' && campaigns.length > 0 ? (
          <>
            <SectionTitle title={`Chaînes de ${alms.name.toLowerCase()}`} />
            <Muted style={{ marginTop: -6, marginBottom: 10 }}>Lancées par votre responsable : chacun donne, même un peu, et passe le maillon.</Muted>
            {campaigns.map((ch) => {
              const p = campaignProgress(ch.id);
              return (
                <Card key={ch.id} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[styles.histIcon, { backgroundColor: c.primaryLight, width: 44, height: 44, borderRadius: 14 }]}>
                      <MaterialCommunityIcons name="link-variant" size={22} color={c.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{ch.title}</Text>
                      {ch.description ? <Muted>{ch.description}</Muted> : null}
                    </View>
                  </View>
                  <ProgressBar progress={ch.target ? p.raised / ch.target : 0} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <Muted>{money(p.raised)} / {money(ch.target)} · {p.donors} maillon{p.donors > 1 ? 's' : ''}</Muted>
                    <Muted>jusqu’au {formatNumeric(ch.deadline)}</Muted>
                  </View>
                  <Button label="Participer" icon="link" onPress={() => navigation.navigate('Donate', { type: 'tsedaka', campaignId: ch.id })} />
                </Card>
              );
            })}
          </>
        ) : null}
        {tab === 'alms' && (
          <>
            <Card style={[styles.hero, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <MaterialCommunityIcons name="hand-heart" size={40} color={c.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textOnPrimary, fontSize: 18, fontWeight: '800' }}>{alms.title}</Text>
                <Text style={{ color: c.textOnPrimary, opacity: 0.85, fontSize: 13, marginTop: 4 }}>{alms.quote}</Text>
              </View>
            </Card>
            <SectionTitle title="Montant rapide" />
            <View style={styles.amounts}>
              {alms.amounts.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => navigation.navigate('Donate', { type: 'tsedaka', amount: a })}
                  style={({ pressed }) => [styles.amount, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>
                    {a} {cur}
                  </Text>
                  <Muted style={{ fontSize: 11 }}>{alms.amountLabels[a] ?? ''}</Muted>
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
            <Muted style={{ marginTop: 4 }}>{alms.amountsNote}</Muted>

            <SectionTitle title="Où va votre argent ?" />
            <Muted style={{ marginTop: -6, marginBottom: 10 }}>Choisissez la destination de votre don.</Muted>
            {seed.causes.map((cause) => (
              <Card key={cause.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.histIcon, { backgroundColor: c.primaryLight, width: 46, height: 46, borderRadius: 14 }]}>
                  <MaterialCommunityIcons name={cause.icon as MciName} size={24} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{cause.name}</Text>
                  <Muted style={{ marginTop: 2 }}>{cause.description}</Muted>
                </View>
                <Button label="Donner" variant="secondary" onPress={() => navigation.navigate('Donate', { type: 'tsedaka', cause: cause.name })} style={{ paddingVertical: 10, paddingHorizontal: 14 }} />
              </Card>
            ))}
          </>
        )}

        {tab === 'engagements' && (
          <>
            <Card style={[styles.hero, { backgroundColor: due.length ? c.warning + '22' : c.success + '22', borderColor: 'transparent' }]}>
              <Ionicons name={due.length ? 'alert-circle' : 'checkmark-circle'} size={32} color={due.length ? c.warning : c.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{due.length ? `${money(dueTotal)} à régler` : 'Tout est réglé'}</Text>
                <Muted>{due.length ? `${due.length} engagement${due.length > 1 ? 's' : ''} en attente` : 'Aucun engagement en attente'}</Muted>
              </View>
            </Card>
            {pledges.length === 0 ? (
              <EmptyState compact icon="document-text-outline" title="Aucune promesse de don enregistrée" hint="Les dons promis à votre communauté apparaîtront ici, prêts à être réglés en un geste." />
            ) : null}
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
                  <Button label="Payer maintenant" icon="card-outline" onPress={() => navigation.navigate('Donate', { type: 'engagement', amount: p.amount, pledgeId: p.id })} style={{ marginTop: 12 }} />
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

        <SectionTitle title="Reçus fiscaux" />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.histIcon, { backgroundColor: c.primaryLight, width: 44, height: 44, borderRadius: 12 }]}>
              <Ionicons name="document-text" size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>Reçu {currentYear} généré automatiquement</Text>
              <Muted>{money(givenThisYear)} de dons enregistrés · à imprimer, télécharger ou envoyer par email</Muted>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            {myAssociations.length ? (
              myAssociations.map((a) => (
                <Button
                  key={a.id}
                  label={`${a.receiptFormat === 'seif46' ? 'Seif 46' : a.receiptFormat === 'cerfa' ? 'Cerfa' : 'Reçu'} · ${a.purpose ?? a.name}`}
                  icon="print-outline"
                  variant="secondary"
                  onPress={() => navigation.navigate('Receipt', { format: a.receiptFormat, year: currentYear, associationId: a.id })}
                  style={{ flexGrow: 1 }}
                />
              ))
            ) : (
              <Button label="Cerfa · France" icon="print-outline" variant="secondary" onPress={() => navigation.navigate('Receipt', { format: 'cerfa', year: currentYear })} style={{ flex: 1 }} />
            )}
          </View>
        </Card>

        <SectionTitle title="Historique" />
        {donations.length === 0 ? (
          <EmptyState compact icon="hand-left-outline" title="Aucun don pour l’instant" hint={`Votre premier don apparaîtra ici et fera grandir votre ${seed.gamification.name.toLowerCase()}.`} />
        ) : null}
        {donations.map((d) => (
          <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
            <View style={[styles.histIcon, { backgroundColor: c.primaryLight }]}>
              <MaterialCommunityIcons name={d.type === 'maasser' ? 'percent' : d.type === 'engagement' ? 'file-document-check' : 'hand-heart'} size={18} color={c.primary} />
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

function FeeRow({ icon, label, value, onChange, onBlur, currency }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; onChange: (v: string) => void; onBlur: () => void; currency: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.feeRow}>
      <Ionicons name={icon} size={18} color={c.primary} />
      <Text style={{ color: c.text, flex: 1, fontWeight: '600' }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" placeholder="0" placeholderTextColor={c.textMuted} style={[styles.feeInput, { borderColor: c.border, backgroundColor: c.surface, color: c.text }]} />
      <Muted>{currency}</Muted>
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
