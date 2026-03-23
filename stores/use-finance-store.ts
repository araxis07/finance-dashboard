"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildStarterTransactions,
  normalizeAccountId,
  normalizeCategoryId,
  normalizePaymentMethodId
} from "@/lib/finance";
import type { Language } from "@/types/app";
import type { NewTransaction, Transaction } from "@/types/finance";

interface ToastPayload {
  id: number;
  transactionTitle: string;
  category: Transaction["category"];
}

interface FinanceStore {
  language: Language;
  transactions: Transaction[];
  isAddTransactionOpen: boolean;
  toast: ToastPayload | null;
  setLanguage: (language: Language) => void;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  addTransaction: (transaction: NewTransaction) => void;
  loadStarterTransactions: (language: Language) => void;
  dismissToast: () => void;
}

function createTransactionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "ja" || value === "th" ? value : "th";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
    return getTodayString();
  }

  return value;
}

function normalizeStoredTransaction(value: unknown): Transaction | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const transaction = value as Partial<Record<keyof Transaction, unknown>>;
  const type =
    transaction.type === "income" || transaction.type === "expense"
      ? transaction.type
      : null;

  if (!type) {
    return null;
  }

  const amount = Number(transaction.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const fallbackTitle = normalizeText(transaction.category) || (type === "income" ? "Income" : "Expense");

  return {
    id:
      typeof transaction.id === "string" && transaction.id
        ? transaction.id
        : createTransactionId(),
    title: normalizeText(transaction.title) || fallbackTitle,
    amount,
    type,
    category: normalizeCategoryId(transaction.category, type),
    date: normalizeDate(transaction.date),
    account: normalizeAccountId(transaction.account),
    paymentMethod: normalizePaymentMethodId(transaction.paymentMethod, type),
    counterparty: normalizeText(transaction.counterparty),
    location: normalizeText(transaction.location),
    reference: normalizeText(transaction.reference),
    note: normalizeText(transaction.note),
    tags: normalizeTags(transaction.tags)
  };
}

function migratePersistedState(persistedState: unknown) {
  const fallback = {
    language: "th" as Language,
    transactions: [] as Transaction[]
  };

  if (!persistedState || typeof persistedState !== "object") {
    return fallback;
  }

  const rawState = persistedState as Partial<
    Record<keyof FinanceStore | "state", unknown>
  >;
  const state =
    rawState.state && typeof rawState.state === "object"
      ? (rawState.state as Partial<Record<keyof FinanceStore, unknown>>)
      : (rawState as Partial<Record<keyof FinanceStore, unknown>>);

  return {
    language: normalizeLanguage(state.language),
    transactions: Array.isArray(state.transactions)
      ? state.transactions
          .map((transaction) => normalizeStoredTransaction(transaction))
          .filter((transaction): transaction is Transaction => transaction !== null)
      : fallback.transactions
  };
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      language: "th",
      transactions: [],
      isAddTransactionOpen: false,
      toast: null,
      setLanguage: (language) => set({ language: normalizeLanguage(language) }),
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
            transactionTitle: transaction.title,
            category: transaction.category
          }
        })),
      loadStarterTransactions: (language) =>
        set({
          transactions: buildStarterTransactions(normalizeLanguage(language)).map(
            (transaction) => ({
              ...transaction,
              id: createTransactionId()
            })
          ),
          toast: null
        }),
      dismissToast: () => set({ toast: null })
    }),
    {
      name: "finance-dashboard-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => ({
        ...migratePersistedState(persistedState),
        isAddTransactionOpen: false,
        toast: null
      }),
      partialize: (state) => ({
        language: state.language,
        transactions: state.transactions
      })
    }
  )
);
