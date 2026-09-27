import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { RavScreen, BigLabel, BigInput, BigButton, BigChoice, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavLive'>;
type Kind = 'cours' | 'office' | 'message';

const quickTitles: Record<Kind, string> = {
  cours: 'Cours en direct',
  office: 'Office en direct',
  message: 'Message à la communauté',
};

export function RavLiveScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { live, startLive, endLive, congregation } = useAppState();
  const [kind, setKind] = useState<Kind>('cours');
  const [title, setTitle] = useState('Cours en direct : la paracha de la semaine');
  const [notify, setNotify] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState<{ viewers: number; elapsed: number } | null>(null);

  // Simulation : les spectateurs arrivent au fil des secondes après la notification push.
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setViewers((v) => (v < 60 ? v + Math.floor(Math.random() * 4) : v + (Math.random() < 0.2 ? 1 : 0)));
    }, 1000);
    return () => clearInterval(t);
  }, [live]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  if (ended) {
    return (
      <RavScreen title="Live terminé" onBack={() => navigation.goBack()}>
        <RavCard style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Ionicons name="checkmark-circle" size={56} color={c.success} />
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '900', marginTop: 10 }}>Merci, Rav !</Text>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 6, textAlign: 'center' }}>
            {ended.viewers} fidèles ont suivi votre live pendant {Math.floor(ended.elapsed / 60)} min {ended.elapsed % 60} s. L’enregistrement est disponible dans vos divré Torah (maquette).
          </Text>
          <BigButton label="Retour à l’accueil" icon="home" onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch', marginTop: 20 }} />
        </RavCard>
      </RavScreen>
    );
  }

  if (live) {
    return (
      <RavScreen title="Vous êtes en direct" subtitle={live.title} onBack={() => navigation.goBack()}>
        <View style={styles.stage}>
          <View style={styles.liveTag}>
            <View style={styles.dot} />
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>LIVE</Text>
          </View>
          <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={120} ring />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 14 }}>{congregation.rav.name}</Text>
          <Text style={{ color: '#D1D5DB', fontSize: 15 }}>{congregation.name}</Text>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 14, fontVariant: ['tabular-nums'] }}>
            {mm}:{ss}
          </Text>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="eye" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{viewers}</Text>
              <Text style={{ color: '#D1D5DB', fontSize: 12 }}>spectateurs</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="notifications" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{live.notified}</Text>
              <Text style={{ color: '#D1D5DB', fontSize: 12 }}>prévenus</Text>
            </View>
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 14 }}>Caméra simulée. Les fidèles voient un bandeau « LIVE » dans leur application.</Text>
        </View>
        <BigButton
          label="Terminer le live"
          icon="stop-circle"
          color={c.danger}
          onPress={() => {
            setEnded({ viewers, elapsed });
            endLive();
          }}
          style={{ marginTop: 16 }}
        />
      </RavScreen>
    );
  }

  return (
    <RavScreen title="Faire un live" subtitle="Vos fidèles reçoivent une notification et vous rejoignent" onBack={() => navigation.goBack()}>
      <RavCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.primaryLight, borderColor: c.primaryLight }}>
        <MaterialCommunityIcons name="video-wireless" size={36} color={c.primary} />
        <Text style={{ color: c.text, fontSize: BIG.small, flex: 1 }}>
          Un cours, un office ou un mot à transmettre ? Lancez le direct en un geste. {congregation.members} fidèles de {congregation.name} seront prévenus.
        </Text>
      </RavCard>

      <BigLabel>Quel type de live ?</BigLabel>
      <BigChoice
        options={[
          { value: 'cours', label: 'Cours' },
          { value: 'office', label: 'Office' },
          { value: 'message', label: 'Message' },
        ]}
        value={kind}
        onChange={(k) => {
          setKind(k);
          setTitle(quickTitles[k]);
        }}
      />

      <BigLabel hint="Ce titre apparaît dans la notification.">Titre du live</BigLabel>
      <BigInput value={title} onChangeText={setTitle} placeholder="Ex. : Cours en direct sur la paracha" />

      <BigLabel>Prévenir la communauté</BigLabel>
      <BigChoice
        options={[
          { value: 'yes', label: `Oui, envoyer une notification push à ${congregation.members} fidèles` },
          { value: 'no', label: 'Non, live discret' },
        ]}
        value={notify ? 'yes' : 'no'}
        onChange={(v) => setNotify(v === 'yes')}
      />

      <View style={{ marginTop: 26 }}>
        <BigButton
          label="Démarrer le live"
          icon="radio"
          color={c.danger}
          disabled={title.trim().length < 3}
          onPress={() => {
            setViewers(0);
            setElapsed(0);
            startLive(title.trim());
          }}
        />
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  stage: { backgroundColor: '#111827', borderRadius: 22, padding: 24, alignItems: 'center' },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
});
