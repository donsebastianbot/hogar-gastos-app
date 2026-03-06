"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Copy, FileDown, Printer, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatusBadge } from "@/components/status-badge";
import { ExpensesChart } from "@/components/expenses-chart";
import { BalanceHistoryChart } from "@/components/balance-history-chart";
import type { MonthRecord, PaymentStatus } from "@/types/finance";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function money(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}

type ApiResponse = {
  months: MonthRecord[];
  error?: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error || "Error de API");
  return data;
}

export default function Home() {
  const [months, setMonths] = useState<MonthRecord[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [newMonth, setNewMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [incomeForm, setIncomeForm] = useState({ source: "", amount: "" });
  const [fixedForm, setFixedForm] = useState({ name: "", amount: "", status: "PENDIENTE" as PaymentStatus });
  const [variableForm, setVariableForm] = useState({
    name: "",
    amount: "",
    status: "PENDIENTE" as PaymentStatus,
    category: "",
    date: "",
  });
  const [debtForm, setDebtForm] = useState({
    name: "",
    initialTotal: "",
    remainingTotal: "",
    monthlyFee: "",
    status: "PENDIENTE" as PaymentStatus,
  });

  const selectedMonth = useMemo(
    () => months.find((m) => m.id === selectedMonthId) || null,
    [months, selectedMonthId],
  );

  const monthlyCategories = useMemo(() => {
    if (!selectedMonth) return [];
    return Array.from(
      new Set(selectedMonth.variableExpenses.map((v) => v.category).filter((x): x is string => Boolean(x))),
    );
  }, [selectedMonth]);

  const loadMonths = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<ApiResponse>("/api/months");
      setMonths(data.months);
      setError("");

      if (!selectedMonthId && data.months.length) {
        setSelectedMonthId(data.months[data.months.length - 1].id);
      } else if (selectedMonthId && !data.months.some((m) => m.id === selectedMonthId)) {
        setSelectedMonthId(data.months[data.months.length - 1]?.id || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando meses");
    } finally {
      setLoading(false);
    }
  }, [selectedMonthId]);

  useEffect(() => {
    loadMonths();
  }, [loadMonths]);

  const filteredFixed = useMemo(() => {
    if (!selectedMonth) return [];
    return selectedMonth.fixedExpenses.filter((e) => {
      const statusOk = statusFilter === "ALL" || e.status === statusFilter;
      const searchOk = e.name.toLowerCase().includes(search.toLowerCase());
      return statusOk && searchOk;
    });
  }, [selectedMonth, statusFilter, search]);

  const filteredVariable = useMemo(() => {
    if (!selectedMonth) return [];
    return selectedMonth.variableExpenses.filter((e) => {
      const statusOk = statusFilter === "ALL" || e.status === statusFilter;
      const categoryOk = categoryFilter === "ALL" || (e.category || "") === categoryFilter;
      const searchOk = `${e.name} ${e.category || ""}`.toLowerCase().includes(search.toLowerCase());
      return statusOk && categoryOk && searchOk;
    });
  }, [selectedMonth, statusFilter, categoryFilter, search]);

  const pendingCount = useMemo(() => {
    if (!selectedMonth) return 0;
    return (
      selectedMonth.fixedExpenses.filter((x) => x.status === "PENDIENTE").length +
      selectedMonth.variableExpenses.filter((x) => x.status === "PENDIENTE").length +
      selectedMonth.debts.filter((x) => x.status === "PENDIENTE").length
    );
  }, [selectedMonth]);

  async function createMonth() {
    await api("/api/months", {
      method: "POST",
      body: JSON.stringify({ year: Number(newMonth.year), month: Number(newMonth.month) }),
    });
    await loadMonths();
  }

  async function duplicateMonth() {
    if (!selectedMonth) return;
    await api(`/api/months/${selectedMonth.id}/duplicate`, { method: "POST" });
    await loadMonths();
  }

  async function addIncome() {
    if (!selectedMonth) return;
    await api(`/api/months/${selectedMonth.id}/incomes`, {
      method: "POST",
      body: JSON.stringify({ source: incomeForm.source, amount: Number(incomeForm.amount) }),
    });
    setIncomeForm({ source: "", amount: "" });
    await loadMonths();
  }

  async function addFixedExpense() {
    if (!selectedMonth) return;
    await api(`/api/months/${selectedMonth.id}/fixed-expenses`, {
      method: "POST",
      body: JSON.stringify({ ...fixedForm, amount: Number(fixedForm.amount) }),
    });
    setFixedForm({ name: "", amount: "", status: "PENDIENTE" });
    await loadMonths();
  }

  async function addVariableExpense() {
    if (!selectedMonth) return;
    await api(`/api/months/${selectedMonth.id}/variable-expenses`, {
      method: "POST",
      body: JSON.stringify({
        ...variableForm,
        amount: Number(variableForm.amount),
        category: variableForm.category || null,
        date: variableForm.date ? new Date(variableForm.date).toISOString() : null,
      }),
    });
    setVariableForm({ name: "", amount: "", status: "PENDIENTE", category: "", date: "" });
    await loadMonths();
  }

  async function addDebt() {
    if (!selectedMonth) return;
    await api(`/api/months/${selectedMonth.id}/debts`, {
      method: "POST",
      body: JSON.stringify({
        ...debtForm,
        initialTotal: Number(debtForm.initialTotal),
        remainingTotal: Number(debtForm.remainingTotal),
        monthlyFee: Number(debtForm.monthlyFee),
      }),
    });
    setDebtForm({ name: "", initialTotal: "", remainingTotal: "", monthlyFee: "", status: "PENDIENTE" });
    await loadMonths();
  }

  async function updateItem(type: "income" | "fixed" | "variable" | "debt", id: string, patch: Record<string, unknown>) {
    const map: Record<typeof type, string> = {
      income: `/api/incomes/${id}`,
      fixed: `/api/fixed-expenses/${id}`,
      variable: `/api/variable-expenses/${id}`,
      debt: `/api/debts/${id}`,
    };

    await api(map[type], {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    await loadMonths();
  }

  async function deleteItem(type: "income" | "fixed" | "variable" | "debt", id: string) {
    if (!confirm("¿Seguro que quieres borrar este registro?")) return;

    const map: Record<typeof type, string> = {
      income: `/api/incomes/${id}`,
      fixed: `/api/fixed-expenses/${id}`,
      variable: `/api/variable-expenses/${id}`,
      debt: `/api/debts/${id}`,
    };

    await api(map[type], { method: "DELETE" });
    await loadMonths();
  }

  const selectedIndex = months.findIndex((m) => m.id === selectedMonthId);
  const previousMonthId = selectedIndex > 0 ? months[selectedIndex - 1].id : "";
  const nextMonthId = selectedIndex >= 0 && selectedIndex < months.length - 1 ? months[selectedIndex + 1].id : "";

  const debtMonthlyPending = selectedMonth
    ? selectedMonth.debts
        .filter((d) => d.status === "PENDIENTE")
        .reduce((acc, d) => acc + Math.min(d.monthlyFee, d.remainingTotal), 0)
    : 0;

  return (
    <main className="mx-auto w-[min(1280px,95%)] space-y-5 py-6">
      <header className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Control de Gastos del Hogar</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Gestiona ingresos, gastos y deudas mes a mes con balance automático.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> PDF
          </button>
          {selectedMonth && (
            <a className="btn-secondary" href={`/api/months/${selectedMonth.id}/export/csv`}>
              <FileDown size={16} /> CSV
            </a>
          )}
        </div>
      </header>

      <section className="card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-2">
            <label className="field">
              Año
              <input
                type="number"
                min={2000}
                max={2100}
                value={newMonth.year}
                onChange={(e) => setNewMonth((s) => ({ ...s, year: Number(e.target.value) }))}
              />
            </label>
            <label className="field">
              Mes
              <select
                value={newMonth.month}
                onChange={(e) => setNewMonth((s) => ({ ...s, month: Number(e.target.value) }))}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-primary" onClick={createMonth}>
              <Plus size={16} /> Crear mes
            </button>
            <button className="btn-secondary" onClick={duplicateMonth} disabled={!selectedMonth}>
              <Copy size={16} /> Duplicar mes
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-secondary" disabled={!previousMonthId} onClick={() => setSelectedMonthId(previousMonthId)}>
              ← Mes anterior
            </button>
            <select className="input" value={selectedMonthId} onChange={(e) => setSelectedMonthId(e.target.value)}>
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {MONTH_NAMES[m.month - 1]} {m.year}
                </option>
              ))}
            </select>
            <button className="btn-secondary" disabled={!nextMonthId} onClick={() => setSelectedMonthId(nextMonthId)}>
              Mes siguiente →
            </button>
          </div>
        </div>

        {loading && <p>Cargando…</p>}
        {error && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      </section>

      {selectedMonth && (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard title="Ingresos" value={money(selectedMonth.summary.totalIncome)} tone="emerald" />
            <SummaryCard title="Gasto total" value={money(selectedMonth.summary.totalExpenses)} tone="rose" />
            <SummaryCard title="Otros gastos" value={money(selectedMonth.summary.totalVariableExpenses)} tone="amber" />
            <SummaryCard title="Pendiente mes" value={money(selectedMonth.summary.totalPendingMonth)} tone="violet" />
            <SummaryCard
              title="Balance"
              value={money(selectedMonth.summary.finalBalance)}
              tone={selectedMonth.summary.finalBalance >= 0 ? "emerald" : "rose"}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-semibold">Reparto de gastos del mes</h2>
              <ExpensesChart
                fixed={selectedMonth.summary.totalFixedExpenses}
                variable={selectedMonth.summary.totalVariableExpenses}
                debtMonthly={debtMonthlyPending}
              />
            </div>
            <div className="card">
              <h2 className="text-lg font-semibold">Evolución mensual del balance</h2>
              <BalanceHistoryChart months={months} />
            </div>
          </section>

          <section className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Filtros y búsqueda</h2>
              <div className="flex flex-wrap items-center gap-2">
                <label className="field-inline">
                  <Search size={14} />
                  <input
                    className="input"
                    placeholder="Buscar gasto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "ALL" | PaymentStatus)}>
                  <option value="ALL">Todos</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="LIQUIDADO">Liquidados</option>
                </select>
                <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="ALL">Todas categorías</option>
                  {monthlyCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Pendientes actuales: {pendingCount}</p>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Ingresos</h2>
              <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                <input className="input" placeholder="Fuente" value={incomeForm.source} onChange={(e) => setIncomeForm((s) => ({ ...s, source: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Importe" value={incomeForm.amount} onChange={(e) => setIncomeForm((s) => ({ ...s, amount: e.target.value }))} />
                <button className="btn-primary" onClick={addIncome}>Añadir</button>
              </div>

              <SimpleTable
                columns={["Fuente", "Importe", "Acciones"]}
                rows={selectedMonth.incomes.map((i) => [
                  i.source,
                  money(i.amount),
                  <div key={i.id} className="flex gap-2">
                    <button className="btn-mini" onClick={() => {
                      const source = prompt("Fuente", i.source);
                      const amount = prompt("Importe", String(i.amount));
                      if (source && amount) updateItem("income", i.id, { source, amount: Number(amount) });
                    }}>Editar</button>
                    <button className="btn-mini-danger" onClick={() => deleteItem("income", i.id)}><Trash2 size={14} /></button>
                  </div>,
                ])}
                footer={`Total ingresos: ${money(selectedMonth.summary.totalIncome)}`}
              />
            </div>

            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Gastos fijos</h2>
              <div className="grid gap-2 md:grid-cols-[1fr_120px_130px_auto]">
                <input className="input" placeholder="Nombre" value={fixedForm.name} onChange={(e) => setFixedForm((s) => ({ ...s, name: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Importe" value={fixedForm.amount} onChange={(e) => setFixedForm((s) => ({ ...s, amount: e.target.value }))} />
                <select className="input" value={fixedForm.status} onChange={(e) => setFixedForm((s) => ({ ...s, status: e.target.value as PaymentStatus }))}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="LIQUIDADO">Liquidado</option>
                </select>
                <button className="btn-primary" onClick={addFixedExpense}>Añadir</button>
              </div>

              <SimpleTable
                columns={["Gasto", "Importe", "Estado", "Acciones"]}
                rows={filteredFixed.map((f) => [
                  f.name,
                  money(f.amount),
                  <StatusBadge key={`status-${f.id}`} status={f.status} />,
                  <div key={f.id} className="flex gap-2">
                    <button className="btn-mini" onClick={() => updateItem("fixed", f.id, { status: f.status === "PENDIENTE" ? "LIQUIDADO" : "PENDIENTE" })}>
                      Toggle
                    </button>
                    <button className="btn-mini-danger" onClick={() => deleteItem("fixed", f.id)}><Trash2 size={14} /></button>
                  </div>,
                ])}
                footer={`Total fijos: ${money(selectedMonth.summary.totalFixedExpenses)}`}
              />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Otros gastos variables</h2>
              <div className="grid gap-2 md:grid-cols-2">
                <input className="input" placeholder="Nombre" value={variableForm.name} onChange={(e) => setVariableForm((s) => ({ ...s, name: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Importe" value={variableForm.amount} onChange={(e) => setVariableForm((s) => ({ ...s, amount: e.target.value }))} />
                <input className="input" placeholder="Categoría (opcional)" value={variableForm.category} onChange={(e) => setVariableForm((s) => ({ ...s, category: e.target.value }))} />
                <input className="input" type="date" value={variableForm.date} onChange={(e) => setVariableForm((s) => ({ ...s, date: e.target.value }))} />
                <select className="input" value={variableForm.status} onChange={(e) => setVariableForm((s) => ({ ...s, status: e.target.value as PaymentStatus }))}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="LIQUIDADO">Liquidado</option>
                </select>
                <button className="btn-primary" onClick={addVariableExpense}>Añadir</button>
              </div>

              <SimpleTable
                columns={["Nombre", "Importe", "Estado", "Categoría", "Fecha", "Acciones"]}
                rows={filteredVariable.map((v) => [
                  v.name,
                  money(v.amount),
                  <StatusBadge key={`status-${v.id}`} status={v.status} />,
                  v.category || "—",
                  v.date ? new Date(v.date).toLocaleDateString("es-ES") : "—",
                  <div key={v.id} className="flex gap-2">
                    <button className="btn-mini" onClick={() => updateItem("variable", v.id, { status: v.status === "PENDIENTE" ? "LIQUIDADO" : "PENDIENTE" })}>Toggle</button>
                    <button className="btn-mini-danger" onClick={() => deleteItem("variable", v.id)}><Trash2 size={14} /></button>
                  </div>,
                ])}
                footer={`Total variables: ${money(selectedMonth.summary.totalVariableExpenses)}`}
              />
            </div>

            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Deudas / Préstamos</h2>
              <div className="grid gap-2 md:grid-cols-2">
                <input className="input" placeholder="Nombre" value={debtForm.name} onChange={(e) => setDebtForm((s) => ({ ...s, name: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Importe inicial" value={debtForm.initialTotal} onChange={(e) => setDebtForm((s) => ({ ...s, initialTotal: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Pendiente" value={debtForm.remainingTotal} onChange={(e) => setDebtForm((s) => ({ ...s, remainingTotal: e.target.value }))} />
                <input className="input" type="number" min={0} step="0.01" placeholder="Cuota mensual" value={debtForm.monthlyFee} onChange={(e) => setDebtForm((s) => ({ ...s, monthlyFee: e.target.value }))} />
                <select className="input" value={debtForm.status} onChange={(e) => setDebtForm((s) => ({ ...s, status: e.target.value as PaymentStatus }))}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="LIQUIDADO">Liquidado</option>
                </select>
                <button className="btn-primary" onClick={addDebt}>Añadir deuda</button>
              </div>

              <SimpleTable
                columns={["Nombre", "Inicial", "Pendiente", "Cuota", "Estado", "Acciones"]}
                rows={selectedMonth.debts
                  .filter((d) => {
                    const statusOk = statusFilter === "ALL" || d.status === statusFilter;
                    const searchOk = d.name.toLowerCase().includes(search.toLowerCase());
                    return statusOk && searchOk;
                  })
                  .map((d) => [
                    d.name,
                    money(d.initialTotal),
                    money(d.remainingTotal),
                    money(d.monthlyFee),
                    <StatusBadge key={`status-${d.id}`} status={d.status} />,
                    <div key={d.id} className="flex flex-wrap gap-2">
                      <button
                        className="btn-mini"
                        onClick={() =>
                          updateItem("debt", d.id, {
                            isPaid: !d.isPaid,
                            status: !d.isPaid ? "LIQUIDADO" : "PENDIENTE",
                          })
                        }
                      >
                        {d.isPaid ? "Marcar pendiente" : "Marcar cuota pagada"}
                      </button>
                      <button className="btn-mini-danger" onClick={() => deleteItem("debt", d.id)}><Trash2 size={14} /></button>
                    </div>,
                  ])}
                footer={`Pendiente acumulado de deudas: ${money(selectedMonth.summary.totalDebtRemaining)}`}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "emerald" | "rose" | "amber" | "violet";
}) {
  const colorMap = {
    emerald: "text-emerald-600 dark:text-emerald-300",
    rose: "text-rose-600 dark:text-rose-300",
    amber: "text-amber-600 dark:text-amber-300",
    violet: "text-violet-600 dark:text-violet-300",
  };

  return (
    <article className="card">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${colorMap[tone]}`}>{value}</p>
    </article>
  );
}

function SimpleTable({
  columns,
  rows,
  footer,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  footer?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800/70">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-3 text-center text-slate-500">
                Sin datos
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
              {row.map((cell, i) => (
                <td key={i} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div className="bg-slate-50 px-3 py-2 text-sm font-semibold dark:bg-slate-900/60">{footer}</div>}
    </div>
  );
}
