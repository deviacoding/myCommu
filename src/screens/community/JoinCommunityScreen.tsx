import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { Card, Button, Segmented, Muted, Chip } from '../../components/ui';
import { useI18n } from '../../i18n';
import { countryName } from '../../utils/countries';
import { Congregation } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinCommunity'>;
type Method = 'nearby' | 'qr' | 'code';

export function JoinCommunityScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const onboarding = route.params?.onboarding ?? false;
  const { user, finishOnboarding, claimStaffCode, switchRole, updateUser } = useAuth();
  const { congregations, myCongregations, joinCongregation, currents, currentOf, groupOf, lookupCongregationByCode, backendMode, locateMe, userCoords } = useAppState();
  const real = backendMode === 'firebase';
  const [locating, setLocating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qrLink, setQrLink] = useState('');
  const { t, lang } = useI18n();
  const [method, setMethod] = useState<Method>('nearby');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const nearbyList = congregations.filter((k) => !k.isPrivate && (!currentFilter || k.currentId === currentFilter));
  const usedCurrents = currents.filter((cur) => congregations.some((k) => !k.isPrivate && k.currentId === cur.id));
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<Congregation | null>(null);
  const [joinedNow, setJoinedNow] = useState<string | null>(null);
  const scanLine = useRef(new Animated.Value(0)).current;

  const joined = congregations.filter((k) => myCongregations.includes(k.id));
  const firstName = user.name.split(' ')[0];

  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    // Simulation : le QR code de la communauté voisine est reconnu après 2,5 s.
    const t = setTimeout(() => {
      setScanning(false);
      setScanned(congregations.find((k) => !myCongregations.includes(k.id)) ?? congregations[0]);
    }, 2500);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [scanning, scanLine, congregations, myCongregations]);

  const join = (k: Congregation, via: 'nearby' | 'qr' | 'code' = 'nearby') => {
    joinCongregation(k.id, via);
    setJoinedNow(k.name);
    setScanned(null);
    setCode('');
    setTimeout(() => setJoinedNow(null), 3000);
  };

  // Un code de communauté (XX-0000) fait rejoindre ; un code d'équipe (RB/TR/OR-0000) ouvre l'espace responsable.
  const submitCode = async (raw: string = code, via: 'code' | 'qr' = 'code') => {
    const norm = raw.replace(/[\s-]/g, '').toUpperCase();
    setChecking(true);
    setCodeError(null);
    try {
      if (real && /^(RB|TR|OR)\d{4}$/.test(norm)) {
        await claimStaffCode(norm);
        return;
      }
      const found = await lookupCongregationByCode(norm);
      if (!found) {
        setCodeError('Code inconnu. Vérifiez auprès de votre communauté : le code est de la forme XX-0000.');
        return;
      }
      join(found, via);
    } catch (e) {
      setCodeError((e as Error).message);
    } finally {
      setChecking(false);
    }
  };

  // Lien du QR code (…/rejoindre/XX-0000) collé ou ouvert directement dans le navigateur.
  const codeFromLink = (s: string) => (s.match(/([A-Z]{2}-?\d{4})(?![\w-])/i)?.[1] ?? '').toUpperCase();
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location) return;
    const c0 = codeFromLink(window.location.pathname);
    if (c0) {
      setMethod('code');
      setCode(c0);
    }
  }, []);

  const becomeLeader = () => {
    updateUser({ intent: 'leader' });
    switchRole('rav');
  };

  const finish = () => {
    finishOnboarding();
    if (onboarding) navigation.replace('MainTabs', { screen: 'ScheduleTab' });
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!onboarding ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ alignSelf: 'flex-start', marginBottom: 6 }}>
            <Ionicons name="chevron-back" size={28} color={c.text} />
          </Pressable>
        ) : null}
        <Text style={[styles.title, { color: c.text }]}>{onboarding ? t('join.welcome', { name: firstName }) : t('join.title')}</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>
          {onboarding ? t('join.intro') : t('join.introMore')}
        </Text>

        {joined.length ? (
          <View style={[styles.joinedRow, { backgroundColor: c.primaryLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={c.primary} />
            <Text style={{ color: c.primary, fontWeight: '700', flex: 1, fontSize: 13 }}>
              {t('join.myCommunities', { list: joined.map((k) => k.name).join(', ') })}
            </Text>
          </View>
        ) : null}
        {joinedNow ? (
          <View style={[styles.joinedRow, { backgroundColor: c.success + '22' }]}>
            <Ionicons name="sparkles" size={20} color={c.success} />
            <Text style={{ color: c.success, fontWeight: '800', flex: 1, fontSize: 14 }}>{t('join.joinedNow', { name: joinedNow })}</Text>
          </View>
        ) : null}

        <Segmented<Method>
          options={[
            { value: 'nearby', label: t('join.nearby') },
            { value: 'qr', label: t('join.qr') },
            { value: 'code', label: t('join.code') },
          ]}
          value={method}
          onChange={(m) => {
            setMethod(m);
            setScanning(false);
            setScanned(null);
          }}
        />

        {/* ---- Autour de moi ---- */}
        {method === 'nearby' ? (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="location" size={18} color={c.primary} />
              <Muted style={{ flex: 1 }}>{real ? (userCoords ? 'Communautés publiques, de la plus proche à la plus éloignée' : 'Activez votre position pour voir les distances') : t('join.nearbyHint', { city: user.city ?? '—' })}</Muted>
            </View>
            {real && !userCoords ? (
              <Button
                label={locating ? 'Recherche de votre position…' : 'Me géolocaliser'}
                icon="navigate"
                variant="secondary"
                disabled={locating}
                onPress={async () => {
                  setLocating(true);
                  await locateMe();
                  setLocating(false);
                }}
                style={{ marginBottom: 10 }}
              />
            ) : null}
            {real && nearbyList.length === 0 ? <Card><Muted>Aucune communauté publique de votre confession n’est encore inscrite. Rejoignez la vôtre par son code ou son QR code.</Muted></Card> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
              <Chip label={t('affiliation.allCurrents')} active={currentFilter === null} onPress={() => setCurrentFilter(null)} />
              {usedCurrents.map((cur) => (
                <Chip key={cur.id} label={cur.name} active={currentFilter === cur.id} onPress={() => setCurrentFilter(currentFilter === cur.id ? null : cur.id)} />
              ))}
            </View>
            {nearbyList.map((k) => {
              const isMember = myCongregations.includes(k.id);
              return (
                <Card key={k.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar source={k.rav.photo} name={k.rav.name} size={52} ring={isMember} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{k.name}</Text>
                    <Muted>
                      {currentOf(k)?.name ?? k.rite} · {k.rav.name}
                    </Muted>
                    {groupOf(k) ? (
                      <Muted style={{ fontSize: 12 }}>
                        <Ionicons name="git-network" size={12} /> {groupOf(k)?.name}
                      </Muted>
                    ) : null}
                    <Muted style={{ fontSize: 12 }}>
                      {k.distance} · {k.address}, {k.city}{k.country ? `, ${countryName(k.country, lang)}` : ''} · {t('common.members', { count: k.members })}
                    </Muted>
                  </View>
                  {isMember ? (
                    <View style={[styles.joinedPill, { backgroundColor: c.success + '22' }]}>
                      <Ionicons name="checkmark" size={16} color={c.success} />
                      <Text style={{ color: c.success, fontWeight: '800', fontSize: 12 }}>{t('common.joined')}</Text>
                    </View>
                  ) : (
                    <Button label={t('common.join')} onPress={() => join(k)} style={{ paddingVertical: 10, paddingHorizontal: 14 }} />
                  )}
                </Card>
              );
            })}
          </View>
        ) : null}

        {/* ---- QR code ---- */}
        {method === 'qr' && real ? (
          <View style={{ marginTop: 16 }}>
            <Muted style={{ marginBottom: 10 }}>Scannez le QR code de votre communauté avec l’appareil photo de votre téléphone : il ouvre un lien qui vous amène ici. Vous pouvez aussi coller ce lien.</Muted>
            <TextInput
              value={qrLink}
              onChangeText={setQrLink}
              placeholder="https://mycommunity-b13de.web.app/rejoindre/XX-0000"
              autoCapitalize="none"
              placeholderTextColor={c.textMuted}
              style={[styles.codeInput, { borderColor: codeError ? c.danger : c.border, backgroundColor: c.surface, color: c.text, fontSize: 14, letterSpacing: 0 }]}
            />
            {codeError ? <Text style={{ color: c.danger, fontSize: 13, marginTop: 6 }}>{codeError}</Text> : null}
            <Button label={checking ? 'Vérification…' : 'Rejoindre avec ce lien'} icon="link" disabled={!codeFromLink(qrLink) || checking} onPress={() => submitCode(codeFromLink(qrLink), 'qr')} style={{ marginTop: 12 }} />
          </View>
        ) : null}
        {method === 'qr' && !real ? (
          <View style={{ marginTop: 16 }}>
            <Muted style={{ marginBottom: 10 }}>Scannez le QR code affiché à l’entrée de votre lieu de culte ou envoyé par votre responsable.</Muted>
            <View style={styles.camera}>
              <View style={styles.frame}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
                {scanning ? (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { backgroundColor: c.secondary, transform: [{ translateY: scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }] },
                    ]}
                  />
                ) : null}
                {!scanning && !scanned ? <MaterialCommunityIcons name="qrcode-scan" size={72} color="rgba(255,255,255,0.7)" /> : null}
                {scanned ? <Ionicons name="checkmark-circle" size={80} color="#22C55E" /> : null}
              </View>
              <Text style={{ color: '#fff', marginTop: 12, fontWeight: '600' }}>
                {scanning ? 'Recherche d’un QR code…' : scanned ? 'QR code reconnu' : 'Caméra (simulation)'}
              </Text>
            </View>
            {scanned ? (
              <Card style={{ marginTop: 14, borderColor: c.success, borderWidth: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar source={scanned.rav.photo} name={scanned.rav.name} size={52} />
                  <View style={{ flex: 1 }}>
                    <Muted style={{ fontSize: 12, fontWeight: '700' }}>COMMUNAUTÉ DÉTECTÉE</Muted>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>{scanned.name}</Text>
                    <Muted>
                      {scanned.rite} · {scanned.rav.name}
                    </Muted>
                  </View>
                </View>
                {myCongregations.includes(scanned.id) ? (
                  <Muted style={{ marginTop: 10 }}>Vous êtes déjà membre de cette communauté.</Muted>
                ) : (
                  <Button label={`Rejoindre ${scanned.name}`} icon="checkmark-circle" onPress={() => join(scanned)} style={{ marginTop: 12 }} />
                )}
              </Card>
            ) : (
              <Button label={scanning ? 'Scan en cours…' : 'Scanner un QR code'} icon="camera" disabled={scanning} onPress={() => setScanning(true)} style={{ marginTop: 14 }} />
            )}
          </View>
        ) : null}

        {/* ---- Code ---- */}
        {method === 'code' ? (
          <View style={{ marginTop: 16 }}>
            <Muted style={{ marginBottom: 10 }}>{real ? 'Entrez le code de votre communauté (XX-0000), ou le code d’accès d’équipe reçu de votre responsable (RB-, TR- ou OR-0000).' : `Entrez le code communiqué par votre communauté. Pour la démo : ${congregations.map((k) => `${k.code} (${k.name})`).join(', ')}.`}</Muted>
            <TextInput
              value={code}
              onChangeText={(v) => {
                setCode(v.toUpperCase());
                setCodeError(null);
              }}
              placeholder="XX-0000"
              autoCapitalize="characters"
              placeholderTextColor={c.textMuted}
              style={[styles.codeInput, { borderColor: codeError ? c.danger : c.border, backgroundColor: c.surface, color: c.text }]}
            />
            {codeError ? <Text style={{ color: c.danger, fontSize: 13, marginTop: 6 }}>{codeError}</Text> : null}
            <Button label={checking ? 'Vérification…' : 'Valider le code'} icon="key" disabled={code.replace(/[\s-]/g, '').length < 6 || checking} onPress={() => submitCode()} style={{ marginTop: 12 }} />
          </View>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <Button
            label={onboarding ? (joined.length ? 'Continuer' : 'Rejoignez une communauté pour continuer') : 'Terminé'}
            icon="arrow-forward"
            disabled={onboarding && joined.length === 0}
            onPress={finish}
          />
          {onboarding && !real ? (
            <Muted style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
              Maquette : demain, cette étape utilisera votre position, la caméra du téléphone et un code fourni par votre communauté.
            </Muted>
          ) : null}
          {onboarding && real ? (
            <Pressable onPress={becomeLeader} style={{ marginTop: 18, alignItems: 'center' }}>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>
                {t('auth.areYouLeader')} <Text style={{ color: c.primary, fontWeight: '700' }}>{t('auth.createCommunity')}</Text>
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '900', marginTop: 8 },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  joinedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, marginBottom: 12 },
  joinedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12 },
  camera: { backgroundColor: '#111827', borderRadius: 18, padding: 20, alignItems: 'center' },
  frame: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: '#fff' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  scanLine: { position: 'absolute', top: 10, left: 10, right: 10, height: 3, borderRadius: 2, opacity: 0.9 },
  codeInput: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 26, fontWeight: '800', letterSpacing: 4, textAlign: 'center' },
});
