"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { MonthRecord } from "@/types/finance";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function BalanceHistoryChart({ months }: { months: MonthRecord[] }) {
  const data = months.map((m) => ({
    name: `${MONTHS[m.month - 1]} ${m.year}`,
    balance: m.summary.finalBalance,
    pendiente: m.summary.totalPendingMonth,
  }));

  if (data.length < 2) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Añade más meses para ver evolución.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#33415566" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(2)} €`} />
          <Line type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} name="Balance" />
          <Line type="monotone" dataKey="pendiente" stroke="#f59e0b" strokeWidth={2} name="Pendiente" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
