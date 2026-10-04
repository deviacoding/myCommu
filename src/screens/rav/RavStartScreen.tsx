import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { LanguagePicker } from '../../components/LanguagePicker';
import { RavScreen, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavStart'>;

// Premier écran de l'accès responsable : créer sa communauté ou ouvrir une communauté existante.
export function RavStartScreen({ navigation }: Props) {
  const { theme, community } = useTheme();
  const c = theme.colors;
  const { t, rtl } = useI18n();
  const r = (k: string) => t(`religions.${community}.${k}`);
  const { signOut, staffRoleFor } = useAuth();
  const { seed, setCongregation, congregations, backendMode } = useAppState();
  const real = backendMode === 'firebase';
  const demo = real ? congregations.find((k) => staffRoleFor(k.id)) : (congregations.find((k) => k.id === seed.defaultCongregation) ?? congregations[0]);
  const chevron = rtl ? 'chevron-back' : 'chevron-forward';

  return (
    <RavScreen title={t('rav.hello', { leader: r('leaderShort') })} subtitle={r('community')} onBack={signOut}>
      <Text style={{ color: c.textMuted, fontSize: BIG.text, marginBottom: 18 }}>{t('rav.whatToDo')}</Text>

      <Pressable onPress={() => navigation.navigate('RavCreateCommunity')} style={({ pressed }) => [styles.big, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
        <View style={styles.icon}>
          <Ionicons name="add-circle" size={48} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bigTxt}>{t('rav.create')}</Text>
          <Text style={styles.bigSub}>{t('rav.createSub', { leader: r('leader') })}</Text>
        </View>
        <Ionicons name={chevron} size={30} color="#fff" />
      </Pressable>

      {demo ? (
      <Pressable
        onPress={() => {
          setCongregation(demo.id);
          navigation.navigate('RavHome');
        }}
        style={({ pressed }) => [styles.big, { backgroundColor: c.surface, borderWidth: 2, borderColor: c.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Avatar source={demo.rav.photo} name={demo.rav.name} size={72} ring />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigTxt, { color: c.primary }]}>{t('rav.viewExisting')}</Text>
          <Text style={[styles.bigSub, { color: c.textMuted, opacity: 1 }]}>
            {demo.name} · {demo.rav.name}
          </Text>
        </View>
        <Ionicons name={chevron} size={30} color={c.primary} />
      </Pressable>
      ) : (
        <RavCard style={{ marginBottom: 18 }}>
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>Vous n’avez pas encore de communauté. Créez-la ci-dessus : cela prend deux minutes. Si votre responsable vous a donné un code d’accès, entrez-le dans « Voir l’application comme un fidèle » → Rejoindre → Code.</Text>
        </RavCard>
      )}

      <RavCard style={{ marginTop: 10 }}>
        <LanguagePicker big />
      </RavCard>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  big: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 22, borderRadius: 22, marginBottom: 18, minHeight: 130 },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bigTxt: { color: '#fff', fontSize: 23, fontWeight: '900' },
  bigSub: { color: '#fff', opacity: 0.85, fontSize: 16, marginTop: 6 },
});
