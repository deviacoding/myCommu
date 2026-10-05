# L'ora qui grandit

Système de points et de niveaux de myCommu (ora pour la confession juive, nur, flamme, pāramitā selon la confession). Un seul niveau par fidèle, qui monte sans fin, nourri par deux sources visibles séparément : l'**assiduité** et la **générosité**. Code : `src/config/gamification.ts` (barème, formule, titres, calcul), `src/components/OraCard.tsx` (écran du fidèle), `src/screens/account/AttestationScreen.tsx`, `src/screens/rav/RavEngagementScreen.tsx`.

## Barème

| Action | Points | Limite | Catégorie |
|---|---|---|---|
| Ouvrir l'application | 1 | 1 / jour | assiduité |
| Ouvrir Horaires | 1 | 1 / jour | assiduité |
| Ouvrir l'Agenda | 1 | 1 / jour | assiduité |
| Lire un cours en entier (défilé jusqu'en bas ou 30 s ; vidéo 80 %) | 2 | une fois par cours | assiduité |
| Poser une question | 2, +1 quand le responsable répond | 1 question comptée / jour | assiduité |
| 7 jours d'ouverture d'affilée | +5 | par semaine de série | assiduité |
| 30 jours d'affilée | +20 | par mois de série | assiduité |
| Tsedaka, sadaqa, offrande, dana, promesse réglée | 4 par tranche de 10 € (40 ₪) | — | générosité |
| Maasser, zakat, dîme | 10 par tranche de 100 € (400 ₪) | — | générosité |
| Au moins un don par mois, 3 mois d'affilée | +15 | par trimestre | générosité |
| Rejoindre sa première communauté | 5 | une fois | départ |
| Compléter son profil (téléphone, ville, date de naissance) | 2 | une fois | départ |

Les tranches sont entamées (15 € = 4 points). Les points de don viennent **uniquement des dons confirmés** (paiement Stripe via webhook, ou don enregistré par le trésorier) : un fidèle ne peut pas se les attribuer.

## Niveaux

Le niveau 1 coûte 5 points, chaque niveau suivant coûte un point de plus. Total pour le niveau *n* :

```
points(n) = n × (n + 9) / 2      →  10 : 95   20 : 290   50 : 1 475   100 : 5 450
```

Paliers nommés tous les 10 niveaux, avec les noms de la confession (`seed.gamification.levels`, 5 noms : Nefech, Roua'h, Nechama, 'Haya, Ye'hida pour le judaïsme), puis le cycle recommence avec un numéro (Nefech II…). L'aura de l'écran Compte suit le palier.

## Titres (12 mois glissants)

- Assiduité : Régulier (30 jours actifs), Fidèle (100), Pilier (365).
- Générosité : Généreux (180 €), Bienfaiteur (1 000 €), Mécène (5 000 €) ; ×4 en shekels.

## Données

- `activity/{uid}_{date}_{type}` : une action quotidienne (`open`, `schedule`, `agenda`) avec `uid`, `congregationId`, `date`. L'id impose l'unicité par jour ; règles : chacun écrit la sienne, l'équipe lit celle de sa communauté.
- Les cours lus viennent de `users/{uid}.readCourses`, les questions de `questions`, les dons de `donations`.
- Tout est **recalculé** à chaque affichage (`computeGamification`) : changer le barème recalcule tout le monde sans perdre l'historique.

## Écrans

- **Compte → Mon ora** : niveau, palier, progression, jauge assiduité et jauge générosité, titres, « prochain pas », bouton « Mon attestation ».
- **Mon attestation** : page imprimable (jours de présence, série, cours lus, questions, dons par association, niveau, titres). Sans valeur fiscale.
- **Responsable → Fidèles engagés** : les 10 plus assidus et les 10 plus généreux du mois ou de l'année, visibles par le responsable seul.
- Un « +1 » discret s'affiche quand une action rapporte des points (`PointsToast`).

## Série de tsedaka, remerciement, classement (octobre 2026)

- **Série de tsedaka** (`tsedakaStreak`) : un don de tsedaka par jour, le samedi est neutre (il ne compte ni ne casse). Points de série ajoutés à la générosité : +1 par jour à partir du 2e, +10 au 7e jour, +40 au 30e, +150 au 100e. Affichée dans l'onglet Dons (flamme), sur la carte Mon ora et à la fin de chaque don.
- **Fête du don** : à la confirmation d'un don, carillon (`assets/sounds/tsedaka.wav`, expo-audio) et éclats animés autour de l'aura (`Celebration`).
- **Maasser → remerciement** : la Cloud Function `onDonationCreated` envoie un push aux rôles finance (responsable, adjoint, trésorier) quand un maasser arrive. Sur l'accueil du responsable, un bandeau « N maasser à remercier » (14 derniers jours, `thankedAt` vide) ouvre un message pré-rempli ; « Envoyer » crée une **conversation** (`questions` avec `kind: 'message'`, privée, `askerUid` = le fidèle) et pose `thankedAt` sur le don.
- **Chat dans Questions/Réponses** : le fidèle peut répondre dans le fil de n'importe quelle question ou message (`replyToQuestion`, statut repassé à `pending`), le responsable voit tout le fil et répond à nouveau. Règles : le fidèle ne peut modifier que `messages` et `status` de sa propre conversation ; le responsable peut créer un document `kind == 'message'`.
- **Classement** : chaque fidèle publie son score dans `scores/{congregationId}_{uid}` (points, assiduité, générosité, niveau ; écriture différée de 2 s après chaque changement). Les membres de la communauté le lisent. Carte Mon ora : rang par points et par assiduité, podiums ; écran **Classement** (`Leaderboard`) : podium, top 20, sa place. Prénoms + initiale, jamais de montants.

## Gamification 2 (octobre 2026) : série unique, gels, rachat, badges, ligues, caisses, chaînes

- **Série unique d'utilisation** (`ora.streak`) : un jour compte dès qu'une action *utile* est faite — horaires consultés, agenda, cours lu, réponse lue, don. Ouvrir l'application ne suffit pas. Jours neutres : samedi et fêtes (yom tov) pour les communautés juives (`jewishQuietDays`, hebcal) ; ils ne comptent ni ne cassent.
- **Gels de série** : un gel gagné tous les 7 jours de série, 2 en réserve au plus, consommé automatiquement quand un jour est manqué. Pas d'angoisse : un seul geste par jour, et la série pardonne.
- **Rachat de série** : série cassée depuis ≤ 30 jours → une tsedaka de `jours manqués × 0,10` (10 agorot / 10 centimes par jour) la répare (`Donation.streakRepair = { from, to, days }`, jours couverts comptés comme actifs). Via Stripe, minimum 0,50 € / 2 ₪.
- **Grands dons** : bonus par don (≥ 180 € +20, ≥ 500 € +60, ≥ 1 000 € +150, ≥ 5 000 € +800 ; ×4 en ₪) en plus des tranches. **Paliers de donateur** sur 12 mois (`DONOR_TIERS`) : Petit, Régulier (100 €), Grand donateur (500 €), Pilier (2 000 €) — visibles par le responsable seulement.
- **Journées à points doublés** (`boosts`) : posées par le responsable, 30 au plus sur 365 jours glissants ; tout compte double ce jour-là ; la communauté est prévenue la veille à 18 h (`engagementReminders`).
- **Badges** (`computeBadges`, jamais stockés sauf « vus ») : premiers pas (jour, semaine, tsedaka, maasser), flammes 7/30/100/365, tsedaka 7/30/100, maillon et chaînes, paliers de donateur, maasser 1/3/6/9/12 mois d'affilée, étude, ligue, niveaux.
- **Ligues** : quinzaines (`leaguePeriod`, lundi → dimanche d'après, époque 2026-01-05). Chaque fidèle publie `periodPoints` dans `scores` ; classement dans Mon ora et l'écran Classement. Le responsable voit « Ligue terminée : X a gagné » et félicite (`congratulateWinner` → conversation + doc `leagues/{cong}_{période}`, +30 points pour le vainqueur).
- **Caisses** (`funds`) : si la communauté en a créé, le fidèle choisit au moment du don ; sinon aucune question, le don va à l'établissement. **Chaînes de tsedaka** (`campaigns`) : lancées par le responsable (objectif, échéance, caisse), progression partagée, chaque don porte `campaignId`.
- **Réactions du responsable** (`reactToMember`) : like, texte, audio (expo-audio), vidéo de 5 s (expo-image-picker) → message `kind` + `mediaUrl` (Storage `reactions/{cong}/…`) dans la conversation du fidèle (onglet Questions).
- **Notifications** : tout don → push aux rôles finance (`onDonationCreated`). Heure habituelle d'ouverture (`users.usualHourUtc`, médiane des 14 dernières ouvertures) → rappel « Ravive ton aura » / « Sauvegarde ta série » une heure avant, s'il n'y a rien eu dans la journée ; jamais le Chabbat ni les fêtes ; un par jour au plus (`engagementReminders`, toutes les heures).
