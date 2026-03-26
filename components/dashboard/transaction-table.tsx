"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/hooks/use-i18n";
import { getCategoryLabel, getSummary, getTransactionTypeLabel } from "@/lib/finance";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Transaction, TransactionType } from "@/types/finance";

type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
type TypeFilter = "all" | TransactionType;

const tableCopy = {
  th: {
    badge: "สมุดรายการธุรกรรม",
    title: "ค้นหา กรอง และแก้ไขรายการจากตารางเดียว",
    description:
      "ทุกแถวสามารถเปิดเพื่อดูรายละเอียดและแก้ไขได้ พร้อมตัวกรองที่ช่วยไล่ดูธุรกรรมเร็วขึ้น",
    searchPlaceholder: "ค้นหาจากชื่อรายการ หมวด แท็ก หรือคู่รายการ",
    typeLabel: "ประเภทรายการ",
    categoryLabel: "หมวดหมู่",
    sortLabel: "เรียงลำดับ",
    allTypes: "ทั้งหมด",
    allCategories: "ทุกหมวด",
    sortNewest: "วันที่ล่าสุด",
    sortOldest: "วันที่เก่าสุด",
    sortHighest: "ยอดมากไปน้อย",
    sortLowest: "ยอดน้อยไปมาก",
    amount: "จำนวนเงิน",
    balance: "คงเหลือ",
    date: "วันที่",
    descriptionColumn: "รายละเอียด",
    records: "รายการที่แสดง",
    filters: "ตัวกรอง",
    emptyTitle: "ยังไม่มีรายการธุรกรรม",
    emptyDescription:
      "เพิ่มรายการเองหรือโหลดข้อมูลตัวอย่างเพื่อเริ่มใช้งานตารางและกราฟ",
    noResultsTitle: "ไม่พบรายการที่ตรงกับตัวกรอง",
    noResultsDescription:
      "ลองล้างคำค้นหรือเปลี่ยนตัวกรองเพื่อดูข้อมูลเพิ่มเติม",
    uploadCta: "นำเข้าจากไฟล์"
  },
  en: {
    badge: "Transaction ledger",
    title: "Search, filter, and edit everything from one table",
    description:
      "Every row opens into the editor, and the filters make it easier to inspect money movement quickly.",
    searchPlaceholder: "Search title, category, tags, or counterparty",
    typeLabel: "Type",
    categoryLabel: "Category",
    sortLabel: "Sort",
    allTypes: "All types",
    allCategories: "All categories",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortHighest: "Highest amount",
    sortLowest: "Lowest amount",
    amount: "Amount",
    balance: "Balance",
    date: "Date",
    descriptionColumn: "Description",
    records: "Visible records",
    filters: "Filters",
    emptyTitle: "No transactions yet",
    emptyDescription:
      "Add an entry manually or load sample data to start using the ledger and charts.",
    noResultsTitle: "No transactions match these filters",
    noResultsDescription:
      "Clear the query or adjust the filters to widen the result set.",
    uploadCta: "Import from file"
  },
  ja: {
    badge: "取引レジャー",
    title: "1つのテーブルで検索、絞り込み、編集",
    description:
      "各行からそのまま編集でき、フィルターで取引の流れをすばやく確認できます。",
    searchPlaceholder: "取引名、カテゴリ、タグ、相手先で検索",
    typeLabel: "種類",
    categoryLabel: "カテゴリ",
    sortLabel: "並び順",
    allTypes: "すべて",
    allCategories: "全カテゴリ",
    sortNewest: "新しい順",
    sortOldest: "古い順",
    sortHighest: "金額が大きい順",
    sortLowest: "金額が小さい順",
    amount: "金額",
    balance: "残高",
    date: "日付",
    descriptionColumn: "詳細",
    records: "表示件数",
    filters: "フィルター",
    emptyTitle: "取引がまだありません",
    emptyDescription:
      "手動で追加するかサンプルデータを読み込んで、レジャーとグラフを使い始めてください。",
    noResultsTitle: "条件に一致する取引がありません",
    noResultsDescription:
      "検索語を削除するかフィルターを調整して、表示範囲を広げてください。",
    uploadCta: "ファイルから取り込み"
  }
} as const;

function compareTransactions(left: Transaction, right: Transaction, sortBy: SortOption) {
  const leftDate = new Date(left.date).getTime();
  const rightDate = new Date(right.date).getTime();

  switch (sortBy) {
    case "date_asc":
      return leftDate - rightDate;
    case "amount_desc":
      return right.amount - left.amount;
    case "amount_asc":
      return left.amount - right.amount;
    case "date_desc":
    default:
      return rightDate - leftDate;
  }
}

function buildRunningBalanceMap(transactions: Transaction[]) {
  let runningBalance = 0;

  return [...transactions]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .reduce<Record<string, number>>((accumulator, transaction) => {
      runningBalance +=
        transaction.type === "income" ? transaction.amount : -transaction.amount;
      accumulator[transaction.id] = runningBalance;
      return accumulator;
    }, {});
}

export function TransactionTable() {
  const { language, translation } = useI18n();
  const transactions = useFinanceStore((state) => state.transactions);
  const loadStarterTransactions = useFinanceStore(
    (state) => state.loadStarterTransactions
  );
  const openAddTransaction = useFinanceStore((state) => state.openAddTransaction);
  const copy = tableCopy[language];
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const deferredQuery = useDeferredValue(query);

  const runningBalanceMap = useMemo(
    () => buildRunningBalanceMap(transactions),
    [transactions]
  );

  const categoryOptions = useMemo(() => {
    return [...new Set(transactions.map((transaction) => transaction.category))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        if (typeFilter !== "all" && transaction.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          transaction.title,
          getCategoryLabel(transaction.category, language),
          transaction.counterparty,
          transaction.note,
          transaction.location,
          transaction.reference,
          transaction.tags.join(" ")
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => compareTransactions(left, right, sortBy));
  }, [categoryFilter, deferredQuery, language, sortBy, transactions, typeFilter]);

  const visibleSummary = getSummary(filteredTransactions);
  const hasTransactions = transactions.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="badge-pill w-fit">{copy.badge}</div>
              <CardTitle className="mt-4">{copy.title}</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                {copy.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="stat-tile bg-panel/92">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {copy.records}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {filteredTransactions.length}
                </p>
              </div>
              <div className="stat-tile bg-panel/92">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {copy.balance}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(visibleSummary.totalBalance, language)}
                </p>
              </div>
            </div>
          </div>

          <div className="soft-panel p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal className="h-4 w-4" />
              {copy.filters}
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))]">
              <label className="block">
                <span className="field-label sr-only">{copy.searchPlaceholder}</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="field-input pl-10"
                    type="search"
                    placeholder={copy.searchPlaceholder}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </label>

              <label className="block">
                <span className="field-label">{copy.typeLabel}</span>
                <select
                  className="field-input"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as TypeFilter)
                  }
                >
                  <option value="all">{copy.allTypes}</option>
                  <option value="income">{translation.summary.income}</option>
                  <option value="expense">{translation.summary.expense}</option>
                </select>
              </label>

              <label className="block">
                <span className="field-label">{copy.categoryLabel}</span>
                <select
                  className="field-input"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="all">{copy.allCategories}</option>
                  {categoryOptions.map((categoryId) => (
                    <option key={categoryId} value={categoryId}>
                      {getCategoryLabel(categoryId, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field-label">{copy.sortLabel}</span>
                <select
                  className="field-input"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                >
                  <option value="date_desc">{copy.sortNewest}</option>
                  <option value="date_asc">{copy.sortOldest}</option>
                  <option value="amount_desc">{copy.sortHighest}</option>
                  <option value="amount_asc">{copy.sortLowest}</option>
                </select>
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!hasTransactions ? (
            <EmptyState
              icon={Search}
              title={copy.emptyTitle}
              description={copy.emptyDescription}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={openAddTransaction}>
                    {translation.shell.addTransaction}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => loadStarterTransactions(language)}
                  >
                    {translation.shell.loadSample}
                  </Button>
                  <Link href="/upload" className={buttonStyles("ghost")}>
                    {copy.uploadCta}
                  </Link>
                </div>
              }
              className="min-h-[320px]"
            />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Search}
              title={copy.noResultsTitle}
              description={copy.noResultsDescription}
              className="min-h-[280px]"
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[1.5rem] border border-stroke/70 lg:block">
                <table className="w-full border-collapse">
                  <thead className="bg-surface/86">
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted">
                      <th className="px-5 py-4 font-semibold">{copy.date}</th>
                      <th className="px-5 py-4 font-semibold">{copy.descriptionColumn}</th>
                      <th className="px-5 py-4 font-semibold">{copy.categoryLabel}</th>
                      <th className="px-5 py-4 font-semibold text-right">{copy.amount}</th>
                      <th className="px-5 py-4 font-semibold text-right">{copy.balance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const isIncome = transaction.type === "income";

                      return (
                        <tr
                          key={transaction.id}
                          tabIndex={0}
                          role="button"
                          onClick={() => setSelectedTransaction(transaction)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedTransaction(transaction);
                            }
                          }}
                          className="cursor-pointer border-t border-stroke/60 bg-panel/88 transition hover:bg-surface/86 focus:bg-surface/86 focus:outline-none"
                          aria-label={transaction.title}
                        >
                          <td className="px-5 py-4 text-sm text-muted">
                            {formatDate(transaction.date, language)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                                    isIncome
                                      ? "bg-incomeSoft text-income"
                                      : "bg-expenseSoft text-expense"
                                  )}
                                >
                                  {isIncome ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                  ) : (
                                    <ArrowDownLeft className="h-4 w-4" />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-ink">
                                    {transaction.title}
                                  </p>
                                  <p className="truncate text-sm text-muted">
                                    {transaction.counterparty ||
                                      transaction.note ||
                                      getTransactionTypeLabel(transaction.type, language)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted">
                            {getCategoryLabel(transaction.category, language)}
                          </td>
                          <td
                            className={cn(
                              "px-5 py-4 text-right text-sm font-semibold",
                              isIncome ? "text-income" : "text-expense"
                            )}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount, language)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-ink">
                            {formatCurrency(runningBalanceMap[transaction.id] ?? 0, language)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 lg:hidden">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="rounded-[1.5rem] border border-stroke/70 bg-surface/78 px-4 py-4 text-left transition hover:bg-panel"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{transaction.title}</p>
                          <p className="mt-1 text-sm text-muted">
                            {formatDate(transaction.date, language)} •{" "}
                            {getCategoryLabel(transaction.category, language)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                            isIncome
                              ? "bg-incomeSoft text-income"
                              : "bg-expenseSoft text-expense"
                          )}
                        >
                          {getTransactionTypeLabel(transaction.type, language)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {copy.amount}
                          </p>
                          <p
                            className={cn(
                              "mt-1 font-semibold",
                              isIncome ? "text-income" : "text-expense"
                            )}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount, language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {copy.balance}
                          </p>
                          <p className="mt-1 font-semibold text-ink">
                            {formatCurrency(runningBalanceMap[transaction.id] ?? 0, language)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={Boolean(selectedTransaction)}
        mode="edit"
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}
