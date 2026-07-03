/**
 * LanguageProvider — wires LanguageService state into React. Wrap the whole
 * app in this once, mirroring `ThemeProvider`.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {LanguageContext, interpolate, type LanguageContextValue} from './LanguageContext';
import {LanguageService} from './LanguageService';
import {translations, type TranslationKey} from './translations';
import type {LanguageCode} from './types';

export function LanguageProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [language, setLanguageState] = useState<LanguageCode>(() => LanguageService.load());

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    LanguageService.save(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(translations[language][key], params),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({language, setLanguage, t}),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
