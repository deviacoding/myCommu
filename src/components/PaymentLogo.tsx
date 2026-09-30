import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentProviderId, paymentProvider } from '../config/paymentProviders';

// Pastille aux couleurs du prestataire (sans image externe).
export function PaymentLogo({ id, size = 56 }: { id: PaymentProviderId; size?: number }) {
  const p = paymentProvider(id);
  const box = { width: size, height: size, borderRadius: size * 0.26, backgroundColor: p.color, alignItems: 'center' as const, justifyContent: 'center' as const };
  if (id === 'lemonsqueezy') {
    return (
      <View style={box}>
        <MaterialCommunityIcons name="fruit-citrus" size={size * 0.6} color={p.onColor} />
      </View>
    );
  }
  return (
    <View style={box}>
      <Text style={{ color: p.onColor, fontWeight: '900', fontSize: id === 'bit' ? size * 0.38 : size * 0.5, letterSpacing: -0.5 }}>{id === 'bit' ? 'bit' : 'S'}</Text>
    </View>
  );
}
