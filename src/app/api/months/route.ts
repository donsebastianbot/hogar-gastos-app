import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createMonthSchema } from "@/lib/validators";
import { listMonths } from "@/lib/month-service";
import { fail, ok, parseBody } from "@/lib/http";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  if (yearParam && (!Number.isFinite(year) || !Number.isInteger(year))) {
    return fail("Parámetro year inválido", 400);
  }

  const months = await listMonths(year);
  return ok({ months });
}

export async function POST(req: Request) {
  try {
    const payload = await parseBody(req, createMonthSchema);

    const existing = await prisma.month.findUnique({
      where: {
        year_month: {
          year: payload.year,
          month: payload.month,
        },
      },
    });

    if (existing) {
      return fail("Ese mes ya existe", 409);
    }

    const month = await prisma.month.create({
      data: {
        year: payload.year,
        month: payload.month,
      },
    });

    return ok({ month }, 201);
  } catch (error) {
    if (error instanceof ZodError) return fail(error.issues[0]?.message || "Datos inválidos", 400);
    return fail("No se pudo crear el mes", 500);
  }
}
