/** useLanguage — access the active language + translator anywhere in the tree. */
import {useContext} from 'react';
import {LanguageContext, type LanguageContextValue} from './LanguageContext';

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
