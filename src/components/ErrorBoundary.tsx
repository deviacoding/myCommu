import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Filet de sécurité : si un écran plante, on affiche un message et un bouton pour réessayer,
// jamais une page blanche.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[app] écran en erreur :', error.message, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <View style={styles.icon}>
          <Ionicons name="warning-outline" size={34} color="#B45309" />
        </View>
        <Text style={styles.title}>Cette page n’a pas pu s’afficher</Text>
        <Text style={styles.text}>Une erreur est survenue. Réessayez ; si le problème persiste, revenez à l’accueil.</Text>
        <Text style={styles.detail} numberOfLines={3}>{this.state.error.message}</Text>
        <Pressable onPress={() => this.setState({ error: null })} style={styles.btn}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.btnTxt}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#F7F7FA' },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2430', textAlign: 'center' },
  text: { fontSize: 14, color: '#5D6472', textAlign: 'center', marginTop: 8, maxWidth: 340 },
  detail: { fontSize: 11, color: '#9AA0AD', textAlign: 'center', marginTop: 10, maxWidth: 340 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2F3E5C', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 18 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
