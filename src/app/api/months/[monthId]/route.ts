import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/http";
import { getMonthById } from "@/lib/month-service";

export async function GET(_: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;
  const month = await getMonthById(monthId);
  if (!month) return fail("Mes no encontrado", 404);
  return ok({ month });
}

export async function DELETE(_: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  const exists = await prisma.month.findUnique({ where: { id: monthId }, select: { id: true } });
  if (!exists) return fail("Mes no encontrado", 404);

  await prisma.month.delete({ where: { id: monthId } });
  return ok({ success: true });
}
