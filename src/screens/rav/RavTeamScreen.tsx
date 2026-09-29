import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useReligion } from '../../state/useReligion';
import { Avatar } from '../../components/Avatar';
import { StaffRole, roleDescription, roleLabel } from '../../config/roles';
import { RavScreen, BigLabel, BigInput, BigButton, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavTeam'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const invitable: { role: StaffRole; icon: IoniconName; color: string }[] = [
  { role: 'deputy', icon: 'person-add', color: '#1D4ED8' },
  { role: 'treasurer', icon: 'cash', color: '#BE123C' },
  { role: 'organizer', icon: 'calendar', color: '#0F766E' },
];

export function RavTeamScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { profile } = useReligion();
  const { myStaff, addStaff, removeStaff, congregation } = useAppState();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [invite, setInvite] = useState<{ name: string; code: string; role: StaffRole } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const colorOf = (r: StaffRole) => invitable.find((x) => x.role === r)?.color ?? c.primary;
  const canCreate = !!role && name.trim().length > 1 && contact.trim().length > 3;

  const submit = () => {
    if (!role) return;
    if (role === 'leader') return;
    const s = addStaff({ name: name.trim(), contact: contact.trim(), role });
    setInvite({ name: s.name, code: s.code, role: s.role });
    setName('');
    setContact('');
    setRole(null);
  };

  return (
    <RavScreen title="Créer des accès" subtitle={`Votre équipe à ${congregation.name}`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', marginBottom: 10 }}>1. Quel accès ?</Text>
      {invitable.map((x) => {
        const active = role === x.role;
        return (
          <Pressable
            key={x.role}
            onPress={() => setRole(x.role)}
            style={({ pressed }) => [styles.role, { borderColor: active ? x.color : c.border, backgroundColor: active ? x.color + '14' : c.surface, opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[styles.roleIcon, { backgroundColor: x.color }]}>
              <Ionicons name={x.icon} size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>Accès {roleLabel(x.role, profile).toLowerCase()}</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{roleDescription(x.role, profile)}</Text>
            </View>
            <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={28} color={active ? x.color : c.border} />
          </Pressable>
        );
      })}

      {role ? (
        <>
          <BigLabel>2. Pour qui ?</BigLabel>
          <BigInput value={name} onChangeText={setName} placeholder="Prénom et nom" />
          <BigInput value={contact} onChangeText={setContact} placeholder="Téléphone ou email" style={{ marginTop: 8 }} />
          <View style={{ marginTop: 18 }}>
            <BigButton label={`Créer l’accès ${roleLabel(role, profile).toLowerCase()}`} icon="key" disabled={!canCreate} onPress={submit} />
          </View>
        </>
      ) : null}

      {invite ? (
        <RavCard style={{ marginTop: 18, borderColor: c.success, borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="checkmark-circle" size={30} color={c.success} />
            <Text style={{ color: c.text, fontSize: 19, fontWeight: '900', flex: 1 }}>
              Accès {roleLabel(invite.role, profile).toLowerCase()} créé pour {invite.name}
            </Text>
          </View>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 8 }}>
            Une invitation lui est envoyée. En se connectant, il entre ce code d’accès personnel :
          </Text>
          <Text style={{ color: c.primary, fontSize: 32, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginTop: 8 }}>{invite.code}</Text>
        </RavCard>
      ) : null}

      <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', marginTop: 28, marginBottom: 10 }}>Mon équipe ({myStaff.length + 1})</Text>
      <RavCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={52} ring />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{congregation.rav.name}</Text>
          <Text style={{ color: c.textMuted, fontSize: 15 }}>{roleLabel('leader', profile)} · tous les droits</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: c.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Vous</Text>
        </View>
      </RavCard>
      {myStaff.map((s) => (
        <RavCard key={s.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.name} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{s.name}</Text>
              <Text style={{ color: c.textMuted, fontSize: 15 }}>{s.contact}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <View style={[styles.badge, { backgroundColor: colorOf(s.role) }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{roleLabel(s.role, profile)}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: s.status === 'active' ? c.success + '22' : c.warning + '22' }]}>
                  <Text style={{ color: s.status === 'active' ? c.success : c.warning, fontWeight: '800', fontSize: 13 }}>
                    {s.status === 'active' ? 'Actif' : `Invité · code ${s.code}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {confirmId === s.id ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <BigButton label="Oui, retirer l’accès" color={c.danger} onPress={() => { removeStaff(s.id); setConfirmId(null); }} style={{ flex: 1 }} />
              <BigButton label="Non" color={c.background} textColor={c.text} onPress={() => setConfirmId(null)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
            </View>
          ) : (
            <Pressable onPress={() => setConfirmId(s.id)} style={[styles.remove, { backgroundColor: c.danger + '14' }]}>
              <Ionicons name="trash" size={20} color={c.danger} />
              <Text style={{ color: c.danger, fontWeight: '800', fontSize: 16 }}>Retirer l’accès</Text>
            </Pressable>
          )}
        </RavCard>
      ))}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  role: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 2, marginBottom: 10, minHeight: 96 },
  roleIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginTop: 12 },
});
