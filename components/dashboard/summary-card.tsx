"use client";

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export function SummaryCard({
  totalBalance,
  totalIncome,
  totalExpense
}: SummaryCardProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/70">
      <CardContent className="p-6">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">
              <Wallet className="h-3.5 w-3.5" />
              Portfolio snapshot
            </div>
            <p className="mt-5 text-sm text-muted">Total balance</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {formatCurrency(totalBalance)}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
              Keep an eye on incoming cash, outgoing spend, and how your balance
              is moving over time.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:min-w-[420px]">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-income shadow-sm">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Income</p>
                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-expense shadow-sm">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Expense</p>
                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
