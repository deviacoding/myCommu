# myCommu

Application mobile React Native (Expo + TypeScript) pour communautés religieuses. Le thème de couleur s'adapte à la communauté choisie à l'inscription.

## Statut

**Maquette frontend uniquement** — toutes les données sont dans `src/mocks/`. Pas de backend, pas de paiement réel, connexion simulée.

Quatre confessions sont réalisées avec leurs propres contenus, vocabulaire, calendrier, dons et gamification : **juive**, **musulmane**, **chrétienne**, **bouddhiste**. Chaque confession est un « seed » (`src/seeds/*.ts`) chargé par `AppStateProvider` ; les écrans sont communs et lisent leurs libellés dans le seed.

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
   - **Partager un dvar Torah** : titre, thème (liste modifiable, bouton « Ajouter un thème »), **vidéo / photo / audio** (chargement simulé, bloc média chez les fidèles), texte libre découpé automatiquement en parties. Barre de mise en forme : **gras**, ==surligné==, couleurs rouge / bleu / vert (balises légères rendues par RichText, sélection du texte puis bouton).
   - Répondre aux questions (liste des non répondues, éditeur, sources en un clic, interrupteur **« Anonymiser et rendre cette question-réponse publique »** : le nom devient « Anonyme » et la Q/R devient visible par toute la communauté ; sinon elle reste privée).
   - Horaires : carte **« Horaires proposés automatiquement »** (judaïsme : calcul hors ligne avec Hebcal à partir de la position de la communauté — allumage, sortie de Chabbat et de fête, jeûnes, fêtes, Roch H̲odech, paracha — que le responsable ajoute d’un geste, un par un ou tous ; autres confessions : import simulé) et un **calendrier** mensuel (Chabbat teinté, aujourd'hui encadré, pastille avec le nombre d'horaires). On touche un jour, on voit ses horaires nommés, on en ajoute un (nom + heure, raccourcis Allumage / Minha / Cours…). Les horaires des fêtes de Tichri sont préremplis jour par jour. Le fidèle voit « Prochains horaires » (7 jours) en haut de son onglet Horaires.
   - Agenda (ajout / suppression d'événements, **chargement de l'affiche** simulé : galerie ou photo, affichée en grand chez les fidèles).
   - **Faire un live et prévenir ma communauté** : notification push simulée aux fidèles, écran de direct avec compteur de spectateurs, bandeau « LIVE » chez les fidèles, bilan à la fin.
   - **Dates des fidèles** : anniversaires, azkarot et autres dates des membres, groupées cette semaine / ce mois / plus tard, ajout par le Rav, boutons « Envoyer un mazal tov » / « Proposer une montée / Kaddich ».
   - Dons : deux entrées. **1) Enregistrer un nouveau don** en 4 étapes (fidèle avec recherche, catégorie, type de don, montant) : catégories préremplies Apéritif, Dons de Chabbat (Richone, Chéni, Chlichi, Revihi, Hamichi, Chichi, Chevihi, Haftara, Hagbaha, Port du Séfer), Dons de fêtes juives, Divers ; ajout de catégories et de types de dons à la volée, montant habituel prérempli. **2) Dons à récupérer** : classement **par don** (du plus grand au plus petit) ou **par donateur** (du fidèle qui doit le plus à celui qui doit le moins, dépliable), **recherche** par nom de donateur, **filtre par catégorie** (Fêtes juives, Chabbat, Apéritif, Divers… avec compteurs), total du filtre, note libre par don, bouton « Envoyer un rappel push » (simulé, par don ou pour tout un donateur), et bouton **Don acquitté** (avec confirmation) qui passe le don dans « Réglés », l'ajoute à l'historique des dons et retire son montant du total à récupérer. Le fidèle retrouve le don dans « À payer ».
   - **Tous les textes peuvent être corrigés et réécrits par ChatGPT** : bouton vert sur chaque zone de texte, proposition à accepter ou refuser. Simulation locale (`src/utils/ai.ts`) en attendant le branchement de l'API.
   - Bouton « Voir l'application comme un fidèle » pour vérifier le rendu.
4. **Accès fidèle** : premier écran **Rejoindre une communauté** (obligatoire pour continuer) avec trois méthodes : **Autour de moi** (liste des synagogues proches avec distance, rite, Rav, bouton Rejoindre), **QR code** (caméra simulée : ligne de scan puis « communauté détectée »), **Code** (ex. BY-2026, HB-7700). Un fidèle peut appartenir à **plusieurs communautés** (ex. Beth Yaacov séfarade et Beth Habad) : une pastille **switch communauté** dans la barre du haut de chaque onglet permet de basculer, et les horaires, divré Torah, questions, agenda et dons affichés sont ceux de la communauté choisie (champ `congregationId` sur chaque contenu, listes `my*` dans AppState). Puis 5 onglets :

| Onglet | Contenu |
| --- | --- |
| **Horaires** | Bandeau **LIVE** quand le Rav est en direct. Segment Agenda : affiches des événements et bloc **Mes dates** (ajout d'anniversaires / azkarot, aussi dans Compte). Fêtes de Tichri 5787 avec allumages, fins de fête, notes ; offices quotidiens ; segment **Agenda** avec les événements à venir de la communauté |
| **Cours** (libellé de l'onglet) | **Dvar Torah** : le dernier dvar Torah du Rav s'affiche directement en entier, avec sa photo en rond façon réseau social (« Souccot : la fragilité comme refuge », sourcé). En dessous, les divré Torah précédents filtrables par catégorie |
| **Questions** | Questions-réponses membres ↔ Rav (photo du Rav sur chaque réponse) avec sources halakhiques. La première question est marquée **Non répondu**. Filtres et formulaire pour poser une question (anonyme possible) |
| **Dons** | Rubrique **« Où va votre argent ? »** dans Tsedaka (dons pour les pauvres, apéritif, entretien de la synagogue, Talmud Torah, Hevra Kadicha, Israël) avec bouton Donner pré-rempli. S'ouvre sur **Maasser** : calculateur (salaire net − frais école juive / Talmud Torah / autres, puis 10 %), suivi du mois. Tsedaka avec montants rapides en shekels (1, 5, 18, 26, 52 ₪). Engagements à payer (chéni paracha Berechit 104 ₪, chaise à l'année 350 ₪, nedava, cotisation…). **Reçus fiscaux** générés automatiquement : Seif 46 (Israël) ou Cerfa 11580 (France), à imprimer, télécharger ou envoyer par email. Historique |
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

La monnaie dépend de la confession (₪ pour la démo juive, € pour les autres), champ `currency` du seed appliqué par `setCurrency()` dans `src/utils/time.ts`.

## Horaires

Les horaires de Tichri 5787 (sept.–oct. 2026) sont indicatifs pour Paris. La date hébraïque affichée est calculée à partir du 1 Tichri 5787 = 12 septembre 2026 (valable jusqu'à Kislev).

## Multi-confessions

Les quatre confessions sont jouables dans la démo (accès responsable et accès fidèle). Correspondances principales :

| | Juif | Musulman | Chrétien | Bouddhiste |
| --- | --- | --- | --- | --- |
| Responsable | Rav | Imam | Père / Pasteur | Vénérable / Enseignant |
| Enseignement | Dvar Torah | Khutba | Homélie | Enseignement du Dharma |
| Part régulière | Maasser 10 % du revenu | Zakat 2,5 % de l'épargne au-delà du nisab | Dîme 10 % (repère, non obligatoire) | aucune (dana libre) |
| Aumône | Tsedaka (18, 26 ₪…) | Sadaqa | Aumône (obole) | Dana (108) |
| Horaires | Hebcal (hors ligne), Chabbat, fêtes de Tichri | Aladhan, cinq prières, Jumu'a, Ramadan | calendrier liturgique, messes, Toussaint, Avent | calendrier lunaire, uposatha, Pavāraṇā, Kathina |
| Date religieuse | hébraïque | hégirienne | liturgique | lunaire |
| Dates des fidèles | anniversaires, azkarot | anniversaires, décès, aqiqa, nikah | anniversaires, décès, baptêmes, mariages | anniversaires, décès (49e jour), refuge |
| Gamification | Ora (5 niveaux de l'âme) | Nur (niyya → taqwa) | Flamme (graine de sénevé → bon serviteur) | Pāramitās (dāna → paññā) |
| Reçu fiscal | Seif 46 + Cerfa | Cerfa | Cerfa | Cerfa |

Tous les contenus (khutbas, homélies, enseignements, questions-réponses) citent leurs sources (Coran, hadiths, Évangiles, Catéchisme, suttas). Le vocabulaire et les particularités de chacune sont dans `src/config/religions.ts`. Le modèle de base de données et le plan de déclinaison (imam, prêtre, enseignant bouddhiste) sont dans **`docs/MULTI-CONFESSIONS.md`**.

## Prochaines étapes

Base de données (Firebase) selon `docs/MULTI-CONFESSIONS.md`, auth réelle, puis déclinaison islam → christianisme → bouddhisme.
