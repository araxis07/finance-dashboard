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
import { useI18n } from "@/hooks/use-i18n";
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Transaction, TransactionType } from "@/types/finance";

interface TransactionDraft {
  title: string;
  amount: string;
  type: TransactionType;
  category: Transaction["category"];
  date: string;
  account: Transaction["account"];
  paymentMethod: Transaction["paymentMethod"];
  counterparty: string;
  location: string;
  reference: string;
  note: string;
  tags: string;
}

interface TransactionFormProps {
  mode: "create" | "edit";
  transaction?: Transaction | null;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
}

const composerCopy = {
  th: {
    previewBadge: "ผลลัพธ์แบบทันที",
    previewTitle: "ตัวอย่างก่อนบันทึก",
    previewDescription:
      "ยอดคงเหลือและการ์ดสรุปด้านขวาจะอัปเดตตามข้อมูลที่กำลังกรอก เพื่อให้เห็นผลลัพธ์ก่อนกดบันทึกจริง",
    projectedBalance: "ยอดคงเหลือหลังบันทึก",
    currentImpact: "มูลค่ารายการนี้",
    latestSaved: "รายการล่าสุดที่บันทึก",
    latestSavedEmpty: "เมื่อบันทึกรายการแรกแล้ว การ์ดผลลัพธ์ล่าสุดจะแสดงตรงนี้",
    currentRecord: "รายการที่กำลังแก้ไข",
    currentRecordEmpty: "ยังไม่มีข้อมูลรายการให้แก้ไข",
    draftSummary: "สรุปรายการที่กำลังเตรียมบันทึก",
    detailCaption: "รายละเอียดพร้อมใช้งานสำหรับหน้าแสดงผลและประวัติรายการ",
    incomeFlow: "เงินจะถูกเพิ่มเข้ายอดคงเหลือ",
    expenseFlow: "เงินจะถูกหักออกจากยอดคงเหลือ",
    editSave: "บันทึกการแก้ไข"
  },
  en: {
    previewBadge: "Instant result",
    previewTitle: "Live preview before save",
    previewDescription:
      "The balance projection and summary card update as you type, so you can review the outcome before committing the entry.",
    projectedBalance: "Projected balance",
    currentImpact: "This entry amount",
    latestSaved: "Latest saved entry",
    latestSavedEmpty: "Once you save your first item, the latest result card will appear here.",
    currentRecord: "Current record",
    currentRecordEmpty: "No transaction is selected for editing.",
    draftSummary: "Draft summary",
    detailCaption: "Prepared details for the result view and transaction history",
    incomeFlow: "This will increase your balance",
    expenseFlow: "This will reduce your balance",
    editSave: "Save changes"
  },
  ja: {
    previewBadge: "即時結果",
    previewTitle: "保存前のライブプレビュー",
    previewDescription:
      "入力内容に合わせて残高予測と結果カードが更新されるため、保存前に影響を確認できます。",
    projectedBalance: "保存後の予測残高",
    currentImpact: "今回の金額",
    latestSaved: "直近で保存した取引",
    latestSavedEmpty: "最初の取引を保存すると、最新結果カードがここに表示されます。",
    currentRecord: "編集中の取引",
    currentRecordEmpty: "編集中の取引はありません。",
    draftSummary: "下書きサマリー",
    detailCaption: "結果ビューと取引履歴にそのまま使える詳細情報",
    incomeFlow: "残高に加算されます",
    expenseFlow: "残高から差し引かれます",
    editSave: "変更を保存"
  }
} as const;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

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

function createDraftFromTransaction(transaction: Transaction): TransactionDraft {
  return {
    title: transaction.title,
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
    account: transaction.account,
    paymentMethod: transaction.paymentMethod,
    counterparty: transaction.counterparty,
    location: transaction.location,
    reference: transaction.reference,
    note: transaction.note,
    tags: transaction.tags.join(", ")
  };
}

function toSignedAmount(type: TransactionType, amount: number) {
  return type === "income" ? amount : -amount;
}

export function TransactionForm({
  mode,
  transaction,
  onCancel,
  onSubmitSuccess
}: TransactionFormProps) {
  const { language, translation } = useI18n();
  const transactions = useFinanceStore((state) => state.transactions);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const copy = composerCopy[language];
  const [draft, setDraft] = useState<TransactionDraft>(createInitialDraft());
  const [errorMessage, setErrorMessage] = useState("");

  const latestSaved = transactions[0] ?? null;

  useEffect(() => {
    setDraft(
      mode === "edit" && transaction
        ? createDraftFromTransaction(transaction)
        : createInitialDraft()
    );
    setErrorMessage("");
  }, [mode, transaction]);

  const categoryOptions = useMemo(
    () => getCategoriesForType(draft.type),
    [draft.type]
  );

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

  const summary = getSummary(transactions);
  const parsedAmount = Number(draft.amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const existingSignedAmount =
    mode === "edit" && transaction
      ? toSignedAmount(transaction.type, transaction.amount)
      : 0;
  const nextSignedAmount = hasValidAmount ? toSignedAmount(draft.type, parsedAmount) : 0;
  const projectedBalance =
    summary.totalBalance - existingSignedAmount + nextSignedAmount;
  const isIncome = draft.type === "income";
  const previewRecord = mode === "edit" ? transaction ?? null : latestSaved;

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

    const payload = {
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
    };

    if (mode === "edit" && transaction) {
      updateTransaction(transaction.id, payload);
    } else {
      addTransaction(payload);

      if (!onSubmitSuccess) {
        setDraft(createInitialDraft(draft.type));
      }
    }

    setErrorMessage("");
    onSubmitSuccess?.();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_360px]">
        <section className="space-y-5">
          <div className="panel p-5 sm:p-6">
            <div className="badge-pill">{translation.modal.primarySection}</div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
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

              <div>
                <span className="field-label">{translation.modal.type}</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["expense", "income"] as TransactionType[]).map((type) => {
                    const active = draft.type === type;
                    const Icon = type === "income" ? ArrowUpRight : ArrowDownLeft;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateDraft("type", type)}
                        className={cn(
                          "flex h-12 items-center justify-center gap-2 rounded-[1rem] border text-sm font-semibold transition",
                          active
                            ? "border-accent/20 bg-accent text-accentForeground shadow-soft"
                            : "border-stroke/70 bg-surface text-ink hover:bg-panel"
                        )}
                        aria-pressed={active}
                      >
                        <Icon className="h-4 w-4" />
                        {getTransactionTypeLabel(type, language)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label>
                <span className="field-label">{translation.modal.category}</span>
                <select
                  className="field-input"
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft("category", event.target.value as Transaction["category"])
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
                    updateDraft("account", event.target.value as Transaction["account"])
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
                <span className="field-label">
                  {translation.modal.paymentMethod}
                </span>
                <select
                  className="field-input"
                  value={draft.paymentMethod}
                  onChange={(event) =>
                    updateDraft(
                      "paymentMethod",
                      event.target.value as Transaction["paymentMethod"]
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

          <div className="panel p-5 sm:p-6">
            <div className="badge-pill">{translation.modal.detailsSection}</div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label>
                <span className="field-label">{translation.modal.counterparty}</span>
                <input
                  className="field-input"
                  type="text"
                  placeholder={translation.modal.placeholders.counterparty}
                  value={draft.counterparty}
                  onChange={(event) => updateDraft("counterparty", event.target.value)}
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

              <label className="block lg:col-span-2">
                <span className="field-label">{translation.modal.note}</span>
                <textarea
                  className="field-textarea"
                  placeholder={translation.modal.placeholders.note}
                  value={draft.note}
                  onChange={(event) => updateDraft("note", event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="hero-panel p-5 sm:p-6">
          <div className="hero-glow -right-10 top-0 h-36 w-36" />
          <div className="hero-glow left-0 top-1/3 h-32 w-32" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-white/85">
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.projectedBalance}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {formatCurrency(projectedBalance, language)}
                </p>
                <p className="mt-2 text-xs text-white/62">
                  {isIncome ? copy.incomeFlow : copy.expenseFlow}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.currentImpact}
                </p>
                <p
                  className={cn(
                    "mt-3 text-2xl font-semibold",
                    isIncome ? "text-income" : "text-expense"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(hasValidAmount ? parsedAmount : 0, language)}
                </p>
                <p className="mt-2 text-xs text-white/62">
                  {getTransactionTypeLabel(draft.type, language)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                    {copy.draftSummary}
                  </p>
                  <h4 className="mt-2 break-words text-lg font-semibold">
                    {draft.title || translation.modal.placeholders.title}
                  </h4>
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-3",
                    isIncome
                      ? "bg-incomeSoft/20 text-income"
                      : "bg-expenseSoft/20 text-expense"
                  )}
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

              <div className="mt-4 grid gap-3 text-sm text-white/82">
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <ReceiptText className="h-4 w-4 text-white/78" />
                  <span>{getCategoryLabel(draft.category, language)}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <Landmark className="h-4 w-4 text-white/78" />
                  <span>{getAccountLabel(draft.account, language)}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <Tags className="h-4 w-4 text-white/78" />
                  <span className="break-words">
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

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                {mode === "edit" ? copy.currentRecord : copy.latestSaved}
              </p>

              {previewRecord ? (
                <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{previewRecord.title}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {getCategoryLabel(previewRecord.category, language)} •{" "}
                        {formatDate(previewRecord.date, language)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-lg font-semibold",
                        previewRecord.type === "income"
                          ? "text-income"
                          : "text-expense"
                      )}
                    >
                      {previewRecord.type === "income" ? "+" : "-"}
                      {formatCurrency(previewRecord.amount, language)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/78">
                      {getAccountLabel(previewRecord.account, language)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/78">
                      {getPaymentMethodLabel(previewRecord.paymentMethod, language)}
                    </span>
                    {previewRecord.tags.slice(0, 2).map((tag) => (
                      <span
                        key={`${previewRecord.id}-${tag}`}
                        className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/78"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[1.35rem] border border-dashed border-white/12 bg-black/10 px-4 py-5 text-sm leading-6 text-white/62">
                  {mode === "edit" ? copy.currentRecordEmpty : copy.latestSavedEmpty}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {errorMessage ? (
        <div className="rounded-[1.35rem] border border-expense/20 bg-expenseSoft/72 px-4 py-3 text-sm font-medium text-expense">
          {errorMessage}
        </div>
      ) : null}

      <div className="panel flex flex-col-reverse gap-3 p-4 sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            {translation.modal.cancel}
          </Button>
        ) : null}
        <Button type="submit" className="sm:min-w-[210px]">
          {mode === "edit" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {mode === "edit" ? copy.editSave : translation.modal.save}
        </Button>
      </div>
    </form>
  );
}
