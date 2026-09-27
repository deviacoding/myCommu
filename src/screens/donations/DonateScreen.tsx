import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Aura } from '../../components/Aura';
import { Card, Chip, Muted, Button } from '../../components/ui';
import { causes, quickAmounts } from '../../mocks/donations';
import { money } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'Donate'>;

const titles = {
  tsedaka: { title: 'Donner la tsedaka', sub: 'Don ponctuel' },
  maasser: { title: 'Verser mon maasser', sub: 'Dixième du mois' },
  engagement: { title: 'Payer mon engagement', sub: 'Promesse de don' },
};

export function DonateScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { type, pledgeId } = route.params;
  const { donate, pledges, levelIndex, levelProgress, level, nextLevel, points } = useAppState();
  const pledge = pledges.find((p) => p.id === pledgeId);

  const [amount, setAmount] = useState<number>(route.params.amount ?? 18);
  const [custom, setCustom] = useState('');
  const [cause, setCause] = useState(pledge ? pledge.label : causes[0]);
  const [dedication, setDedication] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const [pointsBefore] = useState(points);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const t = titles[type];

  const confirm = () => {
    const gained = donate({ type, amount, cause, dedication: dedication.trim() || undefined, pledgeId });
    setDone(gained);
  };

  if (done !== null) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 30 }]}>
          <Aura levelIndex={levelIndex} progress={levelProgress} size={200} />
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 18 }}>Merci pour votre don</Text>
          <Text style={{ color: c.primary, fontSize: 30, fontWeight: '900', marginTop: 4 }}>{money(done)}</Text>
          <Muted style={{ textAlign: 'center', marginTop: 8, maxWidth: 320 }}>
            {cause}
            {dedication.trim() ? ` · ${dedication.trim()}` : ''}
          </Muted>
          <Card style={{ marginTop: 24, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="creation" size={28} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>+{done} points d’ora</Text>
              <Muted>
                {pointsBefore} → {points} · niveau {level.name}
                {nextLevel ? ` · prochain : ${nextLevel.name} à ${nextLevel.min}` : ''}
              </Muted>
            </View>
          </Card>
          <Button label="Voir mon ora" icon="person-outline" onPress={() => navigation.navigate('MainTabs', { screen: 'AccountTab' })} style={{ alignSelf: 'stretch' }} />
          <Button label="Fermer" variant="ghost" onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch', marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title={t.title} subtitle={t.sub} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {pledge ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="document-text-outline" size={26} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{pledge.label}</Text>
              <Muted>{pledge.origin}</Muted>
            </View>
          </Card>
        ) : null}

        <Text style={[styles.label, { color: c.text }]}>Montant</Text>
        <View style={styles.amounts}>
          {(pledge ? [pledge.amount] : quickAmounts).map((a) => (
            <Pressable
              key={a}
              onPress={() => {
                setAmount(a);
                setCustom('');
              }}
              style={[styles.amount, { borderColor: amount === a && !custom ? c.primary : c.border, backgroundColor: amount === a && !custom ? c.primary : c.surface }]}
            >
              <Text style={{ color: amount === a && !custom ? c.textOnPrimary : c.text, fontWeight: '800', fontSize: 16 }}>{a} ₪</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={custom}
          onChangeText={(v) => {
            setCustom(v);
            const n = parseInt(v.replace(/\D/g, ''), 10);
            if (Number.isFinite(n) && n > 0) setAmount(n);
          }}
          keyboardType="number-pad"
          placeholder="Autre montant en ₪"
          placeholderTextColor={c.textMuted}
          style={[...inputStyle, { marginTop: 10 }]}
        />

        {!pledge ? (
          <>
            <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>Destination</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {causes.map((x) => (
                <Chip key={x} label={x} active={cause === x} onPress={() => setCause(x)} />
              ))}
            </View>
          </>
        ) : null}

        <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>Dédicace (facultatif)</Text>
        <TextInput
          value={dedication}
          onChangeText={setDedication}
          placeholder="Leilouy nichmat… / Refoua chelema pour…"
          placeholderTextColor={c.textMuted}
          style={inputStyle}
        />

        <Card style={{ marginTop: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="card" size={22} color={c.primary} />
            <Text style={{ color: c.text, fontWeight: '600', flex: 1 }}>Visa •••• 4242</Text>
            <Text style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}>Modifier</Text>
          </View>
          <Muted>Reçu fiscal envoyé par email après chaque don.</Muted>
        </Card>

        <Button label={`Confirmer le don de ${money(amount)}`} icon="heart" onPress={confirm} />
        <Muted style={{ textAlign: 'center', marginTop: 12 }}>Maquette : aucun paiement réel n’est effectué.</Muted>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amount: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
});
