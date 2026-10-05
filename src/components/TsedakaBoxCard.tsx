import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { Card, Muted, Button, Chip } from './ui';
import { BOX_THRESHOLD, COIN_CHOICES, DEFAULT_COIN, RULES } from '../config/gamification';
import { formatShort } from '../utils/time';

// La boîte de tsedaka : chaque jour on y met une pièce (sans payer), la série de tsedaka avance ; quand la boîte
// atteint le seuil (entre le minimum Stripe et celui de Grow), on la vide en un seul paiement, qui rapporte des points.
export function TsedakaBoxCard({ compact, onEmpty }: { compact?: boolean; onEmpty: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { ora, seed, box, putCoin, setBoxSettings } = useAppState();
  const [settings, setSettings] = useState(false);
  const cur = seed.currency;
  const threshold = BOX_THRESHOLD(cur);
  const coin = box.coinAmount ?? DEFAULT_COIN(cur);
  const ratio = Math.min(1, box.balance / threshold);
  const full = box.balance >= threshold;
  const today = ora.tsedakaToday;
  const pending = box.coins.length;
  const fmt = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} ${cur}`;

  const gauge = (
    <View style={[styles.box, { borderColor: full ? c.success : c.border, backgroundColor: c.surface }]}>
      <View style={[styles.fill, { height: `${Math.max(8, ratio * 100)}%`, backgroundColor: full ? c.success : c.secondary }]} />
      <MaterialCommunityIcons name="gift-outline" size={compact ? 26 : 34} color={c.text} style={{ zIndex: 1 }} />
    </View>
  );

  if (compact) {
    return (
      <Pressable onPress={full ? onEmpty : () => putCoin()} style={[styles.compact, { borderColor: full ? c.success : c.border }]}>
        {gauge}
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontWeight: '800' }}>Boîte de {seed.alms.name.toLowerCase()} : {fmt(box.balance)} / {fmt(threshold)}</Text>
          <Muted style={{ fontSize: 12 }}>{full ? `Pleine ! Videz-la : +${RULES.boxEmptied} points.` : today ? 'Pièce du jour mise. À demain.' : `Touchez pour mettre la pièce du jour (${fmt(coin)}).`}</Muted>
        </View>
        <MaterialCommunityIcons name={full ? 'cash-fast' : 'plus-circle'} size={24} color={full ? c.success : c.primary} />
      </Pressable>
    );
  }

  return (
    <Card style={{ borderColor: full ? c.success : c.border, borderWidth: full ? 2 : 1, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {gauge}
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontWeight: '900', fontSize: 17 }}>Ma boîte de {seed.alms.name.toLowerCase()}</Text>
          <Text style={{ color: full ? c.success : c.primary, fontWeight: '800', fontSize: 22 }}>{fmt(box.balance)} <Muted style={{ fontSize: 13 }}>/ {fmt(threshold)}</Muted></Text>
          <Muted style={{ fontSize: 12 }}>
            {pending} pièce{pending > 1 ? 's' : ''} dans la boîte{box.emptied > 0 ? ` · vidée ${box.emptied} fois` : ''}
          </Muted>
        </View>
      </View>

      {full ? (
        <View style={[styles.note, { backgroundColor: c.success + '18' }]}>
          <MaterialCommunityIcons name="party-popper" size={20} color={c.success} />
          <Text style={{ color: c.text, fontSize: 13, flex: 1, fontWeight: '700' }}>La boîte est pleine ! Videz-la en un seul paiement : +{RULES.boxEmptied} points, et les points du don.</Text>
        </View>
      ) : (
        <Muted style={{ fontSize: 12 }}>
          Une pièce par jour, même petite, fait avancer votre série de {seed.alms.name.toLowerCase()} — sans payer tout de suite. Dès {fmt(threshold)}, vous videz la boîte en un seul geste (les prestataires de paiement refusent les très petits montants).
        </Muted>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          label={today ? 'Pièce du jour mise ✓' : `Mettre ${fmt(coin)}`}
          icon={today ? 'checkmark-circle' : 'add-circle'}
          variant={today ? 'secondary' : 'primary'}
          disabled={today}
          onPress={() => putCoin()}
          style={{ flex: 1 }}
        />
        {full ? <Button label="Vider la boîte" icon="cash" onPress={onEmpty} style={{ flex: 1 }} /> : null}
      </View>

      {box.repairs.some((r) => !r.paid) ? (
        <Muted style={{ fontSize: 12 }}>
          {box.repairs.filter((r) => !r.paid).map((r) => `Rachat de série (${r.days} jour${r.days > 1 ? 's' : ''}, ${formatShort(r.from)}) : ${fmt(r.amount)}`).join(' · ')}
        </Muted>
      ) : null}

      <Pressable onPress={() => setSettings((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <MaterialCommunityIcons name={settings ? 'chevron-up' : 'cog-outline'} size={18} color={c.textMuted} />
        <Muted style={{ fontSize: 12 }}>Réglages de la boîte</Muted>
      </Pressable>
      {settings ? (
        <View style={{ gap: 10 }}>
          <View>
            <Muted style={{ fontSize: 12, marginBottom: 6 }}>Pièce du jour</Muted>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {COIN_CHOICES(cur).map((v) => (
                <Chip key={v} label={fmt(v)} active={coin === v} onPress={() => setBoxSettings({ coinAmount: v })} />
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}>Pièce automatique</Text>
              <Muted style={{ fontSize: 12 }}>Chaque jour où vous utilisez l’application, la pièce est mise toute seule.</Muted>
            </View>
            <Switch value={!!box.autoCoin} onValueChange={(v) => setBoxSettings({ autoCoin: v })} trackColor={{ true: c.primary }} />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  box: { width: 64, height: 64, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, right: 0, bottom: 0, opacity: 0.35 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 },
});
