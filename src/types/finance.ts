export type PaymentStatus = "PENDIENTE" | "LIQUIDADO";

export type Income = {
  id: string;
  source: string;
  amount: number;
  createdAt: string;
};

export type Debt = {
  id: string;
  name: string;
  initialTotal: number;
  remainingTotal: number;
  monthlyFee: number;
  status: PaymentStatus;
  isPaid: boolean;
};

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  status: PaymentStatus;
};

export type VariableExpense = {
  id: string;
  name: string;
  amount: number;
  status: PaymentStatus;
  category?: string | null;
  date?: string | null;
};

export type MonthSummary = {
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalExpenses: number;
  finalBalance: number;
  totalPendingMonth: number;
  totalDebtRemaining: number;
};

export type MonthRecord = {
  id: string;
  year: number;
  month: number;
  incomes: Income[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  summary: MonthSummary;
};
