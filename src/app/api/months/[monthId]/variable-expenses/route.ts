import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { variableExpenseSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function POST(req: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  try {
    const payload = await parseBody(req, variableExpenseSchema);

    const month = await prisma.month.findUnique({ where: { id: monthId }, select: { id: true } });
    if (!month) return fail("Mes no encontrado", 404);

    const variableExpense = await prisma.variableExpense.create({
      data: {
        monthId,
        name: payload.name,
        amount: payload.amount,
        status: payload.status,
        category: payload.category || null,
        date: payload.date ? new Date(payload.date) : null,
      },
    });

    return ok({ variableExpense }, 201);
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo crear el gasto variable", 500);
  }
}
