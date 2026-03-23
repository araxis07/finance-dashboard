"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoryLabel } from "@/lib/finance";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { TransactionCategoryId } from "@/types/finance";

interface ExpenseDatum {
  categoryId: TransactionCategoryId;
  value: number;
  color: string;
}

export function ExpenseChartCard({ data }: { data: ExpenseDatum[] }) {
  const language = usePreferencesStore((state) => state.language);
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const translation = getTranslation(language);
  const totalExpense = data.reduce((total, item) => total + item.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{translation.chart.title}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {translation.chart.description}
          </p>
        </div>
        <p className="text-sm font-medium text-muted">
          {translation.chart.totalSpent}:{" "}
          <span className="text-ink">{formatCurrency(totalExpense, language)}</span>
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title={translation.chart.emptyTitle}
            description={translation.chart.emptyDescription}
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={openAddTransaction}>
                  {translation.chart.addExpense}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => loadStarterTransactions(language)}
                >
                  {translation.chart.loadSample}
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative h-[280px] rounded-2xl bg-slate-50/70 p-3">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center">
                <p className="text-sm text-muted">{translation.chart.centerLabel}</p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {formatCurrency(totalExpense, language)}
                </p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={82}
                    outerRadius={108}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(Number(value), language)
                    }
                    labelFormatter={(label) =>
                      getCategoryLabel(label as TransactionCategoryId, language)
                    }
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #dce5f2",
                      boxShadow: "0 24px 60px -30px rgba(15, 23, 42, 0.22)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between rounded-2xl border border-stroke bg-slate-50/60 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium text-ink">
                        {getCategoryLabel(item.categoryId, language)}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {translation.chart.category}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatCurrency(item.value, language)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
