"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Landmark,
  PlusCircle,
  ReceiptText,
  Sparkles,
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  accountOptions,
  getAccountLabel,
  getCategoriesForType,
  getCategoryLabel,
  getPaymentMethodLabel,
  getSummary,
  getTransactionTypeLabel,
  paymentMethodOptions
} from "@/lib/finance";
import { getTranslation } from "@/lib/i18n";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Language } from "@/types/app";
import type { NewTransaction, TransactionType } from "@/types/finance";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

interface TransactionDraft {
  title: string;
  amount: string;
  type: TransactionType;
  category: NewTransaction["category"];
  date: string;
  account: NewTransaction["account"];
  paymentMethod: NewTransaction["paymentMethod"];
  counterparty: string;
  location: string;
  reference: string;
  note: string;
  tags: string;
}

interface TransactionFormProps {
  variant?: "panel" | "modal";
  onCancel?: () => void;
  isOpen?: boolean;
}

const composerCopy: Record<
  Language,
  {
    badge: string;
    title: string;
    description: string;
    previewBadge: string;
    previewTitle: string;
    previewDescription: string;
    projectedBalance: string;
    currentImpact: string;
    latestSaved: string;
    latestSavedEmpty: string;
    draftSummary: string;
    detailCaption: string;
    incomeFlow: string;
    expenseFlow: string;
  }
> = {
  th: {
    badge: "ศูนย์บันทึกรายรับรายจ่าย",
    title: "กรอกรายการแบบละเอียดและดูผลลัพธ์ทันที",
    description:
      "กรอกข้อมูลธุรกรรมให้ครบทั้งหมวด บัญชี วิธีชำระเงิน คู่รายการ และแท็ก เพื่อให้แดชบอร์ดสรุปผลได้แม่นยำขึ้น",
    previewBadge: "ผลลัพธ์แบบทันที",
    previewTitle: "ตัวอย่างก่อนบันทึก",
    previewDescription:
      "ยอดคงเหลือและการ์ดสรุปด้านขวาจะอัปเดตตามข้อมูลที่กำลังกรอก เพื่อให้เห็นผลลัพธ์ก่อนกดบันทึกจริง",
    projectedBalance: "ยอดคงเหลือหลังบันทึก",
    currentImpact: "มูลค่ารายการนี้",
    latestSaved: "รายการล่าสุดที่บันทึก",
    latestSavedEmpty: "เมื่อบันทึกรายการแรกแล้ว การ์ดผลลัพธ์ล่าสุดจะแสดงตรงนี้",
    draftSummary: "สรุปรายการที่กำลังเตรียมบันทึก",
    detailCaption: "รายละเอียดพร้อมใช้งานสำหรับหน้าแสดงผลและประวัติรายการ",
    incomeFlow: "เงินจะถูกเพิ่มเข้ายอดคงเหลือ",
    expenseFlow: "เงินจะถูกหักออกจากยอดคงเหลือ"
  },
  en: {
    badge: "Transaction studio",
    title: "Capture a detailed entry and preview the result instantly",
    description:
      "Fill in category, account, payment method, counterparty, and tags so the dashboard can summarize each movement with better context.",
    previewBadge: "Instant result",
    previewTitle: "Live preview before save",
    previewDescription:
      "The balance projection and summary card update as you type, so you can review the outcome before committing the entry.",
    projectedBalance: "Projected balance",
    currentImpact: "This entry amount",
    latestSaved: "Latest saved entry",
    latestSavedEmpty: "Once you save your first item, the latest result card will appear here.",
    draftSummary: "Draft summary",
    detailCaption: "Prepared details for the result view and transaction history",
    incomeFlow: "This will increase your balance",
    expenseFlow: "This will reduce your balance"
  },
  ja: {
    badge: "取引スタジオ",
    title: "詳細な取引を入力し、結果をすぐ確認",
    description:
      "カテゴリ、口座、支払方法、相手先、タグまで入力しておくと、ダッシュボードの集計と履歴がより正確になります。",
    previewBadge: "即時結果",
    previewTitle: "保存前のライブプレビュー",
    previewDescription:
      "入力内容に合わせて残高予測と結果カードが更新されるため、保存前に影響を確認できます。",
    projectedBalance: "保存後の予測残高",
    currentImpact: "今回の金額",
    latestSaved: "直近で保存した取引",
    latestSavedEmpty: "最初の取引を保存すると、最新結果カードがここに表示されます。",
    draftSummary: "下書きサマリー",
    detailCaption: "結果ビューと取引履歴にそのまま使える詳細情報",
    incomeFlow: "残高に加算されます",
    expenseFlow: "残高から差し引かれます"
  }
};

function createInitialDraft(type: TransactionType = "expense"): TransactionDraft {
  return {
    title: "",
    amount: "",
    type,
    category: getCategoriesForType(type)[0].id,
    date: getTodayString(),
    account: "bankAccount",
    paymentMethod: type === "income" ? "bankTransfer" : "promptPay",
    counterparty: "",
    location: "",
    reference: "",
    note: "",
    tags: ""
  };
}

export function TransactionForm({
  variant = "panel",
  onCancel,
  isOpen
}: TransactionFormProps) {
  const language = usePreferencesStore((state) => state.language);
  const transactions = useFinanceStore((state) => state.transactions);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const translation = getTranslation(language);
  const copy = composerCopy[language];
  const [draft, setDraft] = useState<TransactionDraft>(createInitialDraft());
  const [errorMessage, setErrorMessage] = useState("");

  const latestSaved = transactions[0] ?? null;
  const summary = getSummary(transactions);
  const parsedAmount = Number(draft.amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const projectedBalance =
    summary.totalBalance +
    (hasValidAmount ? (draft.type === "income" ? parsedAmount : -parsedAmount) : 0);

  const categoryOptions = useMemo(
    () => getCategoriesForType(draft.type),
    [draft.type]
  );

  useEffect(() => {
    if (variant === "modal" && isOpen) {
      setDraft(createInitialDraft());
      setErrorMessage("");
    }
  }, [isOpen, variant]);

  useEffect(() => {
    setDraft((current) => {
      const isValidCategory = categoryOptions.some(
        (option) => option.id === current.category
      );

      if (isValidCategory) {
        return current;
      }

      return {
        ...current,
        category: categoryOptions[0].id
      };
    });
  }, [categoryOptions]);

  function updateDraft<Key extends keyof TransactionDraft>(
    key: Key,
    value: TransactionDraft[Key]
  ) {
    if (errorMessage) {
      setErrorMessage("");
    }

    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = draft.title.trim();

    if (!title) {
      setErrorMessage(translation.modal.validation.titleRequired);
      return;
    }

    if (!hasValidAmount) {
      setErrorMessage(translation.modal.validation.amountRequired);
      return;
    }

    addTransaction({
      title,
      amount: parsedAmount,
      type: draft.type,
      category: draft.category,
      date: draft.date,
      account: draft.account,
      paymentMethod: draft.paymentMethod,
      counterparty: draft.counterparty.trim(),
      location: draft.location.trim(),
      reference: draft.reference.trim(),
      note: draft.note.trim(),
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    });

    setDraft(createInitialDraft(draft.type));
    setErrorMessage("");
  }

  const isIncome = draft.type === "income";

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {variant === "panel" ? (
        <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,244,255,0.86))] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                {copy.badge}
              </div>
              <h3 className="mt-4 max-w-2xl text-2xl font-semibold text-ink md:text-3xl">
                {copy.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                {copy.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/90 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {translation.summary.income}
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {formatCurrency(summary.totalIncome, language)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-red-100 bg-red-50/90 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {translation.summary.expense}
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {formatCurrency(summary.totalExpense, language)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="rounded-[2rem] border border-white/65 bg-white/92 p-5 shadow-card sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="rounded-[1.5rem] border border-stroke bg-[linear-gradient(180deg,rgba(248,251,255,0.92),rgba(255,255,255,0.98))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {translation.modal.primarySection}
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="field-label">
                    {translation.modal.transactionTitle}
                  </span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={translation.modal.placeholders.title}
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span className="field-label">{translation.modal.amount}</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                      ฿
                    </span>
                    <input
                      className="field-input pl-10"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={translation.modal.placeholders.amount}
                      value={draft.amount}
                      onChange={(event) => updateDraft("amount", event.target.value)}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span className="field-label">{translation.modal.date}</span>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      className="field-input pl-10"
                      type="date"
                      value={draft.date}
                      onChange={(event) => updateDraft("date", event.target.value)}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span className="field-label">{translation.modal.type}</span>
                  <select
                    className="field-input"
                    value={draft.type}
                    onChange={(event) =>
                      updateDraft("type", event.target.value as TransactionType)
                    }
                  >
                    <option value="expense">
                      {getTransactionTypeLabel("expense", language)}
                    </option>
                    <option value="income">
                      {getTransactionTypeLabel("income", language)}
                    </option>
                  </select>
                </label>

                <label>
                  <span className="field-label">{translation.modal.category}</span>
                  <select
                    className="field-input"
                    value={draft.category}
                    onChange={(event) =>
                      updateDraft(
                        "category",
                        event.target.value as NewTransaction["category"]
                      )
                    }
                  >
                    {categoryOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getCategoryLabel(item.id, language)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="field-label">{translation.modal.account}</span>
                  <select
                    className="field-input"
                    value={draft.account}
                    onChange={(event) =>
                      updateDraft("account", event.target.value as NewTransaction["account"])
                    }
                  >
                    {accountOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getAccountLabel(item.id, language)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="field-label">{translation.modal.paymentMethod}</span>
                  <select
                    className="field-input"
                    value={draft.paymentMethod}
                    onChange={(event) =>
                      updateDraft(
                        "paymentMethod",
                        event.target.value as NewTransaction["paymentMethod"]
                      )
                    }
                  >
                    {paymentMethodOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getPaymentMethodLabel(item.id, language)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stroke bg-[linear-gradient(180deg,rgba(245,248,255,0.88),rgba(255,255,255,0.98))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {translation.modal.detailsSection}
              </p>

              <div className="mt-5 grid gap-5">
                <label>
                  <span className="field-label">{translation.modal.counterparty}</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={translation.modal.placeholders.counterparty}
                    value={draft.counterparty}
                    onChange={(event) =>
                      updateDraft("counterparty", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span className="field-label">{translation.modal.location}</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={translation.modal.placeholders.location}
                    value={draft.location}
                    onChange={(event) => updateDraft("location", event.target.value)}
                  />
                </label>

                <label>
                  <span className="field-label">{translation.modal.reference}</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={translation.modal.placeholders.reference}
                    value={draft.reference}
                    onChange={(event) => updateDraft("reference", event.target.value)}
                  />
                </label>

                <label>
                  <span className="field-label">{translation.modal.tags}</span>
                  <input
                    className="field-input"
                    type="text"
                    placeholder={translation.modal.placeholders.tags}
                    value={draft.tags}
                    onChange={(event) => updateDraft("tags", event.target.value)}
                  />
                  <span className="mt-2 block text-xs text-muted">
                    {translation.modal.tagsHint}
                  </span>
                </label>

                <label className="block">
                  <span className="field-label">{translation.modal.note}</span>
                  <textarea
                    className="min-h-[158px] w-full rounded-[1.2rem] border border-stroke bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                    placeholder={translation.modal.placeholders.note}
                    value={draft.note}
                    onChange={(event) => updateDraft("note", event.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-ink/10 bg-[linear-gradient(180deg,rgba(20,33,61,0.98),rgba(29,47,84,0.96))] p-5 text-white shadow-card sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-blue-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                {copy.previewBadge}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{copy.previewTitle}</h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/72">
            {copy.previewDescription}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                {copy.projectedBalance}
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {formatCurrency(projectedBalance, language)}
              </p>
              <p className="mt-2 text-xs text-white/62">
                {isIncome ? copy.incomeFlow : copy.expenseFlow}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                {copy.currentImpact}
              </p>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  isIncome ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(hasValidAmount ? parsedAmount : 0, language)}
              </p>
              <p className="mt-2 text-xs text-white/62">
                {getTransactionTypeLabel(draft.type, language)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {copy.draftSummary}
                </p>
                <h4 className="mt-2 text-lg font-semibold">
                  {draft.title || translation.modal.placeholders.title}
                </h4>
              </div>
              <div
                className={`rounded-2xl p-3 ${
                  isIncome
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "bg-rose-400/15 text-rose-200"
                }`}
              >
                {isIncome ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5" />
                )}
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {formatCurrency(hasValidAmount ? parsedAmount : 0, language)}
            </p>

            <div className="mt-4 grid gap-3 text-sm text-white/80">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                <ReceiptText className="h-4 w-4 text-blue-200" />
                <span>{getCategoryLabel(draft.category, language)}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                <Landmark className="h-4 w-4 text-emerald-200" />
                <span>{getAccountLabel(draft.account, language)}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                <Tags className="h-4 w-4 text-amber-200" />
                <span>
                  {draft.tags
                    ? draft.tags
                    : getPaymentMethodLabel(draft.paymentMethod, language)}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-white/58">
              {copy.detailCaption}
            </p>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/12 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">
              {copy.latestSaved}
            </p>

            {latestSaved ? (
              <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-white/8 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{latestSaved.title}</p>
                    <p className="mt-1 text-sm text-white/65">
                      {getCategoryLabel(latestSaved.category, language)} •{" "}
                      {formatDate(latestSaved.date, language)}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      latestSaved.type === "income"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {latestSaved.type === "income" ? "+" : "-"}
                    {formatCurrency(latestSaved.amount, language)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/78">
                    {getAccountLabel(latestSaved.account, language)}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/78">
                    {getPaymentMethodLabel(latestSaved.paymentMethod, language)}
                  </span>
                  {latestSaved.tags.slice(0, 2).map((tag) => (
                    <span
                      key={`${latestSaved.id}-${tag}`}
                      className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-medium text-blue-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[1.4rem] border border-dashed border-white/12 bg-white/5 px-4 py-5 text-sm leading-6 text-white/62">
                {copy.latestSavedEmpty}
              </p>
            )}
          </div>
        </aside>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-expense">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 rounded-[1.6rem] border border-white/60 bg-white/85 p-4 shadow-card sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            {translation.modal.cancel}
          </Button>
        ) : null}
        <Button type="submit" className="sm:min-w-[210px]">
          <PlusCircle className="h-4 w-4" />
          {translation.modal.save}
        </Button>
      </div>
    </form>
  );
}
