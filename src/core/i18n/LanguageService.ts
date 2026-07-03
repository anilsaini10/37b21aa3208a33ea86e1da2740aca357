/**
 * LanguageService — pure logic for resolving and persisting the app language.
 *
 * Separated from React so it is unit-testable, mirroring `ThemeService`.
 */
import {storage, StorageKeys} from '../storage/storage';
import {DEFAULT_LANGUAGE} from './translations';
import type {LanguageCode} from './types';

export const LanguageService = {
  load(): LanguageCode {
    const stored = storage.getString(StorageKeys.LANGUAGE);
    return stored === 'en' || stored === 'hi' ? stored : DEFAULT_LANGUAGE;
  },

  save(language: LanguageCode): void {
    storage.set(StorageKeys.LANGUAGE, language);
  },
};
