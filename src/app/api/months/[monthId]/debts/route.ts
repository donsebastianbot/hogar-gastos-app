import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { debtSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function POST(req: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  try {
    const payload = await parseBody(req, debtSchema);

    const month = await prisma.month.findUnique({ where: { id: monthId }, select: { id: true } });
    if (!month) return fail("Mes no encontrado", 404);

    const debt = await prisma.debt.create({
      data: {
        monthId,
        name: payload.name,
        initialTotal: payload.initialTotal,
        remainingTotal: payload.remainingTotal,
        monthlyFee: payload.monthlyFee,
        status: payload.status,
        isPaid: payload.isPaid ?? false,
      },
    });

    return ok({ debt }, 201);
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo crear la deuda", 500);
  }
}
