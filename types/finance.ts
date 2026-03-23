export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface NewTransaction {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface ParsedTransactionPreview {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface MockParsedResult {
  sourceLabel: string;
  confidence: string;
  note: string;
  transactions: ParsedTransactionPreview[];
}
