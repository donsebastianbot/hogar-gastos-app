import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateDebtSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

/**
 * Regla importante:
 * - Si isPaid pasa de false -> true, descuenta una cuota del remainingTotal.
 * - Si isPaid pasa de true -> false, revierte cuota (sin superar initialTotal).
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const payload = await parseBody(req, updateDebtSchema);

    const existing = await prisma.debt.findUnique({ where: { id } });
    if (!existing) return fail("Deuda no encontrada", 404);

    let remainingTotal = payload.remainingTotal ?? existing.remainingTotal;
    let isPaid = payload.isPaid ?? existing.isPaid;

    if (payload.isPaid !== undefined) {
      if (!existing.isPaid && payload.isPaid) {
        remainingTotal = Math.max(0, existing.remainingTotal - existing.monthlyFee);
        isPaid = true;
      } else if (existing.isPaid && !payload.isPaid) {
        remainingTotal = Math.min(existing.initialTotal, existing.remainingTotal + existing.monthlyFee);
        isPaid = false;
      }
    }

    const status = payload.status ?? (isPaid ? "LIQUIDADO" : "PENDIENTE");

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...payload,
        remainingTotal,
        isPaid,
        status,
      },
    });

    return ok({ debt });
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo actualizar deuda", 500);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.debt.delete({ where: { id } });
  return ok({ success: true });
}
