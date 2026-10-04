import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommunityId } from '../../types';
import { themes } from '../../theme/themes';
import { useAuth } from '../../state/AuthContext';
import { useI18n } from '../../i18n';
import { ReligionIcon } from '../../components/ReligionIcon';
import { LanguagePicker } from '../../components/LanguagePicker';

// Première connexion (Google) : on ne déduit pas la confession, on la demande.
// Palette neutre volontairement : aucun thème de confession n'est encore choisi.
const NEUTRAL = { bg: '#F4F5F8', surface: '#FFFFFF', text: '#1F2430', muted: '#5D6472', border: '#D9DCE3', accent: '#2F3E5C', accentSoft: '#E6EAF2' };
const ORDER: CommunityId[] = ['jewish', 'christian', 'muslim', 'buddhist'];

export function ChooseReligionScreen() {
  const { t } = useI18n();
  const { user, completeSetup, signOut } = useAuth();
  const [religion, setReligion] = useState<CommunityId | null>(null);
  const [intent, setIntent] = useState<'member' | 'leader'>('member');
  const tint = religion ? themes[religion].colors.primary : NEUTRAL.accent;
  const firstName = user.name.split(' ')[0];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: NEUTRAL.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <LanguagePicker compact />
        <Text style={[styles.hello, { color: NEUTRAL.muted }]}>{t('setup.hello', { name: firstName })}</Text>
        <Text style={[styles.title, { color: NEUTRAL.text }]}>{t('setup.title')}</Text>
        <Text style={[styles.intro, { color: NEUTRAL.muted }]}>{t('setup.intro')}</Text>

        {ORDER.map((id) => {
          const active = religion === id;
          const color = themes[id].colors.primary;
          return (
            <Pressable
              key={id}
              onPress={() => setReligion(id)}
              accessibilityRole="radio"
              aria-checked={active}
              style={({ pressed }) => [styles.card, { borderColor: active ? color : NEUTRAL.border, backgroundColor: active ? color : NEUTRAL.surface, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.icon, { backgroundColor: active ? 'rgba(255,255,255,0.18)' : color + '1A' }]}>
                <ReligionIcon community={id} size={34} color={active ? '#fff' : color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: active ? '#fff' : NEUTRAL.text, fontSize: 22, fontWeight: '900' }}>{t(`religions.${id}.label`)}</Text>
                <Text style={{ color: active ? 'rgba(255,255,255,0.85)' : NEUTRAL.muted, fontSize: 13, marginTop: 2 }}>{t(`religions.${id}.community`)}</Text>
              </View>
              <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={active ? '#fff' : NEUTRAL.border} />
            </Pressable>
          );
        })}

        <Text style={[styles.label, { color: NEUTRAL.text }]}>{t('setup.role')}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['member', 'leader'] as const).map((k) => {
            const active = intent === k;
            return (
              <Pressable key={k} onPress={() => setIntent(k)} accessibilityRole="radio" aria-checked={active} style={[styles.intent, { borderColor: active ? tint : NEUTRAL.border, backgroundColor: active ? tint + '14' : NEUTRAL.surface }]}>
                <Ionicons name={k === 'member' ? 'people' : 'ribbon'} size={24} color={active ? tint : NEUTRAL.muted} />
                <Text style={{ color: active ? tint : NEUTRAL.text, fontWeight: '800', fontSize: 15, textAlign: 'center' }}>{k === 'member' ? t('auth.intentMember') : t('auth.intentLeader')}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ color: NEUTRAL.muted, fontSize: 12, marginTop: 8 }}>{intent === 'leader' ? t('auth.intentLeaderHint') : t('auth.intentMemberHint')}</Text>

        <Pressable
          disabled={!religion}
          onPress={() => religion && completeSetup({ community: religion, intent })}
          style={({ pressed }) => [styles.cta, { backgroundColor: tint, opacity: !religion ? 0.4 : pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{t('setup.continue')}</Text>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </Pressable>
        <Pressable onPress={signOut} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: NEUTRAL.muted, fontSize: 13, fontWeight: '600' }}>{t('setup.signOut')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, maxWidth: 520, width: '100%', alignSelf: 'center' },
  hello: { fontSize: 14, fontWeight: '600', marginTop: 18 },
  title: { fontSize: 30, fontWeight: '900', marginTop: 4 },
  intro: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 2, marginBottom: 12, minHeight: 86 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  intent: { flex: 1, alignItems: 'center', gap: 6, borderWidth: 2, borderRadius: 16, padding: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 24 },
});
