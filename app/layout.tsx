import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Finance Dashboard",
  description: "Local-first personal finance dashboard built with Next.js and Zustand."
};

const themeInitScript = `
(() => {
  const storageKey = "finance-dashboard-preferences";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  let theme = systemTheme;

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (raw) {
      const parsed = JSON.parse(raw);
      const candidate =
        parsed && typeof parsed === "object"
          ? "state" in parsed && parsed.state && typeof parsed.state === "object"
            ? parsed.state.theme
            : parsed.theme
          : null;

      if (candidate === "light" || candidate === "dark") {
        theme = candidate;
      }
    }
  } catch {
    theme = systemTheme;
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
