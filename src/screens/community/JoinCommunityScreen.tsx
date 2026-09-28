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
import { Card, Button, Segmented, Muted } from '../../components/ui';
import { Congregation } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinCommunity'>;
type Method = 'nearby' | 'qr' | 'code';

export function JoinCommunityScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const onboarding = route.params?.onboarding ?? false;
  const { user, finishOnboarding } = useAuth();
  const { congregations, myCongregations, joinCongregation } = useAppState();
  const [method, setMethod] = useState<Method>('nearby');
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

  const join = (k: Congregation) => {
    joinCongregation(k.id);
    setJoinedNow(k.name);
    setScanned(null);
    setCode('');
    setTimeout(() => setJoinedNow(null), 3000);
  };

  const submitCode = () => {
    const norm = code.replace(/[\s-]/g, '').toUpperCase();
    const found = congregations.find((k) => k.code.replace(/[\s-]/g, '').toUpperCase() === norm);
    if (!found) {
      setCodeError('Code inconnu. Vérifiez auprès de votre synagogue, le code est de la forme XX-0000.');
      return;
    }
    setCodeError(null);
    join(found);
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
        <Text style={[styles.title, { color: c.text }]}>{onboarding ? `Bienvenue ${firstName}` : 'Rejoindre une communauté'}</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>
          {onboarding
            ? 'Pour commencer, rejoignez votre communauté. Vous pourrez en ajouter d’autres à tout moment et passer de l’une à l’autre.'
            : 'Vous pouvez appartenir à plusieurs communautés et basculer entre elles depuis la barre du haut.'}
        </Text>

        {joined.length ? (
          <View style={[styles.joinedRow, { backgroundColor: c.primaryLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={c.primary} />
            <Text style={{ color: c.primary, fontWeight: '700', flex: 1, fontSize: 13 }}>
              Mes communautés : {joined.map((k) => k.name).join(', ')}
            </Text>
          </View>
        ) : null}
        {joinedNow ? (
          <View style={[styles.joinedRow, { backgroundColor: c.success + '22' }]}>
            <Ionicons name="sparkles" size={20} color={c.success} />
            <Text style={{ color: c.success, fontWeight: '800', flex: 1, fontSize: 14 }}>Vous avez rejoint {joinedNow} !</Text>
          </View>
        ) : null}

        <Segmented<Method>
          options={[
            { value: 'nearby', label: 'Autour de moi' },
            { value: 'qr', label: 'QR code' },
            { value: 'code', label: 'Code' },
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
              <Muted>Communautés près de {user.city ?? 'vous'}, de la plus proche à la plus éloignée</Muted>
            </View>
            {congregations.map((k) => {
              const isMember = myCongregations.includes(k.id);
              return (
                <Card key={k.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar source={k.rav.photo} name={k.rav.name} size={52} ring={isMember} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{k.name}</Text>
                    <Muted>
                      {k.rite} · {k.rav.name}
                    </Muted>
                    <Muted style={{ fontSize: 12 }}>
                      {k.distance} · {k.address}, {k.city} · {k.members} membres
                    </Muted>
                  </View>
                  {isMember ? (
                    <View style={[styles.joinedPill, { backgroundColor: c.success + '22' }]}>
                      <Ionicons name="checkmark" size={16} color={c.success} />
                      <Text style={{ color: c.success, fontWeight: '800', fontSize: 12 }}>Rejoint</Text>
                    </View>
                  ) : (
                    <Button label="Rejoindre" onPress={() => join(k)} style={{ paddingVertical: 10, paddingHorizontal: 14 }} />
                  )}
                </Card>
              );
            })}
          </View>
        ) : null}

        {/* ---- QR code ---- */}
        {method === 'qr' ? (
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
            <Muted style={{ marginBottom: 10 }}>Entrez le code communiqué par votre communauté. Pour la démo : {congregations.map((k) => `${k.code} (${k.name})`).join(', ')}.</Muted>
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
            <Button label="Valider le code" icon="key" disabled={code.replace(/[\s-]/g, '').length < 6} onPress={submitCode} style={{ marginTop: 12 }} />
          </View>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <Button
            label={onboarding ? (joined.length ? 'Continuer' : 'Rejoignez une communauté pour continuer') : 'Terminé'}
            icon="arrow-forward"
            disabled={onboarding && joined.length === 0}
            onPress={finish}
          />
          {onboarding ? (
            <Muted style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
              Maquette : demain, cette étape utilisera votre position, la caméra du téléphone et un code fourni par votre communauté.
            </Muted>
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
