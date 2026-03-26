import * as XLSX from "xlsx";
import {
  accountOptions,
  expenseCategories,
  incomeCategories,
  normalizeAccountId,
  normalizeCategoryId,
  normalizePaymentMethodId,
  paymentMethodOptions
} from "@/lib/finance";
import { getUploadSourceType } from "@/lib/upload";
import type {
  ParsedUploadTransaction,
  PaymentMethodId,
  TransactionCategoryId,
  TransactionType,
  UploadParseResult,
  UploadParseWarning
} from "@/types/finance";

type CanonicalColumnKey =
  | "date"
  | "title"
  | "amount"
  | "credit"
  | "debit"
  | "balance"
  | "type"
  | "category"
  | "account"
  | "paymentMethod"
  | "counterparty"
  | "note"
  | "tags";

const HEADER_ALIASES: Record<CanonicalColumnKey, string[]> = {
  date: ["date", "transaction date", "posted date", "วันที่", "日付"],
  title: [
    "title",
    "description",
    "details",
    "memo",
    "narration",
    "particulars",
    "รายการ",
    "รายละเอียด",
    "คำอธิบาย",
    "摘要",
    "説明",
    "明細"
  ],
  amount: ["amount", "value", "total", "ยอด", "金額"],
  credit: ["credit", "deposit", "income", "inflow", "รายรับ", "入金"],
  debit: ["debit", "withdrawal", "expense", "outflow", "payment", "รายจ่าย", "支出"],
  balance: ["balance", "running balance", "closing balance", "ยอดคงเหลือ", "残高"],
  type: ["type", "transaction type", "ประเภท", "種別"],
  category: ["category", "หมวด", "カテゴリ"],
  account: ["account", "wallet", "บัญชี", "口座"],
  paymentMethod: ["payment method", "method", "channel", "วิธีชำระเงิน", "支払方法"],
  counterparty: [
    "counterparty",
    "merchant",
    "vendor",
    "payee",
    "payer",
    "source",
    "party",
    "ร้านค้า",
    "ผู้รับเงิน",
    "相手先"
  ],
  note: ["note", "notes", "remark", "remarks", "บันทึก", "備考"],
  tags: ["tag", "tags", "label", "labels", "แท็ก", "タグ"]
};

const categoryKeywordMap: Record<TransactionCategoryId, string[]> = {
  salary: ["salary", "payroll", "เงินเดือน", "給与"],
  freelance: ["freelance", "contract", "consulting", "ฟรีแลนซ์", "フリーランス"],
  investments: ["dividend", "investment", "interest", "ลงทุน", "投資"],
  refund: ["refund", "rebate", "cashback", "เงินคืน", "返金"],
  gift: ["gift", "present", "allowance", "ของขวัญ", "贈与"],
  otherIncome: ["bonus", "deposit", "income", "transfer in", "รายรับ", "収入"],
  housing: ["rent", "mortgage", "housing", "lease", "เช่า", "家賃", "住居"],
  groceries: ["grocery", "supermarket", "mart", "食料", "ของกิน", "grocer"],
  transport: ["transport", "transit", "taxi", "grab", "fuel", "เดินทาง", "交通"],
  utilities: ["utility", "electric", "water", "internet", "phone", "ไฟ", "電気", "公共"],
  dining: ["restaurant", "food", "coffee", "cafe", "อาหาร", "外食", "ランチ"],
  shopping: ["shopping", "store", "mall", "shop", "ช้อป", "買い物"],
  health: ["health", "clinic", "hospital", "pharmacy", "สุขภาพ", "病院", "健康"],
  education: ["education", "course", "tuition", "เรียน", "教育", "講座"],
  entertainment: ["movie", "streaming", "game", "concert", "บันเทิง", "娯楽"],
  family: ["family", "child", "school", "parent", "ครอบครัว", "家族"],
  travel: ["travel", "hotel", "flight", "trip", "ท่องเที่ยว", "旅行"],
  insurance: ["insurance", "premium", "ประกัน", "保険"],
  debt: ["loan", "debt", "installment", "repayment", "หนี้", "債務"],
  otherExpense: ["expense", "purchase", "payment", "รายจ่าย", "支出"]
};

const incomeKeywords = [
  "income",
  "credit",
  "deposit",
  "salary",
  "refund",
  "payroll",
  "received",
  "รับ",
  "入金",
  "収入"
];

const expenseKeywords = [
  "expense",
  "debit",
  "withdrawal",
  "payment",
  "purchase",
  "paid",
  "จ่าย",
  "支出",
  "出金"
];

function normalizeToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^\p{L}\p{N}.\- ]+/gu, " ")
    .replace(/\s+/g, " ");
}

function parseNumericValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const isNegative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith("-");
  let numeric = trimmed.replace(/[^\d,.-]/g, "");

  const lastComma = numeric.lastIndexOf(",");
  const lastDot = numeric.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      numeric = numeric.replace(/\./g, "").replace(",", ".");
    } else {
      numeric = numeric.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    const decimalDigits = numeric.length - lastComma - 1;
    numeric =
      decimalDigits > 0 && decimalDigits <= 2
        ? numeric.replace(",", ".")
        : numeric.replace(/,/g, "");
  }

  const parsed = Number(numeric);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return isNegative ? -Math.abs(parsed) : parsed;
}

function formatAsIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatAsIsoDate(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return formatAsIsoDate(
        new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
      );
    }
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const direct = new Date(trimmed);

  if (!Number.isNaN(direct.getTime())) {
    return formatAsIsoDate(direct);
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const resolvedYear = year.length === 2 ? `20${year}` : year;
    const parsed = new Date(
      Date.UTC(Number(resolvedYear), Number(month) - 1, Number(day))
    );

    if (!Number.isNaN(parsed.getTime())) {
      return formatAsIsoDate(parsed);
    }
  }

  return null;
}

function detectCanonicalColumn(header: string) {
  const normalized = normalizeToken(header);

  if (!normalized) {
    return null;
  }

  for (const [canonicalKey, aliases] of Object.entries(HEADER_ALIASES) as Array<
    [CanonicalColumnKey, string[]]
  >) {
    const matched = aliases.some((alias) => {
      const aliasToken = normalizeToken(alias);
      return (
        normalized === aliasToken ||
        normalized.includes(aliasToken) ||
        aliasToken.includes(normalized)
      );
    });

    if (matched) {
      return canonicalKey;
    }
  }

  return null;
}

function splitTags(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[;,/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function findMappedValue(
  row: Record<string, unknown>,
  columnMap: Partial<Record<CanonicalColumnKey, string>>,
  key: CanonicalColumnKey
) {
  const sourceColumn = columnMap[key];
  return sourceColumn ? row[sourceColumn] : undefined;
}

function inferTypeFromText(value: unknown): TransactionType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeToken(value);

  if (!normalized) {
    return null;
  }

  if (incomeKeywords.some((keyword) => normalized.includes(keyword))) {
    return "income";
  }

  if (expenseKeywords.some((keyword) => normalized.includes(keyword))) {
    return "expense";
  }

  return null;
}

function createOptionKeywordMap<T extends string>(
  items: Array<{
    id: T;
    labels: Record<string, string>;
  }>
) {
  return items.reduce<Record<T, string[]>>((accumulator, item) => {
    accumulator[item.id] = Object.values(item.labels).map((label) =>
      normalizeToken(label)
    );
    return accumulator;
  }, {} as Record<T, string[]>);
}

const paymentMethodKeywordMap = createOptionKeywordMap(paymentMethodOptions);
const accountKeywordMap = createOptionKeywordMap(accountOptions);
const categoryLabelKeywordMap = createOptionKeywordMap([
  ...incomeCategories,
  ...expenseCategories
]);

function findBestOption<T extends string>(
  candidate: unknown,
  keywordMap: Record<T, string[]>
) {
  if (typeof candidate !== "string") {
    return null;
  }

  const normalized = normalizeToken(candidate);

  if (!normalized) {
    return null;
  }

  for (const [id, keywords] of Object.entries(keywordMap) as Array<[T, string[]]>) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return id;
    }
  }

  return null;
}

function inferCategory(
  candidate: unknown,
  fallbackText: string,
  type: TransactionType
) {
  const fromLabels = findBestOption(candidate, categoryLabelKeywordMap);

  if (fromLabels) {
    return normalizeCategoryId(fromLabels, type);
  }

  const normalized = normalizeToken(
    [typeof candidate === "string" ? candidate : "", fallbackText].join(" ")
  );

  for (const [categoryId, keywords] of Object.entries(categoryKeywordMap) as Array<
    [TransactionCategoryId, string[]]
  >) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return normalizeCategoryId(categoryId, type);
    }
  }

  return normalizeCategoryId(undefined, type);
}

function inferPaymentMethod(candidate: unknown, fallbackText: string, type: TransactionType) {
  const fromLabel = findBestOption(candidate, paymentMethodKeywordMap);

  if (fromLabel) {
    return normalizePaymentMethodId(fromLabel, type);
  }

  const normalized = normalizeToken(fallbackText);

  if (normalized.includes("cash") || normalized.includes("เงินสด") || normalized.includes("現金")) {
    return "cash";
  }

  if (
    normalized.includes("credit card") ||
    normalized.includes("visa") ||
    normalized.includes("mastercard") ||
    normalized.includes("บัตรเครดิต") ||
    normalized.includes("クレジット")
  ) {
    return "creditCard";
  }

  if (
    normalized.includes("debit") ||
    normalized.includes("บัตรเดบิต") ||
    normalized.includes("デビット")
  ) {
    return "debitCard";
  }

  if (
    normalized.includes("promptpay") ||
    normalized.includes("qr") ||
    normalized.includes("พร้อมเพย์")
  ) {
    return "promptPay";
  }

  if (
    normalized.includes("wallet") ||
    normalized.includes("ewallet") ||
    normalized.includes("e-wallet")
  ) {
    return "eWallet";
  }

  return type === "income" ? "bankTransfer" : "other";
}

function inferAccount(candidate: unknown, paymentMethod: PaymentMethodId) {
  const fromLabel = findBestOption(candidate, accountKeywordMap);

  if (fromLabel) {
    return normalizeAccountId(fromLabel);
  }

  if (paymentMethod === "cash") {
    return "cash";
  }

  if (paymentMethod === "creditCard" || paymentMethod === "debitCard") {
    return "creditCard";
  }

  if (paymentMethod === "eWallet" || paymentMethod === "promptPay") {
    return "eWallet";
  }

  return "bankAccount";
}

function buildSummary(transactions: ParsedUploadTransaction[]) {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.incomeCount += 1;
        summary.totalIncome += transaction.amount;
      } else {
        summary.expenseCount += 1;
        summary.totalExpense += transaction.amount;
      }

      summary.transactionCount += 1;
      return summary;
    },
    {
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
      totalIncome: 0,
      totalExpense: 0
    }
  );
}

function createMetadataResult(
  file: File,
  sourceType: "pdf" | "image"
): UploadParseResult {
  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    sourceType,
    parser: "metadata",
    sheetName: null,
    columns: [],
    skippedRows: 0,
    processedAt: new Date().toISOString(),
    warnings: ["manual_review_required", "no_transactions_detected"],
    summary: {
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
      totalIncome: 0,
      totalExpense: 0
    },
    transactions: []
  };
}

function parseSpreadsheetFile(file: File, buffer: Buffer): UploadParseResult {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true
  });

  const selectedSheetName =
    workbook.SheetNames.find((sheetName) => {
      const rows = XLSX.utils.sheet_to_json<string[]>(
        workbook.Sheets[sheetName],
        {
          header: 1,
          raw: false
        }
      );

      return rows.length > 1;
    }) ?? workbook.SheetNames[0] ?? null;

  if (!selectedSheetName) {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      sourceType: "spreadsheet",
      parser: "spreadsheet",
      sheetName: null,
      columns: [],
      skippedRows: 0,
      processedAt: new Date().toISOString(),
      warnings: ["no_transactions_detected"],
      summary: {
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        totalIncome: 0,
        totalExpense: 0
      },
      transactions: []
    };
  }

  const sheet = workbook.Sheets[selectedSheetName];
  const headerRows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false
  });
  const columns = (headerRows[0] ?? []).map((cell) =>
    typeof cell === "string" ? cell.trim() : String(cell ?? "").trim()
  );
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false
  });

  const columnMap = columns.reduce<Partial<Record<CanonicalColumnKey, string>>>(
    (accumulator, columnName) => {
      const canonicalKey = detectCanonicalColumn(columnName);

      if (canonicalKey && !accumulator[canonicalKey]) {
        accumulator[canonicalKey] = columnName;
      }

      return accumulator;
    },
    {}
  );

  const transactions: ParsedUploadTransaction[] = [];
  let skippedRows = 0;

  rows.forEach((row, rowIndex) => {
    const dateValue = parseDateValue(findMappedValue(row, columnMap, "date")) ?? null;
    const rawTitle = findMappedValue(row, columnMap, "title");
    const rawCategory = findMappedValue(row, columnMap, "category");
    const rawType = findMappedValue(row, columnMap, "type");
    const rawCredit = parseNumericValue(findMappedValue(row, columnMap, "credit"));
    const rawDebit = parseNumericValue(findMappedValue(row, columnMap, "debit"));
    const rawAmount = parseNumericValue(findMappedValue(row, columnMap, "amount"));
    const rawBalance = parseNumericValue(findMappedValue(row, columnMap, "balance"));
    const rawCounterparty = findMappedValue(row, columnMap, "counterparty");
    const rawNote = findMappedValue(row, columnMap, "note");
    const rawPaymentMethod = findMappedValue(row, columnMap, "paymentMethod");
    const rawAccount = findMappedValue(row, columnMap, "account");
    const fallbackText = [
      rawTitle,
      rawCounterparty,
      rawCategory,
      rawNote
    ]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ");

    const explicitType = inferTypeFromText(rawType) ?? inferTypeFromText(fallbackText);

    let type: TransactionType | null = explicitType;
    let amount: number | null = rawAmount;

    if (amount == null && rawCredit != null) {
      type = "income";
      amount = Math.abs(rawCredit);
    } else if (amount == null && rawDebit != null) {
      type = "expense";
      amount = Math.abs(rawDebit);
    } else if (amount != null && type == null) {
      type = amount < 0 ? "expense" : inferTypeFromText(fallbackText) ?? "expense";
      amount = Math.abs(amount);
    } else if (amount != null) {
      amount = Math.abs(amount);
    }

    if (!amount || amount <= 0 || !type) {
      const nonEmptyRow = Object.values(row).some((value) =>
        typeof value === "string" ? value.trim() : value
      );

      if (nonEmptyRow) {
        skippedRows += 1;
      }

      return;
    }

    const paymentMethod = inferPaymentMethod(rawPaymentMethod, fallbackText, type);
    const account = inferAccount(rawAccount, paymentMethod);
    const title =
      (typeof rawTitle === "string" && rawTitle.trim()) ||
      (typeof rawCounterparty === "string" && rawCounterparty.trim()) ||
      (type === "income" ? "Imported income" : "Imported expense");

    transactions.push({
      title,
      amount,
      type,
      category: inferCategory(rawCategory, fallbackText, type),
      date: dateValue ?? new Date().toISOString().split("T")[0],
      account,
      paymentMethod,
      counterparty:
        typeof rawCounterparty === "string" ? rawCounterparty.trim() : "",
      location: "",
      reference: "",
      note: typeof rawNote === "string" ? rawNote.trim() : "",
      tags: splitTags(findMappedValue(row, columnMap, "tags")),
      balance: rawBalance,
      sourceRow: rowIndex + 2
    });
  });

  const warnings: UploadParseWarning[] = [];

  if (transactions.length === 0) {
    warnings.push("no_transactions_detected" as const);
  }

  if (skippedRows > 0) {
    warnings.push("rows_skipped" as const);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    sourceType: "spreadsheet",
    parser: "spreadsheet",
    sheetName: selectedSheetName,
    columns,
    skippedRows,
    processedAt: new Date().toISOString(),
    warnings,
    summary: buildSummary(transactions),
    transactions
  };
}

export async function parseUploadedFile(file: File) {
  const sourceType = getUploadSourceType(file);

  if (sourceType === "pdf" || sourceType === "image") {
    return createMetadataResult(file, sourceType);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return parseSpreadsheetFile(file, buffer);
}
