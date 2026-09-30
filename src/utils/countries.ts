// Pays : stockés par leur code ISO à deux lettres (FR, IL…) quand on le connaît,
// sinon par le nom saisi. Le nom affiché suit la langue de l'application.

// Pays proposés en premier dans le formulaire de création.
export const COMMON_COUNTRIES = ['FR', 'IL', 'BE', 'CH', 'LU', 'CA', 'US', 'GB', 'DE', 'MA', 'TN', 'DZ'];

// Noms de secours si le téléphone ne sait pas traduire les pays (Intl.DisplayNames).
const FALLBACK: Record<string, string> = {
  FR: 'France',
  IL: 'Israël',
  BE: 'Belgique',
  CH: 'Suisse',
  LU: 'Luxembourg',
  CA: 'Canada',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  DE: 'Allemagne',
  MA: 'Maroc',
  TN: 'Tunisie',
  DZ: 'Algérie',
};

type DisplayNamesCtor = new (locales: string[], options: { type: 'region' }) => { of: (code: string) => string | undefined };

export function countryName(value: string | undefined, lang = 'fr'): string {
  if (!value) return '';
  if (!/^[A-Z]{2}$/.test(value)) return value;
  try {
    const DN = (Intl as unknown as { DisplayNames?: DisplayNamesCtor }).DisplayNames;
    if (DN) {
      const n = new DN([lang], { type: 'region' }).of(value);
      if (n && n !== value) return n;
    }
  } catch {
    // on retombe sur le nom français
  }
  return FALLBACK[value] ?? value;
}
