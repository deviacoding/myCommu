import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { AiAssist, AiBanner } from '../../components/AiAssist';
import { RavByline } from '../../components/DvarTorah';
import { CourseCategory } from '../../types';
import { RavScreen, BigLabel, BigInput, BigButton, BigChoice, Done, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavDvarTorah'>;

const categories: { value: CourseCategory; label: string }[] = [
  { value: 'Paracha', label: 'Paracha de la semaine' },
  { value: 'Fête', label: 'Fête' },
  { value: 'Halakha', label: 'Halakha' },
  { value: 'Moussar', label: 'Moussar' },
  { value: 'Michna', label: 'Michna' },
];

export function RavDvarTorahScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { addCourse, courses } = useAppState();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Paracha');
  const [text, setText] = useState('');
  const [published, setPublished] = useState(false);

  const canPublish = title.trim().length > 3 && text.trim().length > 40;

  if (published) {
    return (
      <RavScreen title="Dvar Torah publié" onBack={() => navigation.goBack()}>
        <Done title="C’est publié !" text="Votre dvar Torah s’affiche maintenant en premier chez tous les fidèles, avec votre photo.">
          <View style={{ alignSelf: 'stretch', marginTop: 18, gap: 10 }}>
            <BigButton label="Écrire un autre dvar Torah" icon="create" onPress={() => { setTitle(''); setSubtitle(''); setText(''); setPublished(false); }} />
            <BigButton label="Retour à l’accueil" icon="home" color={c.primaryLight} textColor={c.primary} onPress={() => navigation.goBack()} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  return (
    <RavScreen title="Écrire un dvar Torah" subtitle={`${courses.length} déjà publiés`} onBack={() => navigation.goBack()}>
      <AiBanner compact />

      <BigLabel hint="Exemple : Souccot, la fragilité comme refuge">1. Le titre</BigLabel>
      <BigInput value={title} onChangeText={setTitle} placeholder="Titre de votre dvar Torah" />

      <BigLabel hint="Une phrase pour donner envie de lire (facultatif)">2. Le sous-titre</BigLabel>
      <BigInput value={subtitle} onChangeText={setSubtitle} placeholder="Pourquoi quitter sa maison une semaine après Yom Kippour" />

      <BigLabel>3. Le thème</BigLabel>
      <BigChoice options={categories} value={category} onChange={setCategory} />

      <BigLabel hint="Écrivez comme vous parlez. Sautez une ligne entre les paragraphes. Une ligne courte devient un titre de partie.">4. Votre texte</BigLabel>
      <BigInput value={text} onChangeText={setText} multiline placeholder="Cette semaine, la paracha nous enseigne…" />
      <AiAssist text={text} onAccept={setText} />

      {title.trim() ? (
        <RavCard style={{ marginTop: 22 }}>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, fontWeight: '700', marginBottom: 10 }}>APERÇU CHEZ LES FIDÈLES</Text>
          <RavByline />
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 12 }}>{title}</Text>
          {subtitle ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4 }}>{subtitle}</Text> : null}
          {text ? <Text style={{ color: c.text, fontSize: 17, lineHeight: 26, marginTop: 10 }} numberOfLines={4}>{text}</Text> : null}
        </RavCard>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <BigButton
          label="Publier pour les fidèles"
          icon="send"
          disabled={!canPublish}
          onPress={() => {
            addCourse({ title: title.trim(), subtitle: subtitle.trim(), category, text: text.trim() });
            setPublished(true);
          }}
        />
        {!canPublish ? (
          <Text style={{ color: c.textMuted, fontSize: BIG.small, textAlign: 'center', marginTop: 10 }}>
            Il manque un titre ou le texte est trop court.
          </Text>
        ) : null}
      </View>
    </RavScreen>
  );
}
