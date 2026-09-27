# myCommu : base de données et déclinaison multi-confessions

Ce document décrit comment passer de la maquette (données en mémoire, communauté juive) à une base de données réelle, puis comment construire les parties **imam**, **prêtre / pasteur** et **enseignant bouddhiste** en copiant ce qui existe et en l'adaptant.

Principe : **un seul moteur, quatre vocabulaires**. Tout ce que fait le rabbin (partager un enseignement, répondre, publier des horaires, gérer l'agenda, enregistrer des dons, suivre les dates des fidèles, faire un live) existe dans les quatre religions. Seuls changent les mots, les calendriers, les catégories de dons et quelques règles (zakat, dîme…). Le fichier `src/config/religions.ts` porte déjà ces différences.

## 1. Modèle de données

Toutes les entités portent `id`, `created_at`, `updated_at`. Les entités de contenu portent `congregation_id` (déjà le cas dans la maquette via `congregationId`).

| Table | Rôle | Champs clés |
| --- | --- | --- |
| `religions` | Les 4 confessions | `id` (jewish, muslim, christian, buddhist), libellés (voir `religions.ts`), `calendar`, `currency`, `tithe_rate` |
| `congregations` | Une synagogue, mosquée, église, temple | `religion_id`, `name`, `rite` (séfarade, habad, sunnite, catholique, zen…), `address`, `lat`, `lng`, `join_code`, `qr_token`, `leader_user_id` |
| `users` | Toute personne | `name`, `email`, `phone`, `city`, `birth_date`, `religion_id`, `auth_provider` (google, email) |
| `memberships` | Appartenance d'un user à une congrégation, avec rôle | `user_id`, `congregation_id`, `role` (member, leader, admin), `joined_at`, `joined_via` (nearby, qr, code) |
| `teachings` | Dvar Torah / khutba / homélie / enseignement du Dharma | `congregation_id`, `author_id`, `title`, `subtitle`, `theme` (texte libre), `body_markup` (balises RichText), `media_url`, `media_type`, `published_at` |
| `themes` | Thèmes des enseignements, par congrégation | `congregation_id`, `name`, `is_default` |
| `questions` | Question d'un fidèle | `congregation_id`, `asker_id`, `subject`, `category`, `status`, `is_public`, `is_anonymous` |
| `answers` | Réponse du responsable | `question_id`, `author_id`, `body`, `sources[]` |
| `schedule_entries` | Horaires nommés par jour (calendrier) | `congregation_id`, `date`, `name`, `time`, `source` (manual, calj, aladhan, liturgical) |
| `events` | Agenda | `congregation_id`, `title`, `date`, `time`, `place`, `category`, `description`, `poster_url` |
| `donation_categories` | Catégories de dons | `congregation_id`, `name`, `icon`, `sort_order` |
| `donation_items` | Types de dons dans une catégorie | `category_id`, `name`, `default_amount` |
| `pledges` | Don enregistré par le responsable, à récupérer | `congregation_id`, `member_id`, `item_id`, `label`, `amount`, `due_date`, `status` (due, paid), `note`, `last_reminder_at`, `settled_at`, `settled_by` |
| `donations` | Paiement effectif | `congregation_id`, `user_id`, `pledge_id?`, `type` (tsedaka, maasser, engagement, zakat, dime, dana…), `amount`, `cause`, `dedication`, `paid_at`, `payment_ref` |
| `member_dates` | Dates importantes | `congregation_id`, `user_id`, `type` (anniversaire, azkara, autre), `label`, `date`, `religious_date`, `note` |
| `lives` | Directs | `congregation_id`, `host_id`, `title`, `started_at`, `ended_at`, `viewers_max`, `recording_url` |
| `notifications` | Push envoyés | `user_id`, `kind` (reminder, live, event, answer, mazal_tov), `payload`, `sent_at` |
| `tax_receipts` | Reçus fiscaux | `user_id`, `year`, `format` (seif46, cerfa, autre), `total`, `pdf_url` |
| `soul_points` | Gamification (ora) | `user_id`, `points`, `level`, `history[]` |

Ce que la maquette calcule en mémoire (`AppState.tsx`) correspond une à une à ces tables : `courses` → `teachings`, `dayEntries` → `schedule_entries`, `pledges` → `pledges`, `memberDates` → `member_dates`, `categories` → `donation_categories` + `donation_items`, `live` → `lives`.

**Multi-communautés** : un user a plusieurs `memberships`. L'écran affiche une congrégation à la fois (`congregationId` courant) et filtre tout par cette valeur. La pastille « switch communauté » ne fait que changer ce filtre.

**Rôles** : le responsable religieux est un user avec `memberships.role = leader`. Il voit les mêmes tables que le fidèle, plus les écrans d'écriture. Un même user peut être fidèle dans une communauté et responsable dans une autre.

## 2. Ce qui est commun aux quatre religions

Tout le parcours actuel, sans modification :

- Accès démo → religion → rôle ; onboarding « rejoindre une communauté » (autour de moi, QR, code) ; switch communauté.
- Responsable : partager un enseignement (texte enrichi, vidéo / photo / audio, thèmes modifiables, correction ChatGPT), répondre aux questions (anonymiser et publier), calendrier d'horaires nommés, agenda avec affiche, dons en deux entrées (enregistrer par catégories / sous-catégories, dons à récupérer triés, notes, rappels push, acquitter), dates des fidèles, live avec notification.
- Fidèle : horaires + agenda + mes dates, enseignements, questions, dons (calculateur, causes, à payer, reçus), compte avec gamification.

## 3. Adaptations par religion

### Islam (imam)

| Élément | Adaptation |
| --- | --- |
| Vocabulaire | Mosquée, imam, **khutba** (sermon du vendredi) et **rappels**, « Questions à l'imam » |
| Horaires | Les **cinq prières** (Fajr, Dhuhr, Asr, Maghrib, Isha) + **jumu'a** calculées par géolocalisation via l'API **Aladhan** ou **Mawaqit** (remplace CalJ). Méthode de calcul paramétrable (UOIF, MWL…). Iqama distincte de l'adhan. |
| Calendrier | Hégirien : Ramadan (horaires d'iftar / imsak), Aïd al-Fitr, Aïd al-Adha, Achoura, Mawlid. |
| Dons | **Zakat** : calculateur 2,5 % de l'épargne au-delà du **nisab** (valeur de l'or paramétrable), une fois par an lunaire. **Sadaqa** libre, **zakat al-fitr** par personne avant l'Aïd, **qurbani** (sacrifice). Catégories : Aïd, Ramadan (iftar collectif), Entretien de la mosquée, Pauvres, Construction. |
| Dates des fidèles | Anniversaires, naissances (aqiqa), décès (condoléances, 3e / 40e jour selon la coutume), mariages (nikah). |
| Enseignements | Khutba du vendredi enregistrée en audio / vidéo ; thèmes par défaut : Coran, Hadith, Fiqh, Sira, Ramadan. |
| Reçu fiscal | Cerfa (France) ; pas d'équivalent Seif 46. |
| Particularités | Séparation des espaces hommes / femmes dans les événements (champ `audience`), langue arabe pour certains textes (RTL déjà géré). |

### Christianisme (prêtre, pasteur)

| Élément | Adaptation |
| --- | --- |
| Vocabulaire | Église / paroisse / temple, prêtre ou pasteur, **homélie** / prédication, « Questions au prêtre » |
| Horaires | **Messes** et cultes (semaine, dimanche, veille), confessions, adoration, vêpres. Source : calendrier liturgique (Avent, Carême, Pâques, fêtes des saints), pas de géolocalisation nécessaire. |
| Calendrier | Liturgique, avec les lectures du jour (API type AELF pour les catholiques francophones). |
| Dons | **Dîme** (10 % pour les protestants évangéliques) ou **denier de l'Église** annuel (catholiques), **quête** dominicale, **intentions de messe** (montant fixe), offrandes pour les pauvres (Secours catholique), entretien de l'église, missions. |
| Dates des fidèles | Baptêmes, premières communions, confirmations, mariages, anniversaires de décès (messes anniversaires), fêtes patronymiques (saint du prénom). |
| Enseignements | Homélie du dimanche (vidéo / audio), catéchèse, thèmes : Évangile du jour, Vie de prière, Sacrements, Saints. |
| Particularités | Plusieurs confessions dans la même religion (catholique, protestant, orthodoxe, évangélique) : utiliser `congregations.rite` comme pour séfarade / habad. Notion de **paroisse** géographique. |

### Bouddhisme (moine, enseignant)

| Élément | Adaptation |
| --- | --- |
| Vocabulaire | Temple / centre / sangha, moine ou enseignant, **enseignement du Dharma**, « Questions à l'enseignant », le fidèle est un **pratiquant** |
| Horaires | **Séances de méditation** (assise, marche), récitations (sutras), cérémonies, retraites. Calendrier lunaire : jours d'**uposatha** (nouvelle et pleine lune), Vesak, Asalha Puja, Kathina. Le calendrier se calcule à partir des phases de la lune, pas de géolocalisation. |
| Dons | **Dana** : générosité libre, sans taux. Pas de calculateur de dîme (`tithe: null`). Catégories : Offrandes de nourriture aux moines, Entretien du temple, Retraites (bourses), Publications du Dharma, Aide aux pratiquants. Aucune notion de « don à récupérer » obligatoire : les engagements existent mais sont présentés comme promesses volontaires. |
| Dates des pratiquants | Anniversaires, dates de décès (cérémonies du 49e jour dans plusieurs traditions), prise de refuge, ordination. |
| Enseignements | Dharma talks (audio surtout), méditations guidées (audio), thèmes : Sutras, Méditation, Éthique, Sagesse. Le lecteur audio est central ici. |
| Gamification | Remplacer l'« ora » et ses cinq niveaux de l'âme par un équivalent culturellement juste, par exemple les **pāramitās** (perfections : générosité, éthique, patience, énergie, méditation, sagesse). |
| Particularités | Traditions très différentes (theravada, zen, tibétaine, Nichiren) : `rite` indispensable ; plusieurs langues (pali, sanskrit, tibétain, japonais). |

## 4. Gamification par religion

L'« ora » (Nefech → Ye'hida) est juive. Le mécanisme (points par don, par enseignement lu, par question) reste ; seule la métaphore change :

| Religion | Métaphore | Niveaux |
| --- | --- | --- |
| Juive | Ora, niveaux de l'âme | Nefech, Roua'h, Nechama, 'Haya, Ye'hida |
| Islam | Lumière du cœur (nur) | Muslim, Mu'min, Muhsin… ou simple compteur de hassanat |
| Christianisme | Flamme / talents (parabole) | 1 à 5 talents, ou fruits de l'Esprit |
| Bouddhisme | Pāramitās | Générosité, Éthique, Patience, Énergie, Méditation, Sagesse |

À valider avec un responsable de chaque religion avant de coder : c'est le point le plus sensible culturellement.

## 5. Ordre de construction proposé

1. **Base de données** avec le schéma ci-dessus (Firebase déjà pressenti : Firestore + Auth + Storage pour les médias + Cloud Functions pour les push et les reçus PDF). Migrer les mocks juifs en données de seed.
2. **Auth réelle** (Google, email) et onboarding (géolocalisation réelle, scan QR avec `expo-camera`, code).
3. **Rendre le code religion-agnostique** : remplacer les libellés en dur par `religions[religionId].xxx` (déjà commencé), déplacer les catégories de dons et les thèmes par défaut dans des seeds par religion.
4. **Islam** : brancher Aladhan pour les horaires, calculateur de zakat, catégories de dons, seeds de khutbas. Copier `src/mocks/*` → `src/seeds/muslim/*`.
5. **Christianisme** : calendrier liturgique, messes, intentions de messe, denier / dîme.
6. **Bouddhisme** : calendrier lunaire, séances, dana, lecteur audio en avant, gamification pāramitās.
7. **Contenus réels** validés par un rabbin, un imam, un prêtre, un enseignant.

## 6. Ce qui reste simulé dans la maquette

Connexion, paiement, notifications push, live vidéo, lecteur média, scan QR, géolocalisation, CalJ, correction ChatGPT, génération PDF des reçus. Chacun a déjà son point d'accroche dans le code (fonction ou composant nommé), il suffira de remplacer la simulation par l'appel réel.
