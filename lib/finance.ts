import type { Transaction, TransactionType } from "@/types/finance";

export const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Refund",
  "Other income"
];

export const expenseCategories = [
  "Housing",
  "Groceries",
  "Transport",
  "Utilities",
  "Dining",
  "Shopping",
  "Health",
  "Entertainment",
  "Other expense"
];

const chartPalette = [
  "#2563EB",
  "#14B8A6",
  "#F59E0B",
  "#8B5CF6",
  "#F97316",
  "#0EA5E9"
];

export function getCategoriesForType(type: TransactionType) {
  return type === "income" ? incomeCategories : expenseCategories;
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
    .reduce<Record<string, number>>((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] ?? 0) + transaction.amount;

      return accumulator;
    }, {});

  return Object.entries(expensesByCategory)
    .map(([name, value], index) => ({
      name,
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
