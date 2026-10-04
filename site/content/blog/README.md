# Publier un article sur le blog

Chaque article est un fichier Markdown dans ce dossier : `content/blog/<slug>.md`.
Le nom du fichier devient l'adresse de l'article : `mon-article.md` → `/blog/mon-article`.

## 1. Créer le fichier

```markdown
---
title: "Titre de l'article"
date: 2026-11-03
excerpt: "Une ou deux phrases qui résument l'article (affichées dans la liste et en description Open Graph)."
tags: [horaires, judaïsme]
cover: /blog/mon-image.jpg
---

Le texte de l'article en Markdown : titres `##`, listes, liens, images, tableaux…
```

Champs du frontmatter :

| Champ | Obligatoire | Rôle |
|---|---|---|
| `title` | oui | titre de l'article |
| `date` | oui | date de publication au format `AAAA-MM-JJ` (les articles sont triés du plus récent au plus ancien) |
| `excerpt` | oui | résumé court (liste du blog, balises meta) |
| `tags` | non | liste de mots-clés affichés sous le titre |
| `cover` | non | image d'en-tête ; placer le fichier dans `public/blog/` et indiquer `/blog/<fichier>` |

Les images insérées dans le texte (`![légende](/blog/image.jpg)`) vont aussi dans `public/blog/`.

## 2. Vérifier en local

```bash
cd site
npm run dev
```

Puis ouvrir http://localhost:3000/blog.

## 3. Publier

Depuis la racine du dépôt :

```bash
cd site && npm run build && cd ..
node node_modules/firebase-tools/lib/bin/firebase.js deploy --only hosting:site --project mycommunity-b13de --non-interactive
```

`npm run build` régénère aussi `sitemap.xml` (le nouvel article y est ajouté automatiquement) et les PDF des guides.
