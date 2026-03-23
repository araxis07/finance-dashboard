"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useFinanceStore } from "@/stores/use-finance-store";

export function ToastViewport() {
  const toast = useFinanceStore((state) => state.toast);
  const dismissToast = useFinanceStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      dismissToast();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] animate-fade-up">
      <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        <div className="rounded-full bg-emerald-100 p-2 text-income">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-ink">{toast.title}</p>
          <p className="mt-1 text-sm text-muted">{toast.description}</p>
        </div>
      </div>
    </div>
  );
}
