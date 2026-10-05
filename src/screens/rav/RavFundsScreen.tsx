import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar } from '../../components/ProgressBar';
import { RULES, isoDaysAfter } from '../../config/gamification';
import { formatLong, money, todayISO } from '../../utils/time';
import { RavScreen, RavCard, BigChoice, BigButton, BigInput, BigLabel, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavFunds'>;
type Tab = 'funds' | 'chains' | 'boosts';

// Caisses (destinations des dons), chaînes de tsedaka et journées à points doublés : tout ce qui fait vivre
// la générosité de la communauté, géré par le responsable ou le trésorier.
export function RavFundsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { funds, addFund, updateFund, campaigns, addCampaign, closeCampaign, campaignProgress, boosts, boostsThisYear, addBoost, removeBoost, myAssociations, seed, congregation } = useAppState();
  const [tab, setTab] = useState<Tab>('funds');
  const today = todayISO();

  // Caisses
  const [fundName, setFundName] = useState('');
  const [fundDesc, setFundDesc] = useState('');
  const [fundAssoc, setFundAssoc] = useState<string | undefined>(undefined);
  const [showFund, setShowFund] = useState(false);

  // Chaînes
  const [chTitle, setChTitle] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [chFund, setChFund] = useState<string | undefined>(undefined);
  const [chTarget, setChTarget] = useState('');
  const [chDeadline, setChDeadline] = useState(isoDaysAfter(today, 14));
  const [showChain, setShowChain] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null);

  // Jours doublés
  const [boostDate, setBoostDate] = useState(isoDaysAfter(today, 1));
  const [boostLabel, setBoostLabel] = useState('');
  const [boostMsg, setBoostMsg] = useState<string | null>(null);

  const validISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + 'T12:00:00').getTime());

  const createFund = () => {
    if (!fundName.trim()) return;
    addFund({ name: fundName, description: fundDesc, associationId: fundAssoc });
    setFundName('');
    setFundDesc('');
    setFundAssoc(undefined);
    setShowFund(false);
  };

  const createChain = () => {
    const target = parseInt(chTarget.replace(/\D/g, ''), 10) || 0;
    if (!chTitle.trim() || target <= 0 || !validISO(chDeadline)) return;
    addCampaign({ title: chTitle, description: chDesc, fundId: chFund, target, deadline: chDeadline });
    setChTitle('');
    setChDesc('');
    setChFund(undefined);
    setChTarget('');
    setChDeadline(isoDaysAfter(today, 14));
    setShowChain(false);
  };

  const createBoost = () => {
    if (!validISO(boostDate) || boostDate < today) {
      setBoostMsg('Date invalide : écrivez-la sous la forme AAAA-MM-JJ, aujourd’hui ou plus tard.');
      return;
    }
    const ok = addBoost(boostDate, boostLabel);
    setBoostMsg(ok ? `Journée posée le ${formatLong(boostDate)}.` : 'Quota atteint ou date déjà posée.');
    if (ok) setBoostLabel('');
  };

  const assocName = (id?: string) => myAssociations.find((a) => a.id === id)?.name;
  const fundName_ = (id?: string) => funds.find((f) => f.id === id)?.name;
  const upcomingBoosts = [...boosts].filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <RavScreen title="Caisses, chaînes et jours doublés" subtitle={congregation.name} onBack={() => navigation.goBack()}>
      <BigChoice<Tab>
        options={[
          { value: 'funds', label: `Caisses (${funds.length})` },
          { value: 'chains', label: `Chaînes (${campaigns.length})` },
          { value: 'boosts', label: `Jours doublés (${boostsThisYear}/${RULES.boostMaxPerYear})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* ---------------- Caisses ---------------- */}
      {tab === 'funds' ? (
        <>
          <Note icon="information-circle" text="S’il n’y a aucune caisse, le fidèle ne choisit rien : son don va à l’établissement. Dès que vous créez des caisses, il choisit au moment de donner." />
          {funds.length === 0 ? (
            <EmptyState icon="wallet-outline" title="Aucune caisse" hint="Exemples : Hevra Kadisha, Talmud Torah, Familles dans le besoin, Travaux de la synagogue." />
          ) : (
            funds.map((f) => (
              <RavCard key={f.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.icon, { backgroundColor: c.primaryLight }]}>
                  <MaterialCommunityIcons name={(f.icon as never) ?? 'wallet'} size={28} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{f.name}</Text>
                  {f.description ? <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{f.description}</Text> : null}
                  {assocName(f.associationId) ? <Text style={{ color: c.primary, fontSize: 14, fontWeight: '700', marginTop: 2 }}>Association : {assocName(f.associationId)}</Text> : null}
                </View>
                <Pressable onPress={() => updateFund(f.id, { archived: true })} style={[styles.small, { borderColor: c.border }]}>
                  <Ionicons name="archive-outline" size={18} color={c.textMuted} />
                  <Text style={{ color: c.textMuted, fontWeight: '700' }}>Archiver</Text>
                </Pressable>
              </RavCard>
            ))
          )}
          {showFund ? (
            <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
              <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Nouvelle caisse</Text>
              <BigInput value={fundName} onChangeText={setFundName} placeholder="Nom (ex. : Hevra Kadisha)" style={{ marginTop: 8 }} />
              <BigInput value={fundDesc} onChangeText={setFundDesc} placeholder="À quoi sert cette caisse ? (facultatif)" style={{ marginTop: 8 }} />
              {myAssociations.length > 1 ? (
                <>
                  <BigLabel hint="Le reçu fiscal est émis par cette association.">Association bénéficiaire</BigLabel>
                  <BigChoice<string>
                    options={[{ value: '', label: 'Par défaut' }, ...myAssociations.map((a) => ({ value: a.id, label: a.name }))]}
                    value={fundAssoc ?? ''}
                    onChange={(v) => setFundAssoc(v || undefined)}
                  />
                </>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <BigButton label="Créer la caisse" icon="checkmark" disabled={!fundName.trim()} onPress={createFund} style={{ flex: 1 }} />
                <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowFund(false)} style={{ borderWidth: 1, borderColor: c.border }} />
              </View>
            </RavCard>
          ) : (
            <BigButton label="Ajouter une caisse" icon="add-circle" onPress={() => setShowFund(true)} />
          )}
        </>
      ) : null}

      {/* ---------------- Chaînes ---------------- */}
      {tab === 'chains' ? (
        <>
          <Note icon="link" text="Vous lancez la chaîne ; chaque fidèle donne, même un peu, et passe le maillon à un proche. Tout le monde voit la barre avancer." />
          {campaigns.length === 0 ? (
            <EmptyState icon="link-outline" title="Aucune chaîne en cours" hint="Une chaîne a un objectif et une date de fin. Exemple : « Chaîne de Tichri : 5 000 ₪ pour la Hevra Kadisha avant Souccot »." />
          ) : (
            campaigns.map((ch) => {
              const p = campaignProgress(ch.id);
              const ratio = ch.target > 0 ? p.raised / ch.target : 0;
              return (
                <RavCard key={ch.id}>
                  <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{ch.title}</Text>
                  {ch.description ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>{ch.description}</Text> : null}
                  <View style={{ marginTop: 10 }}>
                    <ProgressBar progress={ratio} height={14} color={c.secondary} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, flexWrap: 'wrap', gap: 6 }}>
                    <Text style={{ color: c.text, fontSize: BIG.small, fontWeight: '800' }}>{money(p.raised)} / {money(ch.target)} · {Math.round(ratio * 100)} %</Text>
                    <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{p.donors} maillon{p.donors > 1 ? 's' : ''} · jusqu’au {formatLong(ch.deadline)}</Text>
                  </View>
                  {fundName_(ch.fundId) ? <Text style={{ color: c.primary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>Caisse : {fundName_(ch.fundId)}</Text> : null}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <BigButton
                      label="Texte à partager"
                      icon="share-social"
                      color={c.primaryLight}
                      textColor={c.primary}
                      onPress={() => setShareText(shareText === ch.id ? null : ch.id)}
                      style={{ flex: 1 }}
                    />
                    <BigButton label="Clôturer" icon="checkmark-done" color={c.background} textColor={c.textMuted} onPress={() => closeCampaign(ch.id)} style={{ borderWidth: 1, borderColor: c.border }} />
                  </View>
                  {shareText === ch.id ? (
                    <View style={[styles.share, { backgroundColor: c.background, borderColor: c.border }]}>
                      <Text selectable style={{ color: c.text, fontSize: BIG.small, lineHeight: 24 }}>
                        🔗 {ch.title}{'\n'}
                        Objectif : {money(ch.target)} avant le {formatLong(ch.deadline)} · déjà {money(p.raised)}.{'\n'}
                        Chacun donne ce qu’il peut, même un peu, et passe le maillon. Rejoignez la chaîne dans myCommu, communauté {congregation.name} (code {congregation.code}).
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6 }}>Sélectionnez le texte pour le copier dans WhatsApp ou un e-mail.</Text>
                    </View>
                  ) : null}
                </RavCard>
              );
            })
          )}
          {showChain ? (
            <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
              <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Nouvelle chaîne de {seed.alms.name.toLowerCase()}</Text>
              <BigInput value={chTitle} onChangeText={setChTitle} placeholder="Titre (ex. : Chaîne de Tichri pour la Hevra Kadisha)" style={{ marginTop: 8 }} />
              <BigInput value={chDesc} onChangeText={setChDesc} placeholder="Quelques mots pour motiver (facultatif)" style={{ marginTop: 8 }} />
              {funds.length ? (
                <>
                  <BigLabel hint="Les dons de la chaîne iront dans cette caisse.">Caisse (facultatif)</BigLabel>
                  <BigChoice<string> options={[{ value: '', label: 'Établissement' }, ...funds.map((f) => ({ value: f.id, label: f.name }))]} value={chFund ?? ''} onChange={(v) => setChFund(v || undefined)} />
                </>
              ) : null}
              <BigLabel>Objectif en {seed.currency}</BigLabel>
              <BigInput value={chTarget} onChangeText={setChTarget} keyboardType="number-pad" placeholder={`Ex. : ${seed.currency === '₪' ? '5000' : '1500'}`} />
              <BigLabel hint="Forme AAAA-MM-JJ, ou un raccourci.">Échéance</BigLabel>
              <BigInput value={chDeadline} onChangeText={setChDeadline} placeholder="AAAA-MM-JJ" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {[7, 14, 30].map((n) => (
                  <Pressable key={n} onPress={() => setChDeadline(isoDaysAfter(today, n))} style={[styles.chip, { backgroundColor: chDeadline === isoDaysAfter(today, n) ? c.primary : c.surface, borderColor: chDeadline === isoDaysAfter(today, n) ? c.primary : c.border }]}>
                    <Text style={{ color: chDeadline === isoDaysAfter(today, n) ? c.textOnPrimary : c.text, fontWeight: '700', fontSize: 16 }}>Dans {n} jours</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <BigButton label="Lancer la chaîne" icon="rocket" disabled={!chTitle.trim() || !(parseInt(chTarget.replace(/\D/g, ''), 10) > 0) || !validISO(chDeadline)} onPress={createChain} style={{ flex: 1 }} />
                <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowChain(false)} style={{ borderWidth: 1, borderColor: c.border }} />
              </View>
            </RavCard>
          ) : (
            <BigButton label="Lancer une chaîne" icon="add-circle" onPress={() => setShowChain(true)} />
          )}
        </>
      ) : null}

      {/* ---------------- Jours doublés ---------------- */}
      {tab === 'boosts' ? (
        <>
          <RavCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.secondary, borderWidth: 2 }}>
            <MaterialCommunityIcons name="star-four-points" size={34} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>{boostsThisYear} / {RULES.boostMaxPerYear} journées</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>sur 12 mois glissants</Text>
            </View>
          </RavCard>
          <Note icon="flash" text="Ce jour-là, chaque geste et chaque don comptent double. La communauté est prévenue la veille à 18 h. Réservez-les aux grands moments : veille de Kippour, Pourim, Roch Hodech…" />

          <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
            <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Poser une journée</Text>
            <BigInput value={boostDate} onChangeText={setBoostDate} placeholder="AAAA-MM-JJ" style={{ marginTop: 8 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {[{ n: 1, l: 'Demain' }, { n: 2, l: 'Après-demain' }, { n: 7, l: 'Dans 7 jours' }].map((x) => {
                const d = isoDaysAfter(today, x.n);
                const active = boostDate === d;
                return (
                  <Pressable key={x.n} onPress={() => setBoostDate(d)} style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                    <Text style={{ color: active ? c.textOnPrimary : c.text, fontWeight: '700', fontSize: 16 }}>{x.l}</Text>
                  </Pressable>
                );
              })}
            </View>
            <BigInput value={boostLabel} onChangeText={setBoostLabel} placeholder="Libellé (ex. : Veille de Kippour)" style={{ marginTop: 8 }} />
            <BigButton label="Poser cette journée" icon="flash" disabled={boostsThisYear >= RULES.boostMaxPerYear} onPress={createBoost} style={{ marginTop: 12 }} />
            {boostMsg ? <Text style={{ color: boostMsg.startsWith('Journée') ? c.success : c.danger, fontSize: BIG.small, marginTop: 8, fontWeight: '700' }}>{boostMsg}</Text> : null}
          </RavCard>

          <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '900', marginTop: 6, marginBottom: 8 }}>À venir</Text>
          {upcomingBoosts.length === 0 ? (
            <EmptyState compact icon="flash-outline" title="Aucune journée à venir" hint="Posez-en une ci-dessus." />
          ) : (
            upcomingBoosts.map((b) => (
              <RavCard key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons name="star-four-points" size={26} color={c.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{formatLong(b.date)}</Text>
                  <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{b.label}</Text>
                </View>
                <Pressable onPress={() => removeBoost(b.id)} style={[styles.small, { borderColor: c.border }]}>
                  <Ionicons name="trash-outline" size={18} color={c.danger} />
                  <Text style={{ color: c.danger, fontWeight: '700' }}>Retirer</Text>
                </Pressable>
              </RavCard>
            ))
          )}
        </>
      ) : null}
    </RavScreen>
  );
}

function Note({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.note, { backgroundColor: c.primaryLight }]}>
      <Ionicons name={icon} size={22} color={c.primary} />
      <Text style={{ color: c.primary, fontSize: 15, flex: 1, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  small: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  chip: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, minHeight: 50, justifyContent: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginTop: 14, marginBottom: 12 },
  share: { marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
