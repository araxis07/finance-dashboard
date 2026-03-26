import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AppPreferencesProvider } from "@/components/providers/app-preferences-provider";
import { AppShell } from "@/components/layout/app-shell";
import {
  LANGUAGE_COOKIE_NAME,
  PREFERENCES_STORAGE_KEY,
  THEME_COOKIE_NAME
} from "@/lib/preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Finance Dashboard",
  description: "Local-first personal finance dashboard built with Next.js and Zustand."
};

function normalizeLanguage(value: string | undefined) {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

function normalizeTheme(value: string | undefined) {
  return value === "light" || value === "dark" ? value : undefined;
}

function buildThemeInitScript(initialLanguage: string, initialTheme: string) {
  return `
(() => {
  const storageKey = "${PREFERENCES_STORAGE_KEY}";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  let language = "${initialLanguage}";
  let theme = "${initialTheme}" || systemTheme;

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (raw) {
      const parsed = JSON.parse(raw);
      const state =
        parsed && typeof parsed === "object"
          ? "state" in parsed && parsed.state && typeof parsed.state === "object"
            ? parsed.state
            : parsed
          : null;

      if (state?.theme === "light" || state?.theme === "dark") {
        theme = state.theme;
      }

      if (state?.language === "th" || state?.language === "en" || state?.language === "ja") {
        language = state.language;
      }
    }
  } catch {
    theme = systemTheme;
  }

  root.lang = language;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle("dark", theme === "dark");
})();
`;
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const initialLanguage = normalizeLanguage(
    cookieStore.get(LANGUAGE_COOKIE_NAME)?.value
  );
  const initialTheme = normalizeTheme(
    cookieStore.get(THEME_COOKIE_NAME)?.value
  );
  const themeInitScript = buildThemeInitScript(
    initialLanguage,
    initialTheme ?? ""
  );

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-page text-ink antialiased">
        <AppPreferencesProvider>
          <AppShell>{children}</AppShell>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
