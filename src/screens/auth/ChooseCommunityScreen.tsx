import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { communities } from '../../mocks/communities';
import { CommunityId } from '../../types';
import { themes } from '../../theme/themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'ChooseCommunity'>;

const iconMap: Record<CommunityId, string> = {
  jewish: 'star-of-david',
  christian: 'cross',
  muslim: 'mosque',
};

export function ChooseCommunityScreen({ navigation }: Props) {
  const { theme, setCommunity } = useTheme();
  const [selected, setSelected] = useState<CommunityId | null>(null);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choisissez votre communauté</Text>
        <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
          L’apparence de l’application s’adaptera à votre communauté. Vous pourrez en changer plus tard.
        </Text>
        <View style={{ marginTop: 24, gap: 12 }}>
          {communities.map((c) => {
            const isSelected = selected === c.id;
            const cTheme = themes[c.id];
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setSelected(c.id);
                  setCommunity(c.id);
                }}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isSelected ? cTheme.colors.primary : theme.colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.icon, { backgroundColor: cTheme.colors.primaryLight }]}>
                  <MaterialCommunityIcons name={iconMap[c.id] as any} size={28} color={cTheme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{c.name}</Text>
                  <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>{c.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? cTheme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? cTheme.colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          disabled={!selected}
          onPress={() => navigation.navigate('Signup')}
          style={[
            styles.btn,
            { backgroundColor: selected ? theme.colors.primary : theme.colors.border },
          ]}
        >
          <Text style={[styles.btnTxt, { color: theme.colors.textOnPrimary }]}>Continuer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  icon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: 24, paddingTop: 8 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnTxt: { fontSize: 16, fontWeight: '700' },
});
