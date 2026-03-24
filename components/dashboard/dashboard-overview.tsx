"use client";

import { ArrowRight, ChartNoAxesCombined, Layers3, Sparkles } from "lucide-react";
import { ExpenseChartCard } from "@/components/dashboard/expense-chart-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import {
  getExpenseChartData,
  getRecentTransactions,
  getSummary
} from "@/lib/finance";
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
    guidanceTitle: "หน้าจอหลักที่เน้นความชัดเจนก่อนความหวือหวา",
    guidanceDescription:
      "ทุกบล็อกถูกย่อให้สั้นลง ใช้คอนทราสต์ที่พอดี และจัดลำดับข้อมูลให้สแกนตัวเลขสำคัญได้ทันที"
  },
  en: {
    badge: "Financial control center",
    title: "A dashboard that summarizes the full picture and lets you log entries immediately",
    description:
      "The main view now brings financial status, a detailed transaction form, and the latest results into one continuous workflow.",
    totalEntries: "Total entries",
    trackedCategories: "Tracked categories",
    avgExpense: "Average expense entry",
    guidanceTitle: "A clearer, calmer operating view",
    guidanceDescription:
      "Each block is shorter, contrast is more controlled, and the hierarchy makes key numbers easier to scan at a glance."
  },
  ja: {
    badge: "Financial control center",
    title: "全体像を把握しながら、すぐに記録できるダッシュボード",
    description:
      "財務状況、詳細入力フォーム、最新結果を1画面にまとめ、記録から確認までの流れを短くしました。",
    totalEntries: "取引件数",
    trackedCategories: "追跡カテゴリ数",
    avgExpense: "支出1件あたり平均",
    guidanceTitle: "派手さより見やすさを優先した主画面",
    guidanceDescription:
      "各ブロックを簡潔に整理し、コントラストを抑えつつ、重要な数値をすばやく確認できる構成にしました。"
  }
};

export function DashboardOverview() {
  const { language, translation } = useI18n();
  const transactions = useFinanceStore((state) => state.transactions);
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
    <div className="space-y-5">
      <section className="hero-panel p-6 sm:p-7">
        <div className="hero-glow -left-14 top-10 h-44 w-44" />
        <div className="hero-glow right-2 top-0 h-52 w-52" />
        <div className="hero-glow bottom-0 left-1/3 h-40 w-40" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_360px]">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/76">
              {copy.badge}
            </div>
            <h3 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
              {copy.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.totalEntries}
                </p>
                <p className="mt-3 text-3xl font-semibold">{transactions.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.trackedCategories}
                </p>
                <p className="mt-3 text-3xl font-semibold">{expenseData.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.avgExpense}
                </p>
                <p className="mt-3 break-words text-2xl font-semibold">
                  {formatCurrency(averageExpense, language)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles className="h-5 w-5 text-white/85" />
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

            <p className="mt-4 text-sm leading-7 text-white/72">
              {copy.guidanceDescription}
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                <div className="flex items-center gap-3">
                  <ChartNoAxesCombined className="h-5 w-5 text-white/80" />
                  <div>
                    <p className="font-medium">{translation.dashboardPanel.cleanTitle}</p>
                    <p className="text-sm text-white/64">
                      {translation.dashboardPanel.cleanDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-5 w-5 text-white/80" />
                  <div>
                    <p className="font-medium">{translation.dashboardPanel.localTitle}</p>
                    <p className="text-sm text-white/64">
                      {translation.dashboardPanel.localDescription}
                    </p>
                  </div>
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

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <ExpenseChartCard data={expenseData} />

        <Card className="overflow-hidden">
          <CardContent className="flex h-full flex-col p-6">
            <div className="badge-pill w-fit">{translation.dashboardPanel.badge}</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              {translation.dashboardPanel.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {translation.dashboardPanel.description}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="stat-tile bg-panel/92">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {translation.summary.totalBalance}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.totalBalance, language)}
                </p>
              </div>

              <div className="stat-tile bg-panel/92">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {translation.recent.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {recentTransactions.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {translation.recent.description}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 text-sm leading-7 text-muted">
              {copy.guidanceDescription}
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
