"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/use-preferences-store";

export function AppPreferencesProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const language = usePreferencesStore((state) => state.language);
  const setHasHydrated = usePreferencesStore((state) => state.setHasHydrated);
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    let isMounted = true;

    const rehydratePreferences = async () => {
      try {
        await usePreferencesStore.persist.rehydrate();
      } finally {
        // Never leave the UI blocked if storage rehydration fails.
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };

    void rehydratePreferences();

    return () => {
      isMounted = false;
    };
  }, [setHasHydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
