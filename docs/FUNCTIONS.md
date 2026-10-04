# Cloud Functions myCommu

Code serveur du projet Firebase `mycommunity-b13de` (plan Blaze), dans le dossier `functions/` :
TypeScript, `firebase-functions` v2, `firebase-admin` v13, Node 20, région `europe-west1` (au plus près de Firestore `eur3`).

Deux domaines : **paiements Stripe Connect** (`functions/src/stripe.ts`) et **notifications push FCM** (`functions/src/push.ts`).
`functions/src/shared.ts` porte l'initialisation (Admin SDK, région, `maxInstances: 10`) et les utilitaires (rôle d'un membre, devise, dates ISO).

## Les fonctions

### Paiements Stripe Connect (`stripe.ts`)

Chaque communauté possède **son propre compte Stripe Express** ; les dons des fidèles sont encaissés sur le compte de la plateforme puis transférés automatiquement au compte de la communauté (paiement « destination »). Aucune commission n'est prélevée pour l'instant (`application_fee_amount` est en commentaire dans `createDonationCheckout`).

| Fonction | Type | Rôle |
|---|---|---|
| `createStripeConnectLink({ congregationId })` | onCall, connecté | Réservée aux rôles `leader`, `deputy`, `treasurer` (lus dans `memberships/{congregationId}_{uid}`). Crée un compte Express (pays de la communauté, sinon `FR`) ou réutilise celui enregistré, écrit `paymentLinks/{congregationId}_stripe` (`provider: 'stripe'`, `accountId`, `status: 'pending'`, `isDefault` si premier moyen de paiement), puis renvoie `{ url, accountId, status }` : l'URL d'onboarding Stripe (retour vers `APP_URL`), ou un lien vers le tableau de bord Express si le compte est déjà actif. |
| `createDonationCheckout({ congregationId, amount, currency?, cause, dedication?, pledgeId?, type? })` | onCall, connecté | Réservée aux membres de la communauté. `amount` : entier dans la devise (1 à 100 000). `currency` : `₪`/`ils` ou `€`/`eur`, sinon devise de la confession (shekel pour la confession juive, euro sinon). Vérifie que le compte Stripe de la communauté est `active` et, si `pledgeId`, que la promesse appartient au donateur et est encore due. Crée une Checkout Session (mode `payment`, `transfer_data.destination` = compte connecté, métadonnées `congregationId, uid, cause, dedication, pledgeId, type, paymentLinkId`) et renvoie `{ url, sessionId }`. |
| `stripeWebhook` | onRequest (POST) | Vérifie la signature Stripe. `checkout.session.completed` / `checkout.session.async_payment_succeeded` → écrit `donations/stripe_{sessionId}` (`paymentRef` = id de session, `paymentLinkId`, `provider: 'stripe'`, `currency`, `paymentIntent`) et, si `pledgeId`, passe la promesse en `paid` avec `settledAt`. Idempotent (le don n'est pas réécrit). `account.updated` → met le `paymentLink` à `status: 'active'` quand `charges_enabled` et `details_submitted` (sinon `pending`), avec `chargesEnabled`, `payoutsEnabled`. |

Paramètres :
- secrets `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (`defineSecret`, stockés dans Secret Manager) ;
- `APP_URL` (`defineString`, défaut `https://mycommunity-b13de.web.app`) : base des URL de retour (`/?stripe=return|refresh&congregationId=…` après l'onboarding, `/?checkout=success|cancel&session_id=…` après un paiement).

### Notifications push FCM (`push.ts`)

Convention : les jetons d'un utilisateur sont dans `users/{uid}.fcmTokens: string[]` ; chaque membre est abonné au **sujet** `cong_{congregationId}` de chacune de ses communautés. Les jetons morts (`messaging/registration-token-not-registered`, `invalid-registration-token`, `invalid-argument`) sont retirés du profil après chaque envoi.

| Fonction | Déclencheur | Rôle |
|---|---|---|
| `registerPushToken({ token })` | onCall, connecté | Ajoute le jeton au profil (`arrayUnion`) et l'abonne aux sujets de toutes les communautés de l'utilisateur. À appeler à chaque démarrage de l'application. |
| `unregisterPushToken({ token })` | onCall, connecté | Retire le jeton et le désabonne (déconnexion). |
| `onMembershipWritten` | `memberships/{id}` créé ou supprimé | Abonne / désabonne les jetons déjà enregistrés quand l'utilisateur rejoint ou quitte une communauté. |
| `onLiveStarted` | `lives/{congregationId}` écrit, `active` passe à `true` | Sujet de la communauté : « 🔴 {nom} est en direct : {title} ». |
| `onQuestionAnswered` | `questions/{id}` mis à jour, `status` `pending` → `answered` | Jetons de `askerUid` : « Réponse à votre question », extrait du dernier message du rav. |
| `onEventCreated` | `agenda/{id}` créé | Sujet de la communauté : titre, date, heure, lieu. |
| `pledgeReminders` | planifiée `every day 09:00`, fuseau `Europe/Paris` | Pour chaque `pledge` `due` dont `dueDate` ≤ aujourd'hui + 3 jours, sans `lastReminder` ou avec un rappel de plus de 7 jours : notification au `memberUid` (montant dans la devise de la confession) et `lastReminder` = date du jour (`lastReminderBy: 'auto'`). |

Les notifications portent un champ `data.type` (`live`, `question`, `agenda`, `pledge`) et l'identifiant concerné, pour ouvrir le bon écran au clic.

## Mise en place

### 1. `firebase.json` — bloc à ajouter

```json
"functions": [
  { "source": "functions", "codebase": "default", "runtime": "nodejs20" }
]
```

### 2. `.gitignore` racine — lignes à ajouter

```
# Cloud Functions
functions/node_modules
functions/lib
```

(`functions/.gitignore` les ignore déjà localement ; les lignes racine évitent toute surprise.)

### 3. Installer et compiler

```bash
cd functions
npm install
npm run build        # tsc → functions/lib
```

Node 20 est le runtime ciblé ; en local, Node 22/24 compile sans problème (l'avertissement `EBADENGINE` de npm est sans conséquence).

### 4. Secrets Stripe (jamais en clair dans le dépôt)

Dans le dashboard Stripe (`Développeurs → Clés API`), récupérer la **clé secrète** (`sk_test_…` pour commencer, `sk_live_…` en production), puis :

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# coller la clé quand le CLI la demande
```

Le secret du webhook (`whsec_…`) s'obtient à l'étape suivante, après la création de l'endpoint :

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Pour changer l'URL de retour (par ex. un domaine personnalisé), créer `functions/.env` avec `APP_URL=https://…` (le fichier est ignoré par git) ou laisser la valeur par défaut.

Activer **Stripe Connect** dans le dashboard (`Connect → Commencer`), avec les comptes **Express**, et renseigner le nom de la plateforme (myCommu) et son logo : ils apparaissent pendant l'onboarding des communautés.

### 5. Déployer

```bash
firebase deploy --only functions
# ou, depuis functions/ : npm run deploy
```

Le premier déploiement active les API Cloud Functions, Cloud Build, Artifact Registry, Eventarc, Cloud Scheduler et Secret Manager (le CLI le propose). Après déploiement, l'URL du webhook s'affiche ; elle a la forme :

```
https://europe-west1-mycommunity-b13de.cloudfunctions.net/stripeWebhook
```

(ou l'URL `…run.app` indiquée par le CLI : les deux fonctionnent.)

### 6. Déclarer le webhook dans Stripe

`Développeurs → Webhooks → Ajouter un endpoint` :

- URL : celle de `stripeWebhook` ci-dessus.
- **Événements à cocher** :
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `account.updated`
- Stripe sépare les sources : les événements `checkout.*` viennent de **votre compte** (plateforme), `account.updated` vient des **comptes connectés**. Créer donc **deux endpoints** vers la même URL : le premier « Événements sur votre compte » avec `checkout.session.completed` et `checkout.session.async_payment_succeeded`, le second « Événements sur les comptes connectés » avec `account.updated`.
- Chaque endpoint a son **secret de signature** (`whsec_…`). Les mettre tous les deux dans `STRIPE_WEBHOOK_SECRET`, **séparés par une virgule** (`whsec_aaa,whsec_bbb`) : la fonction essaie chaque secret. Puis redéployer les fonctions pour qu'elles prennent la nouvelle version du secret.

En test local : `stripe listen --forward-to http://127.0.0.1:5001/mycommunity-b13de/europe-west1/stripeWebhook` avec l'émulateur (`npm run serve`).

### 7. Tester

- Mode test Stripe : carte `4242 4242 4242 4242`, date future, CVC quelconque.
- Onboarding Express en mode test : Stripe propose de « passer » chaque étape avec des données fictives.
- Logs : `firebase functions:log` ou la console Google Cloud (Logging).

## Ce qui reste à faire côté application

Le SDK web `firebase` (déjà en dépendance) fournit `getFunctions(app, 'europe-west1')` et `httpsCallable` ; la région doit être passée explicitement.

1. **Écran « Moyens de paiement » (responsable / trésorier)** : bouton « Relier Stripe » → `httpsCallable(functions, 'createStripeConnectLink')({ congregationId })` → ouvrir `url` (`Linking.openURL` / nouvel onglet). Au retour sur `/?stripe=return`, le `paymentLink` passe tout seul en `active` via le webhook ; afficher `status` (`pending` → « Finaliser l'inscription Stripe », `active` → « Compte Stripe relié »). Remplacer la connexion simulée actuelle pour le fournisseur `stripe` ; Bit et Lemon Squeezy restent tels quels.
2. **Écran de don (fidèle)** : quand le moyen de paiement choisi est Stripe, remplacer l'écriture locale de `donate()` par `httpsCallable(functions, 'createDonationCheckout')({ congregationId, amount, cause, dedication, pledgeId })` puis ouvrir `url`. Le don apparaît dans Firestore (temps réel) quand le webhook le confirme ; ne plus créer le document `donations` côté client pour Stripe. Lire `?checkout=success|cancel` au retour pour afficher un message.
3. **Enregistrer le jeton push** :
   - **Web** : `getMessaging()` + `getToken(messaging, { vapidKey })` du SDK `firebase/messaging` (créer la paire de clés VAPID dans *Paramètres du projet → Cloud Messaging*), un `firebase-messaging-sw.js` dans `public/`/`dist`, puis `httpsCallable(functions, 'registerPushToken')({ token })` après connexion.
   - **iOS / Android (Expo)** : `expo-notifications` + `getDevicePushTokenAsync()` pour obtenir le jeton **natif** FCM/APNs (pas le jeton Expo), ou `@react-native-firebase/messaging` ; demander la permission, puis appeler `registerPushToken`. Un build natif (EAS) est nécessaire : Expo Go ne reçoit pas de push FCM. Appeler `unregisterPushToken` à la déconnexion.
   - Au clic sur une notification, lire `data.type` et l'identifiant pour naviguer (direct, question, agenda, promesse).
4. **Règles Firestore** : rien à changer, l'Admin SDK des fonctions les contourne ; les champs ajoutés (`fcmTokens`, `status` sur `paymentLinks`, `paymentRef`…) sont dans des documents déjà couverts.
5. **Index** : `pledgeReminders` interroge `pledges` sur `status == 'due'` et `dueDate <= …` ; Firestore demandera un index composite `status + dueDate` au premier passage (lien dans les logs, ou l'ajouter à `firestore.indexes.json`).

## Coûts

- **Invocations** : quota gratuit Blaze de 2 millions d'appels/mois, 400 000 Go-s et 200 000 GHz-s de calcul, 5 Go de sortie réseau. À l'échelle de quelques communautés, les fonctions restent dans le gratuit.
- **Cloud Build / Artifact Registry** : chaque déploiement construit une image ; stockage facturé environ 0,10 $/Go/mois → quelques centimes par mois. Le CLI propose une politique de nettoyage des anciennes images (accepter).
- **Secret Manager** : 6 versions actives gratuites, puis 0,06 $/version/mois ; deux secrets ici.
- **Cloud Scheduler** : 3 tâches gratuites par mois ; `pledgeReminders` en utilise une.
- **FCM** : gratuit.
- **Stripe** : frais Stripe standards sur chaque paiement (en Europe ≈ 1,5 % + 0,25 € par carte européenne, davantage hors Europe) à la charge du compte connecté ; pas de frais fixe pour Connect Express sur les comptes actifs à ce jour (à vérifier sur la page tarifaire Stripe au moment de passer en production).
