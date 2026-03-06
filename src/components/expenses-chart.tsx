"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ExpensesChart({
  fixed,
  variable,
  debtMonthly,
}: {
  fixed: number;
  variable: number;
  debtMonthly: number;
}) {
  const data = [
    { name: "Fijos", value: fixed, color: "#6366f1" },
    { name: "Variables", value: variable, color: "#f59e0b" },
    { name: "Cuotas deuda", value: debtMonthly, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No hay gastos para graficar.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} innerRadius={45}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(2)} €`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
