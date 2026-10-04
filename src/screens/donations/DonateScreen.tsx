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
import { Card, Chip, Muted, Button } from '../../components/ui';
import { money } from '../../utils/time';
import { useI18n } from '../../i18n';
import { PaymentLogo } from '../../components/PaymentLogo';
import { paymentProvider } from '../../config/paymentProviders';
import { openStripeUrl, startStripeCheckout, stripeErrorMessage } from '../../utils/stripe';
import { countryName } from '../../utils/countries';

type Props = NativeStackScreenProps<AppStackParamList, 'Donate'>;


export function DonateScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { type, pledgeId } = route.params;
  const { donate, pledges, levelIndex, levelProgress, level, nextLevel, points, seed, myPaymentLinks: allLinks, backendMode, congregationId, myAssociations } = useAppState();
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
  const causes = seed.causes.map((x) => x.name);
  const quickAmounts = seed.alms.amounts;
  const titles = {
    tsedaka: { title: seed.alms.title, sub: 'Don ponctuel' },
    maasser: { title: `Verser ma ${(seed.tithe?.name ?? seed.alms.name).toLowerCase()}`, sub: seed.tithe ? seed.tithe.hint : 'Don libre' },
    engagement: { title: 'Payer mon engagement', sub: 'Promesse de don' },
  };
  const pledge = pledges.find((p) => p.id === pledgeId);

  const [amount, setAmount] = useState<number>(route.params.amount ?? seed.alms.amounts[2] ?? 18);
  const [custom, setCustom] = useState('');
  const [cause, setCause] = useState(pledge ? pledge.label : route.params.cause ?? causes[0]);
  const [dedication, setDedication] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const [pointsBefore] = useState(points);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const t = titles[type];

  const stripeReal = real && payLink?.provider === 'stripe';
  const stripeReady = !stripeReal || payLink?.status === 'active';

  const confirm = async () => {
    if (stripeReal) {
      // Paiement réel : page Stripe de la communauté ; le don est inscrit en base par le webhook.
      setPaying(true);
      setPayError(null);
      try {
        const r = await startStripeCheckout({ congregationId, associationId, amount, currency: seed.currency, cause, dedication: dedication.trim() || undefined, pledgeId, type });
        await openStripeUrl(r.url);
      } catch (e) {
        setPayError(stripeErrorMessage(e));
      } finally {
        setPaying(false);
      }
      return;
    }
    const gained = donate({ type, amount, cause, dedication: dedication.trim() || undefined, pledgeId, paymentLinkId: payLink?.id, associationId });
    setDone(gained);
  };

  if (done !== null) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 30 }]}>
          <Aura levelIndex={levelIndex} progress={levelProgress} size={200} />
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 18 }}>Merci pour votre don</Text>
          <Text style={{ color: c.primary, fontSize: 30, fontWeight: '900', marginTop: 4 }}>{money(done)}</Text>
          <Muted style={{ textAlign: 'center', marginTop: 8, maxWidth: 320 }}>
            {cause}
            {dedication.trim() ? ` · ${dedication.trim()}` : ''}
          </Muted>
          <Card style={{ marginTop: 24, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="creation" size={28} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>+{done} points ({seed.gamification.name})</Text>
              <Muted>
                {pointsBefore} → {points} · niveau {level.name}
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
          <Button label={seed.gamification.ctaLabel} icon="person-outline" onPress={() => navigation.navigate('MainTabs', { screen: 'AccountTab' })} style={{ alignSelf: 'stretch' }} />
          <Button label="Fermer" variant="ghost" onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch', marginTop: 10 }} />
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

        <Text style={[styles.label, { color: c.text }]}>Montant</Text>
        <View style={styles.amounts}>
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
        </View>
        <TextInput
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
        />

        {!pledge ? (
          <>
            <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>Destination</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {causes.map((x) => (
                <Chip key={x} label={x} active={cause === x} onPress={() => setCause(x)} />
              ))}
            </View>
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
          label={paying ? 'Ouverture du paiement…' : payLink ? tr('payments.member.confirm', { amount: money(amount), name: paymentProvider(payLink.provider).name }) : `Confirmer le don de ${money(amount)}`}
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
