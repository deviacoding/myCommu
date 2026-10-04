import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { DonationCategory, DonationItem } from '../../types';
import { RavScreen, BigLabel, BigInput, BigButton, Done, RavCard, BIG } from './RavUi';
import { money, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavRecordDonation'>;
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

export function RavRecordDonationScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { categories, addCategory, addSubcategory, addPledge, members, seed } = useAppState();

  const [search, setSearch] = useState('');
  const [member, setMember] = useState<string | null>(null);
  const [category, setCategory] = useState<DonationCategory | null>(null);
  const [item, setItem] = useState<DonationItem | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const currentCategory = useMemo(() => (category ? categories.find((x) => x.id === category.id) ?? null : null), [categories, category]);
  const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()));
  const amountNum = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const canSave = !!member && !!currentCategory && !!item && amountNum > 0;

  const chooseItem = (it: DonationItem) => {
    setItem(it);
    setAmount(String(it.amount));
  };

  const createCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    const cat = addCategory(name);
    setCategory(cat);
    setItem(null);
    setNewCat('');
    setShowNewCat(false);
  };

  const createItem = () => {
    const name = newItem.trim();
    const amt = parseInt(newItemAmount.replace(/\D/g, ''), 10) || 0;
    if (!name || !currentCategory) return;
    addSubcategory(currentCategory.id, name, amt);
    setItem({ id: 'pending', name, amount: amt });
    setAmount(String(amt || ''));
    setNewItem('');
    setNewItemAmount('');
    setShowNewItem(false);
  };

  const save = () => {
    if (!canSave || !currentCategory || !item || !member) return;
    addPledge({
      member,
      category: currentCategory.name,
      label: item.name,
      amount: amountNum,
      dueDate: plusDays(30),
      origin: note.trim() || currentCategory.name,
    });
    setSaved(`${item.name} · ${money(amountNum)} attribué à ${member}`);
  };

  const reset = () => {
    setMember(null);
    setCategory(null);
    setItem(null);
    setAmount('');
    setNote('');
    setSearch('');
    setSaved(null);
  };

  if (saved) {
    return (
      <RavScreen title="Don enregistré" onBack={() => navigation.goBack()}>
        <Done title="C’est noté !" text={`${saved}. Le ${seed.memberLabel} le retrouve dans « ${seed.pendingLabel} » sur son téléphone et peut régler en un geste.`}>
          <View style={{ alignSelf: 'stretch', marginTop: 18, gap: 10 }}>
            <BigButton label="Enregistrer un autre don" icon="add-circle" onPress={reset} />
            <BigButton label="Voir les dons à récupérer" icon="cash" color={c.primaryLight} textColor={c.primary} onPress={() => navigation.replace('RavCollect')} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  return (
    <RavScreen title="Enregistrer un don" subtitle="4 étapes, une minute" onBack={() => navigation.goBack()}>
      {/* Étape 1 : le fidèle */}
      <StepTitle n={1} title="À qui ?" done={!!member} value={member ?? undefined} />
      {!member ? (
        <>
          <BigInput value={search} onChangeText={setSearch} placeholder={`Chercher un ${seed.memberLabel} par son nom…`} />
          <View style={{ marginTop: 10 }}>
            {members.length === 0 && !search.trim() ? (
              <RavCard style={{ alignItems: 'center' }}>
                <Ionicons name="people-outline" size={40} color={c.primary} />
                <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>Aucun {seed.memberLabel} n’a encore rejoint</Text>
                <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4, textAlign: 'center' }}>Partagez votre QR code ou votre code pour accueillir vos {seed.memberLabel}s. Vous pouvez aussi taper un nom ci-dessus pour enregistrer un don à son intention.</Text>
              </RavCard>
            ) : null}
            {filteredMembers.map((m) => (
              <Pressable key={m.id} onPress={() => setMember(m.name)} style={({ pressed }) => [styles.member, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
                <Avatar name={m.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>{m.name}</Text>
                  {m.hebrewName ? <Text style={{ color: c.textMuted, fontSize: 15 }}>{m.hebrewName}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={26} color={c.textMuted} />
              </Pressable>
            ))}
            {search.trim() && !filteredMembers.length ? (
              <BigButton label={`Ajouter « ${search.trim()} » comme nouveau ${seed.memberLabel}`} icon="person-add" color={c.primaryLight} textColor={c.primary} onPress={() => setMember(search.trim())} />
            ) : null}
          </View>
        </>
      ) : (
        <ChangeButton label="Changer de fidèle" onPress={() => setMember(null)} />
      )}

      {/* Étape 2 : la catégorie */}
      {member ? (
        <>
          <StepTitle n={2} title="Quelle catégorie ?" done={!!currentCategory} value={currentCategory?.name} />
          {!currentCategory ? (
            <View style={{ gap: 10 }}>
              {categories.length === 0 ? (
                <RavCard style={{ alignItems: 'center', marginBottom: 0 }}>
                  <Ionicons name="pricetags-outline" size={40} color={c.primary} />
                  <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>Aucune catégorie de don</Text>
                  <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4, textAlign: 'center' }}>Créez votre première catégorie ci-dessous (ex. : fêtes, offices, travaux…).</Text>
                </RavCard>
              ) : null}
              {categories.map((cat) => (
                <Pressable key={cat.id} onPress={() => { setCategory(cat); setItem(null); }} style={({ pressed }) => [styles.cat, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
                  <View style={[styles.catIcon, { backgroundColor: c.primaryLight }]}>
                    <MaterialCommunityIcons name={cat.icon as MciName} size={28} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>{cat.name}</Text>
                    <Text style={{ color: c.textMuted, fontSize: 15 }}>{(cat.items ?? []).length ? (cat.items ?? []).map((i) => i.name).slice(0, 4).join(', ') + ((cat.items ?? []).length > 4 ? '…' : '') : 'Aucun type de don pour l’instant'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={26} color={c.textMuted} />
                </Pressable>
              ))}
              {showNewCat ? (
                <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
                  <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 8 }}>Nouvelle catégorie</Text>
                  <BigInput value={newCat} onChangeText={setNewCat} placeholder="Nom de la catégorie" />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <BigButton label="Créer" icon="checkmark" onPress={createCategory} disabled={!newCat.trim()} style={{ flex: 1 }} />
                    <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowNewCat(false)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
                  </View>
                </RavCard>
              ) : (
                <BigButton label="Ajouter une catégorie" icon="add" color={c.primaryLight} textColor={c.primary} onPress={() => setShowNewCat(true)} />
              )}
            </View>
          ) : (
            <ChangeButton label="Changer de catégorie" onPress={() => { setCategory(null); setItem(null); }} />
          )}
        </>
      ) : null}

      {/* Étape 3 : le type de don */}
      {member && currentCategory ? (
        <>
          <StepTitle n={3} title="Quel don ?" done={!!item} value={item ? `${item.name} · ${money(amountNum)}` : undefined} />
          {(currentCategory.items ?? []).length === 0 ? (
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 8 }}>Aucun type de don dans « {currentCategory.name} » pour l’instant. Ajoutez-en un ci-dessous.</Text>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(currentCategory.items ?? []).map((it) => {
              const active = item?.name === it.name;
              return (
                <Pressable key={it.id} onPress={() => chooseItem(it)} style={[styles.chip, { backgroundColor: active ? c.secondary : c.surface, borderColor: active ? c.secondary : c.border }]}>
                  {active ? <Ionicons name="checkmark" size={18} color={c.primaryDark} /> : null}
                  <Text style={{ color: active ? c.primaryDark : c.text, fontSize: 17, fontWeight: '700' }}>{it.name}</Text>
                  <Text style={{ color: active ? c.primaryDark : c.textMuted, fontSize: 14 }}>{it.amount ? `${it.amount} ${seed.currency}` : ''}</Text>
                </Pressable>
              );
            })}
          </View>
          {showNewItem ? (
            <RavCard style={{ borderColor: c.primary, borderWidth: 2, marginTop: 12 }}>
              <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 8 }}>Nouveau type de don dans « {currentCategory.name} »</Text>
              <BigInput value={newItem} onChangeText={setNewItem} placeholder="Nom du type de don" />
              <BigInput value={newItemAmount} onChangeText={setNewItemAmount} keyboardType="number-pad" placeholder={`Montant habituel en ${seed.currency} (facultatif)`} style={{ marginTop: 8 }} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <BigButton label="Ajouter" icon="checkmark" onPress={createItem} disabled={!newItem.trim()} style={{ flex: 1 }} />
                <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowNewItem(false)} style={{ flex: 1, borderWidth: 1, borderColor: c.border }} />
              </View>
            </RavCard>
          ) : (
            <View style={{ marginTop: 10 }}>
              <BigButton label="Ajouter un type de don" icon="add" color={c.primaryLight} textColor={c.primary} onPress={() => setShowNewItem(true)} />
            </View>
          )}
        </>
      ) : null}

      {/* Étape 4 : montant et note */}
      {member && currentCategory && item ? (
        <>
          <StepTitle n={4} title="Montant" done={amountNum > 0} />
          <BigInput value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder={`Montant en ${seed.currency}`} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {[52, 104, 180, 260, 520, 1000].map((a) => (
              <Pressable key={a} onPress={() => setAmount(String(a))} style={[styles.chip, { backgroundColor: amountNum === a ? c.primary : c.surface, borderColor: amountNum === a ? c.primary : c.border }]}>
                <Text style={{ color: amountNum === a ? c.textOnPrimary : c.text, fontSize: 16, fontWeight: '700' }}>{a} {seed.currency}</Text>
              </Pressable>
            ))}
          </View>
          <BigLabel hint="Facultatif">Une précision</BigLabel>
          <BigInput value={note} onChangeText={setNote} placeholder="Ex. : en l’honneur de…" />

          <RavCard style={{ marginTop: 22, backgroundColor: c.primaryLight, borderColor: c.primaryLight }}>
            <Text style={{ color: c.textMuted, fontSize: 14, fontWeight: '700' }}>RÉCAPITULATIF</Text>
            <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', marginTop: 6 }}>{member}</Text>
            <Text style={{ color: c.text, fontSize: BIG.text, marginTop: 2 }}>
              {currentCategory.name} → {item.name}
            </Text>
            <Text style={{ color: c.primary, fontSize: 30, fontWeight: '900', marginTop: 6 }}>{money(amountNum)}</Text>
          </RavCard>
          <BigButton label="Enregistrer ce don" icon="checkmark-circle" disabled={!canSave} onPress={save} />
        </>
      ) : null}
    </RavScreen>
  );
}

function StepTitle({ n, title, done, value }: { n: number; title: string; done: boolean; value?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 10 }}>
      <View style={[styles.step, { backgroundColor: done ? c.success : c.primary }]}>
        {done ? <Ionicons name="checkmark" size={22} color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{n}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>{title}</Text>
        {done && value ? <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '700' }}>{value}</Text> : null}
      </View>
    </View>
  );
}

function ChangeButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable onPress={onPress} style={[styles.change, { borderColor: c.border }]}>
      <Ionicons name="swap-horizontal" size={20} color={c.primary} />
      <Text style={{ color: c.primary, fontWeight: '700', fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  member: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1.5, marginBottom: 8, minHeight: 68 },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, borderWidth: 1.5, minHeight: 84 },
  catIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, minHeight: 52 },
  step: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  change: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
});
