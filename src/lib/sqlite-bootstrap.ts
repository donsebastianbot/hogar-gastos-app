import fs from "node:fs";
import path from "node:path";

/**
 * En Vercel, SQLite sobre filesystem local no es persistente entre deploys/instancias.
 * Para demo funcional con datos iniciales, copiamos prisma/dev.db a /tmp/dev.db
 * cuando DATABASE_URL apunta a file:/tmp/dev.db.
 */
export function ensureSqliteTmpDatabase() {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("file:/tmp/")) return;

  const target = url.replace("file:", ""); // /tmp/dev.db
  const source = path.join(process.cwd(), "prisma", "dev.db");

  try {
    if (!fs.existsSync(source)) {
      console.warn(`[sqlite-bootstrap] Seed DB not found at ${source}`);
      return;
    }

    if (!fs.existsSync(target)) {
      fs.copyFileSync(source, target);
      console.info(`[sqlite-bootstrap] Copied seed DB to ${target}`);
    }
  } catch (err) {
    console.error("[sqlite-bootstrap] Failed to prepare sqlite db", err);
  }
}
