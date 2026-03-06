import { NextResponse } from "next/server";
import { ZodType } from "zod";

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const raw = await req.json();
  return schema.parse(raw);
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
