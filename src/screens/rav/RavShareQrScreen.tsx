import React, { useState } from 'react';
import { View, Text, StyleSheet, Share, Platform, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { RavScreen, BigButton, RavCard, BIG } from './RavUi';
import { countryName } from '../../utils/countries';

type Props = NativeStackScreenProps<RavStackParamList, 'RavShareQr'>;

export const JOIN_BASE_URL = 'https://mycommunity-b13de.web.app/rejoindre/';

export function RavShareQrScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { congregation, seed } = useAppState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const link = `${JOIN_BASE_URL}${congregation.code}`;
  const message = `Rejoignez ${congregation.name} sur myCommu : ouvrez ce lien ${link} ou entrez le code ${congregation.code} dans l’application.`;

  const flash = (m: string) => {
    setFeedback(m);
    setTimeout(() => setFeedback(null), 3500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      flash('Message et lien copiés : collez-les dans WhatsApp, un SMS ou un email.');
    } catch {
      flash(`Copiez ce lien et envoyez-le : ${link}`);
    }
  };

  const share = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message, url: link, title: congregation.name });
      } catch {
        flash('Partage annulé.');
      }
      return;
    }
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
    if (!nav.share) return copy();
    try {
      await nav.share({ title: congregation.name, text: message, url: link });
    } catch (e) {
      // Fermeture volontaire de la feuille de partage : rien à faire. Sinon, on copie le lien.
      if ((e as Error)?.name !== 'AbortError') await copy();
    }
  };

  const print = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.print();
    else flash('Affiche envoyée à l’impression (maquette).');
  };

  return (
    <RavScreen title="Mon QR code" subtitle={congregation.name} onBack={() => navigation.goBack()}>
      <RavCard style={{ alignItems: 'center', paddingVertical: 26 }}>
        {congregation.logo ? <Image source={congregation.logo} style={styles.logo} /> : null}
        <Text style={{ color: c.text, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>{congregation.name}</Text>
        <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 18, textAlign: 'center' }}>
          {congregation.rav.name} · {congregation.city}{congregation.country ? `, ${countryName(congregation.country)}` : ''}
        </Text>
        <View style={[styles.qrFrame, { borderColor: c.primary }]}>
          <QRCode value={link} size={230} color={c.primaryDark} backgroundColor="#FFFFFF" />
        </View>
        <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 16 }}>Ou avec le code</Text>
        <Text style={{ color: c.primary, fontSize: 38, fontWeight: '900', letterSpacing: 4 }}>{congregation.code || '—'}</Text>
        {!congregation.code ? <Text style={{ color: c.textMuted, fontSize: 14, textAlign: 'center' }}>Aucun code disponible : créez ou sélectionnez d’abord votre communauté.</Text> : null}
        <Text selectable style={{ color: c.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' }}>{link}</Text>
      </RavCard>

      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14 }}>
        Vos {seed.memberLabel}s scannent ce QR code avec l’appareil photo de leur téléphone, ou l’écran « Rejoindre une communauté » de l’application.
        {congregation.isPrivate ? ' Votre communauté est privée : c’est le seul moyen de la rejoindre avec le code.' : ''}
      </Text>

      <View style={{ gap: 12 }}>
        <BigButton label="Partager mon QR code" icon="share-social" onPress={share} />
        <BigButton label="Imprimer l’affiche" icon="print" color={c.primaryLight} textColor={c.primary} onPress={print} />
      </View>

      {feedback ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{feedback}</Text>
        </View>
      ) : null}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 64, height: 64, borderRadius: 16, marginBottom: 10 },
  qrFrame: { padding: 16, borderRadius: 20, borderWidth: 3, backgroundColor: '#FFFFFF' },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 14 },
});
