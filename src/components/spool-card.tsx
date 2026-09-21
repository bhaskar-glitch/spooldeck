import { Link } from "@tanstack/react-router";
import { remainingPct } from "@/lib/filament/math";
import { cn, formatGrams, isLightHex } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Spool } from "@/lib/filament/types";

export function SpoolCard({ spool }: { spool: Spool }) {
  const pct = remainingPct(spool.remainingG, spool.initialG);
  const low = spool.remainingG <= spool.lowG;
  const locationTone =
    spool.location === "loaded" ? "print" : spool.location === "empty" ? "danger" : "neutral";

  return (
    <Link
      to="/spools/$id"
      params={{ id: String(spool.id) }}
      className="flex flex-col rounded-xl border border-line bg-card p-4 transition-[border-color,background-color] duration-150 hover:border-muted"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "size-10 rounded-full border",
              isLightHex(spool.colorHex) ? "border-line" : "border-transparent",
            )}
            style={{ backgroundColor: spool.colorHex }}
          />
          <div>
            <p className="font-medium leading-tight">{spool.colorName}</p>
            <p className="text-sm text-muted">
              {spool.brand} · {spool.material}
            </p>
          </div>
        </div>
        <Badge tone={low && spool.location !== "empty" ? "warn" : locationTone}>
          {spool.location === "loaded" ? "on A1" : spool.location}
        </Badge>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono text-2xl tabular-nums tracking-tight">{formatGrams(spool.remainingG)}</p>
        <p className="text-xs text-subtle">{Math.round(pct)}% of {spool.initialG} g</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: low ? "var(--color-warn)" : spool.colorHex,
          }}
        />
      </div>
    </Link>
  );
}
