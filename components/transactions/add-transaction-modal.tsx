"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useFinanceStore } from "@/stores/use-finance-store";
import { TransactionForm } from "./transaction-form";

export function AddTransactionModal() {
  const { translation } = useI18n();
  const isOpen = useFinanceStore((state) => state.isAddTransactionOpen);
  const closeAddTransaction = useFinanceStore((state) => state.closeAddTransaction);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAddTransaction();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAddTransaction, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={closeAddTransaction}
      />

      <div className="absolute inset-0 overflow-y-auto p-3 sm:p-5">
        <div
          aria-modal="true"
          role="dialog"
          className="mx-auto flex min-h-full w-full max-w-[1480px] items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="panel w-full overflow-hidden p-4 sm:p-5">
            <div className="hero-panel p-5 sm:p-6">
              <div className="hero-glow -right-8 top-0 h-32 w-32" />
              <div className="hero-glow left-0 top-1/3 h-28 w-28" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                    {translation.modal.badge}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    {translation.modal.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
                    {translation.modal.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white transition hover:bg-white/15"
                  onClick={closeAddTransaction}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <TransactionForm
                variant="modal"
                onCancel={closeAddTransaction}
                isOpen={isOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
