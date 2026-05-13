import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { chats } from '../../mocks/chats';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { ChatMessage } from '../../types';
import { hourMinute } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const chat = chats.find((c) => c.id === route.params.chatId);
  const [messages, setMessages] = useState<ChatMessage[]>(chat?.messages ?? []);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
  }, []);

  if (!chat) return null;

  const send = () => {
    if (!text.trim()) return;
    const m: ChatMessage = { id: `m-${Date.now()}`, senderId: 'u-me', text: text.trim(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, m]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
        </Pressable>
        <Avatar uri={chat.avatar} name={chat.name} size={38} online={chat.online} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 15 }} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
            {chat.online ? 'En ligne' : 'Vu récemment'}
          </Text>
        </View>
        <Ionicons name="videocam-outline" size={24} color={theme.colors.text} />
        <Ionicons name="call-outline" size={22} color={theme.colors.text} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const mine = item.senderId === 'u-me';
            return (
              <View style={[styles.msgRow, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
                <View
                  style={[
                    styles.bubble,
                    mine
                      ? { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 }
                      : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
                  ]}
                >
                  <Text style={{ color: mine ? '#fff' : theme.colors.text, fontSize: 15 }}>{item.text}</Text>
                  <Text style={{ color: mine ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
                    {hourMinute(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.composer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Pressable hitSlop={8}>
            <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            multiline
          />
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  msgRow: { flexDirection: 'row', marginVertical: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
