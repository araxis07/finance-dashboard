"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Upload
} from "lucide-react";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, translation } = useI18n();
  const transactionCount = useFinanceStore((state) => state.transactions.length);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);

  const navigation = [
    {
      href: "/",
      label: translation.nav.dashboard,
      icon: LayoutDashboard
    },
    {
      href: "/upload",
      label: translation.nav.upload,
      icon: Upload
    }
  ];

  const titleMap = {
    "/": translation.pages.dashboard,
    "/upload": translation.pages.upload
  };

  const currentPage = titleMap[pathname as keyof typeof titleMap] ?? titleMap["/"];

  return (
    <>
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[6%] top-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-[8%] top-16 h-72 w-72 rounded-full bg-surfaceAlt/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-income/10 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-5 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-8 lg:py-6">
          <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="panel flex h-full flex-col gap-5 p-4 sm:p-5">
              <div className="hero-panel p-5">
                <div className="hero-glow -left-12 top-8 h-36 w-36" />
                <div className="hero-glow right-0 top-0 h-44 w-44" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/62">
                        {translation.shell.brandName}
                      </p>
                      <h1 className="mt-3 break-words text-2xl font-semibold">
                        {translation.shell.brandTitle}
                      </h1>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white/80">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-5 max-w-[18rem] text-sm leading-6 text-white/72">
                    {translation.shell.brandDescription}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                        {translation.recent.title}
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {transactionCount}
                      </p>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                        {translation.shell.localStateTitle}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        {translation.shell.localStateDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {navigation.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200",
                        isActive
                          ? "border-accent/20 bg-accent text-accentForeground shadow-soft"
                          : "border-stroke/60 bg-surface/78 text-ink hover:bg-panel"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="soft-panel mt-auto flex items-start gap-3 px-4 py-4">
                <div className="rounded-2xl bg-incomeSoft p-3 text-income">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {translation.shell.localStateTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {translation.shell.localStateDescription}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            <header className="panel flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="badge-pill">
                  {translation.shell.workspaceLabel}
                </div>
                <h2 className="mt-4 break-words text-3xl font-semibold tracking-tight text-ink sm:text-[2.2rem]">
                  {currentPage.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {currentPage.description}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                  <Button
                    className="w-full sm:w-auto"
                    variant="secondary"
                    onClick={() => loadStarterTransactions(language)}
                  >
                    {translation.shell.loadSample}
                  </Button>
                  <Button className="w-full sm:w-auto" onClick={openAddTransaction}>
                    <Plus className="h-4 w-4" />
                    {translation.shell.addTransaction}
                  </Button>
                </div>
              </div>
            </header>

            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>

      <AddTransactionModal />
      <ToastViewport />
    </>
  );
}
