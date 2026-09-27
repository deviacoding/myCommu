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
   - Écrire un dvar Torah (titre, thème, texte libre découpé automatiquement en parties) → apparaît en premier chez les fidèles. Barre de mise en forme : **gras**, ==surligné==, couleurs rouge / bleu / vert (balises légères rendues par RichText, sélection du texte puis bouton).
   - Répondre aux questions (liste des non répondues, éditeur, sources en un clic).
   - Horaires : un **calendrier** mensuel (Chabbat teinté, aujourd'hui encadré, pastille avec le nombre d'horaires). On touche un jour, on voit ses horaires nommés, on en ajoute un (nom + heure, raccourcis Allumage / Minha / Cours…). Les horaires des fêtes de Tichri sont préremplis jour par jour. Le fidèle voit « Prochains horaires » (7 jours) en haut de son onglet Horaires.
   - Agenda (ajout / suppression d'événements).
   - Dons : deux entrées. **1) Enregistrer un nouveau don** en 4 étapes (fidèle avec recherche, catégorie, type de don, montant) : catégories préremplies Apéritif, Dons de Chabbat (Richone, Chéni, Chlichi, Revihi, Hamichi, Chichi, Chevihi, Haftara, Hagbaha, Port du Séfer), Dons de fêtes juives, Divers ; ajout de catégories et de types de dons à la volée, montant habituel prérempli. **2) Dons à récupérer** : classement **par don** (du plus grand au plus petit) ou **par donateur** (du fidèle qui doit le plus à celui qui doit le moins, dépliable), **recherche** par nom de donateur, **filtre par catégorie** (Fêtes juives, Chabbat, Apéritif, Divers… avec compteurs), total du filtre, note libre par don, bouton « Envoyer un rappel push » (simulé, par don ou pour tout un donateur), et bouton **Don acquitté** (avec confirmation) qui passe le don dans « Réglés », l'ajoute à l'historique des dons et retire son montant du total à récupérer. Le fidèle retrouve le don dans « À payer ».
   - **Tous les textes peuvent être corrigés et réécrits par ChatGPT** : bouton vert sur chaque zone de texte, proposition à accepter ou refuser. Simulation locale (`src/utils/ai.ts`) en attendant le branchement de l'API.
   - Bouton « Voir l'application comme un fidèle » pour vérifier le rendu.
4. **Accès fidèle** : premier écran **Rejoindre une communauté** (obligatoire pour continuer) avec trois méthodes : **Autour de moi** (liste des synagogues proches avec distance, rite, Rav, bouton Rejoindre), **QR code** (caméra simulée : ligne de scan puis « communauté détectée »), **Code** (ex. BY-2026, HB-7700). Un fidèle peut appartenir à **plusieurs communautés** (ex. Beth Yaacov séfarade et Beth Habad) : une pastille **switch communauté** dans la barre du haut de chaque onglet permet de basculer, et les horaires, divré Torah, questions, agenda et dons affichés sont ceux de la communauté choisie (champ `congregationId` sur chaque contenu, listes `my*` dans AppState). Puis 5 onglets :

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
