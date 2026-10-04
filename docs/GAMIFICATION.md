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
