import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chats } from '../../mocks/chats';
import { Avatar } from '../../components/Avatar';
import { useTheme } from '../../theme/ThemeProvider';
import { AppStackParamList } from '../../navigation/types';
import { timeAgo } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ChatListScreen() {
  const { theme } = useTheme();
  const nav = useNavigation<Nav>();
  const [q, setQ] = useState('');

  const filtered = chats.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
        <Pressable style={[styles.iconBtn, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            placeholder="Rechercher une conversation"
            placeholderTextColor={theme.colors.textMuted}
            value={q}
            onChangeText={setQ}
            style={{ flex: 1, color: theme.colors.text, fontSize: 14 }}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate('ChatRoom', { chatId: item.id })}
            style={[styles.row, { borderBottomColor: theme.colors.border }]}
          >
            <Avatar uri={item.avatar} name={item.name} size={52} online={item.online} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 15 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{timeAgo(item.lastMessageAt)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text
                  style={{
                    color: item.unread > 0 ? theme.colors.text : theme.colors.textMuted,
                    fontSize: 14,
                    fontWeight: item.unread > 0 ? '600' : '400',
                    flex: 1,
                    marginRight: 8,
                  }}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={[styles.unread, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 24, fontWeight: '800' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { padding: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  unread: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
