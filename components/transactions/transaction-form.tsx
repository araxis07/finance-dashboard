"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Landmark,
  ReceiptText,
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

const formCopy = {
  th: {
    summaryBadge: "ตรวจสอบก่อนบันทึก",
    summaryTitle: "สรุปรายการที่กำลังบันทึก",
    summaryDescription:
      "ตรวจสอบผลกระทบต่อยอดคงเหลือและรายละเอียดสำคัญก่อนยืนยัน",
    projectedBalance: "ยอดคงเหลือหลังบันทึก",
    impactAmount: "จำนวนเงินของรายการ",
    existingRecord: "ข้อมูลปัจจุบัน",
    createAction: "บันทึกรายการ",
    editAction: "บันทึกการแก้ไข"
  },
  en: {
    summaryBadge: "Review before save",
    summaryTitle: "Transaction summary",
    summaryDescription:
      "Check the balance impact and key details before confirming the change.",
    projectedBalance: "Balance after save",
    impactAmount: "Entry amount",
    existingRecord: "Current record",
    createAction: "Save transaction",
    editAction: "Save changes"
  },
  ja: {
    summaryBadge: "保存前に確認",
    summaryTitle: "取引サマリー",
    summaryDescription:
      "残高への影響と重要な詳細を確認してから保存できます。",
    projectedBalance: "保存後の残高",
    impactAmount: "今回の金額",
    existingRecord: "現在の内容",
    createAction: "取引を保存",
    editAction: "変更を保存"
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
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const transactions = useFinanceStore((state) => state.transactions);
  const copy = formCopy[language];
  const [draft, setDraft] = useState<TransactionDraft>(createInitialDraft());
  const [errorMessage, setErrorMessage] = useState("");

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
    setDraft((current) =>
      categoryOptions.some((option) => option.id === current.category)
        ? current
        : {
            ...current,
            category: categoryOptions[0].id
          }
    );
  }, [categoryOptions]);

  const parsedAmount = Number(draft.amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const summary = getSummary(transactions);
  const existingSignedAmount =
    mode === "edit" && transaction
      ? toSignedAmount(transaction.type, transaction.amount)
      : 0;
  const nextSignedAmount = hasValidAmount ? toSignedAmount(draft.type, parsedAmount) : 0;
  const projectedBalance =
    summary.totalBalance - existingSignedAmount + nextSignedAmount;
  const isIncome = draft.type === "income";

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
    }

    onSubmitSuccess?.();
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
      <section className="space-y-5">
        <div className="panel p-5 sm:p-6">
          <div className="badge-pill">{translation.modal.primarySection}</div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="field-label">{translation.modal.transactionTitle}</span>
              <input
                className="field-input"
                type="text"
                placeholder={translation.modal.placeholders.title}
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
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
                  min="0"
                  step="0.01"
                  placeholder={translation.modal.placeholders.amount}
                  value={draft.amount}
                  onChange={(event) => updateDraft("amount", event.target.value)}
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
              <span className="field-label">{translation.modal.paymentMethod}</span>
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

          <div className="mt-6 grid gap-5 md:grid-cols-2">
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

            <label className="block md:col-span-2">
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

        {errorMessage ? (
          <div className="rounded-[1.35rem] border border-expense/20 bg-expenseSoft/72 px-4 py-3 text-sm font-medium text-expense">
            {errorMessage}
          </div>
        ) : null}

        <div className="panel flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button variant="ghost" onClick={onCancel}>
              {translation.modal.cancel}
            </Button>
          ) : null}
          <Button type="submit" className="sm:min-w-[200px]">
            {mode === "edit" ? copy.editAction : copy.createAction}
          </Button>
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <div className="hero-panel p-5 sm:p-6">
          <div className="hero-glow -right-8 top-0 h-28 w-28" />
          <div className="hero-glow left-0 bottom-0 h-24 w-24" />

          <div className="relative">
            <div className="badge-pill w-fit border-white/12 bg-white/10 text-white/80">
              {copy.summaryBadge}
            </div>
            <h3 className="mt-4 text-xl font-semibold">{copy.summaryTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-white/72">
              {copy.summaryDescription}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.projectedBalance}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(projectedBalance, language)}
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  {copy.impactAmount}
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-semibold",
                    isIncome ? "text-income" : "text-expense"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(hasValidAmount ? parsedAmount : 0, language)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.45rem] border border-white/10 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                {copy.existingRecord}
              </p>
              <h4 className="mt-3 break-words text-lg font-semibold">
                {draft.title || translation.modal.placeholders.title}
              </h4>
              <p className="mt-2 text-sm text-white/70">
                {getCategoryLabel(draft.category, language)} •{" "}
                {formatDate(draft.date, language)}
              </p>

              <div className="mt-4 grid gap-2 text-sm text-white/80">
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <ReceiptText className="h-4 w-4 text-white/72" />
                  <span>{getPaymentMethodLabel(draft.paymentMethod, language)}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <Landmark className="h-4 w-4 text-white/72" />
                  <span>{getAccountLabel(draft.account, language)}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/8 px-4 py-3">
                  <Tags className="h-4 w-4 text-white/72" />
                  <span className="break-words">
                    {draft.tags || translation.modal.tagsHint}
                  </span>
                </div>
              </div>

              {mode === "edit" && transaction ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/8 px-4 py-4 text-sm text-white/78">
                  {transaction.counterparty || transaction.note || " "}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
