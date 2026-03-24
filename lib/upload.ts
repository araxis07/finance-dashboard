import { buildMockParsedResult } from "@/lib/mock-parser";
import type { Language } from "@/types/app";
import type { MockParsedResult } from "@/types/finance";

export const ACCEPTED_UPLOAD_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg"
] as const;

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export type UploadValidationIssue = "file_size" | "file_type";

export function isAcceptedUploadFile(file: File) {
  return (
    ACCEPTED_UPLOAD_TYPES.includes(file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number]) ||
    /\.(pdf|xls|xlsx|png|jpe?g)$/i.test(file.name)
  );
}

export function validateUploadFile(file: File): UploadValidationIssue | null {
  if (!isAcceptedUploadFile(file)) {
    return "file_type";
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return "file_size";
  }

  return null;
}

export async function mockUploadFile(
  file: File,
  language: Language
): Promise<MockParsedResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 850));
  return buildMockParsedResult(file.name, language);
}
