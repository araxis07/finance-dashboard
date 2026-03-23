"use client";

import { ArrowDownLeft, ArrowUpRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Transaction } from "@/types/finance";

export function RecentTransactions({
  transactions
}: {
  transactions: Transaction[];
}) {
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Latest income and expense entries with color-coded totals.
        </p>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No transactions recorded"
            description="Add your first transaction to start building recent activity, balances, and expense insights."
            action={<Button onClick={openAddTransaction}>Create transaction</Button>}
            className="min-h-[320px]"
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-4 rounded-2xl border border-stroke bg-white px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft md:flex-row md:items-center md:justify-between"
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

                    <div>
                      <p className="font-semibold text-ink">{transaction.category}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p
                      className={`text-lg font-semibold ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                      {transaction.type}
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
