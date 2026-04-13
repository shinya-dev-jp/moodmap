"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";

import en from "./en.json";
import ja from "./ja.json";
import es from "./es.json";
import ko from "./ko.json";
import th from "./th.json";
import pt from "./pt.json";

export type Locale = "en" | "ja" | "es" | "ko" | "th" | "pt";

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  en,
  ja,
  es,
  ko,
  th,
  pt,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  if (lang && lang in DICTIONARIES) return lang as Locale;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = DICTIONARIES[locale]?.[key] ?? DICTIONARIES.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale]
  );

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
