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

1. **Connexion** : « Continuer avec Google » ou email + mot de passe.
2. **Inscription** : nom, email, mot de passe, puis choix de la religion (le thème change en direct).
3. Une fois connecté, 5 onglets :

| Onglet | Contenu |
| --- | --- |
| **Horaires** | Fêtes de Tichri 5787 avec allumages, fins de fête, notes ; offices quotidiens ; segment **Agenda** avec les événements à venir de la communauté |
| **Cours** | Cours de la semaine (« Souccot : la fragilité comme refuge », avec sources), liste filtrable par catégorie, page de lecture complète |
| **Questions** | Questions-réponses membres ↔ Rav avec sources halakhiques, filtre répondu / en attente, formulaire pour poser une question (anonyme possible) |
| **Dons** | Tsedaka (montants rapides multiples de 18), Maasser (calcul du dixième du revenu net, suivi mensuel), engagements à payer (nedava, cotisation…), historique |
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

## Horaires

Les horaires de Tichri 5787 (sept.–oct. 2026) sont indicatifs pour Paris. La date hébraïque affichée est calculée à partir du 1 Tichri 5787 = 12 septembre 2026 (valable jusqu'à Kislev).

## Prochaines étapes

Contenus pour les communautés chrétienne et musulmane, puis backend (Firebase : auth réelle, stockage des dons/questions, paiement).
