import React, { useMemo, useState } from 'react';
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
import { Card, Muted, Button, Segmented } from '../../components/ui';
import { ReceiptFormat } from '../../types';
import { money, formatNumeric, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'Receipt'>;

const ORG_BASE = {
  legal: 'Association cultuelle',
  address: '',
  israelNumber: '580-123-456',
  franceNumber: 'W751234567',
  president: 'M. Raphaël Benhamou, président',
};

const formatMeta: Record<ReceiptFormat, { title: string; hebrew?: string; subtitle: string; legal: string }> = {
  seif46: {
    title: 'Reçu fiscal – Seif 46',
    hebrew: 'קבלה לצורכי מס – סעיף 46 לפקודת מס הכנסה',
    subtitle: 'Institution reconnue au titre de l’article 46 de l’ordonnance de l’impôt sur le revenu (Israël)',
    legal:
      'Ce reçu est délivré pour un don sans contrepartie à une institution publique reconnue conformément à l’article 46 de l’ordonnance de l’impôt sur le revenu. Il ouvre droit à un crédit d’impôt de 35 % du montant du don, dans les limites prévues par la loi.',
  },
  cerfa: {
    title: 'Reçu au titre des dons – Cerfa n° 11580*05',
    subtitle: 'Articles 200, 238 bis et 885-0 V bis A du code général des impôts (France)',
    legal:
      'Le bénéficiaire reconnaît avoir reçu au titre de dons et versements ouvrant droit à réduction d’impôt la somme indiquée ci-dessus. Don en numéraire, sans contrepartie, versé à un organisme cultuel. Réduction d’impôt sur le revenu de 66 % du montant dans la limite de 20 % du revenu imposable.',
  },
};

export function ReceiptScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { donations, seed, congregation } = useAppState();
  const { user } = useAuth();
  const [format, setFormat] = useState<ReceiptFormat>(route.params.format);
  const [year] = useState(route.params.year);
  const [status, setStatus] = useState<string | null>(null);

  const list = useMemo(() => donations.filter((d) => d.date.startsWith(String(year))), [donations, year]);
  const total = list.reduce((s, d) => s + d.amount, 0);
  const ORG = { ...ORG_BASE, name: congregation.name, legal: `Association cultuelle ${congregation.name}`, address: `${congregation.address}, ${congregation.city}` };
  const meta = formatMeta[format];
  const receiptNumber = `${year}-${format === 'seif46' ? 'IL' : 'FR'}-${String(user.id).toUpperCase()}${String(list.length).padStart(3, '0')}`;

  const feedback = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3500);
  };

  const print = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return;
    }
    feedback('Impression lancée (maquette).');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Reçu fiscal" subtitle={`Année ${year} · généré automatiquement`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {seed.receiptFormats.length > 1 ? (
          <Segmented<ReceiptFormat>
            options={[
              { value: 'seif46', label: 'Seif 46 · Israël' },
              { value: 'cerfa', label: 'Cerfa · France' },
            ]}
            value={format}
            onChange={setFormat}
          />
        ) : null}

        <View style={styles.actions}>
          <Button label="Imprimer" icon="print-outline" variant="secondary" onPress={print} style={{ flex: 1 }} />
          <Button label="Télécharger PDF" icon="download-outline" onPress={() => feedback('PDF téléchargé : ' + receiptNumber + '.pdf')} style={{ flex: 1 }} />
        </View>
        <Button label="Envoyer par email" icon="mail-outline" variant="ghost" onPress={() => feedback('Reçu envoyé à ' + user.email)} />
        {status ? (
          <View style={[styles.toast, { backgroundColor: c.success + '22' }]}>
            <Ionicons name="checkmark-circle" size={18} color={c.success} />
            <Text style={{ color: c.success, fontWeight: '700', flex: 1 }}>{status}</Text>
          </View>
        ) : null}

        {/* Le document */}
        <Card style={[styles.doc, { borderColor: c.border }]}>
          <View style={styles.docHead}>
            <View style={[styles.logo, { backgroundColor: c.primary }]}>
              <IconByName icon={seed.gamification.icon} size={22} color={c.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.orgName, { color: c.text }]}>{ORG.name}</Text>
              <Muted>{ORG.legal}</Muted>
              <Muted>{ORG.address}</Muted>
              <Muted>
                {format === 'seif46' ? `N° d’institution : ${ORG.israelNumber}` : `N° RNA : ${ORG.franceNumber}`}
              </Muted>
            </View>
          </View>

          <View style={[styles.rule, { backgroundColor: c.primary }]} />
          <Text style={[styles.docTitle, { color: c.primary }]}>{meta.title}</Text>
          {meta.hebrew ? <Text style={{ color: c.text, textAlign: 'right', fontSize: 14 }}>{meta.hebrew}</Text> : null}
          <Muted style={{ marginTop: 4 }}>{meta.subtitle}</Muted>

          <View style={styles.metaRow}>
            <Field label="N° de reçu" value={receiptNumber} />
            <Field label="Date d’émission" value={formatNumeric(todayISO())} />
          </View>

          <Text style={[styles.section, { color: c.text }]}>Donateur</Text>
          <Field label="Nom" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Adresse" value={user.city ?? '—'} />

          <Text style={[styles.section, { color: c.text }]}>Dons reçus en {year}</Text>
          <View style={[styles.tableHead, { borderBottomColor: c.border }]}>
            <Text style={[styles.th, { color: c.textMuted, flex: 1 }]}>Date</Text>
            <Text style={[styles.th, { color: c.textMuted, flex: 2 }]}>Destination</Text>
            <Text style={[styles.th, { color: c.textMuted, width: 80, textAlign: 'right' }]}>Montant</Text>
          </View>
          {list.map((d) => (
            <View key={d.id} style={[styles.tr, { borderBottomColor: c.border }]}>
              <Text style={{ color: c.text, flex: 1, fontSize: 13 }}>{formatNumeric(d.date)}</Text>
              <Text style={{ color: c.text, flex: 2, fontSize: 13 }}>{d.cause}</Text>
              <Text style={{ color: c.text, width: 80, textAlign: 'right', fontSize: 13, fontWeight: '600' }}>{money(d.amount)}</Text>
            </View>
          ))}
          <View style={[styles.tr, { borderBottomWidth: 0, marginTop: 4 }]}>
            <Text style={{ color: c.text, flex: 3, fontWeight: '800' }}>Total des dons {year}</Text>
            <Text style={{ color: c.primary, width: 110, textAlign: 'right', fontWeight: '900', fontSize: 18 }}>{money(total)}</Text>
          </View>

          <Text style={[styles.legal, { color: c.textMuted }]}>{meta.legal}</Text>

          <View style={styles.sign}>
            <View style={{ flex: 1 }}>
              <Muted>Fait à {congregation.city}, le {formatNumeric(todayISO())}</Muted>
              <Text style={{ color: c.text, fontWeight: '600', marginTop: 4 }}>{ORG.president}</Text>
            </View>
            <View style={[styles.stamp, { borderColor: c.primary }]}>
              <Text style={{ color: c.primary, fontWeight: '800', fontSize: 10, textAlign: 'center' }}>{ORG.name.toUpperCase()}</Text>
              <MaterialCommunityIcons name="check-decagram" size={20} color={c.primary} />
            </View>
          </View>
        </Card>

        <Muted style={{ textAlign: 'center', marginTop: 4 }}>
          Maquette : reçu généré à partir de vos dons enregistrés. Les mentions légales définitives seront validées par l’association.
        </Muted>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flex: 1 }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 13, minWidth: 96 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 10 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 10 },
  doc: { marginTop: 16, padding: 20, borderWidth: 1 },
  docHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  logo: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orgName: { fontSize: 16, fontWeight: '800' },
  rule: { height: 3, borderRadius: 2, marginVertical: 14 },
  docTitle: { fontSize: 18, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  section: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 4 },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6, marginTop: 6 },
  th: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  legal: { fontSize: 11, lineHeight: 16, marginTop: 16 },
  sign: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  stamp: { borderWidth: 2, borderRadius: 40, width: 80, height: 80, alignItems: 'center', justifyContent: 'center', padding: 6, transform: [{ rotate: '-8deg' }], opacity: 0.8 },
});
