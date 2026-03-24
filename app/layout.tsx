import type { Metadata } from "next";
import { AppPreferencesProvider } from "@/components/providers/app-preferences-provider";
import { AppShell } from "@/components/layout/app-shell";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Finance Dashboard",
  description: "Local-first personal finance dashboard built with Next.js and Zustand."
};

const themeInitScript = `
(() => {
  const storageKey = "${PREFERENCES_STORAGE_KEY}";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  let language = "th";
  let theme = systemTheme;

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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
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
