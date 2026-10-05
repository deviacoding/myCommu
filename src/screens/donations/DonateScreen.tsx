import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Aura } from '../../components/Aura';
import { Celebration } from '../../components/Celebration';
import { Card, Chip, Muted, Button } from '../../components/ui';
import { money } from '../../utils/time';
import { useI18n } from '../../i18n';
import { PaymentLogo } from '../../components/PaymentLogo';
import { paymentProvider } from '../../config/paymentProviders';
import { openStripeUrl, startStripeCheckout, stripeErrorMessage } from '../../utils/stripe';
import { countryName } from '../../utils/countries';
import { ProgressBar } from '../../components/ProgressBar';
import { streakRepairUnit } from '../../config/gamification';

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Minimum accepté par Stripe pour un paiement réel (0,50 € ou 2 ₪).
const stripeMinimum = (currency: string) => (currency === '₪' ? 2 : 0.5);

type Props = NativeStackScreenProps<AppStackParamList, 'Donate'>;


export function DonateScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { type, pledgeId, campaignId, repair } = route.params;
  const { donate, pledges, levelIndex, levelProgress, level, nextLevel, points, seed, myPaymentLinks: allLinks, backendMode, congregationId, myAssociations, ora, funds, campaigns, campaignProgress, congregation, newBadges, markBadgesSeen } = useAppState();
  // Chaîne de tsedaka (maillon) et caisse : si la communauté n'a créé aucune caisse, on ne pose pas la question.
  const campaign = campaigns.find((x) => x.id === campaignId);
  const campaignState = campaign ? campaignProgress(campaign.id) : null;
  // Association bénéficiaire : celle par défaut, modifiable s'il y en a plusieurs. Les moyens de paiement suivent l'association.
  const [associationId, setAssociationId] = useState<string | undefined>(() => (myAssociations.find((a) => a.isDefault) ?? myAssociations[0])?.id);
  const association = myAssociations.find((a) => a.id === associationId);
  const myPaymentLinks = allLinks.filter((p) => !p.associationId || !associationId || p.associationId === associationId);
  const real = backendMode === 'firebase';
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const { t: tr } = useI18n();
  const [payWith, setPayWith] = useState<string | undefined>(() => (myPaymentLinks.find((p) => p.isDefault) ?? myPaymentLinks[0])?.id);
  const payLink = myPaymentLinks.find((p) => p.id === payWith) ?? myPaymentLinks[0];
  const quickAmounts = seed.alms.amounts;
  const defaultFund = campaign?.fundId ? funds.find((f) => f.id === campaign.fundId) : funds.find((f) => f.name === route.params.cause) ?? funds[0];
  const titles = {
    tsedaka: { title: seed.alms.title, sub: 'Don ponctuel' },
    maasser: { title: `Verser ma ${(seed.tithe?.name ?? seed.alms.name).toLowerCase()}`, sub: seed.tithe ? seed.tithe.hint : 'Don libre' },
    engagement: { title: 'Payer mon engagement', sub: 'Promesse de don' },
  };
  const pledge = pledges.find((p) => p.id === pledgeId);

  const [amount, setAmount] = useState<number>(repair ? repair.cost : route.params.amount ?? seed.alms.amounts[2] ?? 18);
  const [custom, setCustom] = useState('');
  const [fundId, setFundId] = useState<string | undefined>(repair ? undefined : defaultFund?.id);
  const [cause, setCause] = useState(pledge ? pledge.label : repair ? 'Rachat de série' : route.params.cause ?? defaultFund?.name ?? congregation.name);
  const [dedication, setDedication] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const [pointsBefore] = useState(points);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const t = titles[type];

  const stripeReal = real && payLink?.provider === 'stripe';
  const stripeReady = !stripeReal || payLink?.status === 'active';
  // Rachat payé par Stripe : le montant envoyé respecte le minimum Stripe.
  const minimum = stripeMinimum(seed.currency);
  const roundedUp = stripeReal && repair && amount < minimum;
  const sendAmount = roundedUp ? minimum : amount;
  const streakRepair = repair ? { from: repair.from, to: repair.to, days: repair.days } : undefined;

  const confirm = async () => {
    if (stripeReal) {
      // Paiement réel : page Stripe de la communauté ; le don est inscrit en base par le webhook.
      setPaying(true);
      setPayError(null);
      try {
        const r = await startStripeCheckout({ congregationId, associationId, amount: sendAmount, currency: seed.currency, cause, dedication: dedication.trim() || undefined, pledgeId, type, fundId, campaignId: campaign?.id, streakRepair });
        await openStripeUrl(r.url);
      } catch (e) {
        setPayError(stripeErrorMessage(e));
      } finally {
        setPaying(false);
      }
      return;
    }
    const gained = donate({ type, amount: sendAmount, cause, dedication: dedication.trim() || undefined, pledgeId, paymentLinkId: payLink?.id, associationId, fundId, campaignId: campaign?.id, streakRepair });
    setDone(gained);
  };

  if (done !== null) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 30 }]}>
          <Celebration size={240}>
            <Aura levelIndex={levelIndex} progress={levelProgress} size={200} />
          </Celebration>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 8 }}>Merci pour votre don</Text>
          <Text style={{ color: c.primary, fontSize: 30, fontWeight: '900', marginTop: 4 }}>{money(done)}</Text>
          <Muted style={{ textAlign: 'center', marginTop: 8, maxWidth: 320 }}>
            {cause}
            {dedication.trim() ? ` · ${dedication.trim()}` : ''}
          </Muted>
          {repair ? (
            <Card style={{ marginTop: 18, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.success, borderWidth: 2 }}>
              <MaterialCommunityIcons name="fire" size={30} color={c.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800' }}>Série rachetée : {ora.streak.days} jour{ora.streak.days > 1 ? 's' : ''} retrouvés</Text>
                <Muted>{repair.days > 1 ? `Les ${repair.days} jours manqués sont couverts` : 'Le jour manqué est couvert'} : la série reprend là où elle s’était arrêtée.</Muted>
              </View>
            </Card>
          ) : null}
          {campaign ? (
            <Card style={{ marginTop: 12, alignSelf: 'stretch', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="link-variant" size={24} color={c.primary} />
                <Text style={{ color: c.text, fontWeight: '800', flex: 1 }}>Maillon ajouté à « {campaign.title} »</Text>
              </View>
              <Muted>Passez le maillon : parlez-en à un proche de la communauté.</Muted>
            </Card>
          ) : null}
          {newBadges.length ? (
            <Card style={{ marginTop: 12, alignSelf: 'stretch', gap: 8 }}>
              <Text style={{ color: c.text, fontWeight: '800' }}>Nouveau{newBadges.length > 1 ? 'x' : ''} badge{newBadges.length > 1 ? 's' : ''}</Text>
              {newBadges.map((b) => (
                <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: b.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={b.icon as MciName} size={22} color={b.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700' }}>{b.name}</Text>
                    <Muted>{b.description}</Muted>
                  </View>
                </View>
              ))}
            </Card>
          ) : null}
          {type !== 'maasser' && !repair ? (
            <Card style={{ marginTop: 18, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: '#F59E0B', borderWidth: 2 }}>
              <MaterialCommunityIcons name="fire" size={30} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800' }}>Série de {seed.alms.name.toLowerCase()} : {ora.tsedakaStreak} jour{ora.tsedakaStreak > 1 ? 's' : ''}</Text>
                <Muted>{ora.tsedakaStreak >= 7 ? 'Bravo, vous tenez la série ! ' : ''}Un don chaque jour, même petit, fait grandir la série : +1 point par jour, +10 au 7e jour, +40 au 30e, +150 au 100e.{ora.tsedakaStreakBest > ora.tsedakaStreak ? ` Votre record : ${ora.tsedakaStreakBest} jour${ora.tsedakaStreakBest > 1 ? "s" : ""}.` : ''}</Muted>
              </View>
            </Card>
          ) : null}
          <Card style={{ marginTop: 12, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="creation" size={28} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{points - pointsBefore > 0 ? `+${points - pointsBefore} points (${seed.gamification.name})` : `Votre ${seed.gamification.name} grandit`}</Text>
              <Muted>
                {points - pointsBefore > 0 ? `${pointsBefore} → ${points} · ` : `${points} points · `}niveau {level.name}
                {nextLevel ? ` · prochain : ${nextLevel.name} à ${nextLevel.min}` : ''}
              </Muted>
            </View>
          </Card>
          <Card style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="document-text" size={26} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>Reçu fiscal généré automatiquement</Text>
              <Muted>{association ? `${association.receiptFormat === 'seif46' ? 'Seif 46 (Israël)' : association.receiptFormat === 'cerfa' ? 'Cerfa (France)' : 'Reçu'} au nom de ${association.name}` : seed.receiptFormats.includes('seif46') ? 'Seif 46 (Israël) ou Cerfa (France)' : 'Cerfa (France)'}, à imprimer ou télécharger.</Muted>
            </View>
            <Button
              label="Voir"
              variant="secondary"
              onPress={() => navigation.navigate('Receipt', { format: association?.receiptFormat ?? seed.receiptFormats[0], year: new Date().getFullYear(), associationId })}
              style={{ paddingVertical: 10, paddingHorizontal: 14 }}
            />
          </Card>
          <Button label={seed.gamification.ctaLabel} icon="person-outline" onPress={() => { if (newBadges.length) markBadgesSeen(); navigation.navigate('MainTabs', { screen: 'AccountTab' }); }} style={{ alignSelf: 'stretch' }} />
          <Button label="Fermer" variant="ghost" onPress={() => { if (newBadges.length) markBadgesSeen(); navigation.goBack(); }} style={{ alignSelf: 'stretch', marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title={t.title} subtitle={t.sub} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {pledge ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="document-text-outline" size={26} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{pledge.label}</Text>
              <Muted>{pledge.origin}</Muted>
            </View>
          </Card>
        ) : null}

        {repair ? (
          <Card style={{ borderColor: '#F59E0B', borderWidth: 2, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="fire" size={28} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>Racheter ma série</Text>
                <Muted>{repair.days} jour{repair.days > 1 ? 's' : ''} manqué{repair.days > 1 ? 's' : ''} × {streakRepairUnit(seed.currency)} {seed.currency} = {repair.cost} {seed.currency}</Muted>
              </View>
              <Text style={{ color: c.primary, fontWeight: '900', fontSize: 22 }}>{repair.cost} {seed.currency}</Text>
            </View>
            <Muted>Une petite {seed.alms.name.toLowerCase()}, et la série reprend là où elle s’était arrêtée : les jours manqués sont couverts.</Muted>
            {roundedUp ? <Muted style={{ color: c.warning }}>Stripe demande au moins {minimum} {seed.currency} : le don sera de {minimum} {seed.currency}.</Muted> : null}
          </Card>
        ) : null}
        {campaign ? (
          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="link-variant" size={24} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800' }}>Chaîne : {campaign.title}</Text>
                {campaign.description ? <Muted>{campaign.description}</Muted> : null}
              </View>
            </View>
            <ProgressBar progress={campaign.target ? (campaignState?.raised ?? 0) / campaign.target : 0} />
            <Muted>{money(campaignState?.raised ?? 0)} / {money(campaign.target)} · {campaignState?.donors ?? 0} maillon{(campaignState?.donors ?? 0) > 1 ? 's' : ''}</Muted>
          </Card>
        ) : null}

        {repair ? null : <Text style={[styles.label, { color: c.text }]}>Montant</Text>}
        {repair ? null : <View style={styles.amounts}>
          {(pledge ? [pledge.amount] : quickAmounts).map((a) => (
            <Pressable
              key={a}
              onPress={() => {
                setAmount(a);
                setCustom('');
              }}
              style={[styles.amount, { borderColor: amount === a && !custom ? c.primary : c.border, backgroundColor: amount === a && !custom ? c.primary : c.surface }]}
            >
              <Text style={{ color: amount === a && !custom ? c.textOnPrimary : c.text, fontWeight: '800', fontSize: 16 }}>{a} {seed.currency}</Text>
            </Pressable>
          ))}
        </View>}
        {repair ? null : <TextInput
          value={custom}
          onChangeText={(v) => {
            setCustom(v);
            const n = parseInt(v.replace(/\D/g, ''), 10);
            if (Number.isFinite(n) && n > 0) setAmount(n);
          }}
          keyboardType="number-pad"
          placeholder={`Autre montant en ${seed.currency}`}
          placeholderTextColor={c.textMuted}
          style={[...inputStyle, { marginTop: 10 }]}
        />}

        {!pledge && !repair && funds.length > 0 ? (
          <>
            <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>Destination</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {funds.map((f) => (
                <Chip key={f.id} label={f.name} active={fundId === f.id} onPress={() => { setFundId(f.id); setCause(f.name); }} />
              ))}
            </View>
            {funds.find((f) => f.id === fundId)?.description ? <Muted style={{ marginTop: 6 }}>{funds.find((f) => f.id === fundId)?.description}</Muted> : null}
          </>
        ) : null}

        <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>Dédicace (facultatif)</Text>
        <TextInput
          value={dedication}
          onChangeText={setDedication}
          placeholder="En mémoire de… / Pour la guérison de…"
          placeholderTextColor={c.textMuted}
          style={inputStyle}
        />

        {myAssociations.length > 1 ? (
          <>
            <Text style={[styles.label, { color: c.text, marginTop: 20 }]}>À quelle association ?</Text>
            {myAssociations.map((a) => {
              const active = a.id === associationId;
              return (
                <Pressable key={a.id} onPress={() => setAssociationId(a.id)} accessibilityRole="radio" aria-checked={active} style={[styles.pay, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}>
                  <Ionicons name="business" size={22} color={active ? c.primary : c.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{a.name}</Text>
                    <Muted>{[a.purpose, countryName(a.country), a.receiptFormat === 'cerfa' ? 'reçu Cerfa' : a.receiptFormat === 'seif46' ? 'reçu Seif 46' : 'reçu simple'].filter(Boolean).join(' · ')}</Muted>
                  </View>
                  <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? c.primary : c.textMuted} />
                </Pressable>
              );
            })}
          </>
        ) : null}
        <Text style={[styles.label, { color: c.text, marginTop: 20 }]}>{tr('payments.member.payWith')}</Text>
        {myPaymentLinks.length ? (
          myPaymentLinks.map((link) => {
            const p = paymentProvider(link.provider);
            const active = link.id === payWith;
            return (
              <Pressable
                key={link.id}
                onPress={() => setPayWith(link.id)}
                accessibilityRole="radio"
                aria-checked={active}
                style={[styles.pay, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}
              >
                <PaymentLogo id={link.provider} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{p.name}</Text>
                  <Muted>{p.methods.join(' · ')}</Muted>
                </View>
                <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? c.primary : c.textMuted} />
              </Pressable>
            );
          })
        ) : (
          <Card>
            <Muted>{myAssociations.length > 1 && association ? `${association.name} n’a pas encore de paiement en ligne : choisissez une autre association, ou donnez sur place.` : tr('payments.member.noneOnline')}</Muted>
          </Card>
        )}
        <Muted style={{ marginBottom: 12 }}>Reçu fiscal envoyé par email après chaque don.</Muted>

        {stripeReal && !stripeReady ? <Muted style={{ marginBottom: 10 }}>Le paiement en ligne de cette communauté n’est pas encore actif : son responsable doit finaliser l’inscription Stripe.</Muted> : null}
        <Button
          label={paying ? 'Ouverture du paiement…' : payLink ? tr('payments.member.confirm', { amount: money(sendAmount), name: paymentProvider(payLink.provider).name }) : `Confirmer le don de ${money(sendAmount)}`}
          icon="heart"
          disabled={paying || !stripeReady}
          onPress={confirm}
        />
        {payError ? <Text style={{ color: c.danger, fontSize: 13, marginTop: 10, textAlign: 'center' }}>{payError}</Text> : null}
        <Muted style={{ textAlign: 'center', marginTop: 12 }}>{stripeReal ? 'Paiement sécurisé sur la page Stripe de votre communauté (carte bancaire, Apple Pay, Google Pay).' : real ? 'Ce moyen de paiement est encore simulé : aucun paiement réel.' : 'Maquette : aucun paiement réel n’est effectué.'}</Muted>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amount: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 8 },
});
