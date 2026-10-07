import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { IconByName } from '../../components/ReligionIcon';
import { Card, Muted, Button } from '../../components/ui';
import { money, formatNumeric, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'Attestation'>;

// Attestation annuelle d'engagement : la preuve qu'on est assidu ou bon donateur, imprimable comme le reçu.
export function AttestationScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useAuth();
  const { ora, seed, congregation, myDonations: donations, myAssociations } = useAppState();
  const [status, setStatus] = useState<string | null>(null);
  const year = new Date().getFullYear();
  const mine = donations.filter((d) => d.date.startsWith(String(year)));
  const byAssociation = myAssociations.map((a) => ({ a, total: mine.filter((d) => d.associationId === a.id || (!d.associationId && a.isDefault)).reduce((s, d) => s + d.amount, 0) })).filter((x) => x.total > 0);
  const number = `${year}-ENG-${String(user.id).toUpperCase().slice(0, 6)}`;

  const print = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return;
    }
    setStatus('Impression lancée.');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Mon attestation" subtitle={`Année ${year} · engagement dans la communauté`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Imprimer" icon="print-outline" variant="secondary" onPress={print} style={{ flex: 1 }} />
          <Button label="Envoyer par email" icon="mail-outline" onPress={() => { setStatus('Attestation envoyée à ' + user.email); setTimeout(() => setStatus(null), 3000); }} style={{ flex: 1 }} />
        </View>
        {status ? (
          <View style={[styles.toast, { backgroundColor: c.success + '22' }]}>
            <Ionicons name="checkmark-circle" size={18} color={c.success} />
            <Text style={{ color: c.success, fontWeight: '700', flex: 1 }}>{status}</Text>
          </View>
        ) : null}

        <Card style={[styles.doc, { borderColor: c.border }]}>
          <View style={styles.head}>
            <View style={[styles.logo, { backgroundColor: c.primary }]}>
              <IconByName icon={seed.gamification.icon} size={22} color={c.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{congregation.name}</Text>
              <Muted>{congregation.address}, {congregation.city}</Muted>
            </View>
          </View>
          <View style={[styles.rule, { backgroundColor: c.primary }]} />
          <Text style={{ color: c.primary, fontSize: 20, fontWeight: '900', marginTop: 10 }}>Attestation d’engagement {year}</Text>
          <Muted>N° {number} · établie le {formatNumeric(todayISO())}</Muted>

          <Text style={[styles.para, { color: c.text }]}>
            La communauté <Text style={{ fontWeight: '800' }}>{congregation.name}</Text> atteste que <Text style={{ fontWeight: '800' }}>{user.name}</Text> a pris part à sa vie au cours des douze derniers mois, selon les éléments enregistrés dans l’application myCommu :
          </Text>

          <View style={styles.grid}>
            <Stat icon="calendar-check" label="Jours de présence" value={String(ora.activeDays12m)} />
            <Stat icon="fire" label="Série en cours" value={`${ora.streakDays} j`} />
            <Stat icon="book-open-variant" label={`${seed.teachingPlural} lus`} value={String(ora.coursesRead)} />
            <Stat icon="comment-question" label="Questions posées" value={String(ora.questionsAsked)} />
            <Stat icon="hand-heart" label="Dons sur 12 mois" value={money(ora.given12m)} />
            <Stat icon="star-four-points" label={`Niveau (${seed.gamification.name})`} value={`${ora.level} · ${ora.tier.name}`} />
          </View>

          {byAssociation.length ? (
            <>
              <Text style={[styles.section, { color: c.text }]}>Dons {year} par association</Text>
              {byAssociation.map(({ a, total }) => (
                <View key={a.id} style={[styles.row, { borderBottomColor: c.border }]}>
                  <Text style={{ color: c.text, flex: 1 }}>{a.name}{a.purpose ? ` · ${a.purpose}` : ''}</Text>
                  <Text style={{ color: c.text, fontWeight: '700' }}>{money(total)}</Text>
                </View>
              ))}
            </>
          ) : null}

          <Text style={[styles.section, { color: c.text }]}>Titres</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ora.assiduityTitle ? <Tag color={c.primary} label={`${ora.assiduityTitle} · assiduité`} /> : <Muted>Assiduité : prochain titre « {ora.nextAssiduityTitle?.name} » à {ora.nextAssiduityTitle?.days} jours.</Muted>}
            {ora.generosityTitle ? <Tag color={c.secondary} label={`${ora.generosityTitle} · générosité`} /> : ora.nextGenerosityTitle ? <Muted>Générosité : prochain titre « {ora.nextGenerosityTitle.name} » à {money(ora.nextGenerosityTitle.amount)}.</Muted> : null}
          </View>

          <Text style={[styles.legal, { color: c.textMuted }]}>
            Les jours de présence, lectures et questions proviennent de l’activité de l’utilisateur dans l’application ; les dons sont ceux confirmés par la communauté ou par le prestataire de paiement. Ce document n’a pas de valeur fiscale : les reçus fiscaux sont délivrés séparément par chaque association.
          </Text>
          <View style={styles.sign}>
            <Muted>Fait à {congregation.city}, le {formatNumeric(todayISO())}</Muted>
            <View style={[styles.stamp, { borderColor: c.primary }]}>
              <Text style={{ color: c.primary, fontWeight: '800', fontSize: 10, textAlign: 'center' }}>{congregation.name.toUpperCase()}</Text>
              <MaterialCommunityIcons name="check-decagram" size={20} color={c.primary} />
            </View>
          </View>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.stat, { borderColor: c.border }]}>
      <MaterialCommunityIcons name={icon} size={18} color={c.primary} />
      <Text style={{ color: c.text, fontWeight: '900', fontSize: 18, marginTop: 4 }}>{value}</Text>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
    </View>
  );
}

function Tag({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ backgroundColor: color + '1F', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
      <Text style={{ color, fontWeight: '800', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 10 },
  doc: { marginTop: 14, padding: 20, borderWidth: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 3, borderRadius: 2, marginTop: 12 },
  para: { marginTop: 14, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  stat: { width: '31%', flexGrow: 1, borderWidth: 1, borderRadius: 10, padding: 10, minWidth: 120 },
  section: { fontWeight: '800', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  legal: { fontSize: 11, lineHeight: 16, marginTop: 16 },
  sign: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  stamp: { width: 90, height: 60, borderWidth: 2, borderRadius: 8, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
});
