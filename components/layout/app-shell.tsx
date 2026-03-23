"use client";

import { useEffect } from "react";
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
import { ToastViewport } from "@/components/ui/toast-viewport";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const language = usePreferencesStore((state) => state.language);
  const transactionCount = useFinanceStore((state) => state.transactions.length);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const translation = getTranslation(language);

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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:px-8 lg:py-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-0 top-10 h-60 w-60 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[290px]">
          <div className="panel flex h-full flex-col justify-between overflow-hidden p-4 shadow-card">
            <div>
              <div className="rounded-[1.7rem] bg-gradient-to-br from-ink via-slate-800 to-accent p-5 text-white shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                      {translation.shell.brandName}
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold">
                      {translation.shell.brandTitle}
                    </h1>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-2">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-6 max-w-[18rem] text-sm leading-6 text-white/75">
                  {translation.shell.brandDescription}
                </p>

                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                    {translation.recent.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{transactionCount}</p>
                </div>
              </div>

              <nav className="mt-6 grid gap-2">
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
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5",
                        isActive
                          ? "bg-accent text-white shadow-soft"
                          : "bg-slate-50 text-muted hover:bg-white hover:text-ink"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-[1.5rem] border border-stroke bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-income">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {translation.shell.localStateTitle}
                  </p>
                  <p className="text-sm text-muted">
                    {translation.shell.localStateDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="panel relative z-10 flex flex-col gap-4 p-5 shadow-card md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-muted">
                {translation.shell.workspaceLabel}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                {currentPage.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{currentPage.description}</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LanguageSwitcher />
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
          </header>

          {children}
        </main>
      </div>

      <AddTransactionModal />
      <ToastViewport />
    </>
  );
}
