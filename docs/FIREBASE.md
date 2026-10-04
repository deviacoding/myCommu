# myCommu sur Firebase

L'application fonctionne dans deux modes, sans changer d'écrans :

| Mode | Quand | Données |
|------|-------|---------|
| **Démo** | bouton « Accès démo » | en mémoire, seeds par confession (`src/seeds/`), remises à zéro à chaque chargement |
| **Réel** | compte créé ou connexion | Firebase Auth + Firestore, temps réel, partagées entre les appareils |

Le choix se fait dans `src/state/AuthContext.tsx` : s'il y a une session Firebase, `AppState` bascule sur Firestore (`backendMode: 'firebase'`), sinon sur la démo.

## Projet Firebase

- Projet : `mycommunity-b13de` (plan **Blaze**, paiement à l’usage, gratuit jusqu’aux quotas).
- Hébergement web : https://mycommunity-b13de.web.app
- Firestore : base `(default)`, région `eur3` (Europe), règles dans `firestore.rules`, index dans `firestore.indexes.json`.
- Authentification : e-mail/mot de passe et Google, activés dans la console (Authentication → Sign-in method).

Configuration client dans `.env` (jamais commité, modèle dans `.env.example`) :

```
EXPO_PUBLIC_FIREBASE_API_KEY=…
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=…
EXPO_PUBLIC_FIREBASE_PROJECT_ID=…
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=…
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
EXPO_PUBLIC_FIREBASE_APP_ID=…
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=…
```

Ces valeurs sont visibles dans le bundle web par nature : la sécurité repose sur les règles Firestore, pas sur leur secret.

## Déploiement

```bash
# Règles et index Firestore, règles Cloud Storage
node node_modules/firebase-tools/lib/bin/firebase.js deploy --only firestore,storage --project mycommunity-b13de --non-interactive

# Site web
npx expo export --platform web
node node_modules/firebase-tools/lib/bin/firebase.js deploy --only hosting --project mycommunity-b13de --non-interactive
```

## Code

| Fichier | Rôle |
|---------|------|
| `src/firebase/app.ts` | initialisation (Auth avec persistance, Firestore) |
| `src/data/db.ts` | couche d'écriture (`set`, `update`, `remove`, `batch`) en mode démo (no-op) ou Firestore ; `listenMerged` fusionne plusieurs requêtes temps réel |
| `src/state/AuthContext.tsx` | session, profil `users/{uid}`, adhésions et rôles, inscription, connexion, code d'accès d'équipe |
| `src/state/AppState.tsx` | toutes les données de l'application ; chaque mutation met à jour l'état local **et** Firestore |
| `src/utils/images.ts` | photos réduites en JPEG puis envoyées dans Cloud Storage (`uploadImage`) ; repli en data URL si l'envoi échoue |

Toutes les écritures sont **optimistes** : l'écran change tout de suite, Firestore confirme ensuite (les erreurs de règles apparaissent dans la console du navigateur avec le préfixe `[firestore]`).

## Modèle Firestore

Collections à la racine ; chaque document de contenu porte `congregationId`.

| Collection | Document | Qui lit | Qui écrit |
|------------|----------|---------|-----------|
| `users/{uid}` | profil : `name`, `email`, `community`, `intent` (member/leader), `readCourses`, `maasserInput`, `phone`, `city` | soi-même | soi-même |
| `congregations/{id}` | `religion`, `name`, `leaderUid`, `code` (XX-0000), `isPrivate`, `address`, `city`, `country`, `coords`, `rav {name,title,photo}`, `logo`, `members`, `currentId`, `groupId`, `themes[]`, `services[]` | connectés | responsable (leader/deputy) ; organisateur : `services` ; tout membre : compteur `members` |
| `memberships/{congregationId}_{uid}` | `uid`, `congregationId`, `role` (member/leader/deputy/treasurer/organizer), `name`, `joinedAt`, `joinedVia`, `inviteCode` | soi-même, équipe | soi-même (member, leader de sa création, ou via code d'équipe valide) |
| `staffInvites/{code}` | `name`, `contact`, `role`, `congregationId`, `status` (invited/active), `claimedBy` | équipe ; `get` par code pour tout connecté | responsable ; activation par le porteur du code |
| `currents/{id}`, `groups/{id}` | référentiel par `religion` (les valeurs par défaut restent dans `src/seeds/affiliations.ts`) | connectés | responsables |
| `associations/{id}` | `congregationId`, `name`, `purpose`, `country`, `receiptFormat` (cerfa/seif46/other), `legalId`, `address`, `city`, `president`, `isDefault` : structures juridiques qui reçoivent les dons (une par pays ou par œuvre) | membres | leader, deputy, trésorier |
| `paymentLinks/{id}` | comptes Stripe / Bit / Lemon Squeezy connectés (simulés) | membres (pour choisir comment payer) | leader, deputy, trésorier |
| `courses`, `agenda`, `dayEntries`, `holidays`, `donationCategories` | contenus de la communauté | membres | équipe selon le rôle |
| `questions/{id}` | `askerUid`, `isPublic`, `messages[]` | auteur, équipe, tous si publique | auteur (création), responsable (réponse, publication) |
| `donations/{id}` | `uid`, `congregationId`, `associationId`, `type`, `amount`, `pledgeId`, `paymentLinkId` | donateur, équipe finance | donateur, équipe finance |
| `pledges/{id}` | `memberUid`, `status`, `note`, `lastReminder` | fidèle concerné, équipe finance | équipe finance ; le fidèle peut marquer « payé » |
| `memberDates/{id}` | `uid`, `type`, `date` | fidèle concerné, équipe | idem |
| `lives/{congregationId}` | `title`, `startedAt`, `active`, `hostUid` | membres | responsable |

Quand un responsable crée sa communauté, l'application y copie les valeurs par défaut de sa confession : fêtes et horaires (`holidays`, `dayEntries`), catégories de dons, thèmes d'enseignement et horaires réguliers.

## Parcours réels

- **Fidèle** : inscription (nom, e-mail, mot de passe, religion, « Fidèle ») → « Rejoindre » : autour de moi (position + communautés publiques), lien du QR code (`/rejoindre/XX-0000`), ou code.
- **Responsable** : inscription avec « Responsable de communauté » → « Créer ma communauté » → contenu par défaut copié → QR code et code à partager.
- **Équipe** (rabbin bis, trésorier, organisateur) : le responsable crée un code dans « Créer des accès » ; la personne crée un compte puis entre ce code dans « Rejoindre → Code » : elle entre directement dans l'espace correspondant.

## Ce qui reste simulé (et pourquoi)

Ces points demandent du code côté serveur (Cloud Functions) ou du stockage de fichiers (Cloud Storage), possibles avec le plan Blaze mais pas encore mis en place :

- **Paiements réels** (Stripe Connect, Bit, Lemon Squeezy) : l'échange OAuth et les webhooks doivent tourner côté serveur (Cloud Functions). Les comptes connectés sont enregistrés en base, mais aucune transaction n'a lieu.
- **Notifications push** (live, rappels, dates) : l'envoi FCM se fait depuis un serveur.
- **Live vidéo** : le document `lives` prévient les fidèles ; la diffusion elle-même demande un service de streaming (voir discussion bande passante).
- **Reçus fiscaux PDF** : génération côté client pour l'instant.
- **Photos** : désormais dans Cloud Storage (bucket par défaut du projet, région `europe-west1`), chemins `congregations/{id}/rav.jpg` et `congregations/{id}/logo.jpg`, règles dans `storage.rules` (lecture connecté ; écriture réservée à l'équipe de la communauté, image < 2 Mo, rôle vérifié dans Firestore). Si l'envoi échoue, la photo réduite reste en data URL dans Firestore (≈ 60 Ko).
- **Scan du QR code** avec la caméra sur téléphone : `expo-camera` à ajouter lors des builds natifs ; sur le web, le lien du QR code amène directement sur l'écran « Rejoindre ».
