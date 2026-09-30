import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { useI18n } from '../i18n';
import { BigInput, BigButton, BIG } from '../screens/rav/RavUi';

// Choix du courant religieux, avec possibilité d'en ajouter un.
export function CurrentPicker({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { currents, addCurrent } = useAppState();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const create = () => {
    const n = name.trim();
    if (!n) return;
    const cur = addCurrent(n);
    onChange(cur.id);
    setName('');
    setAdding(false);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {currents.map((cur) => {
          const active = cur.id === value;
          return (
            <Pressable
              key={cur.id}
              onPress={() => onChange(cur.id)}
              accessibilityRole="radio"
              aria-checked={active}
              style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
            >
              {active ? <Ionicons name="checkmark" size={20} color={c.textOnPrimary} /> : null}
              <Text style={{ color: active ? c.textOnPrimary : c.text, fontSize: 17, fontWeight: '700' }}>{cur.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {adding ? (
        <View style={{ marginTop: 10 }}>
          <BigInput value={name} onChangeText={setName} placeholder={t('affiliation.newCurrentPlaceholder')} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <BigButton label={t('affiliation.addCurrent')} icon="checkmark" disabled={!name.trim()} onPress={create} style={{ flex: 1 }} />
            <BigButton label={t('common.cancel')} color={c.background} textColor={c.textMuted} onPress={() => setAdding(false)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setAdding(true)} style={[styles.add, { borderColor: c.primary }]}>
          <Ionicons name="add-circle" size={22} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: '800', fontSize: 17 }}>{t('affiliation.addCurrent')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export type GroupChoice = { mode: 'none' } | { mode: 'join'; groupId: string } | { mode: 'create'; name: string };

// Choix du groupe : aucun, se rattacher à un groupe existant, ou créer un groupe et en devenir chef.
export function GroupPicker({ value, onChange, currentId }: { value: GroupChoice; onChange: (v: GroupChoice) => void; currentId?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { groups } = useAppState();
  // Les groupes du même courant d'abord, puis les groupes ouverts à tous les courants.
  const sorted = [...groups].sort((a, b) => Number(b.currentId === currentId) - Number(a.currentId === currentId) || Number(!a.currentId) - Number(!b.currentId));

  const Option = ({ mode, icon, title, text }: { mode: GroupChoice['mode']; icon: React.ComponentProps<typeof Ionicons>['name']; title: string; text: string }) => {
    const active = value.mode === mode;
    return (
      <Pressable
        onPress={() => onChange(mode === 'none' ? { mode } : mode === 'join' ? { mode, groupId: sorted[0]?.id ?? '' } : { mode, name: '' })}
        accessibilityRole="radio"
        aria-checked={active}
        style={[styles.option, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}
      >
        <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={28} color={active ? c.primary : c.textMuted} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={icon} size={20} color={c.primary} />
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{title}</Text>
          </View>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{text}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      <Option mode="none" icon="remove-circle-outline" title={t('affiliation.noGroup')} text={t('affiliation.noGroupHint')} />
      <Option mode="join" icon="git-network" title={t('affiliation.joinGroup')} text={t('affiliation.joinGroupHint')} />
      {value.mode === 'join' ? (
        <View style={{ gap: 8, marginBottom: 10, marginLeft: 12 }}>
          {sorted.map((g) => {
            const active = value.groupId === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => onChange({ mode: 'join', groupId: g.id })}
                style={[styles.group, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}
              >
                <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={active ? c.primary : c.border} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{g.name}</Text>
                  {g.description ? <Text style={{ color: c.textMuted, fontSize: 14 }}>{g.description}</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Option mode="create" icon="ribbon" title={t('affiliation.createGroup')} text={t('affiliation.createGroupHint')} />
      {value.mode === 'create' ? (
        <View style={{ marginLeft: 12, marginBottom: 10 }}>
          <BigInput value={value.name} onChangeText={(name) => onChange({ mode: 'create', name })} placeholder={t('affiliation.groupNamePlaceholder')} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, minHeight: 50 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', marginTop: 10, minHeight: 50 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, marginBottom: 10, minHeight: 78 },
  group: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 2 },
});
