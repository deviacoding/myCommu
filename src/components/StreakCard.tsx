import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { Card, Muted, Button } from './ui';
import { RULES, StreakRepair } from '../config/gamification';

// Carte de la série unique d'utilisation : horaires, agenda, cours, réponses, dons — un seul geste par jour suffit.
// Gels gagnés tous les 7 jours (max 2), consommés tout seuls si un jour est manqué ; jours de repos neutres ;
// rachat d'une série cassée par une petite tsedaka. Le ton reste rassurant : jamais une angoisse.
export function StreakCard({ compact, onRepair, onAct }: { compact?: boolean; onRepair: (repair: StreakRepair) => void; onAct?: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { ora, seed, quietDays } = useAppState();
  const s = ora.streak;
  const flame = s.todayDone ? c.success : s.todayQuiet ? c.textMuted : '#F59E0B';
  const status = s.todayQuiet
    ? 'Jour de repos : la série est en pause, rien à faire aujourd’hui.'
    : s.todayDone
      ? 'Geste du jour fait. À demain, sans pression.'
      : s.days > 0
        ? 'Un seul geste aujourd’hui suffit : les horaires, un cours, une réponse ou un don.'
        : 'Commencez une série : consultez les horaires ou lisez un cours aujourd’hui.';
  const freezes = Array.from({ length: RULES.streakFreezeMax });

  const body = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MaterialCommunityIcons name="fire" size={compact ? 28 : 34} color={flame} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: compact ? 15 : 17 }}>
            Série : {s.days} jour{s.days > 1 ? 's' : ''}
            {s.todayDone && !s.todayQuiet ? ' · geste du jour fait' : ''}
          </Text>
          <Muted style={{ marginTop: 2 }}>{status}</Muted>
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {freezes.map((_, i) => (
              <MaterialCommunityIcons key={i} name="snowflake" size={18} color={i < s.freezes ? '#38BDF8' : c.border} />
            ))}
          </View>
          <Muted style={{ fontSize: 10 }}>{s.freezes} gel{s.freezes > 1 ? 's' : ''}</Muted>
        </View>
      </View>

      {!compact ? (
        <View style={[styles.info, { backgroundColor: c.primaryLight }]}>
          <MaterialCommunityIcons name="snowflake" size={16} color="#38BDF8" />
          <Text style={{ color: c.primary, fontSize: 12, flex: 1 }}>
            Un gel est gagné tous les {RULES.streakFreezeEvery} jours de série (deux au plus en réserve). Si vous manquez un jour, il est utilisé tout seul : la série continue.
            {s.days > 0 ? ` Prochain gel dans ${s.nextFreezeIn} jour${s.nextFreezeIn > 1 ? 's' : ''}.` : ''}
            {quietDays.size > 0 ? ' Chabbat et jours de fête sont neutres : ils ne comptent pas et ne cassent rien.' : ''}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
        <Muted style={{ fontSize: 12 }}>Record : {Math.max(s.best, s.days)} jour{Math.max(s.best, s.days) > 1 ? 's' : ''}</Muted>
        <Muted style={{ fontSize: 12 }}>
          Série de {seed.alms.name.toLowerCase()} : {ora.tsedakaStreak} jour{ora.tsedakaStreak > 1 ? 's' : ''}
        </Muted>
        {s.freezesUsed > 0 ? <Muted style={{ fontSize: 12 }}>{s.freezesUsed} gel{s.freezesUsed > 1 ? 's' : ''} utilisé{s.freezesUsed > 1 ? 's' : ''} sur cette série</Muted> : null}
      </View>

      {s.repairable ? (
        <View style={[styles.repair, { borderColor: '#F59E0B', backgroundColor: '#F59E0B14' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="fire-off" size={20} color="#F59E0B" />
            <Text style={{ color: c.text, fontWeight: '800', flex: 1 }}>
              Votre série de {s.repairable.lostDays} jours s’est arrêtée ({s.repairable.missedDays} jour{s.repairable.missedDays > 1 ? 's' : ''} manqué{s.repairable.missedDays > 1 ? 's' : ''})
            </Text>
          </View>
          <Muted style={{ marginTop: 4 }}>
            Rachetez-la pour {s.repairable.cost} {seed.currency} : la somme va dans votre boîte de {seed.alms.name.toLowerCase()} (payée quand la boîte sera pleine) et la série reprend tout de suite.
          </Muted>
          <Button label="Racheter ma série" icon="refresh" onPress={() => onRepair(s.repairable!)} style={{ marginTop: 10 }} />
        </View>
      ) : null}
    </>
  );

  if (compact) {
    return (
      <Pressable onPress={onAct} disabled={!onAct} style={[styles.compact, { borderColor: c.border }]}>
        {body}
      </Pressable>
    );
  }
  return <Card style={{ borderColor: flame, borderWidth: 2 }}>{body}</Card>;
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginTop: 10 },
  repair: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginTop: 12 },
  compact: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
});
