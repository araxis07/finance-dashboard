"use client";

import { Languages } from "lucide-react";
import { getTranslation, languageOptions } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const language = usePreferencesStore((state) => state.language);
  const setPreferredLanguage = usePreferencesStore((state) => state.setLanguage);
  const translation = getTranslation(language);

  function handleLanguageChange(nextLanguage: (typeof languageOptions)[number]["id"]) {
    setPreferredLanguage(nextLanguage);
  }

  return (
    <div className="pointer-events-auto relative z-20 rounded-2xl border border-stroke bg-white/95 p-1.5 shadow-card backdrop-blur">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 px-3 text-sm font-medium text-muted">
          <Languages className="h-4 w-4" />
          {translation.shell.language}
        </div>
        {languageOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleLanguageChange(option.id)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold transition md:min-w-[82px]",
              option.id === language
                ? "bg-accent text-white shadow-soft"
                : "text-muted hover:bg-slate-50 hover:text-ink"
            )}
            aria-pressed={option.id === language}
            aria-label={`Switch language to ${option.nativeLabel}`}
          >
            <span className="mr-1 text-[11px] uppercase opacity-70">
              {option.shortLabel}
            </span>
            <span>{option.nativeLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
