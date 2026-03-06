import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { fixedExpenseSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function POST(req: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  try {
    const payload = await parseBody(req, fixedExpenseSchema);

    const month = await prisma.month.findUnique({ where: { id: monthId }, select: { id: true } });
    if (!month) return fail("Mes no encontrado", 404);

    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        monthId,
        name: payload.name,
        amount: payload.amount,
        status: payload.status,
      },
    });

    return ok({ fixedExpense }, 201);
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo crear el gasto fijo", 500);
  }
}
