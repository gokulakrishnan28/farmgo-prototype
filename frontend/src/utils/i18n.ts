/**
 * FarmGo i18n System
 * -------------------
 * Simple, lightweight internationalization without external libraries.
 * 
 * Supports: English (en), Marathi (mr), Hindi (hi), Tamil (ta)
 * 
 * Usage:
 *   const { t, lang, setLang } = useTranslation();
 *   <p>{t('farmer.greeting')}</p>
 * 
 * Language is persisted in localStorage as "farmgo_lang".
 */

import { useState, useCallback, useEffect } from "react";

export type SupportedLang = "en" | "mr" | "hi" | "ta";

export const SUPPORTED_LANGUAGES: { code: SupportedLang; label: string; nativeLabel: string; flag: string }[] = [
  { code: "en", label: "English",  nativeLabel: "English",  flag: "🇬🇧" },
  { code: "mr", label: "Marathi",  nativeLabel: "मराठी",    flag: "🟠" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिंदी",    flag: "🇮🇳" },
  { code: "ta", label: "Tamil",    nativeLabel: "தமிழ்",    flag: "🟡" },
];

const STORAGE_KEY = "farmgo_lang";

// Cache loaded locale JSONs
const localeCache: Partial<Record<SupportedLang, Record<string, unknown>>> = {};

async function loadLocale(lang: SupportedLang): Promise<Record<string, unknown>> {
  if (localeCache[lang]) return localeCache[lang]!;
  
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) throw new Error(`Locale ${lang} not found`);
    const data = await response.json();
    localeCache[lang] = data;
    return data;
  } catch (error) {
    console.warn(`[i18n] Failed to load locale '${lang}', falling back to 'en'`);
    if (lang !== "en") return loadLocale("en");
    return {};
  }
}

/**
 * Deeply get a value from an object by dot-notation key.
 * e.g., getNestedValue(obj, "farmer.greeting") -> obj.farmer.greeting
 */
function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return key; // Return key itself as fallback (visible in UI so easy to spot)
    }
  }
  return typeof current === "string" ? current : key;
}

// Global state (simple module-level singleton for the current language)
let globalLang: SupportedLang = (localStorage.getItem(STORAGE_KEY) as SupportedLang) || "en";
let globalLocale: Record<string, unknown> = {};
let loadingPromise: Promise<void> | null = null;

// Load initial locale
const initLocale = async () => {
  globalLocale = await loadLocale(globalLang);
};
loadingPromise = initLocale();

// Subscribers list for re-renders
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(fn => fn());
}

export async function setGlobalLanguage(lang: SupportedLang) {
  globalLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  // Also update the existing sessionStorage key for backward compatibility
  sessionStorage.setItem("language_selected", lang);
  globalLocale = await loadLocale(lang);
  notifySubscribers();
}

export function getCurrentLanguage(): SupportedLang {
  return globalLang;
}

/**
 * Translate a dot-notation key to the current language.
 * Falls back to the key itself if not found.
 */
export function translate(key: string): string {
  return getNestedValue(globalLocale, key);
}

/**
 * React hook for using translations in components.
 * 
 * @example
 * const { t, lang, setLang } = useTranslation();
 * return <h1>{t('farmer.greeting')}</h1>;
 */
export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    subscribers.add(update);
    
    // Also wait for initial locale to load
    if (loadingPromise) {
      loadingPromise.then(() => forceUpdate(n => n + 1));
    }
    
    return () => {
      subscribers.delete(update);
    };
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(globalLocale, key);
  }, []);

  const setLang = useCallback(async (lang: SupportedLang) => {
    await setGlobalLanguage(lang);
  }, []);

  return {
    t,
    lang: globalLang,
    setLang,
    languages: SUPPORTED_LANGUAGES,
    isRTL: false, // None of the 4 supported languages are RTL
  };
}

/**
 * Detect language from browser preference or stored preference.
 */
export function detectPreferredLanguage(): SupportedLang {
  // 1. Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
  if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored;
  
  // 2. Check sessionStorage (legacy key from previous version)
  const session = sessionStorage.getItem("language_selected") as SupportedLang | null;
  if (session && SUPPORTED_LANGUAGES.some(l => l.code === session)) return session;
  
  // 3. Check browser language
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "mr") return "mr";
  if (browserLang === "hi") return "hi";
  if (browserLang === "ta") return "ta";
  
  return "en"; // Default
}
