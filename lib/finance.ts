import type { Language } from "@/types/app";
import type {
  AccountId,
  NewTransaction,
  PaymentMethodId,
  Transaction,
  TransactionCategoryId,
  TransactionType
} from "@/types/finance";

interface LabeledOption<T extends string> {
  id: T;
  labels: Record<Language, string>;
}

export const incomeCategories: LabeledOption<TransactionCategoryId>[] = [
  {
    id: "salary",
    labels: { th: "เงินเดือน", en: "Salary", ja: "給与" }
  },
  {
    id: "freelance",
    labels: { th: "ฟรีแลนซ์", en: "Freelance", ja: "フリーランス" }
  },
  {
    id: "investments",
    labels: { th: "การลงทุน", en: "Investments", ja: "投資" }
  },
  {
    id: "refund",
    labels: { th: "เงินคืน", en: "Refund", ja: "返金" }
  },
  {
    id: "gift",
    labels: { th: "ของขวัญ", en: "Gift", ja: "贈与" }
  },
  {
    id: "otherIncome",
    labels: { th: "รายรับอื่น ๆ", en: "Other income", ja: "その他の収入" }
  }
];

export const expenseCategories: LabeledOption<TransactionCategoryId>[] = [
  {
    id: "housing",
    labels: { th: "ที่อยู่อาศัย", en: "Housing", ja: "住居" }
  },
  {
    id: "groceries",
    labels: { th: "ของกินของใช้", en: "Groceries", ja: "食料品" }
  },
  {
    id: "transport",
    labels: { th: "เดินทาง", en: "Transport", ja: "交通" }
  },
  {
    id: "utilities",
    labels: { th: "ค่าสาธารณูปโภค", en: "Utilities", ja: "公共料金" }
  },
  {
    id: "dining",
    labels: { th: "อาหารนอกบ้าน", en: "Dining", ja: "外食" }
  },
  {
    id: "shopping",
    labels: { th: "ช้อปปิ้ง", en: "Shopping", ja: "買い物" }
  },
  {
    id: "health",
    labels: { th: "สุขภาพ", en: "Health", ja: "健康" }
  },
  {
    id: "education",
    labels: { th: "การศึกษา", en: "Education", ja: "教育" }
  },
  {
    id: "entertainment",
    labels: { th: "บันเทิง", en: "Entertainment", ja: "娯楽" }
  },
  {
    id: "family",
    labels: { th: "ครอบครัว", en: "Family", ja: "家族" }
  },
  {
    id: "travel",
    labels: { th: "ท่องเที่ยว", en: "Travel", ja: "旅行" }
  },
  {
    id: "insurance",
    labels: { th: "ประกัน", en: "Insurance", ja: "保険" }
  },
  {
    id: "debt",
    labels: { th: "หนี้สิน", en: "Debt", ja: "債務" }
  },
  {
    id: "otherExpense",
    labels: { th: "รายจ่ายอื่น ๆ", en: "Other expense", ja: "その他の支出" }
  }
];

export const accountOptions: LabeledOption<AccountId>[] = [
  {
    id: "cash",
    labels: { th: "เงินสด", en: "Cash", ja: "現金" }
  },
  {
    id: "bankAccount",
    labels: { th: "บัญชีธนาคาร", en: "Bank account", ja: "銀行口座" }
  },
  {
    id: "savingsAccount",
    labels: { th: "บัญชีออมทรัพย์", en: "Savings account", ja: "貯蓄口座" }
  },
  {
    id: "creditCard",
    labels: { th: "บัตรเครดิต", en: "Credit card", ja: "クレジットカード" }
  },
  {
    id: "eWallet",
    labels: { th: "วอลเล็ต / e-Wallet", en: "E-wallet", ja: "電子ウォレット" }
  },
  {
    id: "investmentAccount",
    labels: { th: "บัญชีลงทุน", en: "Investment account", ja: "投資口座" }
  },
  {
    id: "otherAccount",
    labels: { th: "บัญชีอื่น ๆ", en: "Other account", ja: "その他の口座" }
  }
];

export const paymentMethodOptions: LabeledOption<PaymentMethodId>[] = [
  {
    id: "bankTransfer",
    labels: { th: "โอนผ่านธนาคาร", en: "Bank transfer", ja: "銀行振込" }
  },
  {
    id: "cash",
    labels: { th: "เงินสด", en: "Cash", ja: "現金" }
  },
  {
    id: "promptPay",
    labels: { th: "พร้อมเพย์ / QR", en: "PromptPay / QR", ja: "PromptPay / QR" }
  },
  {
    id: "debitCard",
    labels: { th: "บัตรเดบิต", en: "Debit card", ja: "デビットカード" }
  },
  {
    id: "creditCard",
    labels: { th: "บัตรเครดิต", en: "Credit card", ja: "クレジットカード" }
  },
  {
    id: "autoDebit",
    labels: { th: "หักบัญชีอัตโนมัติ", en: "Auto debit", ja: "自動引き落とし" }
  },
  {
    id: "eWallet",
    labels: { th: "e-Wallet", en: "E-wallet", ja: "電子ウォレット" }
  },
  {
    id: "other",
    labels: { th: "วิธีอื่น ๆ", en: "Other", ja: "その他" }
  }
];

const legacyCategoryIdMap: Record<string, TransactionCategoryId> = {
  Salary: "salary",
  Freelance: "freelance",
  Investments: "investments",
  Refund: "refund",
  Gift: "gift",
  "Other income": "otherIncome",
  Housing: "housing",
  Groceries: "groceries",
  Transport: "transport",
  Utilities: "utilities",
  Dining: "dining",
  Shopping: "shopping",
  Health: "health",
  Education: "education",
  Entertainment: "entertainment",
  Family: "family",
  Travel: "travel",
  Insurance: "insurance",
  Debt: "debt",
  "Other expense": "otherExpense"
};

const legacyAccountIdMap: Record<string, AccountId> = {
  Cash: "cash",
  "Bank account": "bankAccount",
  "Savings account": "savingsAccount",
  "Credit card": "creditCard",
  "E-wallet": "eWallet",
  "Investment account": "investmentAccount",
  "Other account": "otherAccount"
};

const legacyPaymentMethodIdMap: Record<string, PaymentMethodId> = {
  "Bank transfer": "bankTransfer",
  Cash: "cash",
  "PromptPay / QR": "promptPay",
  "Debit card": "debitCard",
  "Credit card": "creditCard",
  "Auto debit": "autoDebit",
  "E-wallet": "eWallet",
  Other: "other"
};

const chartPalette = [
  "#60738A",
  "#4F7A72",
  "#5D78A8",
  "#A07B45",
  "#8A6B8F",
  "#9A6B59"
];

export function getCategoriesForType(type: TransactionType) {
  return type === "income" ? incomeCategories : expenseCategories;
}

function resolveCategoryId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (categoryIds.has(value as TransactionCategoryId)) {
    return value as TransactionCategoryId;
  }

  return legacyCategoryIdMap[value] ?? null;
}

function resolveAccountId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (accountIds.has(value as AccountId)) {
    return value as AccountId;
  }

  return legacyAccountIdMap[value] ?? null;
}

function resolvePaymentMethodId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (paymentMethodIds.has(value as PaymentMethodId)) {
    return value as PaymentMethodId;
  }

  return legacyPaymentMethodIdMap[value] ?? null;
}

export function normalizeCategoryId(
  value: unknown,
  type: TransactionType = "expense"
) {
  return resolveCategoryId(value) ?? (type === "income" ? "otherIncome" : "otherExpense");
}

export function normalizeAccountId(value: unknown) {
  return resolveAccountId(value) ?? "bankAccount";
}

export function normalizePaymentMethodId(
  value: unknown,
  type: TransactionType = "expense"
) {
  return resolvePaymentMethodId(value) ?? (type === "income" ? "bankTransfer" : "promptPay");
}

const categoryLookup = [...incomeCategories, ...expenseCategories].reduce<
  Record<TransactionCategoryId, LabeledOption<TransactionCategoryId>>
>((accumulator, option) => {
  accumulator[option.id] = option;
  return accumulator;
}, {} as Record<TransactionCategoryId, LabeledOption<TransactionCategoryId>>);

const categoryIds = new Set<TransactionCategoryId>(
  Object.keys(categoryLookup) as TransactionCategoryId[]
);

const accountLookup = accountOptions.reduce<Record<AccountId, LabeledOption<AccountId>>>(
  (accumulator, option) => {
    accumulator[option.id] = option;
    return accumulator;
  },
  {} as Record<AccountId, LabeledOption<AccountId>>
);

const accountIds = new Set<AccountId>(
  Object.keys(accountLookup) as AccountId[]
);

const paymentMethodLookup = paymentMethodOptions.reduce<
  Record<PaymentMethodId, LabeledOption<PaymentMethodId>>
>((accumulator, option) => {
  accumulator[option.id] = option;
  return accumulator;
}, {} as Record<PaymentMethodId, LabeledOption<PaymentMethodId>>);

const paymentMethodIds = new Set<PaymentMethodId>(
  Object.keys(paymentMethodLookup) as PaymentMethodId[]
);

const transactionTypeLabels: Record<TransactionType, Record<Language, string>> = {
  income: { th: "รายรับ", en: "Income", ja: "収入" },
  expense: { th: "รายจ่าย", en: "Expense", ja: "支出" }
};

export function getCategoryLabel(
  categoryId: TransactionCategoryId | string,
  language: Language
) {
  const resolved = resolveCategoryId(categoryId);
  return resolved ? categoryLookup[resolved].labels[language] : String(categoryId);
}

export function getAccountLabel(accountId: AccountId | string, language: Language) {
  const resolved = resolveAccountId(accountId);
  return resolved ? accountLookup[resolved].labels[language] : String(accountId);
}

export function getPaymentMethodLabel(
  paymentMethodId: PaymentMethodId | string,
  language: Language
) {
  const resolved = resolvePaymentMethodId(paymentMethodId);
  return resolved
    ? paymentMethodLookup[resolved].labels[language]
    : String(paymentMethodId);
}

export function getTransactionTypeLabel(
  type: TransactionType,
  language: Language
) {
  return transactionTypeLabels[type][language];
}

export function getSummary(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense
  };
}

export function getExpenseChartData(transactions: Transaction[]) {
  const expensesByCategory = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<TransactionCategoryId, number>>((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] ?? 0) + transaction.amount;

      return accumulator;
    }, {} as Record<TransactionCategoryId, number>);

  return Object.entries(expensesByCategory)
    .map(([categoryId, value], index) => ({
      categoryId: categoryId as TransactionCategoryId,
      value,
      color: chartPalette[index % chartPalette.length]
    }))
    .sort((left, right) => right.value - left.value);
}

export function getRecentTransactions(transactions: Transaction[], limit = 6) {
  return [...transactions]
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime()
    )
    .slice(0, limit);
}

export function buildStarterTransactions(language: Language): NewTransaction[] {
  return [
    {
      title:
        language === "th"
          ? "เงินเดือนประจำเดือน"
          : language === "ja"
            ? "月次給与"
            : "Monthly salary",
      amount: 52000,
      type: "income",
      category: "salary",
      date: "2026-03-20",
      account: "bankAccount",
      paymentMethod: "bankTransfer",
      counterparty:
        language === "th"
          ? "บริษัทต้นสังกัด"
          : language === "ja"
            ? "勤務先"
            : "Employer",
      location:
        language === "th"
          ? "กรุงเทพฯ"
          : language === "ja"
            ? "バンコク"
            : "Bangkok",
      reference: "PAY-2026-03",
      note:
        language === "th"
          ? "เงินเดือนเข้าและโบนัสค่าครองชีพบางส่วน"
          : language === "ja"
            ? "給与と一部手当の入金"
            : "Salary deposit with partial allowance",
      tags: ["salary", "fixed-income"]
    },
    {
      title:
        language === "th"
          ? "ค่าเช่าคอนโด"
          : language === "ja"
            ? "コンドミニアム家賃"
            : "Condo rent",
      amount: 18500,
      type: "expense",
      category: "housing",
      date: "2026-03-21",
      account: "bankAccount",
      paymentMethod: "bankTransfer",
      counterparty:
        language === "th"
          ? "เจ้าของห้อง"
          : language === "ja"
            ? "大家"
            : "Landlord",
      location:
        language === "th"
          ? "สุขุมวิท"
          : language === "ja"
            ? "スクンビット"
            : "Sukhumvit",
      reference: "RENT-MAR",
      note:
        language === "th"
          ? "ค่าเช่าพร้อมค่าส่วนกลาง"
          : language === "ja"
            ? "管理費込み"
            : "Monthly rent including maintenance",
      tags: ["housing", "fixed-cost"]
    },
    {
      title:
        language === "th"
          ? "ซื้อของเข้าบ้าน"
          : language === "ja"
            ? "食料品のまとめ買い"
            : "Weekly groceries",
      amount: 2680,
      type: "expense",
      category: "groceries",
      date: "2026-03-22",
      account: "eWallet",
      paymentMethod: "promptPay",
      counterparty:
        language === "th"
          ? "ซูเปอร์มาร์เก็ต"
          : language === "ja"
            ? "スーパーマーケット"
            : "Supermarket",
      location:
        language === "th"
          ? "ออนไลน์"
          : language === "ja"
            ? "オンライン"
            : "Online",
      reference: "GRC-2203",
      note:
        language === "th"
          ? "อาหารสด ของใช้ และของจำเป็นประจำสัปดาห์"
          : language === "ja"
            ? "食材と日用品の週次購入"
            : "Fresh food and weekly essentials",
      tags: ["groceries", "family"]
    }
  ];
}
