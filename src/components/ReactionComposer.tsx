import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { BigButton, BigInput, BIG } from '../screens/rav/RavUi';

// Réaction du responsable à un fidèle : un like, un mot, un message audio ou une vidéo de 5 secondes.
// Tout arrive dans la conversation du fidèle (onglet Questions), comme un message du responsable.
type Mode = 'idle' | 'text' | 'audio' | 'video' | 'sending' | 'sent' | 'error';
const VIDEO_MAX_MS = 6000;

export function ReactionComposer({ memberUid, memberName, about, onDone }: { memberUid: string; memberName: string; about?: string; onDone?: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { reactToMember } = useAppState();
  const [mode, setMode] = useState<Mode>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioMs, setAudioMs] = useState(0);
  const startedAt = useRef(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder, 250);
  const preview = useAudioPlayer(audioUri ?? undefined);
  const firstName = memberName.split(' ')[0];

  // « Envoyé ✓ » 2 secondes, puis on referme.
  useEffect(() => {
    if (mode !== 'sent') return;
    const t = setTimeout(() => {
      setMode('idle');
      onDone?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [mode, onDone]);

  const send = async (input: Parameters<typeof reactToMember>[0]) => {
    setMode('sending');
    setError(null);
    try {
      await reactToMember(input);
      setMode('sent');
    } catch (e) {
      setError((e as Error)?.message ?? 'Envoi impossible.');
      setMode('error');
    }
  };

  const base = { memberUid, memberName, about };

  const startAudio = async () => {
    setError(null);
    setAudioUri(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('Micro refusé : autorisez le micro dans les réglages pour enregistrer un message.');
        setMode('error');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      setMode('audio');
    } catch (e) {
      setError(`Enregistrement impossible : ${(e as Error)?.message ?? 'erreur'}`);
      setMode('error');
    }
  };

  const stopAudio = async () => {
    try {
      await recorder.stop();
      setAudioMs(Date.now() - startedAt.current);
      setAudioUri(recorder.uri);
      await setAudioModeAsync({ allowsRecording: false });
    } catch (e) {
      setError(`Arrêt impossible : ${(e as Error)?.message ?? 'erreur'}`);
      setMode('error');
    }
  };

  const pickVideo = async () => {
    setError(null);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (Platform.OS === 'web') {
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.5 });
      } else {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError('Caméra refusée : autorisez la caméra pour filmer un message.');
          setMode('error');
          return;
        }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: 5, quality: 0.5 });
      }
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const durationMs = asset.duration ?? undefined;
      if (durationMs && durationMs > VIDEO_MAX_MS) {
        setError(`Vidéo trop longue (${Math.round(durationMs / 1000)} s) : 5 secondes maximum.`);
        setMode('error');
        return;
      }
      await send({ ...base, kind: 'video', mediaUri: asset.uri, durationMs });
    } catch (e) {
      setError(`Vidéo impossible : ${(e as Error)?.message ?? 'erreur'}`);
      setMode('error');
    }
  };

  const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  if (mode === 'sent') {
    return (
      <View style={[styles.box, { backgroundColor: c.success + '18', borderColor: c.success }]}>
        <Ionicons name="checkmark-circle" size={30} color={c.success} />
        <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Envoyé ✓ · {firstName} le reçoit dans sa messagerie</Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border, flexDirection: 'column', alignItems: 'stretch' }]}>
      {about ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 8 }}>Réagir à {about} · pour {firstName}</Text> : null}

      {mode === 'idle' || mode === 'error' || mode === 'sending' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Big label="👍 Like" onPress={() => send({ ...base, kind: 'like' })} disabled={mode === 'sending'} />
          <Big label="💬 Texte" onPress={() => setMode('text')} disabled={mode === 'sending'} />
          <Big label="🎙️ Audio" onPress={startAudio} disabled={mode === 'sending'} />
          <Big label="🎬 Vidéo 5 s" onPress={pickVideo} disabled={mode === 'sending'} />
        </View>
      ) : null}

      {mode === 'sending' ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 8 }}>Envoi en cours…</Text> : null}
      {error ? <Text style={{ color: c.danger, fontSize: BIG.small, marginTop: 8 }}>{error}</Text> : null}

      {mode === 'text' ? (
        <View style={{ gap: 8, marginTop: 4 }}>
          <BigInput value={text} onChangeText={setText} multiline placeholder={`Un mot pour ${firstName}…`} style={{ minHeight: 100 }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <BigButton label="Envoyer" icon="send" disabled={text.trim().length < 2} onPress={() => { send({ ...base, kind: 'text', text: text.trim() }); setText(''); }} style={{ flex: 1 }} />
            <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setMode('idle')} style={{ borderWidth: 1, borderColor: c.border }} />
          </View>
        </View>
      ) : null}

      {mode === 'audio' ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          {!audioUri ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.dot, { backgroundColor: c.danger }]} />
                <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Enregistrement… {fmt(recState.durationMillis ?? Date.now() - startedAt.current)}</Text>
              </View>
              <BigButton label="Arrêter" icon="stop-circle" color={c.danger} onPress={stopAudio} />
            </>
          ) : (
            <>
              <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Message de {fmt(audioMs)}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <BigButton label="Écouter" icon="play" color={c.primaryLight} textColor={c.primary} onPress={() => { try { preview.seekTo(0); preview.play(); } catch { /* lecture indisponible */ } }} style={{ flex: 1 }} />
                <BigButton label="Refaire" icon="refresh" color={c.background} textColor={c.textMuted} onPress={startAudio} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <BigButton label="Envoyer" icon="send" onPress={() => send({ ...base, kind: 'audio', mediaUri: audioUri, durationMs: audioMs })} style={{ flex: 1 }} />
                <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => { setAudioUri(null); setMode('idle'); }} style={{ borderWidth: 1, borderColor: c.border }} />
              </View>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

function Big({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.big, { backgroundColor: c.primaryLight, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}>
      <Text style={{ color: c.primary, fontSize: 18, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1.5, marginTop: 8 },
  big: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, minHeight: 54, justifyContent: 'center', flexGrow: 1, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
