"use client";

import { useEffect, useRef } from "react";
import { usePreferencesStore } from "@/stores/use-preferences-store";

export function AppPreferencesProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const language = usePreferencesStore((state) => state.language);
  const theme = usePreferencesStore((state) => state.theme);
  const hasHydrated = usePreferencesStore((state) => state.hasHydrated);
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
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
