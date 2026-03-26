"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { languageOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage, translation } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handleLanguageChange(nextLanguage: (typeof languageOptions)[number]["id"]) {
    startTransition(() => {
      setLanguage(nextLanguage);
    });
  }

  return (
    <div className="control-shell pointer-events-auto relative z-20">
      <div className="flex items-center gap-1">
        <div className="hidden items-center gap-2 px-3 text-sm font-medium text-muted sm:flex">
          <Languages className="h-4 w-4" />
          {translation.shell.language}
        </div>
        {languageOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleLanguageChange(option.id)}
            className={cn(
              "control-button min-w-[46px] sm:min-w-[82px]",
              option.id === language
                ? "control-button-active"
                : "hover:bg-surface hover:text-ink"
            )}
            disabled={isPending}
            aria-pressed={option.id === language}
            aria-label={`Switch language to ${option.nativeLabel}`}
          >
            <span className="text-[11px] uppercase opacity-70">
              {option.shortLabel}
            </span>
            <span className="hidden sm:inline">{option.nativeLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
