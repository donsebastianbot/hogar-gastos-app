import { clsx } from "clsx";
import type { PaymentStatus } from "@/types/finance";

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={clsx(
        "status-pill",
        status === "LIQUIDADO"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      )}
    >
      {status === "LIQUIDADO" ? "Liquidado" : "Pendiente"}
    </span>
  );
}
