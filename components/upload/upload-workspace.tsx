"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  ImageIcon,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAccountLabel,
  getCategoryLabel,
  getPaymentMethodLabel,
  getTransactionTypeLabel
} from "@/lib/finance";
import { getTranslation } from "@/lib/i18n";
import { buildMockParsedResult } from "@/lib/mock-parser";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import type { Language } from "@/types/app";
import type { MockParsedResult } from "@/types/finance";

const acceptedTypes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg"
];

const uploadCopy: Record<
  Language,
  {
    badge: string;
    title: string;
    description: string;
    privacyTitle: string;
    privacyDescription: string;
    workflowTitle: string;
    workflowDescription: string;
    resultsTitle: string;
    resultsDescription: string;
  }
> = {
  th: {
    badge: "Mock import studio",
    title: "จัดหน้าอัปโหลดใหม่ให้เห็นขั้นตอนและผลลัพธ์ชัดขึ้น",
    description:
      "รองรับ statement, spreadsheet และ receipt image พร้อม mock parsing preview ที่จัดลำดับข้อมูลให้อ่านง่ายกว่าเดิม",
    privacyTitle: "ข้อมูลไม่ออกจากเครื่อง",
    privacyDescription:
      "ไฟล์ทั้งหมดใช้เพื่อจำลองการแสดงผลบนหน้าเว็บเท่านั้น ไม่มี backend หรือบริการภายนอกเชื่อมต่ออยู่",
    workflowTitle: "ลำดับการทำงานชัดเจนขึ้น",
    workflowDescription:
      "เริ่มจากลากไฟล์ เลือกตัวอย่าง หรือดูสรุป metadata ก่อน แล้วค่อยไล่อ่านรายการ parse ด้านล่าง",
    resultsTitle: "ผลลัพธ์การแปลงข้อมูล",
    resultsDescription:
      "ตัวอย่างด้านล่างช่วยให้เห็นว่าแต่ละบรรทัดธุรกรรมจะถูกจัดหมวดและแสดงผลอย่างไร"
  },
  en: {
    badge: "Mock import studio",
    title: "A redesigned upload flow with clearer steps and results",
    description:
      "Supports statements, spreadsheets, and receipt images with a cleaner mock parsing preview and stronger information hierarchy.",
    privacyTitle: "Nothing leaves the device",
    privacyDescription:
      "Every file is used only to simulate the interface. There is no backend or external parsing service connected here.",
    workflowTitle: "A clearer sequence",
    workflowDescription:
      "Drop a file, load a sample, review the metadata summary, and then inspect the parsed transaction cards below.",
    resultsTitle: "Parsed output preview",
    resultsDescription:
      "The result cards below show how each extracted transaction could be categorized and presented before import."
  },
  ja: {
    badge: "Mock import studio",
    title: "手順と結果が見やすいアップロード画面へ再設計",
    description:
      "明細書、スプレッドシート、レシート画像に対応し、モック解析プレビューをより読みやすい階層で表示します。",
    privacyTitle: "データは端末外へ送信されません",
    privacyDescription:
      "ファイルはUI表示のシミュレーションにのみ使用され、バックエンドや外部解析サービスには送信されません。",
    workflowTitle: "流れが明確な構成",
    workflowDescription:
      "ファイルをドロップするかサンプルを読み込み、メタデータを確認した後、下部の解析結果カードを確認できます。",
    resultsTitle: "解析結果プレビュー",
    resultsDescription:
      "下部のカードで、抽出された各取引がどのように分類・表示されるかを確認できます。"
  }
};

function isAcceptedFile(file: File) {
  return (
    acceptedTypes.includes(file.type) ||
    /\.(pdf|xls|xlsx|png|jpe?g)$/i.test(file.name)
  );
}

function getFileIcon(type: string) {
  if (type === "application/pdf") {
    return FileText;
  }

  if (type.includes("sheet") || type.includes("excel")) {
    return FileSpreadsheet;
  }

  return ImageIcon;
}

export function UploadWorkspace() {
  const language = usePreferencesStore((state) => state.language);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<MockParsedResult | null>(null);
  const translation = getTranslation(language);
  const copy = uploadCopy[language];

  const FileIcon = useMemo(
    () => getFileIcon(file?.type ?? "image/png"),
    [file?.type]
  );

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!file) {
      setParsedResult(null);
      return;
    }

    setParsedResult(buildMockParsedResult(file.name, language));
  }, [file, language]);

  function handleFileSelection(nextFile: File | null) {
    if (!nextFile || !isAcceptedFile(nextFile)) {
      return;
    }

    setFile(nextFile);
  }

  function loadSamplePreview() {
    const sampleFile = new File(["sample"], "sample-statement.pdf", {
      type: "application/pdf"
    });

    handleFileSelection(sampleFile);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="space-y-5">
      <section className="hero-panel p-6 sm:p-7">
        <div className="hero-glow -right-8 top-0 h-48 w-48" />
        <div className="hero-glow -left-10 bottom-0 h-44 w-44" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
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

            <div className="mt-7 flex flex-wrap gap-2">
              {["PDF", "Excel", "PNG/JPG"].map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-white/85">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{copy.privacyTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    {copy.privacyDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-white/85">
                  <WandSparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{copy.workflowTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    {copy.workflowDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)]">
        <Card>
          <CardContent className="p-6">
            <div className="badge-pill w-fit">{translation.upload.title}</div>

            <div
              className={`mt-5 rounded-[1.8rem] border-2 border-dashed px-6 py-10 text-center transition ${
                isDragging
                  ? "border-accent/30 bg-accentSoft"
                  : "border-stroke/70 bg-surface/72"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="mx-auto flex max-w-xl flex-col items-center">
                <div className="animate-float rounded-[1.7rem] bg-panel p-5 text-accent shadow-card">
                  <UploadCloud className="h-10 w-10" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-ink">
                  {translation.upload.dropTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {translation.upload.dropDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => inputRef.current?.click()}>
                    {translation.upload.chooseFile}
                  </Button>
                  <Button variant="secondary" onClick={loadSamplePreview}>
                    {translation.upload.sample}
                  </Button>
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(event) =>
                  handleFileSelection(event.target.files?.[0] ?? null)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-ink">
                <ScanSearch className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {translation.upload.previewTitle}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-ink">
                  {translation.upload.previewDescription}
                </h3>
              </div>
            </div>

            {!file || !parsedResult ? (
              <div className="mt-6">
                <EmptyState
                  icon={ScanSearch}
                  title={translation.upload.emptyTitle}
                  description={translation.upload.emptyDescription}
                  className="min-h-[340px]"
                />
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-[1.6rem] border border-stroke/70 bg-surface/72 p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-panel p-3 text-accent shadow-sm">
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {file.name}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {formatFileSize(file.size)} • {parsedResult.sourceLabel}
                          </p>
                        </div>
                        <span className="rounded-full bg-incomeSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-income">
                          {translation.upload.confidence} {parsedResult.confidence}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {parsedResult.note}
                      </p>
                    </div>
                  </div>

                  {previewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-stroke/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Uploaded preview"
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="stat-tile bg-panel/92">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {translation.upload.mockResult}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {parsedResult.transactions.length}
                    </p>
                  </div>
                  <div className="stat-tile bg-panel/92">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {translation.upload.detailLine}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {copy.workflowDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="badge-pill">{copy.resultsTitle}</div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {translation.upload.previewTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {copy.resultsDescription}
              </p>
            </div>
          </div>

          {!file || !parsedResult ? (
            <EmptyState
              icon={ScanSearch}
              title={translation.upload.emptyTitle}
              description={translation.upload.emptyDescription}
              className="mt-6 min-h-[280px]"
            />
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {parsedResult.transactions.map((transaction, index) => (
                <div
                  key={`${transaction.title}-${index}`}
                  className="rounded-[1.5rem] border border-stroke/70 bg-surface/72 px-5 py-5 transition hover:-translate-y-0.5 hover:bg-panel"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{transaction.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(transaction.date, language)} •{" "}
                        {getCategoryLabel(transaction.category, language)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                          {getAccountLabel(transaction.account, language)}
                        </span>
                        <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                          {getPaymentMethodLabel(transaction.paymentMethod, language)}
                        </span>
                        <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                          {transaction.counterparty}
                        </span>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "income"
                            ? "text-income"
                            : "text-expense"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, language)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                        {getTransactionTypeLabel(transaction.type, language)} •{" "}
                        {translation.upload.mockResult}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
