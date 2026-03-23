"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "@/types/app";

interface PreferencesStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      language: "th",
      setLanguage: (language) => set({ language: normalizeLanguage(language) })
    }),
    {
      name: "finance-dashboard-preferences",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { language: "th" as Language };
        }

        const state = persistedState as Partial<Record<keyof PreferencesStore, unknown>>;

        return {
          language: normalizeLanguage(state.language)
        };
      }
    }
  )
);
