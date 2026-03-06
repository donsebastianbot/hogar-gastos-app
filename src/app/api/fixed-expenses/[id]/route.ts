import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateFixedExpenseSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const payload = await parseBody(req, updateFixedExpenseSchema);

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id },
      data: payload,
    });

    return ok({ fixedExpense });
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo actualizar gasto fijo", 500);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.fixedExpense.delete({ where: { id } });
  return ok({ success: true });
}
