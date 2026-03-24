"use client";

import { create } from "zustand";
import type { Language } from "@/types/app";

interface PreferencesStore {
  language: Language;
  initializeLanguage: () => void;
  setLanguage: (language: Language) => void;
}

const STORAGE_KEY = "finance-dashboard-preferences";

function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

function readStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return "th";
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return "th";
    }

    const parsedValue = JSON.parse(rawValue) as
      | string
      | {
          language?: unknown;
          state?: {
            language?: unknown;
          };
        };

    if (typeof parsedValue === "string") {
      return normalizeLanguage(parsedValue);
    }

    if (parsedValue && typeof parsedValue === "object") {
      if ("state" in parsedValue && parsedValue.state) {
        return normalizeLanguage(parsedValue.state.language);
      }

      if ("language" in parsedValue) {
        return normalizeLanguage(parsedValue.language);
      }
    }
  } catch {
    return "th";
  }

  return "th";
}

function writeStoredLanguage(language: Language) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { language },
        version: 1
      })
    );
  } catch {
    // Keep the in-memory language responsive even if storage is unavailable.
  }
}

export const usePreferencesStore = create<PreferencesStore>()((set) => ({
  language: "th",
  initializeLanguage: () =>
    set({
      language: readStoredLanguage()
    }),
  setLanguage: (language) => {
    const normalizedLanguage = normalizeLanguage(language);
    set({ language: normalizedLanguage });
    writeStoredLanguage(normalizedLanguage);
  }
}));
