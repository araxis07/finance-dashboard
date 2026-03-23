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
import { ToastViewport } from "@/components/ui/toast-viewport";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";

const navigation = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/upload",
    label: "Upload",
    icon: Upload
  }
];

const titleMap: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Track balances, spending patterns, and recent activity."
  },
  "/upload": {
    title: "Upload",
    description: "Drop a file to preview how mocked parsing would look."
  }
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const currentPage = titleMap[pathname] ?? titleMap["/"];

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:px-8 lg:py-6">
        <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[290px]">
          <div className="panel flex h-full flex-col justify-between overflow-hidden p-4">
            <div>
              <div className="rounded-2xl bg-gradient-to-br from-ink via-slate-800 to-accent p-5 text-white shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                      Finora
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold">Personal finance</h1>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-2">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-6 max-w-[18rem] text-sm leading-6 text-white/75">
                  A local-first dashboard for balance snapshots, spending trends,
                  and quick transaction capture.
                </p>
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

            <div className="rounded-2xl border border-stroke bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-income">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Local-only state</p>
                  <p className="text-sm text-muted">No backend, no sync, no parsing API.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-muted">
                Personal finance workspace
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                {currentPage.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{currentPage.description}</p>
            </div>

            <Button className="w-full md:w-auto" onClick={openAddTransaction}>
              <Plus className="h-4 w-4" />
              Add transaction
            </Button>
          </header>

          {children}
        </main>
      </div>

      <AddTransactionModal />
      <ToastViewport />
    </>
  );
}
