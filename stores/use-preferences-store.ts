"use client";

import { create } from "zustand";
import type { Language, Theme } from "@/types/app";

interface PreferencesStore {
  language: Language;
  theme: Theme;
  initializePreferences: () => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "finance-dashboard-preferences";

function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

function normalizeTheme(value: unknown): Theme {
  return value === "dark" || value === "light" ? value : "light";
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredPreferences() {
  const fallback = {
    language: "th" as Language,
    theme: getSystemTheme()
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as
      | string
      | {
          language?: unknown;
          theme?: unknown;
          state?: {
            language?: unknown;
            theme?: unknown;
          };
        };

    if (typeof parsedValue === "string") {
      return {
        language: normalizeLanguage(parsedValue),
        theme: fallback.theme
      };
    }

    if (parsedValue && typeof parsedValue === "object") {
      if ("state" in parsedValue && parsedValue.state) {
        const stateTheme = parsedValue.state.theme;

        return {
          language: normalizeLanguage(parsedValue.state.language),
          theme:
            stateTheme === "light" || stateTheme === "dark"
              ? stateTheme
              : fallback.theme
        };
      }

      const directTheme = parsedValue.theme;

      return {
        language: normalizeLanguage(parsedValue.language),
        theme:
          directTheme === "light" || directTheme === "dark"
            ? directTheme
            : fallback.theme
      };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function writeStoredPreferences(language: Language, theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { language, theme },
        version: 2
      })
    );
  } catch {
    // Keep the in-memory preferences responsive even if storage is unavailable.
  }
}

export const usePreferencesStore = create<PreferencesStore>()((set) => ({
  language: "th",
  theme: "light",
  initializePreferences: () => set(readStoredPreferences()),
  setLanguage: (language) => {
    const normalizedLanguage = normalizeLanguage(language);
    set((state) => {
      writeStoredPreferences(normalizedLanguage, state.theme);
      return { language: normalizedLanguage };
    });
  },
  setTheme: (theme) => {
    const normalizedTheme = normalizeTheme(theme);
    set((state) => {
      writeStoredPreferences(state.language, normalizedTheme);
      return { theme: normalizedTheme };
    });
  }
}));
