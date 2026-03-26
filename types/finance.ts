export type TransactionType = "income" | "expense";
export type TransactionCategoryId =
  | "salary"
  | "freelance"
  | "investments"
  | "refund"
  | "gift"
  | "otherIncome"
  | "housing"
  | "groceries"
  | "transport"
  | "utilities"
  | "dining"
  | "shopping"
  | "health"
  | "education"
  | "entertainment"
  | "family"
  | "travel"
  | "insurance"
  | "debt"
  | "otherExpense";
export type AccountId =
  | "cash"
  | "bankAccount"
  | "savingsAccount"
  | "creditCard"
  | "eWallet"
  | "investmentAccount"
  | "otherAccount";
export type PaymentMethodId =
  | "bankTransfer"
  | "cash"
  | "promptPay"
  | "debitCard"
  | "creditCard"
  | "autoDebit"
  | "eWallet"
  | "other";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategoryId;
  date: string;
  account: AccountId;
  paymentMethod: PaymentMethodId;
  counterparty: string;
  location: string;
  reference: string;
  note: string;
  tags: string[];
}

export interface NewTransaction {
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategoryId;
  date: string;
  account: AccountId;
  paymentMethod: PaymentMethodId;
  counterparty: string;
  location: string;
  reference: string;
  note: string;
  tags: string[];
}

export interface ParsedTransactionPreview {
  title: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategoryId;
  account: AccountId;
  paymentMethod: PaymentMethodId;
  counterparty: string;
}

export interface MockParsedResult {
  sourceLabel: string;
  confidence: string;
  note: string;
  transactions: ParsedTransactionPreview[];
}

export type UploadSourceType = "spreadsheet" | "pdf" | "image";

export type UploadParseWarning =
  | "manual_review_required"
  | "no_transactions_detected"
  | "rows_skipped";

export interface ParsedUploadTransaction extends NewTransaction {
  balance: number | null;
  sourceRow: number;
}

export interface UploadParseSummary {
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  totalIncome: number;
  totalExpense: number;
}

export interface UploadParseResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  sourceType: UploadSourceType;
  parser: "spreadsheet" | "metadata";
  sheetName: string | null;
  columns: string[];
  skippedRows: number;
  processedAt: string;
  warnings: UploadParseWarning[];
  summary: UploadParseSummary;
  transactions: ParsedUploadTransaction[];
}

export interface UploadImportRecord {
  id: string;
  fileName: string;
  sourceType: UploadSourceType;
  importedAt: string;
  transactionCount: number;
  totalIncome: number;
  totalExpense: number;
  warnings: UploadParseWarning[];
}
