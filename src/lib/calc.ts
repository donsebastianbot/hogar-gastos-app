import type { Debt, FixedExpense, Income, Month, VariableExpense } from "@prisma/client";

export type MonthWithRelations = Month & {
  incomes: Income[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
};

const sum = (values: number[]) => values.reduce((acc, n) => acc + n, 0);

export function monthSummary(month: MonthWithRelations) {
  const totalIncome = sum(month.incomes.map((i) => i.amount));
  const totalFixedExpenses = sum(month.fixedExpenses.map((e) => e.amount));
  const totalVariableExpenses = sum(month.variableExpenses.map((e) => e.amount));
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const finalBalance = totalIncome - totalExpenses;

  const pendingFromFixed = sum(
    month.fixedExpenses.filter((e) => e.status === "PENDIENTE").map((e) => e.amount),
  );
  const pendingFromVariable = sum(
    month.variableExpenses.filter((e) => e.status === "PENDIENTE").map((e) => e.amount),
  );
  const pendingFromDebts = sum(
    month.debts
      .filter((d) => d.status === "PENDIENTE")
      .map((d) => Math.min(d.monthlyFee, Math.max(0, d.remainingTotal))),
  );

  const totalPendingMonth = pendingFromFixed + pendingFromVariable + pendingFromDebts;
  const totalDebtRemaining = sum(month.debts.map((d) => Math.max(0, d.remainingTotal)));

  return {
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    finalBalance,
    totalPendingMonth,
    totalDebtRemaining,
  };
}

export function isValidMoney(value: number) {
  return Number.isFinite(value) && value >= 0;
}

export function toMoney(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export function moneyFormat(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
