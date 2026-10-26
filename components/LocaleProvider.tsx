'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'ar' | 'fr';
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: 'ar', setLocale: () => undefined });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  useEffect(() => {
    const saved = localStorage.getItem('ayoubia-locale');
    if (saved === 'fr' || saved === 'ar') setLocaleState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('ayoubia-locale', locale);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale: (next: Locale) => setLocaleState(next) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
