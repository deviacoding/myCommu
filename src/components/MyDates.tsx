import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthContext';
import { MemberDate, MemberDateType } from '../types';
import { Card, Chip, Muted, Button, SectionTitle } from './ui';
import { daysBetween, formatLong, capitalize, parseISODate } from '../utils/time';

export const dateTypeMeta: Record<MemberDateType, { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }> = {
  anniversaire: { label: 'Anniversaire', icon: 'cake-variant', color: '#DB2777' },
  azkara: { label: 'Souvenir', icon: 'candle', color: '#4B5563' },
  autre: { label: 'Autre', icon: 'calendar-star', color: '#2563EB' },
};

export function useDateTypeMeta() {
  const { seed } = useAppState();
  return {
    anniversaire: { ...dateTypeMeta.anniversaire, label: seed.dateTypeLabels.anniversaire },
    azkara: { ...dateTypeMeta.azkara, label: seed.dateTypeLabels.azkara },
    autre: { ...dateTypeMeta.autre, label: seed.dateTypeLabels.autre },
  } as typeof dateTypeMeta;
}

export function daysUntil(d: MemberDate): number {
  // Prochaine occurrence annuelle.
  const today = new Date();
  const base = parseISODate(d.date);
  let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  if (daysBetween(today, next) < 0) next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
  return daysBetween(today, next);
}

export function DateRow({ d, onRemove, showMember }: { d: MemberDate; onRemove?: () => void; showMember?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const meta = useDateTypeMeta()[d.type];
  const n = daysUntil(d);
  const when = n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : `Dans ${n} jours`;
  return (
    <View style={[styles.row, { borderTopColor: c.border }]}>
      <View style={[styles.icon, { backgroundColor: meta.color + '22' }]}>
        <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>
          {showMember ? `${d.member} · ` : ''}
          {d.label}
        </Text>
        <Muted>
          {capitalize(formatLong(d.date))}
          {d.hebrewDate ? ` · ${d.hebrewDate}` : ''} · {meta.label}
        </Muted>
        {d.note ? <Muted style={{ fontSize: 12, marginTop: 2 }}>{d.note}</Muted> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ color: n <= 7 ? c.danger : c.primary, fontWeight: '800', fontSize: 12 }}>{when}</Text>
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// Formulaire compact d'ajout d'une date, utilisé par le fidèle et par le Rav.
export function AddDateForm({ member, onAdded, big }: { member?: string; onAdded?: (label: string) => void; big?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { addMemberDate, seed } = useAppState();
  const typeMeta = useDateTypeMeta();
  const [type, setType] = useState<MemberDateType>('anniversaire');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [who, setWho] = useState(member ?? '');
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canAdd = label.trim().length > 1 && validDate && (member || who.trim().length > 1);
  const fs = big ? 18 : 15;
  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text, fontSize: fs }];

  const submit = () => {
    const hebrew = seed.religiousDate(parseISODate(date));
    addMemberDate({ member: member ?? who.trim(), type, label: label.trim(), date, hebrewDate: hebrew ?? undefined, note: note.trim() || undefined });
    onAdded?.(label.trim());
    setLabel('');
    setDate('');
    setNote('');
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
        {(Object.keys(dateTypeMeta) as MemberDateType[]).map((t) => (
          <Chip key={t} label={typeMeta[t].label} active={type === t} color={typeMeta[t].color} onPress={() => setType(t)} />
        ))}
      </View>
      {!member ? <TextInput value={who} onChangeText={setWho} placeholder="Nom du fidèle" placeholderTextColor={c.textMuted} style={inputStyle} /> : null}
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder={type === 'azkara' ? `Ex. : ${typeMeta.azkara.label} de ma mère` : type === 'anniversaire' ? 'Ex. : Anniversaire de Léa' : 'Ex. : Anniversaire de mariage'}
        placeholderTextColor={c.textMuted}
        style={[...inputStyle, { marginTop: 8 }]}
      />
      <TextInput value={date} onChangeText={setDate} placeholder="Date : 2026-10-12" placeholderTextColor={c.textMuted} style={[...inputStyle, { marginTop: 8 }]} />
      {date && !validDate ? <Text style={{ color: c.danger, fontSize: 12, marginTop: 4 }}>Écrivez la date comme 2026-10-12 (la date hébraïque est calculée).</Text> : null}
      <TextInput value={note} onChangeText={setNote} placeholder="Note (facultatif)" placeholderTextColor={c.textMuted} style={[...inputStyle, { marginTop: 8 }]} />
      <Button label="Ajouter cette date" icon="add-circle-outline" disabled={!canAdd} onPress={submit} style={{ marginTop: 10 }} />
    </View>
  );
}

// Bloc « Mes dates » du fidèle : liste + ajout.
export function MyDates({ compact }: { compact?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useAuth();
  const { memberDates, removeMemberDate } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const mine = memberDates.filter((d) => d.member === user.name).sort((a, b) => daysUntil(a) - daysUntil(b));

  return (
    <>
      <SectionTitle title="Mes dates" action={showForm ? 'Fermer' : 'Ajouter'} onAction={() => setShowForm((v) => !v)} />
      <Card>
        <Muted style={{ marginBottom: 4 }}>Anniversaires, souvenirs… Votre responsable les voit et peut vous accompagner.</Muted>
        {mine.length === 0 ? <Muted>Aucune date pour l’instant.</Muted> : null}
        {(compact ? mine.slice(0, 3) : mine).map((d) => (
          <DateRow key={d.id} d={d} onRemove={() => removeMemberDate(d.id)} />
        ))}
        {compact && mine.length > 3 ? <Muted style={{ marginTop: 6 }}>+ {mine.length - 3} autres dans l’onglet Horaires → Agenda</Muted> : null}
        {added ? (
          <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
            <Ionicons name="checkmark-circle" size={18} color={c.success} />
            <Text style={{ color: c.success, fontWeight: '700', fontSize: 13, flex: 1 }}>« {added} » ajouté à vos dates.</Text>
          </View>
        ) : null}
        {showForm ? (
          <View style={{ marginTop: 12 }}>
            <AddDateForm
              member={user.name}
              onAdded={(l) => {
                setAdded(l);
                setShowForm(false);
                setTimeout(() => setAdded(null), 3000);
              }}
            />
          </View>
        ) : null}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginTop: 10 },
});
