import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DonorTierInfo } from '../config/gamification';

// Pastille de palier de donateur (petit, régulier, grand, pilier) : le responsable reconnaît d'un coup d'œil.
export function DonorChip({ tier, style, small }: { tier: DonorTierInfo; style?: StyleProp<ViewStyle>; small?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: small ? 2 : 4, paddingHorizontal: small ? 8 : 10, borderRadius: 999, backgroundColor: tier.color + '22', borderWidth: 1, borderColor: tier.color }, style]}>
      <MaterialCommunityIcons name={tier.icon as never} size={small ? 13 : 16} color={tier.color} />
      <Text style={{ color: tier.color, fontWeight: '800', fontSize: small ? 12 : 14 }}>{tier.label}</Text>
    </View>
  );
}
