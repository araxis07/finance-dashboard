"use client";

import { useEffect, useRef } from "react";
import {
  LANGUAGE_COOKIE_NAME,
  THEME_COOKIE_NAME
} from "@/lib/preferences";
import { usePreferencesStore } from "@/stores/use-preferences-store";

export function AppPreferencesProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const language = usePreferencesStore((state) => state.language);
  const theme = usePreferencesStore((state) => state.theme);
  const didRehydrate = useRef(false);

  useEffect(() => {
    if (didRehydrate.current) {
      return;
    }

    didRehydrate.current = true;

    // Rehydrate the store from localStorage on mount.
    // This must happen exactly once, client-side only.
    void usePreferencesStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000; SameSite=Lax`;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }, [theme]);

  return <>{children}</>;
}
