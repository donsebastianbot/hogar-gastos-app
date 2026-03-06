import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function POST(req: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  try {
    const payload = await parseBody(req, incomeSchema);

    const month = await prisma.month.findUnique({ where: { id: monthId }, select: { id: true } });
    if (!month) return fail("Mes no encontrado", 404);

    const income = await prisma.income.create({
      data: {
        monthId,
        source: payload.source,
        amount: payload.amount,
      },
    });

    return ok({ income }, 201);
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo crear el ingreso", 500);
  }
}
