import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateVariableExpenseSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const payload = await parseBody(req, updateVariableExpenseSchema);

    const variableExpense = await prisma.variableExpense.update({
      where: { id },
      data: {
        ...payload,
        date: payload.date ? new Date(payload.date) : payload.date === null ? null : undefined,
      },
    });

    return ok({ variableExpense });
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo actualizar gasto variable", 500);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.variableExpense.delete({ where: { id } });
  return ok({ success: true });
}
