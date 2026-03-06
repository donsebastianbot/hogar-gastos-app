import { prisma } from "@/lib/prisma";
import { monthInclude } from "@/lib/month-service";
import { monthSummary } from "@/lib/calc";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(_: Request, context: { params: Promise<{ monthId: string }> }) {
  const { monthId } = await context.params;

  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: monthInclude,
  });

  if (!month) {
    return new Response("Mes no encontrado", { status: 404 });
  }

  const summary = monthSummary(month);
  const rows: Array<Array<string | number | null | undefined>> = [];

  rows.push(["Tipo", "Nombre/Fuente", "Importe", "Estado", "Categoría", "Fecha"]);

  for (const i of month.incomes) {
    rows.push(["Ingreso", i.source, i.amount, "", "", i.createdAt.toISOString()]);
  }
  for (const f of month.fixedExpenses) {
    rows.push(["Gasto fijo", f.name, f.amount, f.status, "", ""]);
  }
  for (const v of month.variableExpenses) {
    rows.push(["Gasto variable", v.name, v.amount, v.status, v.category || "", v.date?.toISOString() || ""]);
  }
  for (const d of month.debts) {
    rows.push(["Deuda", d.name, d.monthlyFee, d.status, `Pendiente total: ${d.remainingTotal}`, ""]);
  }

  rows.push([]);
  rows.push(["Resumen", "", "", "", "", ""]);
  rows.push(["Ingresos", summary.totalIncome]);
  rows.push(["Gastos fijos", summary.totalFixedExpenses]);
  rows.push(["Otros gastos", summary.totalVariableExpenses]);
  rows.push(["Total gastado", summary.totalExpenses]);
  rows.push(["Balance final", summary.finalBalance]);
  rows.push(["Pendiente del mes", summary.totalPendingMonth]);
  rows.push(["Pendiente de deudas", summary.totalDebtRemaining]);

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=hogar-${month.year}-${String(month.month).padStart(2, "0")}.csv`,
    },
  });
}
