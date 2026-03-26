"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createBrowserJSONStorage } from "@/lib/browser-storage";
import {
  buildStarterTransactions,
  normalizeAccountId,
  normalizeCategoryId,
  normalizePaymentMethodId
} from "@/lib/finance";
import type { Language } from "@/types/app";
import type {
  NewTransaction,
  ParsedUploadTransaction,
  Transaction,
  UploadImportRecord,
  UploadParseResult
} from "@/types/finance";

interface ToastPayload {
  id: number;
  transactionTitle: string;
  category: Transaction["category"];
}

interface FinanceStore {
  transactions: Transaction[];
  imports: UploadImportRecord[];
  isAddTransactionOpen: boolean;
  toast: ToastPayload | null;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  addTransaction: (transaction: NewTransaction) => void;
  updateTransaction: (transactionId: string, transaction: NewTransaction) => void;
  importTransactions: (
    transactions: ParsedUploadTransaction[],
    metadata: Pick<
      UploadParseResult,
      "fileName" | "sourceType" | "summary" | "warnings" | "processedAt"
    >
  ) => void;
  loadStarterTransactions: (language: Language) => void;
  dismissToast: () => void;
}

function createId() {
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

  const fallbackTitle =
    normalizeText(transaction.category) || (type === "income" ? "Income" : "Expense");

  return {
    id:
      typeof transaction.id === "string" && transaction.id
        ? transaction.id
        : createId(),
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

function normalizeImportRecord(value: unknown): UploadImportRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<Record<keyof UploadImportRecord, unknown>>;
  const sourceType =
    record.sourceType === "spreadsheet" ||
    record.sourceType === "pdf" ||
    record.sourceType === "image"
      ? record.sourceType
      : null;

  if (!sourceType) {
    return null;
  }

  return {
    id: typeof record.id === "string" && record.id ? record.id : createId(),
    fileName: normalizeText(record.fileName) || "Imported file",
    sourceType,
    importedAt: normalizeDate(record.importedAt),
    transactionCount: Math.max(0, Number(record.transactionCount) || 0),
    totalIncome: Math.max(0, Number(record.totalIncome) || 0),
    totalExpense: Math.max(0, Number(record.totalExpense) || 0),
    warnings: Array.isArray(record.warnings)
      ? record.warnings.filter(
          (warning): warning is UploadImportRecord["warnings"][number] =>
            warning === "manual_review_required" ||
            warning === "no_transactions_detected" ||
            warning === "rows_skipped"
        )
      : []
  };
}

function migratePersistedState(persistedState: unknown) {
  const fallback = {
    transactions: [] as Transaction[],
    imports: [] as UploadImportRecord[]
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
    transactions: Array.isArray(state.transactions)
      ? state.transactions
          .map((transaction) => normalizeStoredTransaction(transaction))
          .filter((transaction): transaction is Transaction => transaction !== null)
      : fallback.transactions,
    imports: Array.isArray(state.imports)
      ? state.imports
          .map((record) => normalizeImportRecord(record))
          .filter((record): record is UploadImportRecord => record !== null)
      : fallback.imports
  };
}

function normalizeIncomingTransaction(transaction: NewTransaction): NewTransaction {
  return {
    title: normalizeText(transaction.title) || "Untitled transaction",
    amount: Math.max(0, Number(transaction.amount) || 0),
    type: transaction.type === "income" ? "income" : "expense",
    category: normalizeCategoryId(transaction.category, transaction.type),
    date: normalizeDate(transaction.date),
    account: normalizeAccountId(transaction.account),
    paymentMethod: normalizePaymentMethodId(
      transaction.paymentMethod,
      transaction.type
    ),
    counterparty: normalizeText(transaction.counterparty),
    location: normalizeText(transaction.location),
    reference: normalizeText(transaction.reference),
    note: normalizeText(transaction.note),
    tags: normalizeTags(transaction.tags)
  };
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      imports: [],
      isAddTransactionOpen: false,
      toast: null,
      openAddTransaction: () => set({ isAddTransactionOpen: true }),
      closeAddTransaction: () => set({ isAddTransactionOpen: false }),
      addTransaction: (transaction) => {
        const normalized = normalizeIncomingTransaction(transaction);

        set((state) => ({
          transactions: [
            {
              ...normalized,
              id: createId()
            },
            ...state.transactions
          ],
          isAddTransactionOpen: false,
          toast: {
            id: Date.now(),
            transactionTitle: normalized.title,
            category: normalized.category
          }
        }));
      },
      updateTransaction: (transactionId, transaction) => {
        const normalized = normalizeIncomingTransaction(transaction);

        set((state) => ({
          transactions: state.transactions.map((item) =>
            item.id === transactionId ? { ...normalized, id: transactionId } : item
          ),
          toast: {
            id: Date.now(),
            transactionTitle: normalized.title,
            category: normalized.category
          }
        }));
      },
      importTransactions: (transactions, metadata) => {
        const importedTransactions = transactions
          .map((transaction) => normalizeIncomingTransaction(transaction))
          .filter((transaction) => transaction.amount > 0);

        if (importedTransactions.length === 0) {
          return;
        }

        set((state) => ({
          transactions: [
            ...importedTransactions.map((transaction) => ({
              ...transaction,
              id: createId()
            })),
            ...state.transactions
          ],
          imports: [
            {
              id: createId(),
              fileName: metadata.fileName,
              sourceType: metadata.sourceType,
              importedAt: normalizeDate(metadata.processedAt),
              transactionCount: importedTransactions.length,
              totalIncome: metadata.summary.totalIncome,
              totalExpense: metadata.summary.totalExpense,
              warnings: metadata.warnings
            },
            ...state.imports
          ].slice(0, 12)
        }));
      },
      loadStarterTransactions: (language) =>
        set({
          transactions: buildStarterTransactions(normalizeLanguage(language)).map(
            (transaction) => ({
              ...transaction,
              id: createId()
            })
          ),
          toast: null
        }),
      dismissToast: () => set({ toast: null })
    }),
    {
      name: "finance-dashboard-store",
      version: 3,
      storage: createBrowserJSONStorage(),
      migrate: (persistedState) => ({
        ...migratePersistedState(persistedState),
        isAddTransactionOpen: false,
        toast: null
      }),
      partialize: (state) => ({
        transactions: state.transactions,
        imports: state.imports
      })
    }
  )
);
