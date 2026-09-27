import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { AppStackParamList } from '../navigation/types';
import { Avatar } from './Avatar';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// Pastille dans la barre du haut : communauté affichée + bascule vers une autre communauté du fidèle.
export function CommunitySwitcher() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { congregation, congregations, myCongregations, setCongregation } = useAppState();
  const [open, setOpen] = useState(false);
  const mine = congregations.filter((x) => myCongregations.includes(x.id));

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.pill, { backgroundColor: c.primaryLight, opacity: pressed ? 0.8 : 1 }]} hitSlop={6}>
        <MaterialCommunityIcons name="swap-horizontal" size={18} color={c.primary} />
        <View>
          <Text style={{ color: c.primary, fontWeight: '800', fontSize: 13 }} numberOfLines={1}>
            {congregation.name}
          </Text>
          <Text style={{ color: c.primary, opacity: 0.8, fontSize: 10 }} numberOfLines={1}>
            {congregation.rite}
          </Text>
        </View>
        {mine.length > 1 ? (
          <View style={[styles.count, { backgroundColor: c.primary }]}>
            <Text style={{ color: c.textOnPrimary, fontSize: 10, fontWeight: '800' }}>{mine.length}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.surface }]} onPress={() => undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', flex: 1 }}>Changer de communauté</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={26} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={{ color: c.textMuted, fontSize: 13, marginBottom: 12 }}>
              Vous appartenez à {mine.length} communauté{mine.length > 1 ? 's' : ''}. Horaires, divré Torah, questions et dons changent selon la communauté affichée.
            </Text>

            {mine.map((k) => {
              const active = k.id === congregation.id;
              return (
                <Pressable
                  key={k.id}
                  onPress={() => {
                    setCongregation(k.id);
                    setOpen(false);
                  }}
                  style={[styles.item, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}
                >
                  <Avatar source={k.rav.photo} name={k.rav.name} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{k.name}</Text>
                    <Text style={{ color: c.textMuted, fontSize: 13 }}>
                      {k.rite} · {k.rav.name}
                    </Text>
                  </View>
                  <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={active ? c.primary : c.border} />
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setOpen(false);
                navigation.navigate('JoinCommunity', { onboarding: false });
              }}
              style={[styles.item, { borderColor: c.border, borderStyle: 'dashed', justifyContent: 'center' }]}
            >
              <Ionicons name="add-circle-outline" size={24} color={c.primary} />
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>Rejoindre une autre communauté</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, maxWidth: 190 },
  count: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 32, maxWidth: 640, width: '100%', alignSelf: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
});
