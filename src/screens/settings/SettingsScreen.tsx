import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { communities } from '../../mocks/communities';
import { themes } from '../../theme/themes';
import { CommunityId } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const iconMap: Record<CommunityId, string> = {
  jewish: 'star-of-david',
  christian: 'cross',
  muslim: 'mosque',
};

export function SettingsScreen({ navigation }: Props) {
  const { theme, community, setCommunity } = useTheme();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Paramètres" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={[styles.section, { color: theme.colors.text }]}>Communauté</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 12 }}>
          Le thème de l’app suit votre communauté.
        </Text>
        <View style={{ gap: 8 }}>
          {communities.map((c) => {
            const active = community === c.id;
            const cTheme = themes[c.id];
            return (
              <Pressable
                key={c.id}
                onPress={() => setCommunity(c.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: active ? cTheme.colors.primary : theme.colors.border,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.icon, { backgroundColor: cTheme.colors.primaryLight }]}>
                  <MaterialCommunityIcons name={iconMap[c.id] as any} size={22} color={cTheme.colors.primary} />
                </View>
                <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '600' }}>{c.name}</Text>
                {active && <Ionicons name="checkmark-circle" size={22} color={cTheme.colors.primary} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: theme.colors.text, marginTop: 24 }]}>Compte</Text>
        <Item icon="person-outline" label="Profil" />
        <Item icon="lock-closed-outline" label="Confidentialité" />
        <Item icon="notifications-outline" label="Notifications" />

        <Text style={[styles.section, { color: theme.colors.text, marginTop: 24 }]}>Préférences</Text>
        <Item icon="moon-outline" label="Apparence" />
        <Item icon="language-outline" label="Langue" sub="Français" />

        <Text style={[styles.section, { color: theme.colors.text, marginTop: 24 }]}>Support</Text>
        <Item icon="help-circle-outline" label="Aide" />
        <Item icon="document-text-outline" label="Conditions" />

        <Pressable onPress={signOut} style={[styles.logout, { borderColor: theme.colors.danger }]}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({ icon, label, sub }: { icon: any; label: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <Pressable style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.itemIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '500' }}>{label}</Text>
      {sub && <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginRight: 8 }}>{sub}</Text>}
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
  itemIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, marginTop: 32 },
});
