"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/hooks/use-i18n";
import { getCategoryLabel } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { TransactionCategoryId } from "@/types/finance";

interface ExpenseDatum {
  categoryId: TransactionCategoryId;
  value: number;
  color: string;
}

export function ExpenseChartCard({ data }: { data: ExpenseDatum[] }) {
  const { language, translation } = useI18n();
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const totalExpense = data.reduce((total, item) => total + item.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="badge-pill w-fit">{translation.chart.category}</div>
          <CardTitle className="mt-4">{translation.chart.title}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted">
            {translation.chart.description}
          </p>
        </div>
        <div className="rounded-[1.2rem] border border-stroke/70 bg-surface/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {translation.chart.totalSpent}
          </p>
          <p className="mt-2 text-xl font-semibold text-ink">
            {formatCurrency(totalExpense, language)}
          </p>
        </div>
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative h-[280px] rounded-[1.6rem] border border-stroke/70 bg-surface/72 p-4 sm:h-[320px]">
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
                    nameKey="categoryId"
                    innerRadius={88}
                    outerRadius={118}
                    paddingAngle={3}
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
                      backgroundColor: "rgb(var(--panel) / 0.98)",
                      borderRadius: "16px",
                      border: "1px solid rgb(var(--stroke) / 0.7)",
                      boxShadow: "var(--shadow-card)",
                      color: "rgb(var(--ink))"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {data.map((item) => {
                const percentage =
                  totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;

                return (
                  <div
                    key={item.categoryId}
                    className="rounded-[1.35rem] border border-stroke/70 bg-surface/72 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="mt-1 h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {getCategoryLabel(item.categoryId, language)}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {translation.chart.category}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="break-words font-semibold text-ink">
                          {formatCurrency(item.value, language)}
                        </p>
                        <p className="text-xs text-muted">
                          {percentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-pageAlt">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(percentage, 8)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
