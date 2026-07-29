import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, LANGUAGES, makeT } from '../lib/i18n';

const LanguageContext = createContext();

const getInitial = () => {
  const stored = localStorage.getItem('lang');
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  const nav = (navigator.language || 'en').slice(0, 2);
  return LANGUAGES.some((l) => l.code === nav) ? nav : DEFAULT_LANG;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitial);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: makeT(lang), languages: LANGUAGES }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
