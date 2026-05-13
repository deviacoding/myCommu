import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { currentUser } from '../../mocks/users';

type Props = NativeStackScreenProps<AppStackParamList, 'CreatePost'>;

export function CreatePostScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>Annuler</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>Nouveau post</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={!text.trim()}
          style={[styles.publish, { backgroundColor: text.trim() ? theme.colors.primary : theme.colors.border }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Publier</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Avatar uri={currentUser.avatar} name={currentUser.name} size={42} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: '700', color: theme.colors.text }}>{currentUser.name}</Text>
            <View style={[styles.audience, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Ionicons name="people" size={12} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Ma communauté</Text>
              <Ionicons name="chevron-down" size={12} color={theme.colors.textMuted} />
            </View>
          </View>
        </View>

        <TextInput
          autoFocus
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Que voulez-vous partager ?"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }]}
        />
      </ScrollView>

      <View style={[styles.toolbar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <Pressable style={styles.toolBtn}>
          <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.toolTxt, { color: theme.colors.text }]}>Photo</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Ionicons name="location-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.toolTxt, { color: theme.colors.text }]}>Lieu</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Ionicons name="pricetag-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.toolTxt, { color: theme.colors.text }]}>Tags</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Ionicons name="happy-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.toolTxt, { color: theme.colors.text }]}>Emoji</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 17, fontWeight: '700' },
  publish: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  audience: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, marginTop: 4, alignSelf: 'flex-start' },
  input: { fontSize: 17, lineHeight: 24, minHeight: 200, textAlignVertical: 'top' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  toolBtn: { alignItems: 'center', gap: 4 },
  toolTxt: { fontSize: 11, fontWeight: '600' },
});
