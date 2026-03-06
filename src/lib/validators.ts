import { z } from "zod";

export const statusSchema = z.enum(["PENDIENTE", "LIQUIDADO"]);

export const createMonthSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const incomeSchema = z.object({
  source: z.string().trim().min(1),
  amount: z.number().min(0),
});

export const fixedExpenseSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().min(0),
  status: statusSchema.default("PENDIENTE"),
});

export const variableExpenseSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().min(0),
  status: statusSchema.default("PENDIENTE"),
  category: z.string().trim().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
});

export const debtSchema = z.object({
  name: z.string().trim().min(1),
  initialTotal: z.number().min(0),
  remainingTotal: z.number().min(0),
  monthlyFee: z.number().min(0),
  status: statusSchema.default("PENDIENTE"),
  isPaid: z.boolean().optional(),
});

export const updateIncomeSchema = incomeSchema.partial();
export const updateFixedExpenseSchema = fixedExpenseSchema.partial();
export const updateVariableExpenseSchema = variableExpenseSchema.partial();
export const updateDebtSchema = debtSchema.partial();
