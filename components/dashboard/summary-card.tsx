"use client";

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
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
  const { language, translation } = useI18n();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div>
            <div className="badge-pill">{translation.summary.badge}</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[2rem]">
              {translation.summary.totalBalance}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {translation.summary.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="stat-tile bg-panel/92">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {translation.summary.totalBalance}
                  </p>
                  <p className="mt-3 break-words text-2xl font-semibold text-ink">
                    {formatCurrency(totalBalance, language)}
                  </p>
                </div>
                <div className="rounded-2xl bg-accentSoft p-3 text-ink">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="stat-tile bg-incomeSoft/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {translation.summary.income}
                  </p>
                  <p className="mt-3 break-words text-2xl font-semibold text-ink">
                    {formatCurrency(totalIncome, language)}
                  </p>
                </div>
                <div className="rounded-2xl bg-panel/90 p-3 text-income">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="stat-tile bg-expenseSoft/72">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {translation.summary.expense}
                  </p>
                  <p className="mt-3 break-words text-2xl font-semibold text-ink">
                    {formatCurrency(totalExpense, language)}
                  </p>
                </div>
                <div className="rounded-2xl bg-panel/90 p-3 text-expense">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
