import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { PaymentLogo } from '../../components/PaymentLogo';
import { paymentProvider } from '../../config/paymentProviders';
import { RavScreen, BigInput, BigButton, Done, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavPaymentConnect'>;
type Step = 'login' | 'code' | 'account' | 'connecting' | 'done';

// Adresse affichée dans la barre du « navigateur » simulé, comme lors d'une vraie connexion OAuth.
const HOSTS = { stripe: 'connect.stripe.com/oauth/authorize', bit: 'business.bitpay.co.il/connect', lemonsqueezy: 'app.lemonsqueezy.com/oauth/authorize' };

const rand = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 55)]).join('');

// Connexion simulée à un prestataire de paiement : identification, choix du compte, autorisation.
export function RavPaymentConnectScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { congregation, connectPayment } = useAppState();
  const p = paymentProvider(route.params.provider);
  const slug = congregation.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState(`tresorerie@${slug}.org`);
  const [phone, setPhone] = useState('+972 54 123 4567');
  const [code, setCode] = useState('');

  // Comptes « trouvés » chez le prestataire après identification.
  const accounts = useMemo(() => {
    if (p.id === 'stripe') return [{ id: `acct_1Q${rand(12)}`, label: congregation.name, sub: 'Association · compte vérifié' }];
    if (p.id === 'bit') return [{ id: `bitbiz_${rand(8)}`, label: `${congregation.name} · Bit Business`, sub: 'Bank Leumi •••• 4821' }];
    return [
      { id: `store_${Math.floor(10000 + Math.random() * 89999)}`, label: `${congregation.name}`, sub: `${slug}.lemonsqueezy.com` },
      { id: `store_${Math.floor(10000 + Math.random() * 89999)}`, label: `${congregation.name} · Dons`, sub: `${slug}-dons.lemonsqueezy.com` },
    ];
  }, [p.id, congregation.name, slug]);
  const [accountId, setAccountId] = useState<string | 'new'>(accounts[0].id);

  const authorize = () => setStep('connecting');

  useEffect(() => {
    if (step !== 'connecting') return;
    const timer = setTimeout(() => {
      const chosen = accounts.find((a) => a.id === accountId);
      const newId = p.id === 'lemonsqueezy' ? `store_${Math.floor(10000 + Math.random() * 89999)}` : `acct_1Q${rand(12)}`;
      connectPayment({
        associationId: route.params.associationId,
        provider: p.id,
        account: p.id === 'bit' ? `${phone} · ${chosen?.sub ?? ''}` : p.id === 'lemonsqueezy' ? chosen?.sub ?? `${slug}.lemonsqueezy.com` : email,
        accountId: chosen?.id ?? newId,
      });
      setStep('done');
    }, 1600);
    return () => clearTimeout(timer);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (step === 'done') {
    return (
      <RavScreen title={t('payments.connect', { name: p.name })} onBack={() => navigation.goBack()}>
        <Done title={t('payments.flow.doneTitle', { name: p.name })} text={t('payments.flow.doneText', { name: p.name })}>
          <View style={{ marginTop: 6 }}>
            <PaymentLogo id={p.id} size={72} />
          </View>
          <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
            <BigButton label={t('payments.flow.back')} icon="card" onPress={() => navigation.goBack()} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  const emailOk = /.+@.+\..+/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').length >= 9;

  return (
    <RavScreen title={t('payments.connect', { name: p.name })} onBack={() => navigation.goBack()}>
      <View style={[styles.window, { borderColor: c.border, backgroundColor: c.surface }]}>
        {/* Barre d'adresse du prestataire */}
        <View style={[styles.urlBar, { backgroundColor: c.background, borderBottomColor: c.border }]}>
          <Ionicons name="lock-closed" size={14} color={c.success} />
          <Text style={{ color: c.textMuted, fontSize: 13, flex: 1 }} numberOfLines={1}>
            https://{HOSTS[p.id]}
          </Text>
        </View>
        {/* En-tête aux couleurs du prestataire */}
        <View style={[styles.brand, { backgroundColor: p.color }]}>
          <PaymentLogo id={p.id} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: p.onColor, fontSize: 20, fontWeight: '900' }}>{p.name}</Text>
            <Text style={{ color: p.onColor, opacity: 0.85, fontSize: 14 }}>{t('payments.flow.secure', { name: p.name })}</Text>
          </View>
          <Ionicons name="shield-checkmark" size={26} color={p.onColor} />
        </View>

        <View style={{ padding: 16 }}>
          <Stepper step={step} color={p.color} withCode={p.id === 'bit'} />

          {step === 'login' && p.login === 'email' ? (
            <>
              <Text style={[styles.label, { color: c.text }]}>{t('payments.flow.email', { name: p.name })}</Text>
              <BigInput value={email} onChangeText={setEmail} placeholder="vous@exemple.org" />
              <BigButton label={t('payments.flow.continue')} icon="arrow-forward" color={p.color} textColor={p.onColor} disabled={!emailOk} onPress={() => setStep('account')} style={{ marginTop: 14 }} />
            </>
          ) : null}

          {step === 'login' && p.login === 'phone' ? (
            <>
              <Text style={[styles.label, { color: c.text }]}>{t('payments.flow.phone')}</Text>
              <BigInput value={phone} onChangeText={setPhone} placeholder="+972 5X XXX XXXX" />
              <BigButton label={t('payments.flow.sendCode')} icon="chatbox-ellipses" color={p.color} textColor={p.onColor} disabled={!phoneOk} onPress={() => setStep('code')} style={{ marginTop: 14 }} />
            </>
          ) : null}

          {step === 'code' ? (
            <>
              <Text style={[styles.label, { color: c.text }]}>{t('payments.flow.code', { phone })}</Text>
              <BigInput value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" keyboardType="number-pad" style={{ letterSpacing: 8, textAlign: 'center', fontSize: 26 }} />
              <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 6 }}>{t('payments.flow.codeHint')}</Text>
              <BigButton label={t('payments.flow.continue')} icon="arrow-forward" color={p.color} textColor={p.onColor} disabled={code.length !== 6} onPress={() => setStep('account')} style={{ marginTop: 14 }} />
            </>
          ) : null}

          {step === 'account' ? (
            <>
              <Text style={[styles.label, { color: c.text }]}>{p.id === 'lemonsqueezy' ? t('payments.flow.chooseStore') : t('payments.flow.chooseAccount')}</Text>
              {accounts.map((a) => (
                <AccountOption key={a.id} active={accountId === a.id} color={p.color} title={a.label} sub={`${a.sub} · ${a.id}`} onPress={() => setAccountId(a.id)} />
              ))}
              {p.id !== 'bit' ? (
                <AccountOption
                  active={accountId === 'new'}
                  color={p.color}
                  icon="add-circle-outline"
                  title={p.id === 'lemonsqueezy' ? t('payments.flow.newStore') : t('payments.flow.newAccount', { name: p.name })}
                  onPress={() => setAccountId('new')}
                />
              ) : null}

              <Text style={{ color: c.text, fontSize: BIG.small, fontWeight: '800', marginTop: 16 }}>{t('payments.flow.permission', { name: p.name })}</Text>
              {['perm1', 'perm2', 'perm3'].map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color={c.success} />
                  <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>{t(`payments.flow.${k}`)}</Text>
                </View>
              ))}
              <View style={[styles.privacy, { backgroundColor: c.background }]}>
                <Ionicons name="eye-off-outline" size={18} color={c.textMuted} />
                <Text style={{ color: c.textMuted, fontSize: 14, flex: 1 }}>{t('payments.flow.privacy')}</Text>
              </View>
              <BigButton label={t('payments.flow.authorize')} icon="shield-checkmark" color={p.color} textColor={p.onColor} onPress={authorize} style={{ marginTop: 16 }} />
            </>
          ) : null}

          {step === 'connecting' ? (
            <View style={{ alignItems: 'center', paddingVertical: 30, gap: 14 }}>
              <ActivityIndicator size="large" color={p.color === '#FFC233' ? '#A16207' : p.color} />
              <Text style={{ color: c.text, fontSize: BIG.small, fontWeight: '700' }}>{t('payments.flow.connecting', { name: p.name })}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={{ color: c.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 }}>{t('payments.demoNote')}</Text>
    </RavScreen>
  );
}

function Stepper({ step, color, withCode }: { step: Step; color: string; withCode: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const steps: Step[] = withCode ? ['login', 'code', 'account'] : ['login', 'account'];
  const current = step === 'connecting' ? steps.length : steps.indexOf(step);
  const tint = color === '#FFC233' ? '#A16207' : color;
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
      {steps.map((s, i) => (
        <View key={s} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= current ? tint : c.border }} />
      ))}
    </View>
  );
}

function AccountOption({ active, color, title, sub, icon, onPress }: { active: boolean; color: string; title: string; sub?: string; icon?: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const tint = color === '#FFC233' ? '#A16207' : color;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={active}
      style={[styles.option, { borderColor: active ? tint : c.border, backgroundColor: active ? tint + '12' : c.surface }]}
    >
      <Ionicons name={icon ?? (active ? 'radio-button-on' : 'radio-button-off')} size={24} color={active ? tint : c.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{title}</Text>
        {sub ? <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  window: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  urlBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  label: { fontSize: BIG.label, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 2, marginBottom: 10 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
