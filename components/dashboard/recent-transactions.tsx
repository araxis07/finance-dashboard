"use client";

import { ArrowDownLeft, ArrowUpRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAccountLabel,
  getCategoryLabel,
  getPaymentMethodLabel,
  getTransactionTypeLabel
} from "@/lib/finance";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Transaction } from "@/types/finance";

export function RecentTransactions({
  transactions
}: {
  transactions: Transaction[];
}) {
  const language = usePreferencesStore((state) => state.language);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const translation = getTranslation(language);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translation.recent.title}</CardTitle>
        <p className="mt-1 text-sm text-muted">
          {translation.recent.description}
        </p>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={translation.recent.emptyTitle}
            description={translation.recent.emptyDescription}
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={openAddTransaction}>
                  {translation.recent.createTransaction}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => loadStarterTransactions(language)}
                >
                  {translation.recent.loadSample}
                </Button>
              </div>
            }
            className="min-h-[320px]"
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const tags = Array.isArray(transaction.tags) ? transaction.tags : [];
              const transactionTitle =
                transaction.title ||
                getCategoryLabel(transaction.category, language);

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-4 rounded-[1.6rem] border border-stroke bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-card md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-2xl p-3 ${
                        isIncome
                          ? "bg-emerald-100 text-income"
                          : "bg-red-100 text-expense"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-ink">{transactionTitle}</p>
                        <p className="mt-1 text-sm text-muted">
                          {getCategoryLabel(transaction.category, language)} •{" "}
                          {formatDate(transaction.date, language)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-muted">
                          {getAccountLabel(transaction.account, language)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-muted">
                          {getPaymentMethodLabel(
                            transaction.paymentMethod,
                            language
                          )}
                        </span>
                        {tags.map((tag) => (
                          <span
                            key={`${transaction.id}-${tag}`}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-accent"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {transaction.counterparty ? (
                        <p className="text-sm text-muted">
                          {translation.recent.sourceCounterparty}:{" "}
                          <span className="text-ink">{transaction.counterparty}</span>
                        </p>
                      ) : null}
                      {transaction.location ? (
                        <p className="text-sm text-muted">
                          {translation.recent.sourceLocation}:{" "}
                          <span className="text-ink">{transaction.location}</span>
                        </p>
                      ) : null}
                      {transaction.reference ? (
                        <p className="text-sm text-muted">
                          {translation.recent.sourceReference}:{" "}
                          <span className="text-ink">{transaction.reference}</span>
                        </p>
                      ) : null}
                      {transaction.note ? (
                        <p className="text-sm text-muted">
                          {translation.recent.sourceNote}:{" "}
                          <span className="text-ink">{transaction.note}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p
                      className={`text-lg font-semibold ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount, language)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                      {getTransactionTypeLabel(transaction.type, language)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
