import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { AiAssist, AiBanner } from '../../components/AiAssist';
import { RavByline } from '../../components/DvarTorah';
import { FormatToolbar, Selection } from '../../components/FormatToolbar';
import { renderRich } from '../../components/RichText';
import { MediaAttachment, MediaType } from '../../types';
import { RavScreen, BigLabel, BigInput, BigButton, BigChoice, Done, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavDvarTorah'>;

const mediaMeta: Record<MediaType, { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; sample: MediaAttachment; hint: string }> = {
  video: { label: 'Vidéo', icon: 'video', sample: { type: 'video', name: 'Enseignement filmé.mp4', duration: '12 min' }, hint: 'Filmer ou choisir une vidéo' },
  photo: { label: 'Photo', icon: 'image', sample: { type: 'photo', name: 'Photo.jpg' }, hint: 'Prendre ou choisir une photo' },
  audio: { label: 'Audio', icon: 'microphone', sample: { type: 'audio', name: 'Enregistrement.m4a', duration: '9 min' }, hint: 'Enregistrer votre voix' },
};

export function RavDvarTorahScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { addCourse, myCourses: courses, courseThemes, addTheme, seed } = useAppState();
  const tl = seed.teachingLabel;
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<string>(seed.themes[0]);
  const [newTheme, setNewTheme] = useState('');
  const [showNewTheme, setShowNewTheme] = useState(false);
  const [text, setText] = useState('');
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [media, setMedia] = useState<MediaAttachment | null>(null);
  const [loadingMedia, setLoadingMedia] = useState<MediaType | null>(null);
  const [published, setPublished] = useState(false);

  // Avec un média, un texte court suffit (le dvar Torah est dans la vidéo / l'audio).
  const canPublish = title.trim().length > 3 && (text.trim().length > 40 || (!!media && text.trim().length > 0));

  const attach = (type: MediaType) => {
    setLoadingMedia(type);
    setTimeout(() => {
      setMedia(mediaMeta[type].sample);
      setLoadingMedia(null);
    }, 1200);
  };

  const createTheme = () => {
    const name = newTheme.trim();
    if (!name) return;
    addTheme(name);
    setCategory(name);
    setNewTheme('');
    setShowNewTheme(false);
  };

  if (published) {
    return (
      <RavScreen title={`${tl} partagé`} onBack={() => navigation.goBack()}>
        <Done title="C’est partagé !" text={`Votre ${tl.toLowerCase()} s’affiche maintenant en premier chez tous les ${seed.memberLabel}s.`}>
          <View style={{ alignSelf: 'stretch', marginTop: 18, gap: 10 }}>
            <BigButton
              label={`Partager : ${tl}`}
              icon="create"
              onPress={() => {
                setTitle('');
                setSubtitle('');
                setText('');
                setMedia(null);
                setPublished(false);
              }}
            />
            <BigButton label="Retour à l’accueil" icon="home" color={c.primaryLight} textColor={c.primary} onPress={() => navigation.goBack()} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  return (
    <RavScreen title={seed.teachingShareTitle} subtitle={`${courses.length} déjà partagés`} onBack={() => navigation.goBack()}>
      <AiBanner compact />

      <BigLabel hint={`Exemple : ${seed.courses[0]?.title ?? ''}`}>1. Le titre</BigLabel>
      <BigInput value={title} onChangeText={setTitle} placeholder={`Titre de votre ${tl.toLowerCase()}`} />

      <BigLabel hint="Une phrase pour donner envie de lire (facultatif)">2. Le sous-titre</BigLabel>
      <BigInput value={subtitle} onChangeText={setSubtitle} placeholder={seed.courses[0]?.subtitle ?? 'Une phrase pour donner envie de lire'} />

      <BigLabel>3. Le thème</BigLabel>
      <BigChoice options={courseThemes.map((t) => ({ value: t, label: t }))} value={category} onChange={setCategory} />
      {showNewTheme ? (
        <RavCard style={{ marginTop: 10, borderColor: c.primary, borderWidth: 2 }}>
          <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 8 }}>Nouveau thème</Text>
          <BigInput value={newTheme} onChangeText={setNewTheme} placeholder="Nom du nouveau thème" />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <BigButton label="Créer le thème" icon="checkmark" onPress={createTheme} disabled={!newTheme.trim()} style={{ flex: 1 }} />
            <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowNewTheme(false)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
          </View>
        </RavCard>
      ) : (
        <Pressable onPress={() => setShowNewTheme(true)} style={[styles.addTheme, { borderColor: c.primary }]}>
          <Ionicons name="add-circle" size={22} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: '800', fontSize: 17 }}>Ajouter un thème</Text>
        </Pressable>
      )}

      <BigLabel hint={`Vidéo, photo ou audio : ${tl.toLowerCase()} peut aussi se dire de vive voix. Facultatif.`}>4. Une vidéo, une photo ou un audio</BigLabel>
      {media ? (
        <RavCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.success, borderWidth: 2 }}>
          <View style={[styles.mediaIcon, { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name={mediaMeta[media.type].icon} size={30} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{media.name}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small }}>
              {mediaMeta[media.type].label}
              {media.duration ? ` · ${media.duration}` : ''} · prêt à partager
            </Text>
          </View>
          <Pressable onPress={() => setMedia(null)} hitSlop={8} style={[styles.remove, { backgroundColor: c.danger + '18' }]}>
            <Ionicons name="close" size={22} color={c.danger} />
          </Pressable>
        </RavCard>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(Object.keys(mediaMeta) as MediaType[]).map((t) => (
            <Pressable key={t} onPress={() => attach(t)} disabled={!!loadingMedia} style={({ pressed }) => [styles.mediaBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
              <MaterialCommunityIcons name={loadingMedia === t ? 'progress-clock' : mediaMeta[t].icon} size={34} color={c.primary} />
              <Text style={{ color: c.text, fontSize: 17, fontWeight: '800', marginTop: 6 }}>{loadingMedia === t ? 'Chargement…' : mediaMeta[t].label}</Text>
              <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center' }}>{mediaMeta[t].hint}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <BigLabel hint="Écrivez comme vous parlez. Sautez une ligne entre les paragraphes. Une ligne courte devient un titre de partie.">5. Votre texte</BigLabel>
      <BigInput value={text} onChangeText={setText} onSelectionChange={setSelection} multiline placeholder={media ? 'Quelques mots pour présenter votre vidéo ou votre audio…' : 'Écrivez ici…'} />
      <FormatToolbar text={text} selection={selection} onChange={setText} />
      <AiAssist text={text} onAccept={setText} />

      {title.trim() || text.trim() || media ? (
        <RavCard style={{ marginTop: 22 }}>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, fontWeight: '700', marginBottom: 10 }}>APERÇU CHEZ LES {seed.memberLabel.toUpperCase()}S</Text>
          <RavByline />
          {title ? <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 12 }}>{title}</Text> : null}
          {subtitle ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4 }}>{subtitle}</Text> : null}
          {media ? (
            <View style={[styles.mediaPreview, { backgroundColor: '#111827' }]}>
              <MaterialCommunityIcons name={media.type === 'audio' ? 'play-circle' : media.type === 'photo' ? 'image' : 'play-circle'} size={48} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 6 }}>
                {mediaMeta[media.type].label}
                {media.duration ? ` · ${media.duration}` : ''}
              </Text>
            </View>
          ) : null}
          {text ? <Text style={{ color: c.text, fontSize: 17, lineHeight: 27, marginTop: 10 }}>{renderRich(text)}</Text> : null}
        </RavCard>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <BigButton
          label={`Partager avec les ${seed.memberLabel}s`}
          icon="send"
          disabled={!canPublish}
          onPress={() => {
            addCourse({ title: title.trim(), subtitle: subtitle.trim(), category, text: text.trim(), media: media ?? undefined });
            setPublished(true);
          }}
        />
        {!canPublish ? (
          <Text style={{ color: c.textMuted, fontSize: BIG.small, textAlign: 'center', marginTop: 10 }}>
            {media ? 'Il manque un titre ou quelques mots de présentation.' : 'Il manque un titre ou le texte est trop court.'}
          </Text>
        ) : null}
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  addTheme: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', marginTop: 10, minHeight: 52 },
  mediaBtn: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 2, minHeight: 110 },
  mediaIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  remove: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mediaPreview: { borderRadius: 14, padding: 24, alignItems: 'center', marginTop: 12 },
});
