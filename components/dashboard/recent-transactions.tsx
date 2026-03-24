"use client";

import { ArrowDownLeft, ArrowUpRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/hooks/use-i18n";
import {
  getAccountLabel,
  getCategoryLabel,
  getPaymentMethodLabel,
  getTransactionTypeLabel
} from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Transaction } from "@/types/finance";

export function RecentTransactions({
  transactions
}: {
  transactions: Transaction[];
}) {
  const { language, translation } = useI18n();
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="badge-pill w-fit">{translation.recent.title}</div>
          <CardTitle className="mt-4">{translation.recent.title}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted">
            {translation.recent.description}
          </p>
        </div>
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
                  className="rounded-[1.5rem] border border-stroke/70 bg-surface/72 px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:bg-panel"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px] xl:items-start">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-2xl p-3 ${
                            isIncome
                              ? "bg-incomeSoft text-income"
                              : "bg-expenseSoft text-expense"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-lg font-semibold leading-7 text-ink">
                            {transactionTitle}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {getCategoryLabel(transaction.category, language)} •{" "}
                            {formatDate(transaction.date, language)}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                              {getAccountLabel(transaction.account, language)}
                            </span>
                            <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                              {getPaymentMethodLabel(
                                transaction.paymentMethod,
                                language
                              )}
                            </span>
                            {tags.map((tag) => (
                              <span
                                key={`${transaction.id}-${tag}`}
                                className="rounded-full border border-stroke/70 bg-accentSoft px-3 py-1 text-xs font-medium text-ink"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {(transaction.counterparty ||
                        transaction.location ||
                        transaction.reference ||
                        transaction.note) && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {transaction.counterparty ? (
                            <div className="rounded-xl border border-stroke/60 bg-panel/86 px-3 py-3 text-sm text-muted">
                              {translation.recent.sourceCounterparty}:{" "}
                              <span className="break-words text-ink">
                                {transaction.counterparty}
                              </span>
                            </div>
                          ) : null}
                          {transaction.location ? (
                            <div className="rounded-xl border border-stroke/60 bg-panel/86 px-3 py-3 text-sm text-muted">
                              {translation.recent.sourceLocation}:{" "}
                              <span className="break-words text-ink">
                                {transaction.location}
                              </span>
                            </div>
                          ) : null}
                          {transaction.reference ? (
                            <div className="rounded-xl border border-stroke/60 bg-panel/86 px-3 py-3 text-sm text-muted">
                              {translation.recent.sourceReference}:{" "}
                              <span className="break-all text-ink">
                                {transaction.reference}
                              </span>
                            </div>
                          ) : null}
                          {transaction.note ? (
                            <div className="rounded-xl border border-stroke/60 bg-panel/86 px-3 py-3 text-sm text-muted">
                              {translation.recent.sourceNote}:{" "}
                              <span className="break-words text-ink">
                                {transaction.note}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 xl:items-end xl:text-right">
                      <div>
                        <p
                          className={`text-xl font-semibold ${
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

                      <div
                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          isIncome
                            ? "bg-incomeSoft text-income"
                            : "bg-expenseSoft text-expense"
                        }`}
                      >
                        {getTransactionTypeLabel(transaction.type, language)}
                      </div>
                    </div>
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
