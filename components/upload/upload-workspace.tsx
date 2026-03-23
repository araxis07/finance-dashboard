"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  ImageIcon,
  ScanSearch,
  UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMockParsedResult } from "@/lib/mock-parser";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import type { MockParsedResult } from "@/types/finance";

const acceptedTypes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg"
];

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<MockParsedResult | null>(null);

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

  function handleFileSelection(nextFile: File | null) {
    if (!nextFile || !isAcceptedFile(nextFile)) {
      return;
    }

    setFile(nextFile);
    setParsedResult(buildMockParsedResult(nextFile.name));
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Drag and drop upload</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Accepts PDF, Excel, and image files. Parsing is fully mocked for this UI.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-[1.75rem] border-2 border-dashed px-6 py-10 text-center transition duration-200 ${
              isDragging
                ? "border-accent bg-blue-50"
                : "border-stroke bg-gradient-to-br from-slate-50 to-white"
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
            <div className="mx-auto flex max-w-lg flex-col items-center">
              <div className="animate-float rounded-[1.75rem] bg-white p-5 text-accent shadow-card">
                <UploadCloud className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-ink">
                Upload a statement or receipt
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Drop a file here to simulate import parsing. This preview only
                demonstrates the interface and does not send data anywhere.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {["PDF", "Excel", "PNG/JPG"].map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
                <Button variant="ghost" onClick={loadSamplePreview}>
                  Use sample workflow
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
        <CardHeader>
          <CardTitle>Mock parsed preview</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Shows how extracted fields could be presented before import.
          </p>
        </CardHeader>
        <CardContent>
          {!file || !parsedResult ? (
            <EmptyState
              icon={ScanSearch}
              title="Nothing uploaded yet"
              description="Drop a file to generate a mock parsing preview card with sample transactions and metadata."
              className="min-h-[420px]"
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-stroke bg-slate-50/80 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-accent shadow-sm">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="truncate font-semibold text-ink">{file.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {formatFileSize(file.size)} • {parsedResult.sourceLabel}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-income">
                        Confidence {parsedResult.confidence}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {parsedResult.note}
                    </p>
                  </div>
                </div>

                {previewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-stroke">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {parsedResult.transactions.map((transaction, index) => (
                  <div
                    key={`${transaction.description}-${index}`}
                    className="rounded-2xl border border-stroke bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-ink">
                          {transaction.description}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {formatDate(transaction.date)} • {transaction.category}
                        </p>
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
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                          Mock parsed result
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
