import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/http";

/**
 * Duplica estructura del mes actual al siguiente mes natural.
 * Copia registros y resetea estados a PENDIENTE.
 */
export async function POST(_: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  const source = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      incomes: true,
      debts: true,
      fixedExpenses: true,
      variableExpenses: true,
    },
  });

  if (!source) return fail("Mes de origen no encontrado", 404);

  const nextMonth = source.month === 12 ? 1 : source.month + 1;
  const nextYear = source.month === 12 ? source.year + 1 : source.year;

  const exists = await prisma.month.findUnique({
    where: { year_month: { year: nextYear, month: nextMonth } },
  });

  if (exists) return fail("El mes siguiente ya existe", 409);

  const duplicated = await prisma.month.create({
    data: {
      year: nextYear,
      month: nextMonth,
      incomes: {
        create: source.incomes.map((i) => ({
          source: i.source,
          amount: i.amount,
        })),
      },
      debts: {
        create: source.debts.map((d) => ({
          name: d.name,
          initialTotal: d.initialTotal,
          remainingTotal: d.remainingTotal,
          monthlyFee: d.monthlyFee,
          status: "PENDIENTE",
          isPaid: false,
        })),
      },
      fixedExpenses: {
        create: source.fixedExpenses.map((f) => ({
          name: f.name,
          amount: f.amount,
          status: "PENDIENTE",
        })),
      },
      variableExpenses: {
        create: source.variableExpenses.map((v) => ({
          name: v.name,
          amount: v.amount,
          category: v.category,
          date: null,
          status: "PENDIENTE",
        })),
      },
    },
  });

  return ok({ month: duplicated }, 201);
}
