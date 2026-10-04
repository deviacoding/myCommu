import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Association, ReceiptFormat, receiptFormatFor } from '../../types';
import { CountryPicker } from '../../components/CountryPicker';
import { EmptyState } from '../../components/EmptyState';
import { countryName } from '../../utils/countries';
import { RavScreen, BigLabel, BigInput, BigButton, RavCard, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavAssociations'>;

export const RECEIPT_LABELS: Record<ReceiptFormat, string> = { cerfa: 'Reçu Cerfa (France)', seif46: 'Reçu Seif 46 (Israël)', other: 'Reçu simple' };

type Draft = { name: string; purpose: string; country: string; receiptFormat: ReceiptFormat; legalId: string; address: string; city: string; president: string };
const emptyDraft = (country: string): Draft => ({ name: '', purpose: '', country, receiptFormat: receiptFormatFor(country), legalId: '', address: '', city: '', president: '' });

// Les associations qui reçoivent les dons de la communauté : une par pays ou par œuvre.
// Le fidèle choisit l'association au moment du don ; le reçu fiscal suit l'association.
export function RavAssociationsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { congregation, myAssociations, addAssociation, updateAssociation, removeAssociation, setDefaultAssociation, myPaymentLinks, seed } = useAppState();
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const startNew = () => setEditing({ draft: emptyDraft(congregation.country ?? 'FR') });
  const startEdit = (a: Association) => setEditing({ id: a.id, draft: { name: a.name, purpose: a.purpose ?? '', country: a.country, receiptFormat: a.receiptFormat, legalId: a.legalId ?? '', address: a.address ?? '', city: a.city ?? '', president: a.president ?? '' } });
  const canSave = !!editing && editing.draft.name.trim().length > 2 && editing.draft.country.trim().length > 1;

  const save = () => {
    if (!editing || !canSave) return;
    const d = editing.draft;
    const data = { name: d.name.trim(), purpose: d.purpose.trim() || undefined, country: d.country.trim(), receiptFormat: d.receiptFormat, legalId: d.legalId.trim() || undefined, address: d.address.trim() || undefined, city: d.city.trim() || undefined, president: d.president.trim() || undefined };
    if (editing.id) updateAssociation(editing.id, data);
    else addAssociation(data);
    setSaved(d.name.trim());
    setEditing(null);
    setTimeout(() => setSaved(null), 3000);
  };

  const linksOf = (a: Association) => myPaymentLinks.filter((p) => p.associationId === a.id);

  return (
    <RavScreen title="Mes associations" subtitle={`Qui reçoit les dons de ${congregation.name}`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14, lineHeight: 23 }}>
        Une association par pays (par exemple une association française et une amuta israélienne) ou par œuvre (synagogue, Hevra Kadisha…). Vos {seed.memberLabel}s choisissent à qui donner, et reçoivent le reçu fiscal du bon pays : Cerfa en France, Seif 46 en Israël.
      </Text>

      {saved ? (
        <RavCard style={{ borderColor: c.success, borderWidth: 2 }}>
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800' }}>« {saved} » enregistrée.</Text>
        </RavCard>
      ) : null}

      {myAssociations.length === 0 && !editing ? (
        <EmptyState icon="business-outline" title="Aucune association pour l’instant" hint="Ajoutez l’association qui reçoit vos dons : elle apparaîtra sur les reçus fiscaux." />
      ) : null}

      {myAssociations.map((a) => (
        <RavCard key={a.id} style={{ borderColor: a.isDefault ? c.primary : c.border, borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.flag, { backgroundColor: c.primaryLight }]}>
              <Ionicons name="business" size={26} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{a.name}</Text>
                {a.isDefault ? (
                  <View style={[styles.badge, { backgroundColor: c.primaryLight }]}>
                    <Text style={{ color: c.primary, fontWeight: '800', fontSize: 12 }}>Par défaut</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>
                {a.purpose ? `${a.purpose} · ` : ''}{countryName(a.country)} · {RECEIPT_LABELS[a.receiptFormat]}
              </Text>
              {a.legalId ? <Text style={{ color: c.textMuted, fontSize: 13 }}>N° {a.legalId}</Text> : null}
              <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                {linksOf(a).length ? `Paiement : ${linksOf(a).map((p) => p.provider === 'stripe' ? 'Stripe' : p.provider === 'bit' ? 'Bit' : 'Lemon Squeezy').join(', ')}` : 'Aucun moyen de paiement relié (voir « Moyens de paiement »)'}
              </Text>
            </View>
          </View>

          {confirmId === a.id ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <BigButton label="Oui, retirer" color={c.danger} onPress={() => { removeAssociation(a.id); setConfirmId(null); }} style={{ flex: 1 }} />
              <BigButton label="Non" color={c.background} textColor={c.text} onPress={() => setConfirmId(null)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
            </View>
          ) : (
            <View style={styles.actions}>
              <Small icon="pencil" label="Modifier" color={c.primary} onPress={() => startEdit(a)} />
              {!a.isDefault ? <Small icon="star-outline" label="Par défaut" color={c.primary} onPress={() => setDefaultAssociation(a.id)} /> : null}
              {myAssociations.length > 1 ? <Small icon="trash" label="Retirer" color={c.danger} onPress={() => setConfirmId(a.id)} /> : null}
            </View>
          )}
        </RavCard>
      ))}

      {editing ? (
        <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{editing.id ? 'Modifier l’association' : 'Nouvelle association'}</Text>
          <BigLabel>Nom de l’association</BigLabel>
          <BigInput value={editing.draft.name} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, name: v } })} placeholder="Ex. : Association Beth Yaacov, Amutat Or Torah…" />
          <BigLabel hint="Facultatif">Objet</BigLabel>
          <BigInput value={editing.draft.purpose} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, purpose: v } })} placeholder="Synagogue, Hevra Kadisha, Talmud Torah…" />
          <BigLabel hint="Le pays détermine le reçu fiscal et le compte de paiement.">Pays de l’association</BigLabel>
          <CountryPicker value={editing.draft.country} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, country: v, receiptFormat: receiptFormatFor(v) } })} />
          <BigLabel>Reçu fiscal</BigLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['cerfa', 'seif46', 'other'] as ReceiptFormat[]).map((f) => {
              const active = editing.draft.receiptFormat === f;
              return (
                <Pressable key={f} onPress={() => setEditing({ ...editing, draft: { ...editing.draft, receiptFormat: f } })} accessibilityRole="radio" aria-checked={active} style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                  <Text style={{ color: active ? c.textOnPrimary : c.text, fontWeight: '700', fontSize: 15 }}>{RECEIPT_LABELS[f]}</Text>
                </Pressable>
              );
            })}
          </View>
          <BigLabel hint="N° RNA ou SIRET en France, n° d’amuta en Israël. Imprimé sur le reçu.">Numéro officiel (facultatif)</BigLabel>
          <BigInput value={editing.draft.legalId} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, legalId: v } })} placeholder="W751234567 / 580-123-456" />
          <BigLabel hint="Facultatif">Adresse du siège</BigLabel>
          <BigInput value={editing.draft.address} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, address: v } })} placeholder="Numéro et rue" />
          <BigInput value={editing.draft.city} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, city: v } })} placeholder="Ville" style={{ marginTop: 8 }} />
          <BigLabel hint="Nom imprimé au bas du reçu.">Signataire (facultatif)</BigLabel>
          <BigInput value={editing.draft.president} onChangeText={(v) => setEditing({ ...editing, draft: { ...editing.draft, president: v } })} placeholder="M. ou Mme …, président(e)" />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <BigButton label="Enregistrer" icon="checkmark-circle" disabled={!canSave} onPress={save} style={{ flex: 1 }} />
            <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setEditing(null)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
          </View>
        </RavCard>
      ) : (
        <BigButton label="Ajouter une association" icon="add-circle" onPress={startNew} style={{ marginTop: 8 }} />
      )}
    </RavScreen>
  );
}

function Small({ icon, label, color, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.small, { borderColor: color, opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color, fontWeight: '800', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flag: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  small: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5 },
});
