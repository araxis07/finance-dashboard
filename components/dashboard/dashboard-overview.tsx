"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Layers3,
  UploadCloud
} from "lucide-react";
import { ExpenseChartCard } from "@/components/dashboard/expense-chart-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { getExpenseChartData, getSummary } from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";

const heroCopy = {
  th: {
    badge: "Finance operations",
    title: "แดชบอร์ดการเงินที่พร้อมทั้งวิเคราะห์ ติดตาม และแก้ไขรายการ",
    description:
      "โครงสร้างใหม่เน้นให้เห็นสถานะเงินสด ตารางธุรกรรม และกระบวนการนำเข้าข้อมูลในลำดับที่ใช้งานจริง",
    totalEntries: "ธุรกรรมทั้งหมด",
    trackedCategories: "หมวดที่ใช้งาน",
    latestImport: "นำเข้าล่าสุด",
    latestImportEmpty: "ยังไม่มีการนำเข้าจากไฟล์",
    importLink: "ไปยังหน้าจอนำเข้า",
    insightTitle: "พื้นที่ทำงานที่อ่านง่ายขึ้น",
    insightDescription:
      "แดชบอร์ดหลักถูกย่อให้เหลือสัญญาณสำคัญก่อน ส่วนการค้นหาและแก้ไขอยู่ที่ตารางด้านล่าง"
  },
  en: {
    badge: "Finance operations",
    title: "A finance dashboard built to analyze, review, and correct transactions",
    description:
      "The new layout prioritizes cash position, ledger access, and import workflow in the order people actually use them.",
    totalEntries: "Total transactions",
    trackedCategories: "Active categories",
    latestImport: "Latest import",
    latestImportEmpty: "No file imports yet",
    importLink: "Open import workspace",
    insightTitle: "A clearer operating surface",
    insightDescription:
      "The main view now keeps only the critical signals up top, while search and editing live in the ledger below."
  },
  ja: {
    badge: "Finance operations",
    title: "分析、確認、修正までつながるファイナンスダッシュボード",
    description:
      "新しいレイアウトでは、資金状況、レジャー操作、取り込みフローを実際の作業順で整理しました。",
    totalEntries: "取引総数",
    trackedCategories: "使用中カテゴリ",
    latestImport: "最新の取り込み",
    latestImportEmpty: "まだファイル取り込みはありません",
    importLink: "取り込み画面を開く",
    insightTitle: "見やすさを優先した作業画面",
    insightDescription:
      "上部には重要な指標だけを残し、検索や編集は下のレジャーに集約しました。"
  }
} as const;

export function DashboardOverview() {
  const { language, translation } = useI18n();
  const transactions = useFinanceStore((state) => state.transactions);
  const imports = useFinanceStore((state) => state.imports);
  const copy = heroCopy[language];
  const summary = getSummary(transactions);
  const expenseData = getExpenseChartData(transactions);
  const latestImport = imports[0] ?? null;

  return (
    <div className="space-y-5">
      <section className="hero-panel p-6 sm:p-7">
        <div className="hero-glow -left-14 top-10 h-44 w-44" />
        <div className="hero-glow right-2 top-0 h-52 w-52" />
        <div className="hero-glow bottom-0 left-1/3 h-40 w-40" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/76">
              {copy.badge}
            </div>
            <h3 className="mt-5 max-w-4xl break-words text-3xl font-semibold leading-tight md:text-4xl">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74">
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
                  {copy.latestImport}
                </p>
                <p className="mt-3 break-words text-base font-semibold">
                  {latestImport ? latestImport.fileName : copy.latestImportEmpty}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <ChartNoAxesCombined className="h-5 w-5 text-white/85" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {translation.dashboardPanel.badge}
                </p>
                <h4 className="mt-1 text-xl font-semibold">{copy.insightTitle}</h4>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/72">
              {copy.insightDescription}
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-5 w-5 text-white/80" />
                  <div>
                    <p className="font-medium">{translation.summary.totalBalance}</p>
                    <p className="text-sm text-white/64">
                      {formatCurrency(summary.totalBalance, language)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                <div className="flex items-center gap-3">
                  <UploadCloud className="h-5 w-5 text-white/80" />
                  <div className="min-w-0">
                    <p className="font-medium">{copy.latestImport}</p>
                    <p className="truncate text-sm text-white/64">
                      {latestImport
                        ? `${latestImport.fileName} • ${formatDate(
                            latestImport.importedAt,
                            language
                          )}`
                        : copy.latestImportEmpty}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/upload"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/82 transition hover:text-white"
            >
              <ArrowUpRight className="h-4 w-4" />
              {copy.importLink}
            </Link>
          </div>
        </div>
      </section>

      <SummaryCard
        totalBalance={summary.totalBalance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
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
                  {copy.latestImport}
                </p>
                <p className="mt-2 break-words text-lg font-semibold text-ink">
                  {latestImport ? latestImport.fileName : copy.latestImportEmpty}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {latestImport
                    ? `${latestImport.transactionCount} • ${formatDate(
                        latestImport.importedAt,
                        language
                      )}`
                    : copy.importLink}
                </p>
              </div>

              <div className="stat-tile bg-panel/92">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {translation.summary.expense}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.totalExpense, language)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {copy.insightDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionTable />
    </div>
  );
}
