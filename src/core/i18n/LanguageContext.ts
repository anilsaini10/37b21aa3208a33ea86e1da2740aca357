/**
 * LanguageContext — the runtime language + translator exposed to the component tree.
 */
import {createContext} from 'react';
import {translations, DEFAULT_LANGUAGE, type TranslationKey} from './translations';
import type {LanguageCode} from './types';

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(params[key] ?? ''));
}

export interface LanguageContextValue {
  language: LanguageCode;
  /** Switch the active app language and persist the choice. */
  setLanguage: (language: LanguageCode) => void;
  /** Translate a key into the active language, filling any `{{token}}` placeholders. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  t: (key, params) => interpolate(translations[DEFAULT_LANGUAGE][key], params),
});
