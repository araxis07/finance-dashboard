"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import type { Transaction } from "@/types/finance";
import { TransactionForm } from "./transaction-form";

interface TransactionModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  transaction?: Transaction | null;
  onClose: () => void;
}

const modalCopy = {
  th: {
    editBadge: "แก้ไขรายการ",
    editTitle: "ตรวจสอบและแก้ไขธุรกรรม",
    editDescription:
      "เปิดรายการจากตารางเพื่อปรับรายละเอียด หมวดหมู่ หรือยอดเงินได้ทันที",
    closeLabel: "ปิดหน้าต่าง"
  },
  en: {
    editBadge: "Edit transaction",
    editTitle: "Review and update the selected transaction",
    editDescription:
      "Open any row from the table to refine details, categories, or amounts in place.",
    closeLabel: "Close modal"
  },
  ja: {
    editBadge: "取引を編集",
    editTitle: "選択した取引を確認して更新",
    editDescription:
      "テーブルの行から直接開き、詳細、カテゴリ、金額をその場で修正できます。",
    closeLabel: "モーダルを閉じる"
  }
} as const;

export function TransactionModal({
  isOpen,
  mode,
  onClose,
  transaction
}: TransactionModalProps) {
  const { language, translation } = useI18n();
  const copy = modalCopy[language];
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    const nextFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(nextFrame);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const badge = mode === "edit" ? copy.editBadge : translation.modal.badge;
  const title = mode === "edit" ? copy.editTitle : translation.modal.title;
  const description =
    mode === "edit" ? copy.editDescription : translation.modal.description;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/56 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto flex min-h-full w-full max-w-[1160px] items-center justify-center">
          <div
            aria-modal="true"
            role="dialog"
            ref={dialogRef}
            className="panel w-full overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hero-panel p-5 sm:p-6">
              <div className="hero-glow -right-10 top-0 h-32 w-32" />
              <div className="hero-glow -left-8 bottom-0 h-28 w-28" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                    {badge}
                  </p>
                  <h3 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
                    {description}
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white transition hover:bg-white/15"
                  onClick={onClose}
                  aria-label={copy.closeLabel}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <TransactionForm
                mode={mode}
                transaction={transaction}
                onCancel={onClose}
                onSubmitSuccess={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
