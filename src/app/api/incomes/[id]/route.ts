import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateIncomeSchema } from "@/lib/validators";
import { fail, ok, parseBody } from "@/lib/http";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const payload = await parseBody(req, updateIncomeSchema);

    const updated = await prisma.income.update({
      where: { id },
      data: payload,
    });

    return ok({ income: updated });
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo actualizar ingreso", 500);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.income.delete({ where: { id } });
  return ok({ success: true });
}
