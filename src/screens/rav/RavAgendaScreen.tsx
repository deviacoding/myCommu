import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { AiAssist } from '../../components/AiAssist';
import { AgendaCategory } from '../../types';
import { RavScreen, BigLabel, BigInput, BigButton, BigChoice, RavCard, BIG } from './RavUi';
import { capitalize, formatLong, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavAgenda'>;

const categories: { value: AgendaCategory; label: string }[] = [
  { value: 'office', label: 'Office' },
  { value: 'cours', label: 'Cours' },
  { value: 'fete', label: 'Fête' },
  { value: 'communaute', label: 'Communauté' },
];

export function RavAgendaScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { myAgenda: agenda, addEvent, removeEvent } = useAppState();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<AgendaCategory>('communaute');
  const [description, setDescription] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [poster, setPoster] = useState<{ color: string; label: string } | null>(null);
  const [loadingPoster, setLoadingPoster] = useState(false);
  const posterChoices = [
    { color: '#1E3A8A', label: 'Affiche bleue' },
    { color: '#7C3AED', label: 'Affiche violette' },
  ];
  const pickPoster = (choice: { color: string; label: string }) => {
    setLoadingPoster(true);
    setTimeout(() => {
      setPoster(choice);
      setLoadingPoster(false);
    }, 900);
  };

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canAdd = title.trim().length > 2 && validDate && /^\d{1,2}[:h]\d{2}$/.test(time);
  const upcoming = agenda.filter((e) => e.date >= todayISO());

  const submit = () => {
    addEvent({ title: title.trim(), date, time: time.replace('h', ':'), place: place.trim() || 'Sur place', category, description: description.trim() || undefined, poster: poster ?? undefined });
    setPoster(null);
    setAdded(title.trim());
    setTitle('');
    setDate('');
    setTime('');
    setDescription('');
  };

  return (
    <RavScreen title="Agenda" subtitle={`${upcoming.length} événements à venir`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Ajouter un événement</Text>

      <BigLabel>Quoi ?</BigLabel>
      <BigInput value={title} onChangeText={setTitle} placeholder="Ex. : Cours, repas communautaire…" />

      <BigLabel hint="Année-mois-jour, exemple 2026-10-15">Quel jour ?</BigLabel>
      <BigInput value={date} onChangeText={setDate} placeholder="2026-10-15" />
      {date && !validDate ? <Text style={{ color: c.danger, fontSize: 15, marginTop: 4 }}>Écrivez la date comme 2026-10-15</Text> : null}

      <BigLabel hint="Exemple 20:30">À quelle heure ?</BigLabel>
      <BigInput value={time} onChangeText={setTime} placeholder="20:30" />

      <BigLabel>Où ?</BigLabel>
      <BigInput value={place} onChangeText={setPlace} placeholder="Lieu, salle…" />

      <BigLabel>Type</BigLabel>
      <BigChoice options={categories} value={category} onChange={setCategory} />

      <BigLabel hint="Facultatif">Un mot d’explication</BigLabel>
      <BigInput value={description} onChangeText={setDescription} multiline style={{ minHeight: 110 }} placeholder="Apportez un plat à partager…" />
      <AiAssist text={description} onAccept={setDescription} label="Corriger avec ChatGPT" />

      <BigLabel hint="Facultatif : l’affiche s’affiche en grand dans l’agenda de la communauté.">Charger l’affiche de l’événement</BigLabel>
      {poster ? (
        <RavCard style={{ padding: 0, overflow: 'hidden', borderColor: c.success, borderWidth: 2 }}>
          <View style={{ backgroundColor: poster.color, height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="image" size={40} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 6 }}>{title.trim() || 'Votre événement'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
            <Text style={{ color: c.text, fontSize: BIG.small, fontWeight: '700', flex: 1 }}>{poster.label} · affiche.jpg</Text>
            <Pressable onPress={() => setPoster(null)} style={[styles.small, { backgroundColor: c.danger + '18' }]}>
              <Ionicons name="close" size={20} color={c.danger} />
              <Text style={{ color: c.danger, fontWeight: '800', fontSize: 15 }}>Retirer</Text>
            </Pressable>
          </View>
        </RavCard>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => pickPoster(posterChoices[0])} disabled={loadingPoster} style={({ pressed }) => [styles.posterBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialCommunityIcons name={loadingPoster ? 'progress-clock' : 'image-plus'} size={34} color={c.primary} />
            <Text style={{ color: c.text, fontSize: 16, fontWeight: '800', marginTop: 6 }}>{loadingPoster ? 'Chargement…' : 'Choisir une image'}</Text>
            <Text style={{ color: c.textMuted, fontSize: 12 }}>Depuis la galerie</Text>
          </Pressable>
          <Pressable onPress={() => pickPoster(posterChoices[1])} disabled={loadingPoster} style={({ pressed }) => [styles.posterBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialCommunityIcons name="camera" size={34} color={c.primary} />
            <Text style={{ color: c.text, fontSize: 16, fontWeight: '800', marginTop: 6 }}>Prendre une photo</Text>
            <Text style={{ color: c.textMuted, fontSize: 12 }}>De l’affiche papier</Text>
          </Pressable>
        </View>
      )}

      <View style={{ marginTop: 22 }}>
        <BigButton label="Ajouter à l’agenda" icon="add-circle" disabled={!canAdd} onPress={submit} />
      </View>
      {added ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>« {added} » ajouté. Il apparaît dans l’agenda de la communauté.</Text>
        </View>
      ) : null}

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 30, marginBottom: 10 }}>Événements à venir</Text>
      {upcoming.map((e) => (
        <RavCard key={e.id}>
          {e.poster ? (
            <View style={{ backgroundColor: e.poster.color, height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{e.title}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>{e.title}</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>
                {capitalize(formatLong(e.date))} · {e.time} · {e.place}
              </Text>
            </View>
            {confirmId === e.id ? (
              <View style={{ gap: 6 }}>
                <Pressable onPress={() => { removeEvent(e.id); setConfirmId(null); }} style={[styles.small, { backgroundColor: c.danger }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Oui, supprimer</Text>
                </Pressable>
                <Pressable onPress={() => setConfirmId(null)} style={[styles.small, { backgroundColor: c.background, borderWidth: 1, borderColor: c.border }]}>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>Non</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setConfirmId(e.id)} style={[styles.small, { backgroundColor: c.danger + '18' }]} hitSlop={8}>
                <Ionicons name="trash" size={22} color={c.danger} />
                <Text style={{ color: c.danger, fontWeight: '800', fontSize: 15 }}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        </RavCard>
      ))}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 12 },
  small: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, minHeight: 44 },
  posterBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 2, minHeight: 110 },
});
