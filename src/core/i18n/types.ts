/** Supported app languages. */
export type LanguageCode = 'en' | 'hi';

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}
