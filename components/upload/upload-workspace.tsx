"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Info,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
  X
} from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
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
  parseUploadFile,
  validateUploadFile
} from "@/lib/upload";
import { cn, formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import { useFinanceStore } from "@/stores/use-finance-store";
import type { Language } from "@/types/app";
import type { UploadParseResult, UploadParseWarning } from "@/types/finance";

type UploadStatus = "idle" | "processing" | "success" | "error" | "imported";

const uploadCopy: Record<
  Language,
  {
    badge: string;
    title: string;
    description: string;
    requirements: string;
    privacyTitle: string;
    privacyDescription: string;
    workflowTitle: string;
    workflowDescription: string;
    dropTitle: string;
    dropDescription: string;
    chooseFile: string;
    sample: string;
    selectedFile: string;
    clearFile: string;
    processingTitle: string;
    processingDescription: string;
    successTitle: string;
    successDescription: string;
    importedTitle: string;
    importedDescription: string;
    errorTitle: string;
    invalidType: string;
    invalidSize: string;
    genericError: string;
    previewTitle: string;
    previewDescription: string;
    parsedRows: string;
    detectedColumns: string;
    sheetName: string;
    dateLabel: string;
    descriptionLabel: string;
    amountLabel: string;
    balanceLabel: string;
    warnings: string;
    skippedRows: string;
    importButton: string;
    openDashboard: string;
    historyTitle: string;
    historyDescription: string;
    historyEmpty: string;
    previewAlt: string;
    manualReviewTitle: string;
    manualReviewDescription: string;
  }
> = {
  th: {
    badge: "Import workspace",
    title: "อัปโหลด ตรวจสอบ และนำเข้าธุรกรรมจากไฟล์",
    description:
      "สเปรดชีตจะถูกอ่านจริงเพื่อแปลงเป็นรายการธุรกรรม ส่วน PDF และรูปภาพจะถูกตรวจสอบและส่งเข้าคิวตรวจทานแบบ manual",
    requirements: "รองรับ CSV, XLS, XLSX, PDF, PNG และ JPG ขนาดไม่เกิน 8 MB",
    privacyTitle: "ตรวจสอบก่อนนำเข้า",
    privacyDescription:
      "ระบบจะตรวจชนิดไฟล์ ขนาดไฟล์ และโครงสร้างคอลัมน์ก่อนสร้างพรีวิวธุรกรรม",
    workflowTitle: "ขั้นตอนชัดเจนขึ้น",
    workflowDescription:
      "เลือกไฟล์ ดูคำเตือนและผลลัพธ์ แล้วค่อยกดนำเข้ารายการเข้าสู่แดชบอร์ด",
    dropTitle: "อัปโหลด statement, ledger หรือ receipt",
    dropDescription:
      "ลากไฟล์มาวาง หรือเลือกไฟล์เพื่อดูผลการอ่านข้อมูลและรายการที่พร้อมนำเข้า",
    chooseFile: "เลือกไฟล์",
    sample: "ลองตัวอย่าง",
    selectedFile: "ไฟล์ที่เลือก",
    clearFile: "ล้างไฟล์",
    processingTitle: "กำลังประมวลผลไฟล์",
    processingDescription:
      "กำลังตรวจสอบชนิดไฟล์ อ่านข้อมูล และเตรียมพรีวิวรายการธุรกรรม",
    successTitle: "พร้อมนำเข้าแล้ว",
    successDescription:
      "ตรวจสอบไฟล์และอ่านข้อมูลสำเร็จแล้ว คุณสามารถตรวจทานก่อนนำเข้าจริงได้",
    importedTitle: "นำเข้าธุรกรรมสำเร็จ",
    importedDescription:
      "รายการที่ตรวจพบถูกเพิ่มเข้าแดชบอร์ดแล้ว และยังย้อนกลับมาตรวจทานไฟล์นี้ได้",
    errorTitle: "อัปโหลดไม่สำเร็จ",
    invalidType: "รองรับเฉพาะ CSV, XLS, XLSX, PDF, PNG และ JPG",
    invalidSize: "ขนาดไฟล์ต้องไม่เกิน 8 MB",
    genericError: "ไม่สามารถประมวลผลไฟล์นี้ได้ กรุณาลองอีกครั้ง",
    previewTitle: "พรีวิวนำเข้า",
    previewDescription:
      "ตรวจสอบคอลัมน์ คำเตือน และธุรกรรมที่ระบบตรวจพบก่อนเพิ่มลงแดชบอร์ด",
    parsedRows: "รายการที่ตรวจพบ",
    detectedColumns: "คอลัมน์ที่พบ",
    sheetName: "ชีตที่ใช้",
    dateLabel: "วันที่",
    descriptionLabel: "รายละเอียด",
    amountLabel: "จำนวนเงิน",
    balanceLabel: "คงเหลือ",
    warnings: "คำเตือน",
    skippedRows: "แถวที่ข้าม",
    importButton: "นำเข้าธุรกรรม",
    openDashboard: "เปิดแดชบอร์ด",
    historyTitle: "ประวัติการนำเข้า",
    historyDescription: "ไฟล์ที่ถูกนำเข้าจะถูกบันทึกไว้เพื่อย้อนดูได้ง่าย",
    historyEmpty: "ยังไม่มีประวัติการนำเข้า",
    previewAlt: "ภาพตัวอย่างไฟล์ที่อัปโหลด",
    manualReviewTitle: "ต้องตรวจทานแบบ manual",
    manualReviewDescription:
      "PDF และรูปภาพผ่านการตรวจสอบแล้ว แต่ยังไม่มี parser เชิงลึกพอจะดึงธุรกรรมอัตโนมัติจากไฟล์นี้"
  },
  en: {
    badge: "Import workspace",
    title: "Upload, validate, and import transactions from a file",
    description:
      "Spreadsheets are parsed for real into transaction rows, while PDFs and images are validated and routed into a manual-review flow.",
    requirements: "Supports CSV, XLS, XLSX, PDF, PNG, and JPG files up to 8 MB",
    privacyTitle: "Validated before import",
    privacyDescription:
      "The system checks file type, size, and column structure before generating an import preview.",
    workflowTitle: "A clearer workflow",
    workflowDescription:
      "Select a file, review warnings and detected rows, then import the transactions into the dashboard.",
    dropTitle: "Upload a statement, ledger, or receipt",
    dropDescription:
      "Drop a file here or choose one to inspect the parsed result and import-ready transactions.",
    chooseFile: "Choose file",
    sample: "Try sample",
    selectedFile: "Selected file",
    clearFile: "Clear file",
    processingTitle: "Processing file",
    processingDescription:
      "Validating the upload, reading its structure, and preparing the transaction preview.",
    successTitle: "Ready to import",
    successDescription:
      "The file was validated and parsed successfully. Review the preview before importing it.",
    importedTitle: "Transactions imported",
    importedDescription:
      "Detected transactions were added to the dashboard and the import has been recorded.",
    errorTitle: "Upload failed",
    invalidType: "Only CSV, XLS, XLSX, PDF, PNG, and JPG files are supported.",
    invalidSize: "The file must be 8 MB or smaller.",
    genericError: "We could not process this file. Please try again.",
    previewTitle: "Import preview",
    previewDescription:
      "Review detected columns, warnings, and parsed transactions before they reach the dashboard.",
    parsedRows: "Detected rows",
    detectedColumns: "Detected columns",
    sheetName: "Selected sheet",
    dateLabel: "Date",
    descriptionLabel: "Description",
    amountLabel: "Amount",
    balanceLabel: "Balance",
    warnings: "Warnings",
    skippedRows: "Skipped rows",
    importButton: "Import transactions",
    openDashboard: "Open dashboard",
    historyTitle: "Import history",
    historyDescription: "Imported files are recorded so the latest batches stay visible.",
    historyEmpty: "No imports recorded yet",
    previewAlt: "Uploaded file preview",
    manualReviewTitle: "Manual review required",
    manualReviewDescription:
      "PDFs and images are now validated correctly, but this app still needs a deeper extractor to turn them into transactions automatically."
  },
  ja: {
    badge: "Import workspace",
    title: "ファイルをアップロードして検証し、取引として取り込む",
    description:
      "スプレッドシートは実際に解析して取引行へ変換し、PDF と画像は検証後に手動確認フローへ回します。",
    requirements: "CSV、XLS、XLSX、PDF、PNG、JPG に対応し、最大サイズは 8 MB です",
    privacyTitle: "取り込み前に検証",
    privacyDescription:
      "プレビューを生成する前に、ファイル種別、サイズ、列構造を確認します。",
    workflowTitle: "流れを明確化",
    workflowDescription:
      "ファイルを選択し、警告と検出行を確認した上で、ダッシュボードへ取り込みます。",
    dropTitle: "明細、台帳、またはレシートをアップロード",
    dropDescription:
      "ここへドロップするかファイルを選択して、解析結果と取り込み候補を確認できます。",
    chooseFile: "ファイルを選択",
    sample: "サンプルを試す",
    selectedFile: "選択中のファイル",
    clearFile: "ファイルをクリア",
    processingTitle: "ファイルを処理中",
    processingDescription:
      "アップロードを検証し、構造を読み取り、取引プレビューを準備しています。",
    successTitle: "取り込み準備完了",
    successDescription:
      "ファイルの検証と解析が完了しました。取り込む前にプレビューを確認できます。",
    importedTitle: "取引を取り込みました",
    importedDescription:
      "検出された取引をダッシュボードへ追加し、この取り込み履歴も保存しました。",
    errorTitle: "アップロードに失敗しました",
    invalidType: "CSV、XLS、XLSX、PDF、PNG、JPG のみ対応しています。",
    invalidSize: "ファイルサイズは 8 MB 以下にしてください。",
    genericError: "このファイルを処理できませんでした。もう一度お試しください。",
    previewTitle: "取り込みプレビュー",
    previewDescription:
      "ダッシュボードへ反映する前に、検出列、警告、取引行を確認できます。",
    parsedRows: "検出行数",
    detectedColumns: "検出列",
    sheetName: "対象シート",
    dateLabel: "日付",
    descriptionLabel: "詳細",
    amountLabel: "金額",
    balanceLabel: "残高",
    warnings: "警告",
    skippedRows: "スキップ行",
    importButton: "取引を取り込む",
    openDashboard: "ダッシュボードを開く",
    historyTitle: "取り込み履歴",
    historyDescription: "取り込んだファイルは履歴として残り、直近のバッチを確認できます。",
    historyEmpty: "取り込み履歴はまだありません",
    previewAlt: "アップロードしたファイルのプレビュー",
    manualReviewTitle: "手動確認が必要です",
    manualReviewDescription:
      "PDF と画像は正しく検証されますが、このアプリではまだ自動抽出用の深いパーサーが不足しています。"
  }
};

function getFileIcon(type: string, fileName: string) {
  const normalizedName = fileName.toLowerCase();

  if (type === "application/pdf" || normalizedName.endsWith(".pdf")) {
    return FileText;
  }

  if (
    type.includes("sheet") ||
    type.includes("excel") ||
    type === "text/csv" ||
    normalizedName.endsWith(".csv")
  ) {
    return FileSpreadsheet;
  }

  return ImageIcon;
}

function buildSampleFile() {
  const sampleCsv = [
    "date,type,category,description,amount,balance,counterparty,note",
    "2026-03-24,income,salary,Monthly salary,52000,52000,Employer,Payroll transfer",
    "2026-03-25,expense,housing,Apartment rent,18500,33500,Landlord,March payment",
    "2026-03-26,expense,groceries,Weekly groceries,1680,31820,Supermarket,Home essentials"
  ].join("\n");

  return new File([sampleCsv], "sample-transactions.csv", {
    type: "text/csv"
  });
}

function getWarningLabel(language: Language, warning: UploadParseWarning) {
  const map: Record<Language, Record<UploadParseWarning, string>> = {
    th: {
      manual_review_required: "ไฟล์ชนิดนี้ต้องตรวจทานแบบ manual",
      no_transactions_detected: "ไม่พบธุรกรรมที่พร้อมนำเข้า",
      rows_skipped: "มีบางแถวถูกข้ามเพราะข้อมูลไม่ครบหรือไม่ชัดเจน"
    },
    en: {
      manual_review_required: "This file type currently requires manual review",
      no_transactions_detected: "No import-ready transactions were detected",
      rows_skipped: "Some rows were skipped because the data was incomplete or unclear"
    },
    ja: {
      manual_review_required: "このファイル種別は現在手動確認が必要です",
      no_transactions_detected: "取り込み可能な取引が見つかりませんでした",
      rows_skipped: "不完全または不明瞭な行が一部スキップされました"
    }
  };

  return map[language][warning];
}

export function UploadWorkspace() {
  const { language } = useI18n();
  const imports = useFinanceStore((state) => state.imports);
  const importTransactions = useFinanceStore((state) => state.importTransactions);
  const copy = uploadCopy[language];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadParseResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const FileIcon = useMemo(
    () => getFileIcon(file?.type ?? "", file?.name ?? ""),
    [file?.name, file?.type]
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
      setUploadResult(null);
      return;
    }

    let cancelled = false;
    setUploadStatus("processing");
    setUploadError("");
    setUploadResult(null);

    void parseUploadFile(file)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setUploadResult(result);
        setUploadStatus("success");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const errorCode =
          error instanceof Error && error.message ? error.message : "parse_failed";

        setUploadStatus("error");
        setUploadError(
          errorCode === "file_size"
            ? copy.invalidSize
            : errorCode === "file_type"
              ? copy.invalidType
              : copy.genericError
        );
      });

    return () => {
      cancelled = true;
    };
  }, [copy.genericError, copy.invalidSize, copy.invalidType, file]);

  function resetUpload() {
    setFile(null);
    setUploadResult(null);
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
      setUploadResult(null);
      setPreviewUrl(null);
      setUploadStatus("error");
      setUploadError(
        validationIssue === "file_size"
          ? copy.invalidSize
          : validationIssue === "file_type"
            ? copy.invalidType
            : copy.genericError
      );
      return;
    }

    setUploadError("");
    setUploadStatus("idle");
    setFile(nextFile);
  }

  function handleImport() {
    if (!uploadResult || uploadResult.transactions.length === 0) {
      return;
    }

    importTransactions(uploadResult.transactions, uploadResult);
    setUploadStatus("imported");
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
        : uploadStatus === "imported"
          ? {
              description: copy.importedDescription,
              icon: CheckCircle2,
              iconClassName: "",
              title: copy.importedTitle,
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
              {["CSV", "XLSX", "PDF", "PNG/JPG"].map((type) => (
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
                  <ScanSearch className="h-5 w-5" />
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
            <div
              className={cn(
                "rounded-[1.8rem] border-2 border-dashed px-6 py-10 text-center transition",
                isDragging
                  ? "border-accent/30 bg-accentSoft"
                  : "border-stroke/70 bg-surface/72"
              )}
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
                  {copy.dropTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {copy.dropDescription}
                </p>

                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button onClick={() => inputRef.current?.click()}>
                    {copy.chooseFile}
                  </Button>
                  <Button variant="secondary" onClick={() => handleFileSelection(buildSampleFile())}>
                    {copy.sample}
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted">{copy.requirements}</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".csv,.xls,.xlsx,.pdf,.png,.jpg,.jpeg"
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
                  <div className={cn("rounded-2xl p-3", statusMeta.toneClassName)}>
                    <statusMeta.icon
                      className={cn("h-5 w-5", statusMeta.iconClassName)}
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
                <Info className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {copy.previewTitle}
                </p>
                <h3 className="mt-1 break-words text-xl font-semibold text-ink">
                  {copy.previewDescription}
                </h3>
              </div>
            </div>

            {!file ? (
              <div className="mt-6">
                <EmptyState
                  icon={ScanSearch}
                  title={copy.historyTitle}
                  description={copy.historyDescription}
                  className="min-h-[320px]"
                />
              </div>
            ) : uploadStatus === "processing" ? (
              <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[1.6rem] border border-stroke/70 bg-surface/72 p-6">
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
            ) : !uploadResult ? (
              <div className="mt-6">
                <EmptyState
                  icon={AlertTriangle}
                  title={copy.errorTitle}
                  description={uploadError || copy.genericError}
                  className="min-h-[320px]"
                />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-stroke/70 bg-surface/72 p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-panel p-3 text-accent shadow-sm">
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-semibold text-ink">
                        {uploadResult.fileName}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatFileSize(uploadResult.fileSize)} • {uploadResult.sourceType}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="stat-tile bg-panel/92">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {copy.parsedRows}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-ink">
                            {uploadResult.summary.transactionCount}
                          </p>
                        </div>
                        <div className="stat-tile bg-panel/92">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {copy.sheetName}
                          </p>
                          <p className="mt-2 break-words text-sm font-semibold text-ink">
                            {uploadResult.sheetName ?? copy.manualReviewTitle}
                          </p>
                        </div>
                      </div>
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

                <div className="grid gap-3">
                  <div className="rounded-[1.4rem] border border-stroke/70 bg-surface/72 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {copy.detectedColumns}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadResult.columns.length > 0 ? (
                        uploadResult.columns.map((column) => (
                          <span
                            key={column}
                            className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted"
                          >
                            {column}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">
                          {copy.manualReviewDescription}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-stroke/70 bg-surface/72 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {copy.warnings}
                    </p>
                    <div className="mt-3 space-y-2">
                      {uploadResult.warnings.length > 0 ? (
                        uploadResult.warnings.map((warning) => (
                          <div
                            key={warning}
                            className="rounded-2xl bg-panel/92 px-4 py-3 text-sm text-muted"
                          >
                            {getWarningLabel(language, warning)}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-panel/92 px-4 py-3 text-sm text-muted">
                          {copy.successDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {uploadResult.transactions.length > 0 ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleImport}>
                      {copy.importButton} ({uploadResult.transactions.length})
                    </Button>
                    <Link href="/" className={buttonStyles("secondary")}>
                      {copy.openDashboard}
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-stroke/70 bg-surface/72 px-4 py-4">
                    <p className="font-semibold text-ink">{copy.manualReviewTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {copy.manualReviewDescription}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="badge-pill">{copy.previewTitle}</div>
                <h3 className="mt-4 break-words text-2xl font-semibold tracking-tight text-ink">
                  {copy.previewDescription}
                </h3>
              </div>
            </div>

            {!uploadResult ? (
              <EmptyState
                icon={ScanSearch}
                title={copy.previewTitle}
                description={copy.previewDescription}
                className="mt-6 min-h-[280px]"
              />
            ) : uploadResult.transactions.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title={copy.manualReviewTitle}
                description={copy.manualReviewDescription}
                className="mt-6 min-h-[280px]"
              />
            ) : (
              <>
                <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-stroke/70 lg:block">
                  <table className="w-full border-collapse">
                    <thead className="bg-surface/86">
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted">
                        <th className="px-5 py-4 font-semibold">{copy.dateLabel}</th>
                        <th className="px-5 py-4 font-semibold">{copy.descriptionLabel}</th>
                        <th className="px-5 py-4 font-semibold">{copy.detectedColumns}</th>
                        <th className="px-5 py-4 font-semibold text-right">{copy.amountLabel}</th>
                        <th className="px-5 py-4 font-semibold text-right">{copy.balanceLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.transactions.map((transaction) => (
                        <tr key={`${transaction.sourceRow}-${transaction.title}`} className="border-t border-stroke/60 bg-panel/88">
                          <td className="px-5 py-4 text-sm text-muted">
                            {formatDate(transaction.date, language)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-ink">{transaction.title}</p>
                              <p className="text-sm text-muted">
                                {transaction.counterparty || transaction.note || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted">
                            {getCategoryLabel(transaction.category, language)}
                          </td>
                          <td
                            className={cn(
                              "px-5 py-4 text-right text-sm font-semibold",
                              transaction.type === "income" ? "text-income" : "text-expense"
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount, language)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-ink">
                            {transaction.balance == null
                              ? "-"
                              : formatCurrency(transaction.balance, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid gap-3 lg:hidden">
                  {uploadResult.transactions.map((transaction) => (
                    <div
                      key={`${transaction.sourceRow}-${transaction.title}`}
                      className="rounded-[1.4rem] border border-stroke/70 bg-surface/78 px-4 py-4"
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
                            transaction.type === "income"
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
                            {copy.amountLabel}
                          </p>
                          <p
                            className={cn(
                              "mt-1 font-semibold",
                              transaction.type === "income" ? "text-income" : "text-expense"
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount, language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {copy.balanceLabel}
                          </p>
                          <p className="mt-1 font-semibold text-ink">
                            {transaction.balance == null
                              ? "-"
                              : formatCurrency(transaction.balance, language)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                          {getAccountLabel(transaction.account, language)}
                        </span>
                        <span className="rounded-full border border-stroke/70 bg-panel/90 px-3 py-1 text-xs font-medium text-muted">
                          {getPaymentMethodLabel(transaction.paymentMethod, language)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-ink">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {copy.historyTitle}
                </p>
                <h3 className="mt-1 break-words text-xl font-semibold text-ink">
                  {copy.historyDescription}
                </h3>
              </div>
            </div>

            {imports.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={copy.historyTitle}
                description={copy.historyEmpty}
                className="mt-6 min-h-[280px]"
              />
            ) : (
              <div className="mt-6 space-y-3">
                {imports.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[1.4rem] border border-stroke/70 bg-surface/72 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-semibold text-ink">
                          {record.fileName}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {formatDate(record.importedAt, language)} • {record.sourceType}
                        </p>
                      </div>
                      <span className="rounded-full bg-incomeSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-income">
                        {record.transactionCount}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-panel/92 px-4 py-3 text-sm text-muted">
                        {formatCurrency(record.totalIncome, language)}
                      </div>
                      <div className="rounded-2xl bg-panel/92 px-4 py-3 text-sm text-muted">
                        {formatCurrency(record.totalExpense, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
