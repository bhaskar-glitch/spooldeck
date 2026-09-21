import { Radio, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PrinterSnapshot } from "@/lib/filament/types";
import { cn } from "@/lib/utils";

function stateLabel(state: PrinterSnapshot["state"]) {
  if (state === "running" || state === "prepare") return "printing";
  if (state === "paused") return "paused";
  if (state === "finish") return "finished";
  if (state === "failed") return "failed";
  return "idle";
}

function stateTone(state: PrinterSnapshot["state"]) {
  if (state === "running" || state === "prepare") return "print" as const;
  if (state === "finish") return "ok" as const;
  if (state === "failed") return "danger" as const;
  if (state === "paused") return "warn" as const;
  return "neutral" as const;
}

export function PrinterPanel({
  printer,
  onOpenLink,
}: {
  printer: PrinterSnapshot;
  onOpenLink: () => void;
}) {
  const live = printer.state === "running" || printer.state === "prepare";
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">A1 link</p>
          <h2 className="mt-1 text-lg font-semibold">{printer.deviceName}</h2>
          <p className="text-xs text-muted">
            {printer.source === "cloud"
              ? "Bambu Cloud"
              : printer.source === "lan"
                ? "LAN MQTT"
                : "Live demo"}{" "}
            · external holder
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLink}
          className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg"
        >
          {printer.online ? (
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex size-full rounded-full opacity-60",
                  live ? "animate-ping bg-ok" : "bg-ok",
                )}
              />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
          ) : (
            <Wifi className="size-3.5" />
          )}
          {printer.online ? "online" : "offline"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge tone={stateTone(printer.state)}>{stateLabel(printer.state)}</Badge>
        {live && (
          <span className="font-mono text-sm tabular-nums text-muted" suppressHydrationWarning>
            {printer.percent}%
          </span>
        )}
        {printer.slicerG > 0 && live && (
          <span className="text-xs text-subtle">Studio {printer.slicerG} g</span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div>
          <dt className="text-xs text-subtle">Nozzle</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums" suppressHydrationWarning>
            {Math.round(printer.nozzle)}
            {printer.nozzleTarget ? `/${Math.round(printer.nozzleTarget)}` : ""}
            <span className="text-subtle">°</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Bed</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums" suppressHydrationWarning>
            {Math.round(printer.bed)}
            {printer.bedTarget ? `/${Math.round(printer.bedTarget)}` : ""}
            <span className="text-subtle">°</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Layer</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums" suppressHydrationWarning>
            {printer.layers ? `${printer.layer}/${printer.layers}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Speed</dt>
          <dd className="mt-1 text-sm tabular-nums text-muted" suppressHydrationWarning>
            {printer.speed === 1 ? "Silent" : printer.speed === 2 ? "Normal" : printer.speed === 3 ? "Sport" : printer.speed === 4 ? "Ludicrous" : "—"}
          </dd>
        </div>
      </dl>

      {(printer.trayType || printer.jobTitle) && (
        <p className="mt-4 text-sm text-muted" suppressHydrationWarning>
          {printer.trayType ? `External tray ${printer.trayType}` : "External tray"}
          {printer.jobTitle ? ` · ${printer.jobTitle}` : ""}
          {printer.remainingMin > 0 ? ` · ${printer.remainingMin} min left` : ""}
        </p>
      )}

      {printer.error && <p className="mt-3 text-sm text-danger">{printer.error}</p>}

      <button
        type="button"
        onClick={onOpenLink}
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-subtle hover:text-fg"
      >
        <Radio className="size-3.5" />
        Printer connection
      </button>
    </section>
  );
}