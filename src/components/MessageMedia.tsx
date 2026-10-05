import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../theme/ThemeProvider';
import { QaMessage } from '../types';

// Rendu d'une réaction du responsable dans une conversation : un like, un audio, une vidéo de quelques secondes.
// Le texte du message est rendu par l'appelant ; ici, seulement la partie « média ».
export function MessageMedia({ message }: { message: QaMessage }) {
  if (message.kind === 'like') return <LikeCard text={message.text} />;
  if (message.kind === 'audio' && message.mediaUrl) return <AudioClip url={message.mediaUrl} durationMs={message.durationMs} />;
  if (message.kind === 'video' && message.mediaUrl) return <VideoClip url={message.mediaUrl} />;
  return null;
}

function LikeCard({ text }: { text: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.like, { backgroundColor: c.primaryLight }]}>
      <Text style={{ fontSize: 40 }}>👍</Text>
      <Text style={{ color: c.primary, fontWeight: '700', flex: 1 }}>{text.replace(/^👍\s*/, '')}</Text>
    </View>
  );
}

function fmt(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function AudioClip({ url, durationMs }: { url: string; durationMs?: number }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);
  const duration = status.duration && Number.isFinite(status.duration) && status.duration > 0 ? status.duration : (durationMs ?? 0) / 1000;
  const toggle = () => {
    try {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || (duration > 0 && status.currentTime >= duration - 0.2)) player.seekTo(0);
        player.play();
      }
    } catch {
      // lecture impossible (format non pris en charge) : rien de bloquant
    }
  };
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0;
  return (
    <Pressable onPress={toggle} style={[styles.audio, { borderColor: c.border, backgroundColor: c.surface }]}>
      <View style={[styles.play, { backgroundColor: c.primary }]}>
        <MaterialCommunityIcons name={status.playing ? 'pause' : 'play'} size={22} color={c.textOnPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontWeight: '700' }}>Message audio</Text>
        <View style={[styles.track, { backgroundColor: c.primaryLight }]}>
          <View style={[styles.fill, { backgroundColor: c.primary, width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Text style={{ color: c.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] }}>
        {fmt(status.currentTime)} / {fmt(duration)}
      </Text>
    </Pressable>
  );
}

function VideoClip({ url }: { url: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const player = useVideoPlayer({ uri: url }, (p) => {
    p.loop = false;
  });
  return (
    <View style={[styles.video, { borderColor: c.border, backgroundColor: '#000' }]}>
      <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9 }} nativeControls contentFit="contain" />
      <Pressable onPress={() => { try { player.play(); } catch { /* lecture refusée : l'utilisateur relance depuis les contrôles */ } }} style={[styles.videoBtn, { backgroundColor: c.primary }]}>
        <MaterialCommunityIcons name="play" size={16} color={c.textOnPrimary} />
        <Text style={{ color: c.textOnPrimary, fontWeight: '700', fontSize: 12 }}>Lire la vidéo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  like: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
  audio: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1 },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 3 },
  video: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', maxWidth: 320, width: '100%' },
  videoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', margin: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
});
