"use client";

import { ArrowRight, ChartNoAxesCombined, Layers3, Sparkles } from "lucide-react";
import { ExpenseChartCard } from "@/components/dashboard/expense-chart-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  getExpenseChartData,
  getRecentTransactions,
  getSummary
} from "@/lib/finance";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Language } from "@/types/app";

const heroCopy: Record<
  Language,
  {
    badge: string;
    title: string;
    description: string;
    totalEntries: string;
    trackedCategories: string;
    avgExpense: string;
    guidanceTitle: string;
    guidanceDescription: string;
  }
> = {
  th: {
    badge: "Financial control center",
    title: "แดชบอร์ดที่สรุปภาพรวมและเปิดทางให้บันทึกรายการได้ทันที",
    description:
      "หน้าหลักถูกจัดใหม่ให้เห็นทั้งสถานะการเงิน ฟอร์มบันทึกรายละเอียด และผลลัพธ์จากธุรกรรมล่าสุดในหน้าเดียว",
    totalEntries: "รายการทั้งหมด",
    trackedCategories: "หมวดที่ถูกติดตาม",
    avgExpense: "รายจ่ายเฉลี่ยต่อรายการ",
    guidanceTitle: "โครงหน้าจอแบบใหม่เน้นการใช้งานจริง",
    guidanceDescription:
      "ฟอร์มถูกย้ายมาไว้บนหน้า dashboard พร้อม preview และส่วนสรุปผล เพื่อให้ flow การบันทึกและตรวจสอบข้อมูลสั้นลง"
  },
  en: {
    badge: "Financial control center",
    title: "A dashboard that summarizes the full picture and lets you log entries immediately",
    description:
      "The main view now brings financial status, a detailed transaction form, and the latest results into one continuous workflow.",
    totalEntries: "Total entries",
    trackedCategories: "Tracked categories",
    avgExpense: "Average expense entry",
    guidanceTitle: "A workflow-first dashboard layout",
    guidanceDescription:
      "The form now lives directly on the dashboard with a preview and result area, so saving and reviewing data takes fewer steps."
  },
  ja: {
    badge: "Financial control center",
    title: "全体像を把握しながら、すぐに記録できるダッシュボード",
    description:
      "財務状況、詳細入力フォーム、最新結果を1画面にまとめ、記録から確認までの流れを短くしました。",
    totalEntries: "取引件数",
    trackedCategories: "追跡カテゴリ数",
    avgExpense: "支出1件あたり平均",
    guidanceTitle: "操作フローを優先した再設計",
    guidanceDescription:
      "フォームをダッシュボード内に移し、プレビューと結果表示を同居させることで、入力後の確認が速くなりました。"
  }
};

export function DashboardOverview() {
  const language = usePreferencesStore((state) => state.language);
  const transactions = useFinanceStore((state) => state.transactions);
  const translation = getTranslation(language);
  const copy = heroCopy[language];
  const summary = getSummary(transactions);
  const expenseData = getExpenseChartData(transactions);
  const recentTransactions = getRecentTransactions(transactions);
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );
  const averageExpense =
    expenseTransactions.length > 0
      ? summary.totalExpense / expenseTransactions.length
      : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-[linear-gradient(135deg,#14213d_0%,#1e3261_48%,#2d4fb3_100%)] p-6 text-white shadow-card sm:p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/75">
              {copy.badge}
            </div>
            <h3 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
              {copy.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {copy.totalEntries}
                </p>
                <p className="mt-3 text-3xl font-semibold">{transactions.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {copy.trackedCategories}
                </p>
                <p className="mt-3 text-3xl font-semibold">{expenseData.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {copy.avgExpense}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {formatCurrency(averageExpense, language)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-black/15 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles className="h-5 w-5 text-blue-100" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {translation.dashboardPanel.badge}
                </p>
                <h4 className="mt-1 text-xl font-semibold">
                  {copy.guidanceTitle}
                </h4>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/74">
              {copy.guidanceDescription}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4">
                <ChartNoAxesCombined className="h-5 w-5 text-cyan-100" />
                <div>
                  <p className="font-medium">{translation.dashboardPanel.cleanTitle}</p>
                  <p className="text-sm text-white/65">
                    {translation.dashboardPanel.cleanDescription}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4">
                <Layers3 className="h-5 w-5 text-emerald-100" />
                <div>
                  <p className="font-medium">{translation.dashboardPanel.localTitle}</p>
                  <p className="text-sm text-white/65">
                    {translation.dashboardPanel.localDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/78">
              <ArrowRight className="h-4 w-4" />
              {translation.recent.description}
            </div>
          </div>
        </div>
      </section>

      <SummaryCard
        totalBalance={summary.totalBalance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />

      <TransactionForm />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <ExpenseChartCard data={expenseData} />

        <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,244,255,0.86))]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {translation.dashboardPanel.badge}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-ink">
                  {translation.dashboardPanel.title}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted">
              {translation.dashboardPanel.description}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.4rem] border border-stroke bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {translation.summary.totalBalance}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.totalBalance, language)}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stroke bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {translation.recent.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {recentTransactions.length}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {translation.recent.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
