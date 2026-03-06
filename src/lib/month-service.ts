import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { monthSummary } from "@/lib/calc";

export const monthInclude = {
  incomes: { orderBy: { createdAt: "desc" } },
  debts: { orderBy: { createdAt: "asc" } },
  fixedExpenses: { orderBy: { createdAt: "asc" } },
  variableExpenses: { orderBy: [{ date: "desc" }, { createdAt: "desc" }] },
} satisfies Prisma.MonthInclude;

export async function getMonthById(id: string) {
  const month = await prisma.month.findUnique({
    where: { id },
    include: monthInclude,
  });

  if (!month) return null;

  return {
    ...month,
    summary: monthSummary(month),
  };
}

export async function listMonths(year?: number) {
  const months = await prisma.month.findMany({
    where: year ? { year } : undefined,
    include: monthInclude,
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return months.map((m) => ({
    ...m,
    summary: monthSummary(m),
  }));
}
