# myCommu

Application mobile React Native (Expo + TypeScript) pour communautés religieuses (juive, chrétienne, islamique). Le thème de couleur s'adapte automatiquement à la communauté choisie par l'utilisateur.

## Statut

**Maquette frontend uniquement** — toutes les données sont mockées dans `src/mocks/`. Pas encore de backend.

## Stack

- Expo SDK 54
- React Native 0.81 + React 19
- TypeScript strict
- React Navigation v7 (native-stack + bottom-tabs)
- `@expo/vector-icons`

## Lancer le projet

```sh
npm install
npm run start       # Expo
npm run android     # ouvre sur émulateur/téléphone Android
```

Scanner le QR code avec Expo Go pour tester sur un téléphone physique.

## Périmètre de la maquette

- Onboarding + choix de communauté + auth (login/signup)
- Feed de posts (filtres, like, commentaires, création)
- Événements (liste, détail, RSVP)
- Messagerie (liste de conversations + chat 1-1 et groupe)
- Groupes (découvrir, rejoindre, page de groupe)
- Notifications
- Recherche (personnes, groupes, événements)
- Profil + Gamification (niveaux, points, badges, classement)
- Paramètres (changement de communauté)

## Structure

```
src/
  components/    composants UI partagés
  mocks/         données factices pour la maquette
  navigation/    AuthStack, AppStack, MainTabs
  screens/       écrans organisés par feature
  state/         contextes (Auth)
  theme/         ThemeProvider + palettes par communauté
  types/         types TypeScript
  utils/
```

## Thème par communauté

Le thème est piloté par `ThemeProvider` (`src/theme/ThemeProvider.tsx`). Chaque communauté a sa palette dans `src/theme/themes.ts`. Le changement se fait dans **Paramètres**.

| Communauté  | Couleur principale     |
| ----------- | ---------------------- |
| Juive       | Bleu indigo `#1E3A8A`  |
| Chrétienne  | Marron `#8B4513`       |
| Islamique   | Bleu sarcelle `#0E7490`|

## Prochaines étapes

Une fois la maquette validée : implémentation du backend (API, auth réelle, stockage des posts/événements/messages, push notifications).
