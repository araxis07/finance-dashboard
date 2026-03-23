"use client";

import { Layers3, Sparkles } from "lucide-react";
import { ExpenseChartCard } from "@/components/dashboard/expense-chart-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  getExpenseChartData,
  getRecentTransactions,
  getSummary
} from "@/lib/finance";
import { useFinanceStore } from "@/stores/use-finance-store";

export function DashboardOverview() {
  const transactions = useFinanceStore((state) => state.transactions);
  const summary = getSummary(transactions);
  const expenseData = getExpenseChartData(transactions);
  const recentTransactions = getRecentTransactions(transactions);

  return (
    <div className="space-y-6">
      <SummaryCard
        totalBalance={summary.totalBalance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        <ExpenseChartCard data={expenseData} />

        <Card className="overflow-hidden bg-gradient-to-br from-ink via-slate-900 to-slate-800 text-white">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
                Weekly rhythm
              </div>
              <h3 className="mt-5 text-2xl font-semibold">
                Keep capture friction low
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Add transactions as they happen, then use upload previews to mock how
                statement imports could fit into the same workflow.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Sparkles className="h-5 w-5 text-blue-200" />
                <div>
                  <p className="font-medium">Clean fintech styling</p>
                  <p className="text-sm text-white/70">
                    Rounded cards, soft shadows, and subtle motion throughout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Layers3 className="h-5 w-5 text-emerald-200" />
                <div>
                  <p className="font-medium">Local-only architecture</p>
                  <p className="text-sm text-white/70">
                    Zustand manages everything in memory. No backend or parser is wired in.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
