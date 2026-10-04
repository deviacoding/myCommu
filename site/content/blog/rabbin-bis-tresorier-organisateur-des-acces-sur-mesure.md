---
title: "Rabbin bis, trésorier, organisateur : des accès sur mesure"
date: 2026-11-16
excerpt: "Le responsable n'est pas seul. myCommu lui permet de créer des accès pour son équipe, chacun avec ses droits : un adjoint, un trésorier qui ne voit que les dons, un organisateur pour les horaires et l'agenda."
tags: [équipe, accès, sécurité]
cover: /guides/equipe-02-quel-acces.jpg
---

Dans une communauté, les tâches se partagent. Le rabbin enseigne et répond aux questions ; la secrétaire publie les horaires ; le trésorier suit les dons ; un bénévole tient l'agenda. Donner à tous le même mot de passe est une mauvaise idée, et faire tout passer par une seule personne est épuisant.

myCommu propose trois **accès d'équipe**, en plus du compte du responsable.

## Trois rôles, trois périmètres

| Accès | Ce qu'il voit et fait | Ce qu'il ne peut pas faire |
|---|---|---|
| **Rabbin bis** (adjoint, secrétaire) | Tout comme le responsable : enseignements, questions, horaires, agenda, dons, associations, paiements, live | Créer ou retirer des accès |
| **Trésorier** | Uniquement la partie dons : enregistrer un don, suivre les promesses, marquer un don acquitté, envoyer un rappel, gérer associations et moyens de paiement | Voir les questions, publier, toucher aux horaires |
| **Organisateur** | Les horaires et l'agenda : ajouter un office, un cours, un événement avec son affiche | Voir les dons, répondre aux questions |

Dans l'application, le nom du premier rôle suit la confession : rabbin bis, imam bis, prêtre bis, enseignant bis.

## Comment ça marche

1. Depuis son accueil, le responsable ouvre **« Créer des accès »**.
2. Il choisit l'accès (trésorier, par exemple), indique le prénom, le nom et un contact.
3. L'application génère un **code personnel** : `RB-0000` pour un rabbin bis, `TR-0000` pour un trésorier, `OR-0000` pour un organisateur.
4. La personne **crée son propre compte** myCommu (avec son e-mail et son mot de passe), puis entre le code dans **Rejoindre → Code**.
5. Elle arrive directement dans l'espace qui lui correspond : l'espace trésorier n'affiche que les dons.

Le responsable voit son équipe sur le même écran, avec le statut de chaque accès (invité, actif) et un bouton **« Retirer l'accès »** quand quelqu'un quitte ses fonctions. Un code retiré ne fonctionne plus.

## Pourquoi c'est sûr

Les droits ne sont pas seulement un affichage : ils sont vérifiés par la base de données elle-même. Chaque adhésion à une communauté porte un rôle (`member`, `leader`, `deputy`, `treasurer`, `organizer`), et les **règles Firestore** tranchent document par document : un trésorier peut écrire dans les dons, pas dans les questions ; un organisateur peut modifier les horaires, pas les dons. Même une application modifiée ne pourrait pas contourner ces règles.

Chaque communauté ne voit que ses propres données. Un trésorier de Beth Yaacov ne voit rien de la communauté voisine, même s'il en est fidèle par ailleurs.

## Un compte, plusieurs casquettes

Une même personne peut être fidèle d'une communauté et trésorière d'une autre, ou fidèle et organisatrice de la même. Elle garde un seul compte et bascule entre ses communautés depuis la barre du haut.

Pour voir les écrans un par un, suivez le guide [« Créer un accès trésorier »](/apprendre/creer-un-acces-tresorier).
