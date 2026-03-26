"use client";

import { useFinanceStore } from "@/stores/use-finance-store";
import { TransactionModal } from "./transaction-modal";

export function AddTransactionModal() {
  const isOpen = useFinanceStore((state) => state.isAddTransactionOpen);
  const closeAddTransaction = useFinanceStore((state) => state.closeAddTransaction);

  return (
    <TransactionModal
      isOpen={isOpen}
      mode="create"
      onClose={closeAddTransaction}
    />
  );
}
