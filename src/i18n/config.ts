// src/config/languages.ts

// Single source of truth for language configuration
const LANGUAGE_CONFIG = {
  en: { label: "🇬🇧", color: "#ff0088" },
  es: { label: "🇪🇸", color: "#dd00ee" },
  de: { label: "🇩🇪", color: "#9911ff" },
  fr: { label: "🇫🇷", color: "#e7a3f0" },
  hr: { label: "🇭🇷", color: "#1e75f7" },
  it: { label: "🇮🇹", color: "#0cdcf7" },
  nl: { label: "🇳🇱", color: "#facc15" },
  pt: { label: "🇧🇷", color: "#8df0cc" },
} as const;

// Auto-generated type from the config
export type Lang = keyof typeof LANGUAGE_CONFIG;

// Auto-generated languages list for regex patterns
export const languagesList = `(${Object.keys(LANGUAGE_CONFIG).join('|')})`;

// Auto-generated LANG_TABS array
export const LANG_TABS: { id: Lang; label: string; color: string }[] = 
  Object.entries(LANGUAGE_CONFIG).map(([id, config]) => ({
    id: id as Lang,
    label: config.label,
    color: config.color,
  }));

// Auto-generated empty values function
export const getEmptyLangValues = (): Record<Lang, string> =>
  Object.fromEntries(
    Object.keys(LANGUAGE_CONFIG).map((lang) => [lang, ""])
  ) as Record<Lang, string>;
