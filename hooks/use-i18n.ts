"use client";

import { useMemo } from "react";
import { getLocale, getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";

export function useI18n() {
  const hasHydrated = usePreferencesStore((state) => state.hasHydrated);
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);

  const translation = useMemo(() => getTranslation(language), [language]);
  const locale = useMemo(() => getLocale(language), [language]);

  return {
    hasHydrated,
    language,
    locale,
    setLanguage,
    translation
  };
}

export function useThemePreference() {
  const hasHydrated = usePreferencesStore((state) => state.hasHydrated);
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return {
    hasHydrated,
    setTheme,
    theme
  };
}
