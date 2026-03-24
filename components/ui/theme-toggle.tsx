"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useI18n, useThemePreference } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types/app";

const themeOptions: Array<{
  id: Theme;
  icon: typeof SunMedium;
}> = [
  {
    id: "light",
    icon: SunMedium
  },
  {
    id: "dark",
    icon: MoonStar
  }
];

export function ThemeToggle() {
  const { translation } = useI18n();
  const { setTheme, theme } = useThemePreference();

  return (
    <div className="control-shell">
      <div className="flex items-center gap-1">
        <div className="hidden items-center px-3 text-sm font-medium text-muted sm:flex">
          {translation.shell.theme}
        </div>
        {themeOptions.map((option) => {
          const isActive = option.id === theme;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={cn(
                "control-button min-w-[46px] sm:min-w-[92px]",
                isActive ? "control-button-active" : "hover:bg-surface hover:text-ink"
              )}
              aria-pressed={isActive}
              aria-label={
                option.id === "light"
                  ? translation.shell.lightMode
                  : translation.shell.darkMode
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {option.id === "light"
                  ? translation.shell.lightMode
                  : translation.shell.darkMode}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
