export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// Toutes les clés « a.b.c » d'un objet de traductions imbriqué.
export type PathKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object ? PathKeys<T[K], `${P}${K}.`> : `${P}${K}`;
}[keyof T & string];
