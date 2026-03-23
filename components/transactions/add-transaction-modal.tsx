"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, DollarSign, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoriesForType } from "@/lib/finance";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { TransactionType } from "@/types/finance";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export function AddTransactionModal() {
  const isOpen = useFinanceStore((state) => state.isAddTransactionOpen);
  const closeAddTransaction = useFinanceStore((state) => state.closeAddTransaction);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("Housing");
  const [date, setDate] = useState(getTodayString());

  const categoryOptions = useMemo(() => getCategoriesForType(type), [type]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAmount("");
    setType("expense");
    setCategory("Housing");
    setDate(getTodayString());
  }, [isOpen]);

  useEffect(() => {
    setCategory(categoryOptions[0]);
  }, [categoryOptions]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return;
    }

    addTransaction({
      amount: parsedAmount,
      type,
      category,
      date
    });
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-slate-950/35 backdrop-blur-sm transition ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeAddTransaction}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          aria-modal="true"
          role="dialog"
          className={`w-full max-w-xl rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-card transition duration-200 ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Quick add
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">
                Add transaction
              </h3>
              <p className="mt-2 text-sm text-muted">
                Capture an income or expense entry in local Zustand state.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-slate-100 p-2 text-muted transition hover:bg-slate-200 hover:text-ink"
              onClick={closeAddTransaction}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="field-label">Amount</span>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="field-input pl-10"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label>
                <span className="field-label">Date</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="field-input pl-10"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="field-label">Type</span>
                <select
                  className="field-input"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as TransactionType)
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label>
                <span className="field-label">Category</span>
                <select
                  className="field-input"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-stroke pt-5 md:flex-row md:justify-end">
              <Button variant="ghost" onClick={closeAddTransaction}>
                Cancel
              </Button>
              <Button type="submit">
                <PlusCircle className="h-4 w-4" />
                Save transaction
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
