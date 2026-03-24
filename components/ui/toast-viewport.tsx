"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { getCategoryLabel } from "@/lib/finance";
import { useFinanceStore } from "@/stores/use-finance-store";

export function ToastViewport() {
  const { language, translation } = useI18n();
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

  const categoryLabel = getCategoryLabel(toast.category, language);

  return (
    <div className="pointer-events-none fixed left-4 right-4 top-4 z-[60] animate-fade-up sm:left-auto sm:max-w-sm">
      <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-stroke/70 bg-panel/95 px-4 py-3 shadow-card backdrop-blur">
        <div className="rounded-full bg-incomeSoft p-2 text-income">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">{translation.toast.title}</p>
          <p className="mt-1 break-words text-sm text-muted">
            {translation.toast.description(toast.transactionTitle, categoryLabel)}
          </p>
        </div>
      </div>
    </div>
  );
}
