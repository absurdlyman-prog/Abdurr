import en from './en.json';

// Minimal i18n layer. UI chrome strings live in locale JSON; narrative content
// is localized by swapping the content/ bundle (see docs/ARCHITECTURE.md → "Mod
// & localization pipeline"). Additional locales register here.

export interface Locale {
  locale: string;
  name: string;
  strings: Record<string, string>;
}

const LOCALES: Record<string, Locale> = {
  en: en as Locale,
};

let active = 'en';

export function setLocale(code: string): void {
  if (LOCALES[code]) active = code;
}

export function registerLocale(locale: Locale): void {
  LOCALES[locale.locale] = locale;
}

export function availableLocales(): { code: string; name: string }[] {
  return Object.values(LOCALES).map((l) => ({ code: l.locale, name: l.name }));
}

/** Translate a key, falling back to English, then to the key itself. */
export function t(key: string): string {
  return LOCALES[active]?.strings[key] ?? LOCALES.en.strings[key] ?? key;
}
