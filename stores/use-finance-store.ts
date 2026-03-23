"use client";

import { create } from "zustand";
import type { NewTransaction, Transaction } from "@/types/finance";

interface ToastPayload {
  id: number;
  title: string;
  description: string;
}

interface FinanceStore {
  transactions: Transaction[];
  isAddTransactionOpen: boolean;
  toast: ToastPayload | null;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  addTransaction: (transaction: NewTransaction) => void;
  dismissToast: () => void;
}

function createTransactionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  isAddTransactionOpen: false,
  toast: null,
  openAddTransaction: () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        {
          ...transaction,
          id: createTransactionId()
        },
        ...state.transactions
      ],
      isAddTransactionOpen: false,
      toast: {
        id: Date.now(),
        title: "Transaction added",
        description: `${transaction.category} saved to your local dashboard.`
      }
    })),
  dismissToast: () => set({ toast: null })
}));
