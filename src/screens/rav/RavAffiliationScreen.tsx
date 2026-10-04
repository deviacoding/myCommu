import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { CurrentPicker, GroupChoice, GroupPicker } from '../../components/AffiliationPickers';
import { RavScreen, BigButton, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavAffiliation'>;

export function RavAffiliationScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { congregation, congregations, currentOf, groupOf, setCongregationCurrent, joinGroup, leaveGroup, createGroup } = useAppState();
  const [choice, setChoice] = useState<GroupChoice>({ mode: 'none' });
  const [saved, setSaved] = useState<string | null>(null);

  const current = currentOf(congregation);
  const group = groupOf(congregation);
  const isHead = !!group && group.headCongregationId === congregation.id;
  const members = group ? congregations.filter((k) => k.groupId === group.id) : [];

  const flash = (m: string) => {
    setSaved(m);
    setTimeout(() => setSaved(null), 3500);
  };

  const applyGroup = () => {
    if (choice.mode === 'join' && choice.groupId) {
      joinGroup(congregation.id, choice.groupId);
      flash(t('affiliation.joinedMsg'));
    } else if (choice.mode === 'create' && choice.name.trim()) {
      createGroup(congregation.id, choice.name.trim());
      flash(t('affiliation.createdMsg'));
    }
    setChoice({ mode: 'none' });
  };

  const canApply = (choice.mode === 'join' && !!choice.groupId) || (choice.mode === 'create' && choice.name.trim().length > 2);

  return (
    <RavScreen title={t('affiliation.title')} subtitle={congregation.name} onBack={() => navigation.goBack()}>
      {saved ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={22} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{saved}</Text>
        </View>
      ) : null}

      <Text style={[styles.h, { color: c.text }]}>{t('affiliation.currentTitle')}</Text>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 10 }}>{t('affiliation.currentHint')}</Text>
      <CurrentPicker
        value={current?.id}
        onChange={(id) => {
          setCongregationCurrent(congregation.id, id);
          flash(t('affiliation.currentSaved'));
        }}
      />

      <Text style={[styles.h, { color: c.text, marginTop: 28 }]}>{t('affiliation.groupTitle')}</Text>
      <RavCard style={{ borderColor: group ? c.primary : c.border, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name={isHead ? 'ribbon' : group ? 'git-network' : 'remove-circle-outline'} size={32} color={c.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.textMuted, fontSize: 14, fontWeight: '700' }}>
              {isHead ? t('affiliation.statusHead') : group ? t('affiliation.statusMember') : t('affiliation.statusNone')}
            </Text>
            <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{group ? group.name : t('affiliation.noGroup')}</Text>
            {group?.description ? <Text style={{ color: c.textMuted, fontSize: 15 }}>{group.description}</Text> : null}
          </View>
        </View>
        {isHead ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 8 }}>{t('affiliation.groupMembers', { count: members.length })}</Text>
            {members.length === 0 ? <Text style={{ color: c.textMuted, fontSize: BIG.small }}>Aucune communauté n’a encore rejoint ce groupe.</Text> : null}
            {members.map((k) => (
              <View key={k.id} style={[styles.member, { borderTopColor: c.border }]}>
                <Avatar source={k.rav.photo} name={k.rav.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{k.name}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 14 }}>
                    {k.rite} · {k.city}
                  </Text>
                </View>
              </View>
            ))}
            <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 8 }}>{t('affiliation.headHint')}</Text>
          </View>
        ) : null}
        {group ? (
          <BigButton
            label={t('affiliation.leaveGroup')}
            icon="exit-outline"
            color={c.background}
            textColor={c.danger}
            onPress={() => {
              leaveGroup(congregation.id);
              flash(t('affiliation.leftMsg'));
            }}
            style={{ marginTop: 14, borderWidth: 1, borderColor: c.danger }}
          />
        ) : null}
      </RavCard>

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 10, marginBottom: 10 }}>{group ? t('affiliation.changeGroup') : t('affiliation.chooseGroup')}</Text>
      <GroupPicker value={choice} onChange={setChoice} currentId={current?.id} />
      <BigButton label={t('common.save')} icon="checkmark-circle" disabled={!canApply} onPress={applyGroup} style={{ marginTop: 8 }} />
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 14 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
});
