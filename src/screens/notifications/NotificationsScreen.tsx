import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { notifications } from '../../mocks/notifications';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { ScreenHeader } from '../../components/ScreenHeader';
import { NotificationType } from '../../types';
import { timeAgo } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'Notifications'>;

const iconFor: Record<NotificationType, { name: any; color: string }> = {
  like: { name: 'heart', color: '#EF4444' },
  comment: { name: 'chatbubble', color: '#3B82F6' },
  follow: { name: 'person-add', color: '#10B981' },
  event: { name: 'calendar', color: '#F59E0B' },
  badge: { name: 'ribbon', color: '#A855F7' },
  message: { name: 'mail', color: '#06B6D4' },
  mention: { name: 'at', color: '#EC4899' },
};

export function NotificationsScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const cfg = iconFor[item.type];
          return (
            <View
              style={[
                styles.row,
                {
                  backgroundColor: item.read ? theme.colors.surface : theme.colors.primaryLight,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={{ position: 'relative' }}>
                {item.actorAvatar ? (
                  <Avatar uri={item.actorAvatar} name={item.actorName} size={46} />
                ) : (
                  <View style={[styles.iconBg, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Ionicons name={cfg.name} size={22} color={cfg.color} />
                  </View>
                )}
                {item.actorAvatar && (
                  <View style={[styles.smallIcon, { backgroundColor: cfg.color }]}>
                    <Ionicons name={cfg.name} size={11} color="#fff" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 19 }}>
                  {item.actorName && <Text style={{ fontWeight: '700' }}>{item.actorName} </Text>}
                  {item.text}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  iconBg: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  smallIcon: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
