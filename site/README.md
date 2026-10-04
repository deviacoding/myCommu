# Site vitrine myCommu

Site statique Next.js (App Router, export statique, Tailwind) publié sur Firebase Hosting : https://mycommu-site.web.app

- `src/app/` : pages (accueil, `/blog`, `/apprendre`), `sitemap.ts`, `robots.ts`
- `content/blog/*.md` : articles (voir `content/blog/README.md` pour en publier un)
- `content/guides/*.ts` : guides pas à pas (diaporama, version imprimable, PDF)
- `public/guides/` : captures d'écran de l'application ; `public/pdf/` : PDF générés par `scripts/build-pdf.tsx`

## Commandes

```bash
npm run dev      # développement, http://localhost:3000
npm run pdf      # régénère public/pdf/*.pdf (lancé aussi avant build)
npm run build    # export statique dans out/
```

## Publier

Depuis la racine du dépôt :

```bash
cd site && npm run build && cd ..
node node_modules/firebase-tools/lib/bin/firebase.js deploy --only hosting:site --project mycommunity-b13de --non-interactive
```
