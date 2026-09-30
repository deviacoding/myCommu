import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useReligion } from '../../state/useReligion';
import { useI18n } from '../../i18n';
import { CurrentPicker, GroupChoice, GroupPicker } from '../../components/AffiliationPickers';
import { RavScreen, BigLabel, BigInput, BigButton, Done, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavCreateCommunity'>;

type GeoState = 'idle' | 'locating' | 'done' | 'denied' | 'error';

async function pickImage(square: boolean): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted && Platform.OS !== 'web') return null;
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: square ? [1, 1] : [1, 1], quality: 0.7 });
  return r.canceled ? null : r.assets[0]?.uri ?? null;
}

export function RavCreateCommunityScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { profile } = useReligion();
  const { createCongregation, seed, currents } = useAppState();
  const [name, setName] = useState('');
  const { t } = useI18n();
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [groupChoice, setGroupChoice] = useState<GroupChoice>({ mode: 'none' });
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhoto, setLeaderPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geo, setGeo] = useState<GeoState>('idle');
  const [isPrivate, setIsPrivate] = useState(false);
  const [created, setCreated] = useState<{ name: string; code: string; isPrivate: boolean } | null>(null);

  const place = profile.placeLabel.toLowerCase();
  const leader = profile.leaderTitle.toLowerCase();
  const groupOk = groupChoice.mode !== 'create' || groupChoice.name.trim().length > 2;
  const canCreate = name.trim().length > 2 && leaderName.trim().length > 2 && (address.trim().length > 3 || !!coords) && groupOk;

  const locate = async () => {
    setGeo('locating');
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setGeo('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(p);
      // L'adresse postale se déduit de la position sur téléphone ; sur le web, on garde les coordonnées.
      if (Platform.OS !== 'web') {
        try {
          const [a] = await Location.reverseGeocodeAsync({ latitude: p.lat, longitude: p.lng });
          if (a) {
            setAddress([a.streetNumber, a.street].filter(Boolean).join(' ') || a.name || '');
            setCity(a.city ?? a.subregion ?? '');
          }
        } catch {
          // l'adresse reste à saisir à la main
        }
      }
      setGeo('done');
    } catch {
      setGeo('error');
    }
  };

  const submit = () => {
    const k = createCongregation({
      name: name.trim(),
      rite: currents.find((x) => x.id === currentId)?.name ?? profile.communityLabel,
      currentId,
      groupId: groupChoice.mode === 'join' ? groupChoice.groupId : undefined,
      newGroupName: groupChoice.mode === 'create' ? groupChoice.name.trim() : undefined,
      leaderName: leaderName.trim(),
      leaderTitle: `${profile.leaderTitle} de la communauté`,
      leaderPhoto: leaderPhoto ?? undefined,
      logo: logo ?? undefined,
      address: address.trim() || (coords ? `Position ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : ''),
      city: city.trim() || '—',
      coords: coords ?? undefined,
      isPrivate,
    });
    setCreated({ name: k.name, code: k.code, isPrivate });
  };

  if (created) {
    return (
      <RavScreen title="Communauté créée" onBack={() => navigation.replace('RavHome')}>
        <Done title={`${created.name} est créée !`} text={created.isPrivate ? `Communauté privée : elle n’apparaît pas autour de vos ${seed.memberLabel}s. Ils la rejoignent uniquement avec ce code ou votre QR code.` : `Communauté publique : vos ${seed.memberLabel}s la trouvent autour d’eux, ou la rejoignent avec ce code ou votre QR code.`}>
          <View style={[styles.codeBox, { backgroundColor: c.surface, borderColor: c.primary }]}>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, fontWeight: '700' }}>CODE DE LA COMMUNAUTÉ</Text>
            <Text style={{ color: c.primary, fontSize: 40, fontWeight: '900', letterSpacing: 4, marginTop: 4 }}>{created.code}</Text>
          </View>
          <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
            <BigButton label="Aller à l’accueil de ma communauté" icon="home" onPress={() => navigation.replace('RavHome')} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  return (
    <RavScreen title={t('create.title')} subtitle={t('create.subtitle')} onBack={() => navigation.goBack()}>
      <BigLabel hint={`Exemple : ${seed.congregations[0]?.name ?? ''}`}>1. Le nom de la communauté</BigLabel>
      <BigInput value={name} onChangeText={setName} placeholder={`Nom de votre ${place}`} />

      <BigLabel hint={t('affiliation.currentHint')}>{t('create.currentStep')}</BigLabel>
      <CurrentPicker value={currentId} onChange={setCurrentId} />

      <BigLabel hint={t('affiliation.joinGroupHint')}>{t('create.groupStep')}</BigLabel>
      <GroupPicker value={groupChoice} onChange={setGroupChoice} currentId={currentId} />

      <BigLabel>{`2. Le nom du ${leader}`}</BigLabel>
      <BigInput value={leaderName} onChangeText={setLeaderName} placeholder={seed.congregations[0]?.rav.name ?? 'Prénom et nom'} />

      <BigLabel hint="Elle apparaît en rond sur chaque enseignement et chaque réponse.">{`3. La photo du ${leader}`}</BigLabel>
      <PhotoPicker uri={leaderPhoto} round icon="account" label={`Choisir la photo du ${leader}`} onPick={async () => setLeaderPhoto((await pickImage(true)) ?? leaderPhoto)} onRemove={() => setLeaderPhoto(null)} />

      <BigLabel hint="Elle s’affiche dans la liste des communautés et en haut de l’application.">4. Le logo de la communauté</BigLabel>
      <PhotoPicker uri={logo} icon="image-outline" label="Choisir le logo" onPick={async () => setLogo((await pickImage(true)) ?? logo)} onRemove={() => setLogo(null)} />

      <BigLabel hint="Les fidèles proches la verront dans « Autour de moi ».">5. L’adresse</BigLabel>
      <RavCard style={{ borderColor: coords ? c.success : c.border, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name={coords ? 'location' : 'location-outline'} size={30} color={coords ? c.success : c.primary} />
          <Text style={{ color: c.text, fontSize: BIG.small, flex: 1 }}>
            {geo === 'idle' ? `Vous êtes dans votre ${place} ? Utilisez votre position.` : null}
            {geo === 'locating' ? 'Recherche de votre position…' : null}
            {geo === 'done' && coords ? `Position enregistrée : ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : null}
            {geo === 'denied' ? 'La position a été refusée. Saisissez l’adresse ci-dessous.' : null}
            {geo === 'error' ? 'Position introuvable. Saisissez l’adresse ci-dessous.' : null}
          </Text>
        </View>
        <BigButton label={geo === 'done' ? 'Me géolocaliser à nouveau' : 'Me géolocaliser'} icon="navigate" disabled={geo === 'locating'} color={geo === 'done' ? c.success : c.primary} onPress={locate} style={{ marginTop: 12 }} />
      </RavCard>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, textAlign: 'center', marginVertical: 6 }}>ou saisissez l’adresse</Text>
      <BigInput value={address} onChangeText={setAddress} placeholder="Numéro et rue" />
      <BigInput value={city} onChangeText={setCity} placeholder="Ville" style={{ marginTop: 8 }} />

      <BigLabel hint="Cochez une seule case.">6. Qui peut trouver la communauté ?</BigLabel>
      <VisibilityOption
        checked={!isPrivate}
        icon="earth"
        title="Communauté publique"
        text={`Visible par géolocalisation : les ${seed.memberLabel}s proches la trouvent dans « Autour de moi ».`}
        onPress={() => setIsPrivate(false)}
      />
      <VisibilityOption
        checked={isPrivate}
        icon="lock-closed"
        title="Communauté privée"
        text="Introuvable par géolocalisation : on la rejoint seulement avec le code ou le QR code que vous donnez."
        onPress={() => setIsPrivate(true)}
      />

      <View style={{ marginTop: 26 }}>
        <BigButton label="Créer ma communauté" icon="checkmark-circle" disabled={!canCreate} onPress={submit} />
        {!canCreate ? (
          <Text style={{ color: c.textMuted, fontSize: BIG.small, textAlign: 'center', marginTop: 10 }}>Il manque le nom de la communauté, le nom du {leader} ou l’adresse.</Text>
        ) : null}
      </View>
    </RavScreen>
  );
}

function VisibilityOption({ checked, icon, title, text, onPress }: { checked: boolean; icon: React.ComponentProps<typeof Ionicons>['name']; title: string; text: string; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      aria-checked={checked}
      style={({ pressed }) => [styles.option, { borderColor: checked ? c.primary : c.border, backgroundColor: checked ? c.primaryLight : c.surface, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.box, { borderColor: checked ? c.primary : c.textMuted, backgroundColor: checked ? c.primary : 'transparent' }]}>
        {checked ? <Ionicons name="checkmark" size={24} color={c.textOnPrimary} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name={icon} size={22} color={c.primary} />
          <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{title}</Text>
        </View>
        <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4 }}>{text}</Text>
      </View>
    </Pressable>
  );
}

function PhotoPicker({ uri, round, icon, label, onPick, onRemove }: { uri: string | null; round?: boolean; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; onPick: () => void; onRemove: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const size = 96;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: round ? size / 2 : 18, borderWidth: 3, borderColor: c.secondary }} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: round ? size / 2 : 18, backgroundColor: c.primaryLight }]}>
          <MaterialCommunityIcons name={icon} size={44} color={c.primary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 8 }}>
        <BigButton label={uri ? 'Changer' : label} icon="image" color={c.primaryLight} textColor={c.primary} onPress={onPick} />
        {uri ? (
          <Pressable onPress={onRemove} style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
            <Text style={{ color: c.danger, fontWeight: '700', fontSize: 16 }}>Retirer</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 10, minHeight: 84 },
  box: { width: 34, height: 34, borderRadius: 8, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  codeBox: { alignSelf: 'stretch', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 2, marginTop: 18 },
});
