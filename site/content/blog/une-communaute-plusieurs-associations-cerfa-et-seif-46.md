---
title: "Une communauté, plusieurs associations : Cerfa et Seif 46"
date: 2026-11-02
excerpt: "Une synagogue avec une association française et une amuta israélienne, une Hevra Kadisha à part : myCommu gère plusieurs associations par communauté. Le fidèle choisit à qui il donne et reçoit le bon reçu fiscal."
tags: [dons, associations, reçus fiscaux]
---

Dans la vie réelle, « la communauté » n'est pas une seule personne morale. Une synagogue de Paris reçoit des dons par son association loi 1901, mais ses fidèles installés en Israël préfèrent donner à l'amuta sœur pour bénéficier de la déduction locale. La Hevra Kadisha a sa propre structure. Le Talmud Torah parfois aussi.

Jusqu'ici, les applications de dons ne connaissaient qu'un seul compte, un seul reçu, un seul pays. myCommu fait autrement.

## Plusieurs associations par communauté

Depuis l'espace responsable, l'écran **« Mes associations »** permet de déclarer autant de structures que nécessaire. Pour chacune :

- un **nom** (raison sociale) et un **objet** (synagogue, Hevra Kadisha, Talmud Torah…) ;
- un **pays**, qui détermine le reçu fiscal et les moyens de paiement conseillés ;
- le **format du reçu** : Cerfa 11580 en France, Seif 46 (סעיף 46) en Israël, ou reçu simple ailleurs ;
- le **numéro officiel** (RNA ou SIRET en France, numéro d'amuta en Israël), l'adresse du siège et le nom du signataire, imprimés sur le reçu ;
- ses **moyens de paiement** : un compte Stripe, Bit ou Lemon Squeezy relié à cette association précisément.

Une association est marquée **« par défaut »** : c'est celle proposée en premier au fidèle.

## Le fidèle choisit

Au moment de donner, le fidèle voit la liste des associations de sa communauté et choisit celle qu'il veut soutenir. Le don part sur le compte de paiement de **cette** association, et le reçu fiscal généré est celui de **son** pays, avec les bonnes mentions légales.

Un même fidèle peut ainsi donner un mois à l'association française, le mois suivant à l'amuta, et retrouver dans son historique deux reçus distincts, chacun conforme.

## L'argent ne transite jamais par myCommu

Les paiements par carte passent par **Stripe Connect** en mode « paiement direct » : la page de paiement est créée sur le compte Stripe de l'association, et le don est encaissé directement par elle. myCommu ne détient pas les fonds, ne prélève pas de commission et ne voit pas le numéro de carte. En Israël, **Bit** est proposé ; **Lemon Squeezy** couvre d'autres pays.

L'inscription Stripe se fait depuis l'écran **« Moyens de paiement »** : le responsable ou le trésorier clique sur « Relier Stripe », remplit le formulaire hébergé par Stripe, et revient dans l'application. Dès que Stripe valide le compte, il passe en « actif » tout seul.

## Les reçus fiscaux

Chaque don confirmé génère un reçu, que le fidèle retrouve dans son onglet Dons : à **imprimer**, **télécharger** ou **envoyer par e-mail**. Le trésorier, de son côté, voit l'ensemble des dons et des promesses, par donateur ou par don, et peut marquer un don comme acquitté quand il est réglé autrement (espèces, chèque, virement).

## En pratique

1. Créez vos associations dans **Mes associations** (une par pays ou par œuvre).
2. Reliez un moyen de paiement à chacune dans **Moyens de paiement**.
3. Vos fidèles donnent, choisissent l'association, et reçoivent leur reçu.

Vous n'avez qu'une seule structure ? Rien ne change : elle est créée par défaut, et le fidèle n'a rien à choisir.
