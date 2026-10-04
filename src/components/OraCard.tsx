import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { Aura } from './Aura';
import { ProgressBar } from './ProgressBar';
import { Card, Muted, Button } from './ui';
import { money } from '../utils/time';

// Carte « Mon ora » : un niveau qui grandit sans fin, deux jauges (assiduité, générosité),
// les titres obtenus et le prochain pas pour gagner des points aujourd'hui.
export function OraCard({ onDonate, onAttestation, onLearn }: { onDonate: () => void; onAttestation: () => void; onLearn?: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { ora, seed } = useAppState();
  const g = seed.gamification;
  const missing = ora.nextLevelPoints - ora.points;
  const assidTarget = ora.nextAssiduityTitle?.days ?? 365;
  const genTarget = ora.nextGenerosityTitle?.amount ?? ora.given12m;

  return (
    <Card style={{ paddingVertical: 22 }}>
      <Text style={[styles.title, { color: c.textMuted }]}>{g.title}</Text>
      <View style={{ alignItems: 'center' }}>
        <Aura levelIndex={ora.tierIndex} progress={ora.progress} size={210} icon={g.icon} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <Text style={{ color: c.text, fontSize: 34, fontWeight: '900' }}>Niveau {ora.level}</Text>
          <Text style={{ color: c.primary, fontSize: 18, fontWeight: '800' }}>{ora.tier.name}</Text>
          {ora.tier.hebrew ? <Text style={{ color: c.textMuted, fontSize: 16 }}>{ora.tier.hebrew}</Text> : null}
        </View>
        <Muted style={{ textAlign: 'center', marginTop: 2, maxWidth: 320 }}>{ora.tier.description}</Muted>
      </View>

      <View style={{ marginTop: 16 }}>
        <View style={styles.between}>
          <Text style={{ color: c.text, fontWeight: '800' }}>{ora.points} points</Text>
          <Muted>{missing} avant le niveau {ora.level + 1}</Muted>
        </View>
        <ProgressBar progress={ora.progress} />
      </View>

      {/* Deux jauges */}
      <View style={{ marginTop: 16, gap: 12 }}>
        <Gauge
          icon="calendar-check"
          color={c.primary}
          label="Assiduité"
          value={`${ora.assiduityPoints} pts`}
          right={ora.assiduityTitle ? `Titre : ${ora.assiduityTitle}` : ora.nextAssiduityTitle ? `${ora.activeDays12m}/${assidTarget} jours pour « ${ora.nextAssiduityTitle.name} »` : `${ora.activeDays12m} jours actifs`}
          progress={Math.min(1, ora.activeDays12m / assidTarget)}
          sub={`${ora.activeDays12m} jours actifs sur 12 mois · série en cours : ${ora.streakDays} jour${ora.streakDays > 1 ? 's' : ''} · ${ora.coursesRead} cours lu${ora.coursesRead > 1 ? 's' : ''} · ${ora.questionsAsked} question${ora.questionsAsked > 1 ? 's' : ''}`}
        />
        <Gauge
          icon="hand-heart"
          color={c.secondary}
          label="Générosité"
          value={`${ora.generosityPoints} pts`}
          right={ora.generosityTitle ? `Titre : ${ora.generosityTitle}` : ora.nextGenerosityTitle ? `${money(ora.given12m)} / ${money(ora.nextGenerosityTitle.amount)} pour « ${ora.nextGenerosityTitle.name} »` : money(ora.given12m)}
          progress={genTarget ? Math.min(1, ora.given12m / genTarget) : 0}
          sub={`${money(ora.given12m)} donnés sur 12 mois · ${seed.alms.name} : 4 pts par tranche, ${seed.tithe?.name ?? 'don régulier'} : 10 pts par tranche`}
        />
      </View>

      {/* Titres */}
      <View style={styles.badges}>
        {ora.assiduityTitle ? <Badge color={c.primary} label={ora.assiduityTitle} icon="ribbon" /> : null}
        {ora.generosityTitle ? <Badge color={c.secondary} label={ora.generosityTitle} icon="heart" /> : null}
        {ora.streakDays >= 7 ? <Badge color={c.success} label={`Série ${ora.streakDays} j`} icon="flame" /> : null}
        {!ora.assiduityTitle && !ora.generosityTitle && ora.streakDays < 7 ? <Muted style={{ fontSize: 12 }}>Vos titres apparaîtront ici : Régulier dès 30 jours actifs, Généreux dès {money(ora.nextGenerosityTitle?.amount ?? 180)} donnés.</Muted> : null}
      </View>

      {/* Prochain pas */}
      <View style={[styles.next, { backgroundColor: c.primaryLight }]}>
        <Ionicons name="sparkles" size={18} color={c.primary} />
        <Text style={{ color: c.primary, fontWeight: '700', flex: 1, fontSize: 13 }}>{ora.nextStep}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <Button label={g.ctaLabel} icon="heart" onPress={onDonate} style={{ flexGrow: 1 }} />
        <Button label="Mon attestation" icon="document-text-outline" variant="secondary" onPress={onAttestation} style={{ flexGrow: 1 }} />
      </View>
      {onLearn ? (
        <Pressable onPress={onLearn} style={{ marginTop: 10, alignSelf: 'center' }}>
          <Muted style={{ fontSize: 12, textDecorationLine: 'underline' }}>Comment gagne-t-on des points ?</Muted>
        </Pressable>
      ) : null}
    </Card>
  );
}

function Gauge({ icon, color, label, value, right, progress, sub }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; label: string; value: string; right: string; progress: number; sub: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View>
      <View style={styles.between}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
          <Text style={{ color: c.text, fontWeight: '800' }}>{label}</Text>
          <Text style={{ color: c.textMuted }}>{value}</Text>
        </View>
        <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{right}</Text>
      </View>
      <ProgressBar progress={progress} color={color} />
      <Muted style={{ fontSize: 12, marginTop: 4 }}>{sub}</Muted>
    </View>
  );
}

function Badge({ color, label, icon }: { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '1F' }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={{ color, fontWeight: '800', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 12, letterSpacing: 2, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
