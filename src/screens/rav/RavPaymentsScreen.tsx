import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { PaymentLogo } from '../../components/PaymentLogo';
import { PAYMENT_PROVIDERS, PaymentProvider, paymentProvider } from '../../config/paymentProviders';
import { RavScreen, RavCard, BigButton, BIG } from './RavUi';
import { formatLong } from '../../utils/time';
import { PaymentLink } from '../../types';

type Props = NativeStackScreenProps<RavStackParamList, 'RavPayments'>;

// Moyens de paiement de la communauté : comptes connectés et services à connecter.
export function RavPaymentsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { myPaymentLinks, congregation, seed } = useAppState();
  const country = congregation.country ?? (seed.currency === '₪' ? 'IL' : 'FR');
  const connectedIds = myPaymentLinks.map((p) => p.provider);
  // Les services recommandés dans le pays de la communauté passent en premier.
  const available = [...PAYMENT_PROVIDERS].sort((a, b) => Number(b.countries.includes(country)) - Number(a.countries.includes(country)));

  return (
    <RavScreen title={t('payments.title')} subtitle={t('payments.subtitle')} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14, lineHeight: 23 }}>{t('payments.intro')}</Text>

      <Text style={[styles.section, { color: c.text }]}>{t('payments.connected')}</Text>
      {myPaymentLinks.length ? (
        myPaymentLinks.map((link) => <ConnectedCard key={link.id} link={link} />)
      ) : (
        <RavCard>
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{t('payments.none')}</Text>
        </RavCard>
      )}

      <Text style={[styles.section, { color: c.text, marginTop: 22 }]}>{t('payments.add')}</Text>
      {available.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          connected={connectedIds.includes(p.id)}
          recommended={p.countries.includes(country)}
          onConnect={() => navigation.navigate('RavPaymentConnect', { provider: p.id })}
        />
      ))}

      <Text style={{ color: c.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 }}>{t('payments.demoNote')}</Text>
    </RavScreen>
  );
}

function ConnectedCard({ link }: { link: PaymentLink }) {
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
            <View style={[styles.badge, { backgroundColor: c.success + '1F' }]}>
              <View style={[styles.dot, { backgroundColor: c.success }]} />
              <Text style={{ color: c.success, fontWeight: '800', fontSize: 13 }}>{t('payments.active')}</Text>
            </View>
            {link.isDefault ? (
              <View style={[styles.badge, { backgroundColor: p.color + '1F' }]}>
                <Ionicons name="star" size={12} color={p.color === '#FFC233' ? '#A16207' : p.color} />
                <Text style={{ color: p.color === '#FFC233' ? '#A16207' : p.color, fontWeight: '800', fontSize: 13 }}>{t('payments.default')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: c.text, fontSize: BIG.small, marginTop: 2 }}>{link.account}</Text>
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
          <SmallAction icon="flask" label={t('payments.test')} color={c.primary} onPress={() => testPayment(link.id)} />
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

function ProviderCard({ provider: p, connected, recommended, onConnect }: { provider: PaymentProvider; connected: boolean; recommended: boolean; onConnect: () => void }) {
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

      {connected ? (
        <View style={[styles.test, { backgroundColor: c.success + '14', borderColor: c.success }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontWeight: '800', fontSize: BIG.small }}>{t('payments.alreadyConnected')}</Text>
        </View>
      ) : (
        <BigButton label={t('payments.connect', { name: p.name })} icon="link" color={p.color} textColor={p.onColor} onPress={onConnect} style={{ marginTop: 14 }} />
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
