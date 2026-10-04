import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { PaymentLogo } from '../../components/PaymentLogo';
import { PAYMENT_PROVIDERS, PaymentProvider, paymentProvider, STRIPE_UNSUPPORTED_COUNTRIES } from '../../config/paymentProviders';
import { RavScreen, RavCard, BigButton, BIG } from './RavUi';
import { formatLong } from '../../utils/time';
import { PaymentLink } from '../../types';
import { clearStripeReturn, openStripeUrl, readStripeReturn, startStripeConnect, stripeErrorMessage } from '../../utils/stripe';

type Props = NativeStackScreenProps<RavStackParamList, 'RavPayments'>;

// Moyens de paiement de la communauté : comptes connectés et services à connecter.
export function RavPaymentsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { myPaymentLinks, congregation, congregationId, seed, backendMode, myAssociations, associationOf } = useAppState();
  const [targetAssociation, setTargetAssociation] = useState<string | undefined>(undefined);
  const chosenAssociation = myAssociations.find((a) => a.id === targetAssociation) ?? myAssociations.find((a) => a.isDefault) ?? myAssociations[0];
  const real = backendMode === 'firebase';
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  // Retour de Stripe après l'inscription de la communauté (web).
  useEffect(() => {
    const r = readStripeReturn();
    if (r.stripe === 'return') setNotice({ kind: 'info', text: 'Inscription Stripe terminée. Le compte passe « Actif » dès que Stripe a validé les informations (quelques secondes à quelques minutes).' });
    if (r.stripe === 'refresh') setNotice({ kind: 'error', text: 'Le lien Stripe a expiré. Relancez l’inscription.' });
    if (r.stripe) clearStripeReturn();
  }, []);

  // Stripe réel : la fonction crée le compte Express de la communauté et renvoie la page d'inscription
  // (ou le tableau de bord Stripe si le compte est déjà actif).
  const connectStripe = async (associationId?: string) => {
    setBusy(true);
    setNotice(null);
    try {
      const r = await startStripeConnect(congregationId, associationId ?? chosenAssociation?.id);
      await openStripeUrl(r.url);
    } catch (e) {
      setNotice({ kind: 'error', text: stripeErrorMessage(e) });
    } finally {
      setBusy(false);
    }
  };
  // Le pays qui compte pour les recommandations est celui de l'association choisie (sinon celui de la communauté).
  const country = chosenAssociation?.country ?? congregation.country ?? (seed.currency === '₪' ? 'IL' : 'FR');
  // Un service est « déjà connecté » pour l'association choisie seulement : une autre association peut avoir son propre compte.
  const connectedIds = myPaymentLinks.filter((p) => !chosenAssociation || !p.associationId || p.associationId === chosenAssociation.id).map((p) => p.provider);
  const stripeUnavailable = real && STRIPE_UNSUPPORTED_COUNTRIES.includes(country);
  // Les services recommandés dans le pays de la communauté passent en premier.
  const available = [...PAYMENT_PROVIDERS].sort((a, b) => Number(b.countries.includes(country)) - Number(a.countries.includes(country)));

  return (
    <RavScreen title={t('payments.title')} subtitle={t('payments.subtitle')} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14, lineHeight: 23 }}>{t('payments.intro')}</Text>
      {notice ? (
        <RavCard style={{ borderColor: notice.kind === 'error' ? c.danger : c.success, borderWidth: 2 }}>
          <Text style={{ color: notice.kind === 'error' ? c.danger : c.success, fontSize: BIG.small, fontWeight: '700' }}>{notice.text}</Text>
        </RavCard>
      ) : null}

      <Text style={[styles.section, { color: c.text }]}>{t('payments.connected')}</Text>
      {myPaymentLinks.length ? (
        myPaymentLinks.map((link) => <ConnectedCard key={link.id} link={link} real={real} busy={busy} onStripe={() => connectStripe(link.associationId)} associationName={associationOf(link.associationId)?.name} />)
      ) : (
        <RavCard>
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{t('payments.none')}</Text>
        </RavCard>
      )}

      <Text style={[styles.section, { color: c.text, marginTop: 22 }]}>{t('payments.add')}</Text>
      {myAssociations.length > 1 ? (
        <RavCard>
          <Text style={{ color: c.text, fontSize: BIG.small, fontWeight: '800', marginBottom: 8 }}>Pour quelle association ?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {myAssociations.map((a) => {
              const active = chosenAssociation?.id === a.id;
              return (
                <Pressable key={a.id} onPress={() => setTargetAssociation(a.id)} accessibilityRole="radio" aria-checked={active} style={[styles.small, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}>
                  <Ionicons name="business" size={16} color={active ? c.primary : c.textMuted} />
                  <Text style={{ color: active ? c.primary : c.text, fontWeight: '800', fontSize: 15 }}>{a.purpose ? `${a.name} · ${a.purpose}` : a.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 8 }}>Chaque association a ses propres comptes de paiement (pays différent, reçu différent). Gérez-les dans « Mes associations ».</Text>
        </RavCard>
      ) : null}
      {available.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          connected={connectedIds.includes(p.id)}
          recommended={p.countries.includes(country)}
          busy={busy && p.id === 'stripe'}
          unavailable={p.id === 'stripe' && stripeUnavailable ? 'Stripe n’ouvre pas de compte dans ce pays. En Israël, utilisez Bit.' : undefined}
          onConnect={() => (real && p.id === 'stripe' ? connectStripe(chosenAssociation?.id) : navigation.navigate('RavPaymentConnect', { provider: p.id, associationId: chosenAssociation?.id }))}
        />
      ))}

      <Text style={{ color: c.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 }}>{real ? 'Stripe : paiement réel (mode test tant que les clés de test sont utilisées). Bit et Lemon Squeezy : connexion simulée.' : t('payments.demoNote')}</Text>
    </RavScreen>
  );
}

function ConnectedCard({ link, real, busy, onStripe, associationName }: { link: PaymentLink; real: boolean; busy: boolean; onStripe: () => void; associationName?: string }) {
  const realStripe = real && link.provider === 'stripe';
  const pending = realStripe && link.status !== 'active';
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { disconnectPayment, setDefaultPayment, testPayment } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const p = paymentProvider(link.provider);

  return (
    <RavCard style={{ borderColor: link.isDefault ? p.color : c.border, borderWidth: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <PaymentLogo id={link.provider} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: c.text, fontSize: 21, fontWeight: '900' }}>{p.name}</Text>
            <View style={[styles.badge, { backgroundColor: (pending ? c.warning : c.success) + '1F' }]}>
              <View style={[styles.dot, { backgroundColor: pending ? c.warning : c.success }]} />
              <Text style={{ color: pending ? c.warning : c.success, fontWeight: '800', fontSize: 13 }}>{pending ? 'Inscription à finaliser' : t('payments.active')}</Text>
            </View>
            {link.isDefault ? (
              <View style={[styles.badge, { backgroundColor: p.color + '1F' }]}>
                <Ionicons name="star" size={12} color={p.color === '#FFC233' ? '#A16207' : p.color} />
                <Text style={{ color: p.color === '#FFC233' ? '#A16207' : p.color, fontWeight: '800', fontSize: 13 }}>{t('payments.default')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: c.text, fontSize: BIG.small, marginTop: 2 }}>{link.account}</Text>
          {associationName ? <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700', marginTop: 2 }}>Association : {associationName}</Text> : null}
          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
            {link.accountId} · {t('payments.connectedSince', { date: formatLong(link.connectedAt.slice(0, 10)) })}
          </Text>
        </View>
      </View>

      <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 10 }}>
        {t('payments.methods')} : {p.methods.join(' · ')}
      </Text>

      {link.testPayments ? (
        <View style={[styles.test, { backgroundColor: c.success + '14', borderColor: c.success }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontWeight: '800', fontSize: BIG.small }}>{t('payments.testDone', { count: link.testPayments })}</Text>
        </View>
      ) : null}

      {confirming ? (
        <View style={{ marginTop: 12, gap: 10 }}>
          <Text style={{ color: c.danger, fontSize: BIG.small, fontWeight: '700' }}>{t('payments.disconnectConfirm', { name: p.name })}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <BigButton label={t('payments.confirmDisconnect')} color={c.danger} onPress={() => disconnectPayment(link.id)} style={{ flex: 1 }} />
            <BigButton label={t('common.cancel')} color={c.background} textColor={c.textMuted} onPress={() => setConfirming(false)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {realStripe ? (
            <SmallAction icon={pending ? 'open-outline' : 'stats-chart'} label={busy ? 'Patientez…' : pending ? 'Finaliser l’inscription Stripe' : 'Tableau de bord Stripe'} color={c.primary} onPress={() => !busy && onStripe()} />
          ) : (
            <SmallAction icon="flask" label={t('payments.test')} color={c.primary} onPress={() => testPayment(link.id)} />
          )}
          {!link.isDefault ? <SmallAction icon="star-outline" label={t('payments.makeDefault')} color={c.primary} onPress={() => setDefaultPayment(link.id)} /> : null}
          <SmallAction icon="unlink" label={t('payments.disconnect')} color={c.danger} onPress={() => setConfirming(true)} />
        </View>
      )}
    </RavCard>
  );
}

function SmallAction({ icon, label, color, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.small, { borderColor: color, opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color, fontWeight: '800', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

function ProviderCard({ provider: p, connected, recommended, onConnect, busy, unavailable }: { provider: PaymentProvider; connected: boolean; recommended: boolean; onConnect: () => void; busy?: boolean; unavailable?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const info = (k: string) => t(`payments.providers.${p.id}.${k}`);

  return (
    <RavCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <PaymentLogo id={p.id} size={60} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>{p.name}</Text>
            {recommended ? (
              <View style={[styles.badge, { backgroundColor: c.primaryLight }]}>
                <Ionicons name="thumbs-up" size={12} color={c.primary} />
                <Text style={{ color: c.primary, fontWeight: '800', fontSize: 13 }}>{t('payments.recommended')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{info('tagline')}</Text>
        </View>
      </View>

      <View style={{ marginTop: 12, gap: 6 }}>
        <InfoRow icon="pricetag-outline" label={t('payments.fees')} value={info('fees')} />
        <InfoRow icon="business-outline" label={t('payments.payout')} value={info('payout')} />
        <InfoRow icon="card-outline" label={t('payments.methods')} value={p.methods.join(' · ')} />
      </View>

      {unavailable ? (
        <View style={[styles.test, { backgroundColor: c.warning + '14', borderColor: c.warning }]}>
          <Ionicons name="alert-circle" size={22} color={c.warning} />
          <Text style={{ color: c.warning, fontWeight: '800', fontSize: BIG.small, flex: 1 }}>{unavailable}</Text>
        </View>
      ) : connected ? (
        <View style={[styles.test, { backgroundColor: c.success + '14', borderColor: c.success }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontWeight: '800', fontSize: BIG.small }}>{t('payments.alreadyConnected')}</Text>
        </View>
      ) : (
        <BigButton label={busy ? 'Connexion à Stripe…' : t('payments.connect', { name: p.name })} icon="link" color={p.color} textColor={p.onColor} disabled={!!busy} onPress={onConnect} style={{ marginTop: 14 }} />
      )}
    </RavCard>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={18} color={c.textMuted} style={{ marginTop: 2 }} />
      <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>
        <Text style={{ fontWeight: '800' }}>{label} : </Text>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: BIG.label, fontWeight: '900', marginBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  small: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  test: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, borderWidth: 1.5, marginTop: 12 },
});
