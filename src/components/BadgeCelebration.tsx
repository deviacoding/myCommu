import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';
import { Celebration } from './Celebration';
import { Button } from './ui';

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Fête d'un nouveau badge : son, éclats, nom et description. L'écran de don gère lui-même ses badges,
// donc on attend un peu et on ne s'affiche jamais pendant un don.
export function BadgeCelebration() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { newBadges, markBadgesSeen } = useAppState();
  const [show, setShow] = useState(false);
  const navigation = useNavigation();
  const pending = newBadges.length > 0;
  // La modale « Donate » vit dans la pile parente : on vérifie qu'elle n'est pas ouverte avant de fêter.
  const donateOpen = () => {
    try {
      const st = navigation.getParent()?.getState();
      return st?.routes[st.index]?.name === 'Donate';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!pending) {
      setShow(false);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (donateOpen()) t = setTimeout(tick, 1500);
      else setShow(true);
    };
    t = setTimeout(tick, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  if (!show || !pending) return null;
  const badge = newBadges[0];
  const more = newBadges.length - 1;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={markBadgesSeen}>
      <Pressable style={styles.backdrop} onPress={markBadgesSeen}>
        <Pressable style={[styles.card, { backgroundColor: c.surface }]} onPress={() => undefined}>
          <Text style={{ color: c.textMuted, fontWeight: '800', letterSpacing: 2, fontSize: 12 }}>NOUVEAU BADGE</Text>
          <Celebration size={200}>
            <View style={[styles.icon, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
              <MaterialCommunityIcons name={badge.icon as MciName} size={56} color={badge.color} />
            </View>
          </Celebration>
          <Text style={{ color: c.text, fontWeight: '900', fontSize: 22, textAlign: 'center' }}>{badge.name}</Text>
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 4 }}>{badge.description}</Text>
          {more > 0 ? <Text style={{ color: c.primary, fontWeight: '700', marginTop: 8 }}>+ {more} autre{more > 1 ? 's' : ''} badge{more > 1 ? 's' : ''} obtenu{more > 1 ? 's' : ''}</Text> : null}
          <Button label="Super !" icon="sparkles" onPress={markBadgesSeen} style={{ alignSelf: 'stretch', marginTop: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, borderRadius: 20, padding: 20, alignItems: 'center' },
  icon: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
