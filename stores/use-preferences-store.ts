"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createBrowserJSONStorage } from "@/lib/browser-storage";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences";
import type { Language, Theme } from "@/types/app";

interface PreferencesStore {
  hasHydrated: boolean;
  language: Language;
  theme: Theme;
  setHasHydrated: (value: boolean) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
}

function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

function normalizeTheme(value: unknown, fallback: Theme = "light"): Theme {
  return value === "dark" || value === "light" ? value : fallback;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function normalizePersistedPreferences(
  persistedState: unknown,
  fallbackTheme: Theme
) {
  if (!persistedState || typeof persistedState !== "object") {
    return {
      language: "th" as Language,
      theme: fallbackTheme
    };
  }

  const candidate =
    "state" in persistedState &&
    persistedState.state &&
    typeof persistedState.state === "object"
      ? (persistedState.state as Record<string, unknown>)
      : (persistedState as Record<string, unknown>);

  return {
    language: normalizeLanguage(candidate.language),
    theme: normalizeTheme(candidate.theme, fallbackTheme)
  };
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      language: "th",
      theme: getSystemTheme(),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setLanguage: (language) => {
        set({
          language: normalizeLanguage(language)
        });
      },
      setTheme: (theme) => {
        set({
          theme: normalizeTheme(theme, getSystemTheme())
        });
      }
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 3,
      storage: createBrowserJSONStorage(),
      partialize: (state) => ({
        language: state.language,
        theme: state.theme
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedPreferences(persistedState, currentState.theme)
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      skipHydration: true
    }
  )
);
