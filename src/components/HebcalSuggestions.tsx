import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { RavCard, BigButton, BigInput, BIG } from '../screens/rav/RavUi';
import { jewishSuggestions, ScheduleSuggestion, SUGGESTION_LABELS, SuggestionKind } from '../utils/hebcal';
import { capitalize, formatLong } from '../utils/time';

type State = 'idle' | 'locating' | 'ready' | 'denied';

const KIND_ICON: Record<SuggestionKind, React.ComponentProps<typeof Ionicons>['name']> = {
  candles: 'flame',
  havdalah: 'moon',
  fast: 'water-outline',
  holiday: 'star',
  roshchodesh: 'ellipse-outline',
  parasha: 'book-outline',
};

// Propose au responsable juif les horaires des prochaines semaines (calculés hors ligne avec Hebcal)
// pour qu'il n'ait rien à taper : chaque proposition s'ajoute d'un geste, ou toutes d'un coup.
export function HebcalSuggestions() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { congregation, myDayEntries, addDayEntries } = useAppState();
  const [state, setState] = useState<State>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(congregation.coords ?? null);
  const [weeks, setWeeks] = useState(4);
  const [kinds, setKinds] = useState<Set<SuggestionKind>>(new Set(['candles', 'havdalah', 'fast', 'holiday']));
  const [justAdded, setJustAdded] = useState(0);
  // Proposition en cours de modification (nom ou heure ajustés avant publication).
  const [editing, setEditing] = useState<{ key: string; name: string; time: string } | null>(null);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  const suggestions = useMemo<ScheduleSuggestion[]>(() => {
    if (!coords || state !== 'ready') return [];
    try {
      return jewishSuggestions({ lat: coords.lat, lng: coords.lng, country: congregation.country, weeks }).filter((s) => kinds.has(s.kind));
    } catch (e) {
      console.warn('[hebcal]', (e as Error).message);
      return [];
    }
  }, [coords, state, congregation.country, weeks, kinds]);

  const published = useMemo(() => new Set(myDayEntries.map((e) => `${e.date}|${e.name}`)), [myDayEntries]);
  const isDone = (s: ScheduleSuggestion) => published.has(s.key) || addedKeys.has(s.key);
  const pending = suggestions.filter((s) => !isDone(s));

  const start = async () => {
    // La position de la communauté suffit ; sinon on demande celle du téléphone.
    if (congregation.coords) {
      setCoords(congregation.coords);
      setState('ready');
      return;
    }
    setState('locating');
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setState('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setState('ready');
    } catch {
      setState('denied');
    }
  };

  const add = (list: ScheduleSuggestion[]) => {
    const n = addDayEntries(list.map((s) => ({ date: s.date, name: s.name, time: s.time || '—' })));
    setAddedKeys((prev) => new Set([...prev, ...list.map((s) => s.key)]));
    setJustAdded(n);
    setTimeout(() => setJustAdded(0), 2500);
  };
  const validTime = (t: string) => t.trim() === '' || /^\d{1,2}:\d{2}$/.test(t.trim());

  const toggleKind = (k: SuggestionKind) =>
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  // Regroupement par jour pour une lecture rapide.
  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleSuggestion[]>();
    for (const s of suggestions) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    return [...map.entries()];
  }, [suggestions]);

  return (
    <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name="sparkles" size={30} color={c.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Horaires proposés automatiquement</Text>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>
            {state === 'idle' ? 'Allumage, sortie de Chabbat, jeûnes et fêtes calculés pour votre ville. Vous choisissez ce que vous publiez.' : null}
            {state === 'locating' ? 'Recherche de votre position…' : null}
            {state === 'denied' ? 'Position refusée. Renseignez l’adresse de la communauté (Courant et groupe → adresse) ou autorisez la position.' : null}
            {state === 'ready' ? `${pending.length} proposition${pending.length > 1 ? 's' : ''} à venir sur ${weeks} semaines · calculs Hebcal` : null}
          </Text>
        </View>
      </View>

      {state !== 'ready' ? (
        <BigButton label={state === 'locating' ? 'Patientez…' : 'Proposer les horaires de ma ville'} icon="navigate" disabled={state === 'locating'} onPress={start} style={{ marginTop: 12 }} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {(Object.keys(SUGGESTION_LABELS) as SuggestionKind[]).map((k) => {
              const active = kinds.has(k);
              return (
                <Pressable key={k} onPress={() => toggleKind(k)} accessibilityRole="checkbox" aria-checked={active} style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                  <Ionicons name={KIND_ICON[k]} size={16} color={active ? c.textOnPrimary : c.textMuted} />
                  <Text style={{ color: active ? c.textOnPrimary : c.text, fontWeight: '700', fontSize: 14 }}>{SUGGESTION_LABELS[k]}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {[2, 4, 8].map((w) => (
              <Pressable key={w} onPress={() => setWeeks(w)} style={[styles.chip, { backgroundColor: weeks === w ? c.primaryLight : c.surface, borderColor: weeks === w ? c.primary : c.border }]}>
                <Text style={{ color: weeks === w ? c.primary : c.text, fontWeight: '700', fontSize: 14 }}>{w} semaines</Text>
              </Pressable>
            ))}
          </View>

          {byDate.length === 0 ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 12 }}>Rien à proposer avec ces filtres.</Text> : null}
          {byDate.map(([date, list]) => (
            <View key={date} style={{ marginTop: 12 }}>
              <Text style={{ color: c.text, fontWeight: '900', fontSize: 15 }}>{capitalize(formatLong(date))}</Text>
              {list.map((s) => {
                const done = isDone(s);
                if (editing?.key === s.key) {
                  return (
                    <View key={s.key} style={[styles.row, { borderColor: c.border, flexDirection: 'column', alignItems: 'stretch', gap: 8 }]}>
                      <BigInput value={editing.name} onChangeText={(v) => setEditing({ ...editing, name: v })} placeholder="Nom de l’horaire" />
                      <BigInput value={editing.time} onChangeText={(v) => setEditing({ ...editing, time: v })} placeholder="Heure, ex. : 18:55 (vide = date sans heure)" />
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <BigButton
                          label="Ajouter ainsi"
                          icon="checkmark"
                          disabled={editing.name.trim().length < 2 || !validTime(editing.time)}
                          onPress={() => {
                            add([{ ...s, name: editing.name.trim(), time: editing.time.trim() }]);
                            setEditing(null);
                          }}
                          style={{ flex: 1 }}
                        />
                        <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setEditing(null)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
                      </View>
                    </View>
                  );
                }
                return (
                  <View key={s.key} style={[styles.row, { borderColor: c.border }]}>
                    <Ionicons name={KIND_ICON[s.kind]} size={18} color={c.primary} />
                    <Text style={{ color: c.text, fontSize: BIG.small, flex: 1 }}>{s.name}</Text>
                    {s.time ? <Text style={{ color: c.text, fontWeight: '800', fontSize: BIG.small }}>{s.time}</Text> : null}
                    {done ? (
                      <View style={[styles.added, { backgroundColor: c.success + '22' }]}>
                        <Ionicons name="checkmark" size={16} color={c.success} />
                        <Text style={{ color: c.success, fontWeight: '800', fontSize: 13 }}>Publié</Text>
                      </View>
                    ) : (
                      <>
                        <Pressable onPress={() => setEditing({ key: s.key, name: s.name, time: s.time })} hitSlop={6} style={[styles.editBtn, { backgroundColor: c.primaryLight }]} accessibilityLabel="Modifier avant d’ajouter">
                          <Ionicons name="pencil" size={16} color={c.primary} />
                        </Pressable>
                        <Pressable onPress={() => add([s])} style={[styles.addBtn, { backgroundColor: c.primary }]}>
                          <Ionicons name="add" size={18} color={c.textOnPrimary} />
                          <Text style={{ color: c.textOnPrimary, fontWeight: '800', fontSize: 13 }}>Ajouter</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {pending.length ? (
            <BigButton label={`Tout ajouter (${pending.length})`} icon="checkmark-done" onPress={() => add(pending)} style={{ marginTop: 14 }} />
          ) : byDate.length ? (
            <Text style={{ color: c.success, fontWeight: '800', fontSize: BIG.small, marginTop: 12 }}>Tout est déjà publié pour cette période.</Text>
          ) : null}
          {justAdded ? <Text style={{ color: c.success, fontWeight: '800', fontSize: BIG.small, marginTop: 8 }}>{justAdded} horaire{justAdded > 1 ? 's' : ''} ajouté{justAdded > 1 ? 's' : ''} au calendrier.</Text> : null}
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 10 }}>Calculs : Hebcal (hebcal.com). Allumage 18 min avant le coucher (40 à Jérusalem), sortie 42 min après. Le crayon permet de corriger le nom ou l’heure avant d’ajouter ; une fois publié, chaque horaire reste modifiable dans le calendrier ci-dessous.</Text>
        </>
      )}
    </RavCard>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10 },
  editBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  added: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
});
