"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/settings-store";
import { t as translate } from "@/lib/translations";

type LanguageContextValue = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja");
  const [isLoading, setIsLoading] = useState(true);

  const loadLanguage = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/language", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLocaleState(data.language === "en" ? "en" : "ja");
      }
    } catch {
      // keep default ja
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      try {
        const res = await fetch("/api/settings/language", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: newLocale }),
        });
        if (res.ok) {
          setLocaleState(newLocale);
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const t = useCallback(
    (key: string) => translate(locale, key),
    [locale]
  );

  const value: LanguageContextValue = {
    locale,
    t,
    setLocale,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      locale: "ja",
      t: (key: string) => key,
      setLocale: () => {},
      isLoading: false,
    };
  }
  return ctx;
}
