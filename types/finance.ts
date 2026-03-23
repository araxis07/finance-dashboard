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
