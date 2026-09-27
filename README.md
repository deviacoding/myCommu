# myCommu

Application mobile React Native (Expo + TypeScript) pour communautés religieuses. Le thème de couleur s'adapte à la communauté choisie à l'inscription.

## Statut

**Maquette frontend uniquement** — toutes les données sont dans `src/mocks/`. Pas de backend, pas de paiement réel, connexion simulée.

Seuls les contenus de la **communauté juive** sont réalisés pour l'instant (exemple de référence). Les autres communautés changent le thème mais affichent les mêmes contenus.

## Stack

- Expo SDK 54, React Native 0.81, React 19
- TypeScript strict
- React Navigation v7 (native-stack + bottom-tabs)
- `@expo/vector-icons`

## Lancer le projet

```sh
npm install
npm run web        # dans le navigateur (le plus léger)
npm run start      # Expo Go sur téléphone (scanner le QR code)
```

## Parcours

1. **Accueil** : bouton **Accès démo** (seul point d'entrée vers la maquette). Les formulaires de connexion et d'inscription sont présents mais affichent « bientôt disponible » : ils serviront à la vraie authentification.
2. **Accès démo** → choix de la communauté (Juif, Musulman, Chrétien) → choix du rôle : **Accès rabbin** ou **Accès fidèle**.
3. **Accès rabbin** : interface de publication pensée pour des utilisateurs âgés (gros textes, gros boutons, une action par écran) :
   - Écrire un dvar Torah (titre, thème, texte libre découpé automatiquement en parties) → apparaît en premier chez les fidèles.
   - Répondre aux questions (liste des non répondues, éditeur, sources en un clic).
   - Horaires des fêtes et offices (chaque heure modifiable sur place).
   - Agenda (ajout / suppression d'événements).
   - Dons et engagements (enregistrer un chéni, maftir, nédava… pour un fidèle, qui le retrouve dans « À payer »).
   - **Tous les textes peuvent être corrigés et réécrits par ChatGPT** : bouton vert sur chaque zone de texte, proposition à accepter ou refuser. Simulation locale (`src/utils/ai.ts`) en attendant le branchement de l'API.
   - Bouton « Voir l'application comme un fidèle » pour vérifier le rendu.
4. **Accès fidèle** : 5 onglets :

| Onglet | Contenu |
| --- | --- |
| **Horaires** | Fêtes de Tichri 5787 avec allumages, fins de fête, notes ; offices quotidiens ; segment **Agenda** avec les événements à venir de la communauté |
| **Cours** (libellé de l'onglet) | **Dvar Torah** : le dernier dvar Torah du Rav s'affiche directement en entier, avec sa photo en rond façon réseau social (« Souccot : la fragilité comme refuge », sourcé). En dessous, les divré Torah précédents filtrables par catégorie |
| **Questions** | Questions-réponses membres ↔ Rav (photo du Rav sur chaque réponse) avec sources halakhiques. La première question est marquée **Non répondu**. Filtres et formulaire pour poser une question (anonyme possible) |
| **Dons** | S'ouvre sur **Maasser** : calculateur (salaire net − frais école juive / Talmud Torah / autres, puis 10 %), suivi du mois. Tsedaka avec montants rapides en shekels (1, 5, 18, 26, 52 ₪). Engagements à payer (chéni paracha Berechit 104 ₪, chaise à l'année 350 ₪, nedava, cotisation…). **Reçus fiscaux** générés automatiquement : Seif 46 (Israël) ou Cerfa 11580 (France), à imprimer, télécharger ou envoyer par email. Historique |
| **Compte** | Informations, préférences, et **l'ora** : représentation de l'âme qui grandit avec les dons, les cours suivis et les questions posées, en 5 niveaux (Nefech, Roua'h, Nechama, 'Haya, Ye'hida) |

Un don, un cours lu ou une question posée mettent à jour l'ora immédiatement (état en mémoire, réinitialisé au rechargement).

## Structure

```
src/
  components/    Aura, ui (Button, Card, Chip…), Avatar, ProgressBar, ScreenHeader
  mocks/         user, schedule (fêtes + agenda), courses, questions, donations
  navigation/    AuthStack (Login, Signup), MainTabs (5 onglets), AppStack (détails, modales)
  screens/       auth, schedule, courses, questions, donations, account
  state/         AuthContext (connexion simulée), AppState (dons, questions, points, niveau)
  theme/         ThemeProvider + palettes par communauté
  types/, utils/
```

## Monnaie

Tous les montants sont en shekels (₪), constante `CURRENCY` dans `src/utils/time.ts`.

## Horaires

Les horaires de Tichri 5787 (sept.–oct. 2026) sont indicatifs pour Paris. La date hébraïque affichée est calculée à partir du 1 Tichri 5787 = 12 septembre 2026 (valable jusqu'à Kislev).

## Prochaines étapes

Contenus pour les communautés chrétienne et musulmane, puis backend (Firebase : auth réelle, stockage des dons/questions, paiement).
