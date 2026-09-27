// Simulation de la correction / réécriture par ChatGPT.
// Dans la version finale, cette fonction appellera l'API avec le texte du Rav.

export interface AiResult {
  text: string;
  changes: string[];
}

export function improveText(input: string): AiResult {
  const changes: string[] = [];
  let t = input.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
  if (t !== input.trim()) changes.push('Espaces superflus supprimés');

  const before = t;
  // Typographie française : pas d’espace avant « , » et « . », une espace avant « ; : ! ? ».
  t = t
    .replace(/ +([,.])/g, '$1')
    .replace(/([,.;:!?])(?=[^\s\n\d)»])/g, '$1 ')
    .replace(/(\S)([;:!?])/g, '$1 $2')
    .replace(/(\d) ([:])/g, '$1$2');
  if (t !== before) changes.push('Ponctuation corrigée');

  // Quelques reformulations courantes pour rendre la lecture plus fluide (avant les majuscules).
  const rewrites: [RegExp, string][] = [
    [/\bil faut que l'on\b/gi, 'nous devons'],
    [/\bil faut que on\b/gi, 'il faut que l’on'],
    [/\bc'est à dire\b/gi, 'c’est-à-dire'],
    [/\bparceque\b/gi, 'parce que'],
    [/\bmalgré que\b/gi, 'bien que'],
    [/\bau jour d'aujourd'hui\b/gi, 'aujourd’hui'],
    [/\bc est\b/g, 'c’est'],
    [/\bhachem\b/g, 'Hachem'],
    [/\btorah\b/g, 'Torah'],
    [/\bchabbat\b/g, 'Chabbat'],
  ];
  for (const [re, rep] of rewrites) {
    if (re.test(t)) {
      t = t.replace(re, rep);
      if (!changes.includes('Formulations clarifiées')) changes.push('Formulations clarifiées');
    }
  }

  const beforeCaps = t;
  t = t.replace(/(^|[.!?]\s+|\n)([a-zà-ÿ])/g, (_m, a: string, b: string) => a + b.toUpperCase());
  if (t !== beforeCaps) changes.push('Majuscules en début de phrase');

  const paragraphs = t.split('\n').map((p) => {
    const s = p.trim();
    if (!s) return s;
    if (s.length > 60 && !/[.!?:»]$/.test(s)) {
      changes.push('Point final ajouté');
      return s + '.';
    }
    return s;
  });
  t = paragraphs.join('\n');

  if (!changes.length) changes.push('Texte relu : aucune faute détectée, style conservé');
  return { text: t, changes: Array.from(new Set(changes)) };
}
