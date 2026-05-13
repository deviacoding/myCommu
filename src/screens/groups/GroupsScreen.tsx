import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { groups } from '../../mocks/groups';
import { GroupCard } from '../../components/GroupCard';
import { useTheme } from '../../theme/ThemeProvider';
import { ScreenHeader } from '../../components/ScreenHeader';

type Props = NativeStackScreenProps<AppStackParamList, 'Groups'>;
const TABS = ['Découvrir', 'Rejoints'] as const;

export function GroupsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Découvrir');

  const data = useMemo(() => (tab === 'Rejoints' ? groups.filter((g) => g.joined) : groups), [tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Groupes" onBack={() => navigation.goBack()} />

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
            <Text
              style={{
                color: tab === t ? theme.colors.primary : theme.colors.textMuted,
                fontWeight: '700',
              }}
            >
              {t}
            </Text>
            <View
              style={{
                height: 3,
                width: '60%',
                backgroundColor: tab === t ? theme.colors.primary : 'transparent',
                marginTop: 6,
                borderRadius: 2,
              }}
            />
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <GroupCard group={item} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
});
