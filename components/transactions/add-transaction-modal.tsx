"use client";

import { X } from "lucide-react";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { useFinanceStore } from "@/stores/use-finance-store";
import { TransactionForm } from "./transaction-form";

export function AddTransactionModal() {
  const language = usePreferencesStore((state) => state.language);
  const isOpen = useFinanceStore((state) => state.isAddTransactionOpen);
  const closeAddTransaction = useFinanceStore((state) => state.closeAddTransaction);
  const translation = getTranslation(language);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-hidden={false}
      className="fixed inset-0 z-50 transition"
    >
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition opacity-100"
        onClick={closeAddTransaction}
      />

      <div className="absolute inset-0 overflow-y-auto p-3 sm:p-5">
        <div
          aria-modal="true"
          role="dialog"
          className="mx-auto flex min-h-full w-full max-w-[1440px] items-center justify-center transition duration-200 translate-y-0 opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,rgba(246,249,255,0.98),rgba(255,255,255,0.96))] p-4 shadow-card sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-4 rounded-[1.6rem] bg-slate-950 px-5 py-5 text-white">
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
                className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/15"
                onClick={closeAddTransaction}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <TransactionForm
              variant="modal"
              onCancel={closeAddTransaction}
              isOpen={isOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
