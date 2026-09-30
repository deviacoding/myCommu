import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import fr, { Translations } from './locales/fr';
import en from './locales/en';
import he from './locales/he';
import ar from './locales/ar';
import { DeepPartial, PathKeys } from './types';
import { setDateLocale } from '../utils/time';

// Module multilingue de l'application.
// - Le français est la langue de référence : toute clé existe dans locales/fr.ts.
// - Une clé absente d'une autre langue retombe sur le français.
// - t('rav.hello', { leader: 'Rav' }) remplace les variables {leader}.
// - L'hébreu et l'arabe s'affichent de droite à gauche.
// Pour ajouter une langue : créer locales/xx.ts, l'ajouter à LANGUAGES et à DICTIONARIES.

export type Lang = 'fr' | 'en' | 'he' | 'ar';
export type TKey = PathKeys<Translations>;

export const LANGUAGES: { code: Lang; native: string; rtl: boolean; dateLocale: string }[] = [
  { code: 'fr', native: 'Français', rtl: false, dateLocale: 'fr-FR' },
  { code: 'en', native: 'English', rtl: false, dateLocale: 'en-GB' },
  { code: 'he', native: 'עברית', rtl: true, dateLocale: 'he-IL' },
  { code: 'ar', native: 'العربية', rtl: true, dateLocale: 'ar-u-nu-latn' },
];

const DICTIONARIES: Record<Lang, DeepPartial<Translations>> = { fr, en, he, ar };
const STORAGE_KEY = 'mycommu.lang';

function lookup(dict: unknown, key: string): string | undefined {
  const v = key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), dict);
  return typeof v === 'string' ? v : undefined;
}

export function translate(lang: Lang, key: TKey | string, vars?: Record<string, string | number>): string {
  const raw = lookup(DICTIONARIES[lang], key) ?? lookup(fr, key) ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : raw;
}

function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'fr';
  return (LANGUAGES.find((l) => l.code === code)?.code ?? 'fr') as Lang;
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  rtl: boolean;
  t: (key: TKey | string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang);

  // Langue mémorisée d'une session à l'autre.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved as Lang);
      })
      .catch(() => undefined);
  }, []);

  const meta = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  // Réglé pendant le rendu (et non dans un effet) pour que les dates affichées suivent la langue immédiatement.
  setDateLocale(meta.dateLocale);

  useEffect(() => {
    // Sur le web, le sens d'écriture suit la langue (droite à gauche pour l'hébreu et l'arabe).
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang, meta]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => undefined);
  }, []);

  const value = useMemo<I18nValue>(() => ({ lang, setLang, rtl: meta.rtl, t: (key, vars) => translate(lang, key, vars) }), [lang, setLang, meta]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
