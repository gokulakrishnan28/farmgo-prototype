import { useState, useCallback, useEffect } from "react";

export type SupportedLang = "en" | "mr" | "hi" | "ta";

export const SUPPORTED_LANGUAGES: { code: SupportedLang; label: string; nativeLabel: string; flag: string }[] = [
  { code: "en", label: "English",  nativeLabel: "English",  flag: "🇬🇧" },
  { code: "mr", label: "Marathi",  nativeLabel: "मराठी",    flag: "🟠" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिंदी",    flag: "🇮🇳" },
  { code: "ta", label: "Tamil",    nativeLabel: "தமிழ்",    flag: "🟡" },
];

const STORAGE_KEY = "farmgo_lang";
const localeCache: Partial<Record<SupportedLang, Record<string, unknown>>> = {};

async function loadLocale(lang: SupportedLang): Promise<Record<string, unknown>> {
  if (localeCache[lang]) return localeCache[lang]!;
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) throw new Error(`Locale ${lang} not found`);
    const data = await response.json();
    localeCache[lang] = data;
    return data;
  } catch {
    if (lang !== "en") return loadLocale("en");
    return {};
  }
}

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}

let globalLang: SupportedLang = (localStorage.getItem(STORAGE_KEY) as SupportedLang) || "en";
let globalLocale: Record<string, unknown> = {};
let loadingPromise: Promise<void> | null = null;

const initLocale = async () => {
  globalLocale = await loadLocale(globalLang);
};
loadingPromise = initLocale();

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(fn => fn());
}

export async function setGlobalLanguage(lang: SupportedLang) {
  globalLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  sessionStorage.setItem("language_selected", lang);
  globalLocale = await loadLocale(lang);
  notifySubscribers();
}

export function getCurrentLanguage(): SupportedLang {
  return globalLang;
}

export function translate(key: string): string {
  return getNestedValue(globalLocale, key);
}

export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    subscribers.add(update);
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
    isRTL: false,
  };
}

export function detectPreferredLanguage(): SupportedLang {
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
  if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored;
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "mr") return "mr";
  if (browserLang === "hi") return "hi";
  if (browserLang === "ta") return "ta";
  return "en";
}
