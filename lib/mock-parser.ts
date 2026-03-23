import type { MockParsedResult } from "@/types/finance";

export function buildMockParsedResult(fileName: string): MockParsedResult {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return {
      sourceLabel: "Bank statement detected",
      confidence: "94%",
      note: "Matched a statement-style layout and generated mock line items.",
      transactions: [
        {
          date: "2026-03-22",
          description: "Apartment rent",
          amount: 1650,
          type: "expense",
          category: "Housing"
        },
        {
          date: "2026-03-20",
          description: "Power utility",
          amount: 118,
          type: "expense",
          category: "Utilities"
        },
        {
          date: "2026-03-18",
          description: "Payroll deposit",
          amount: 4200,
          type: "income",
          category: "Salary"
        }
      ]
    };
  }

  if (normalized.endsWith(".xls") || normalized.endsWith(".xlsx")) {
    return {
      sourceLabel: "Spreadsheet import detected",
      confidence: "97%",
      note: "Recognized column headers and mapped values into a transaction preview.",
      transactions: [
        {
          date: "2026-03-21",
          description: "Freelance payout",
          amount: 1200,
          type: "income",
          category: "Freelance"
        },
        {
          date: "2026-03-19",
          description: "Cloud subscriptions",
          amount: 89,
          type: "expense",
          category: "Utilities"
        },
        {
          date: "2026-03-17",
          description: "Team lunch",
          amount: 52,
          type: "expense",
          category: "Dining"
        }
      ]
    };
  }

  return {
    sourceLabel: "Receipt image detected",
    confidence: "91%",
    note: "Used mocked OCR tags to classify visible amounts and merchant names.",
    transactions: [
      {
        date: "2026-03-23",
        description: "Weekly groceries",
        amount: 134,
        type: "expense",
        category: "Groceries"
      },
      {
        date: "2026-03-23",
        description: "Coffee stop",
        amount: 8,
        type: "expense",
        category: "Dining"
      },
      {
        date: "2026-03-22",
        description: "Transit reload",
        amount: 35,
        type: "expense",
        category: "Transport"
      }
    ]
  };
}
