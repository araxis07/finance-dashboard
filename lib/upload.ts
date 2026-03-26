import type { UploadParseResult, UploadSourceType } from "@/types/finance";

export const ACCEPTED_UPLOAD_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/jpg"
] as const;

export const ACCEPTED_UPLOAD_EXTENSIONS = [
  "pdf",
  "xls",
  "xlsx",
  "csv",
  "png",
  "jpg",
  "jpeg"
] as const;

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export type UploadValidationIssue = "file_size" | "file_type" | "missing_file";
export type UploadApiErrorCode =
  | "invalid_request"
  | "file_size"
  | "file_type"
  | "parse_failed";

export interface UploadLike {
  name: string;
  size: number;
  type: string;
}

function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function getUploadSourceType(file: UploadLike): UploadSourceType | null {
  const extension = getFileExtension(file.name);

  if (extension === "xls" || extension === "xlsx" || extension === "csv") {
    return "spreadsheet";
  }

  if (extension === "pdf" || file.type === "application/pdf") {
    return "pdf";
  }

  if (
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg" ||
    file.type.startsWith("image/")
  ) {
    return "image";
  }

  return null;
}

export function isAcceptedUploadFile(file: UploadLike) {
  return (
    ACCEPTED_UPLOAD_TYPES.includes(
      file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number]
    ) ||
    ACCEPTED_UPLOAD_EXTENSIONS.includes(
      getFileExtension(file.name) as (typeof ACCEPTED_UPLOAD_EXTENSIONS)[number]
    )
  );
}

export function validateUploadFile(file: UploadLike | null | undefined) {
  if (!file) {
    return "missing_file" satisfies UploadValidationIssue;
  }

  if (!isAcceptedUploadFile(file)) {
    return "file_type" satisfies UploadValidationIssue;
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return "file_size" satisfies UploadValidationIssue;
  }

  return null;
}

export async function parseUploadFile(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const payload = (await response.json()) as
    | UploadParseResult
    | {
        errorCode?: UploadApiErrorCode;
      };

  if (!response.ok) {
    throw new Error(
      "errorCode" in payload && payload.errorCode
        ? payload.errorCode
        : "parse_failed"
    );
  }

  return payload as UploadParseResult;
}
