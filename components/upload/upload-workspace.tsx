"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
  WandSparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/hooks/use-i18n";
import {
  getAccountLabel,
  getCategoryLabel,
  getPaymentMethodLabel,
  getTransactionTypeLabel
} from "@/lib/finance";
import {
  MAX_UPLOAD_SIZE,
  mockUploadFile,
  validateUploadFile
} from "@/lib/upload";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import type { Language } from "@/types/app";
import type { MockParsedResult } from "@/types/finance";

type UploadStatus = "idle" | "processing" | "success" | "error";

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
    requirements: string;
    selectedFile: string;
    clearFile: string;
    processingTitle: string;
    processingDescription: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    invalidType: string;
    invalidSize: string;
    genericError: string;
    previewAlt: string;
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
      "ตัวอย่างด้านล่างช่วยให้เห็นว่าแต่ละบรรทัดธุรกรรมจะถูกจัดหมวดและแสดงผลอย่างไร",
    requirements: "รองรับ PDF, Excel, PNG และ JPG ขนาดไม่เกิน 8 MB",
    selectedFile: "ไฟล์ที่เลือก",
    clearFile: "ล้างไฟล์",
    processingTitle: "กำลังประมวลผลตัวอย่าง",
    processingDescription:
      "กำลังสร้าง mock parsing preview ในเครื่องเพื่อให้เห็นผลลัพธ์ก่อนนำเข้า",
    successTitle: "พร้อมแสดงตัวอย่างแล้ว",
    successDescription:
      "ไฟล์ถูกตรวจสอบและแปลงเป็นข้อมูลจำลองเรียบร้อย โดยไม่มีการส่งออกนอกเครื่อง",
    errorTitle: "อัปโหลดไม่สำเร็จ",
    invalidType: "กรุณาอัปโหลดไฟล์ PDF, Excel, PNG หรือ JPG เท่านั้น",
    invalidSize: "ขนาดไฟล์ต้องไม่เกิน 8 MB",
    genericError: "ไม่สามารถสร้างตัวอย่างจากไฟล์นี้ได้ กรุณาลองใหม่อีกครั้ง",
    previewAlt: "ตัวอย่างภาพที่อัปโหลด"
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
      "The result cards below show how each extracted transaction could be categorized and presented before import.",
    requirements: "Supports PDF, Excel, PNG, and JPG files up to 8 MB",
    selectedFile: "Selected file",
    clearFile: "Clear file",
    processingTitle: "Preparing preview",
    processingDescription:
      "Generating a mock parsing result locally so you can inspect the import before it is committed.",
    successTitle: "Preview ready",
    successDescription:
      "The file was validated and converted into a local mock result without leaving this device.",
    errorTitle: "Upload failed",
    invalidType: "Upload a PDF, Excel, PNG, or JPG file.",
    invalidSize: "The file must be 8 MB or smaller.",
    genericError: "We could not build a preview for this file. Please try again.",
    previewAlt: "Uploaded file preview"
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
      "下部のカードで、抽出された各取引がどのように分類・表示されるかを確認できます。",
    requirements: "PDF、Excel、PNG、JPG に対応し、最大サイズは 8 MB です",
    selectedFile: "選択中のファイル",
    clearFile: "ファイルをクリア",
    processingTitle: "プレビューを生成中",
    processingDescription:
      "取り込み前の見え方を確認できるよう、端末内でモック解析結果を作成しています。",
    successTitle: "プレビューの準備ができました",
    successDescription:
      "ファイルは端末内で検証され、外部送信なしでモック結果へ変換されました。",
    errorTitle: "アップロードに失敗しました",
    invalidType: "PDF、Excel、PNG、JPG ファイルを選択してください。",
    invalidSize: "ファイルサイズは 8 MB 以下にしてください。",
    genericError: "このファイルのプレビューを生成できませんでした。もう一度お試しください。",
    previewAlt: "アップロードした画像のプレビュー"
  }
};

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
  const { language, translation } = useI18n();
  const copy = uploadCopy[language];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedResult, setParsedResult] = useState<MockParsedResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

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

    let cancelled = false;

    setParsedResult(null);
    setUploadStatus("processing");
    setUploadError("");

    void mockUploadFile(file, language)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setParsedResult(result);
        setUploadStatus("success");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setParsedResult(null);
        setUploadStatus("error");
        setUploadError(copy.genericError);
      });

    return () => {
      cancelled = true;
    };
  }, [copy.genericError, file, language]);

  function resetUpload() {
    setFile(null);
    setParsedResult(null);
    setPreviewUrl(null);
    setUploadError("");
    setUploadStatus("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileSelection(nextFile: File | null) {
    if (!nextFile) {
      return;
    }

    const validationIssue = validateUploadFile(nextFile);

    if (validationIssue) {
      setFile(null);
      setParsedResult(null);
      setPreviewUrl(null);
      setUploadStatus("error");
      setUploadError(
        validationIssue === "file_size" ? copy.invalidSize : copy.invalidType
      );
      return;
    }

    setUploadError("");
    setFile(nextFile);
  }

  function loadSamplePreview() {
    const sampleFile = new File(
      [new Uint8Array(2048)],
      "sample-statement.pdf",
      {
        type: "application/pdf"
      }
    );

    handleFileSelection(sampleFile);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
  }

  const statusMeta =
    uploadStatus === "processing"
      ? {
          description: copy.processingDescription,
          icon: LoaderCircle,
          iconClassName: "animate-spin",
          title: copy.processingTitle,
          toneClassName: "bg-accentSoft text-ink"
        }
      : uploadStatus === "success"
        ? {
            description: copy.successDescription,
            icon: CheckCircle2,
            iconClassName: "",
            title: copy.successTitle,
            toneClassName: "bg-incomeSoft text-income"
          }
        : uploadStatus === "error"
          ? {
              description: uploadError || copy.genericError,
              icon: AlertTriangle,
              iconClassName: "",
              title: copy.errorTitle,
              toneClassName: "bg-expenseSoft text-expense"
            }
          : null;

  return (
    <div className="space-y-5">
      <section className="hero-panel p-6 sm:p-7">
        <div className="hero-glow -right-8 top-0 h-48 w-48" />
        <div className="hero-glow -left-10 bottom-0 h-44 w-44" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/76">
              {copy.badge}
            </div>
            <h3 className="mt-5 max-w-3xl break-words text-3xl font-semibold leading-tight md:text-4xl">
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
                <div className="min-w-0">
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
                <div className="min-w-0">
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
                <h3 className="mt-6 break-words text-2xl font-semibold text-ink">
                  {translation.upload.dropTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {translation.upload.dropDescription}
                </p>

                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button onClick={() => inputRef.current?.click()}>
                    {translation.upload.chooseFile}
                  </Button>
                  <Button variant="secondary" onClick={loadSamplePreview}>
                    {translation.upload.sample}
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted">{copy.requirements}</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(event) => {
                  handleFileSelection(event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </div>

            {file ? (
              <div className="mt-4 rounded-[1.4rem] border border-stroke/70 bg-surface/72 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {copy.selectedFile}
                    </p>
                    <p className="mt-2 break-all font-semibold text-ink">
                      {file.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {formatFileSize(file.size)} / {formatFileSize(MAX_UPLOAD_SIZE)}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={resetUpload} className="sm:w-auto">
                    <X className="h-4 w-4" />
                    {copy.clearFile}
                  </Button>
                </div>
              </div>
            ) : null}

            {statusMeta ? (
              <div
                className="mt-4 rounded-[1.4rem] border border-stroke/70 bg-panel/92 p-4"
                aria-live="polite"
                role="status"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-2xl p-3 ${statusMeta.toneClassName}`}>
                    <statusMeta.icon
                      className={`h-5 w-5 ${statusMeta.iconClassName}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{statusMeta.title}</p>
                    <p className="mt-1 break-words text-sm leading-6 text-muted">
                      {statusMeta.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-ink">
                <ScanSearch className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {translation.upload.previewTitle}
                </p>
                <h3 className="mt-1 break-words text-xl font-semibold text-ink">
                  {translation.upload.previewDescription}
                </h3>
              </div>
            </div>

            {!file ? (
              <div className="mt-6">
                <EmptyState
                  icon={ScanSearch}
                  title={translation.upload.emptyTitle}
                  description={translation.upload.emptyDescription}
                  className="min-h-[340px]"
                />
              </div>
            ) : uploadStatus === "processing" ? (
              <div className="mt-6 flex min-h-[340px] items-center justify-center rounded-[1.6rem] border border-stroke/70 bg-surface/72 p-6">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accentSoft text-ink">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-ink">
                    {copy.processingTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {copy.processingDescription}
                  </p>
                </div>
              </div>
            ) : !parsedResult ? (
              <div className="mt-6">
                <EmptyState
                  icon={AlertTriangle}
                  title={copy.errorTitle}
                  description={uploadError || copy.genericError}
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
                          <p className="break-all font-semibold text-ink">
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
                        alt={copy.previewAlt}
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
            <div className="min-w-0">
              <div className="badge-pill">{copy.resultsTitle}</div>
              <h3 className="mt-4 break-words text-2xl font-semibold tracking-tight text-ink">
                {translation.upload.previewTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {copy.resultsDescription}
              </p>
            </div>
          </div>

          {!file ? (
            <EmptyState
              icon={ScanSearch}
              title={translation.upload.emptyTitle}
              description={translation.upload.emptyDescription}
              className="mt-6 min-h-[280px]"
            />
          ) : uploadStatus === "processing" ? (
            <div className="mt-6 rounded-[1.5rem] border border-stroke/70 bg-surface/72 px-5 py-10 text-center">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-ink" />
              <p className="mt-4 font-semibold text-ink">{copy.processingTitle}</p>
              <p className="mt-2 text-sm text-muted">{copy.processingDescription}</p>
            </div>
          ) : !parsedResult ? (
            <EmptyState
              icon={AlertTriangle}
              title={copy.errorTitle}
              description={uploadError || copy.genericError}
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
                      <p className="break-words font-semibold text-ink">
                        {transaction.title}
                      </p>
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

                    <div className="md:max-w-[190px] md:text-right">
                      <p
                        className={`break-words text-lg font-semibold ${
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
