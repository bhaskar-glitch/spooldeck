import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  CircleAlert,
  Pause,
  Play,
  Radio,
  Scale,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { demoSendPrint, getDashboard, syncA1, unloadSpool } from "@/lib/filament/actions";
import {
  LAN_CODE_KEY,
  LAN_HOST_KEY,
  LAN_SERIAL_KEY,
  LINK_MODE_KEY,
  REGION_KEY,
  TOKEN_KEY,
} from "@/lib/filament/link-keys";
import { metersFromGrams, remainingPct } from "@/lib/filament/math";
import { queryClient } from "@/lib/query-client";
import { formatGrams, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpoolReel } from "@/components/spool-reel";
import { StartJobDialog, FinishJobDialog } from "@/components/job-dialog";
import { WeighSpoolDialog } from "@/components/weigh-dialog";
import { PrinterPanel } from "@/components/printer-panel";
import type { SyncEvent } from "@/lib/filament/types";

export const Route = createFileRoute("/")({
  loader: () => getDashboard(),
  staleTime: 30_000,
  component: Deck,
});

const DEMO_JOBS = [
  { title: "Benchy", slicerG: 42 },
  { title: "Cable clip ×4", slicerG: 18 },
  { title: "Gridfinity scoop", slicerG: 37 },
];

function announce(events: SyncEvent[], seen: Set<string>) {
  for (const event of events) {
    const key = `${event.type}:${event.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (event.type === "link_error" || event.type === "need_spool") toast.error(event.message);
    else toast.success(event.message);
  }
}

function Deck() {
  const initial = Route.useLoaderData();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    initialData: initial,
    staleTime: Infinity,
  });
  const [startOpen, setStartOpen] = useState(false);
  const [finishMode, setFinishMode] = useState<"finish" | "fail" | null>(null);
  const [weighOpen, setWeighOpen] = useState(false);
  const [live, setLive] = useState(false);
  const [creds, setCreds] = useState<{
    mode: "demo" | "cloud" | "lan";
    token?: string;
    region: "global" | "cn";
    lan?: { host: string; serial: string; accessCode: string };
  }>({
    mode: "demo",
    region: "global",
  });
  const seenEvents = useRef(new Set<string>());

  useEffect(() => {
    const start = window.setTimeout(() => setLive(true), 300);
    function readCreds() {
      const modeRaw = window.localStorage.getItem(LINK_MODE_KEY);
      const token = window.localStorage.getItem(TOKEN_KEY) ?? undefined;
      const region = window.localStorage.getItem(REGION_KEY);
      const host = window.localStorage.getItem(LAN_HOST_KEY) ?? "";
      const serial = window.localStorage.getItem(LAN_SERIAL_KEY) ?? "";
      const accessCode = window.localStorage.getItem(LAN_CODE_KEY) ?? "";
      const mode: "demo" | "cloud" | "lan" =
        modeRaw === "lan" && host && serial && accessCode
          ? "lan"
          : modeRaw === "cloud" || (!modeRaw && token)
            ? "cloud"
            : "demo";
      setCreds({
        mode,
        token,
        region: region === "cn" ? "cn" : "global",
        lan: mode === "lan" ? { host, serial, accessCode } : undefined,
      });
    }
    readCreds();
    window.addEventListener("spooldeck:creds-changed", readCreds);
    return () => {
      window.clearTimeout(start);
      window.removeEventListener("spooldeck:creds-changed", readCreds);
    };
  }, []);

  useQuery({
    queryKey: ["sync-a1", creds.mode, creds.token ? "cloud" : "", creds.region, creds.lan?.host, creds.lan?.serial],
    queryFn: async () => {
      const res = await syncA1({
        data: {
          token: creds.mode === "cloud" ? creds.token : undefined,
          region: creds.region,
          lan: creds.mode === "lan" ? creds.lan : undefined,
        },
      });
      announce(res.events, seenEvents.current);
      queryClient.setQueryData(["dashboard"], res.dashboard);
      if (res.events.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["spools"] });
      }
      return res;
    },
    enabled: live,
    refetchInterval: 4000,
  });

  const unload = useMutation({
    mutationFn: () => unloadSpool(),
    onSuccess: () => {
      toast.success("Spool moved back to the shelf");
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendDemo = useMutation({
    mutationFn: (job: (typeof DEMO_JOBS)[number]) => demoSendPrint({ data: job }),
    onSuccess: (res) => {
      announce(res.events, seenEvents.current);
      queryClient.setQueryData(["dashboard"], res.dashboard);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="h-72 animate-pulse rounded-2xl bg-card" />
        <div className="h-40 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-danger">{error instanceof Error ? error.message : "Could not load deck"}</p>
    );
  }

  const loaded = data.loaded;
  const printing = data.printing;
  const printer = data.printer;
  const pct = loaded ? remainingPct(loaded.remainingG, loaded.initialG) : 0;
  const meters = loaded ? metersFromGrams(loaded.remainingG, loaded.material) : 0;
  const low = loaded ? loaded.remainingG <= loaded.lowG : false;
  const enoughForJob = printing && loaded ? loaded.remainingG >= printing.slicerG : true;
  const listening = printer.state === "running" || printer.state === "prepare" || printer.state === "paused";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-start">
      <section className="rounded-2xl border border-line bg-card p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">
              External holder
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {loaded ? `${loaded.colorName}` : "Nothing loaded"}
            </h1>
            {loaded && (
              <p className="text-sm text-muted">
                {loaded.brand} {loaded.material}
              </p>
            )}
          </div>
          {printing ? (
            <Badge tone="print">printing</Badge>
          ) : loaded ? (
            <Badge tone="ok">idle</Badge>
          ) : (
            <Badge>empty holder</Badge>
          )}
        </div>

        {loaded ? (
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
            <SpoolReel
              color={loaded.colorHex}
              remaining={loaded.remainingG}
              initial={loaded.initialG}
              size={200}
            />
            <div className="w-full text-center sm:text-left">
              <p className="font-mono text-6xl leading-none font-medium tracking-tight tabular-nums sm:text-7xl" suppressHydrationWarning>
                {loaded.remainingG}
              </p>
              <p className="mt-2 text-muted">grams remaining · {meters.toFixed(1)} m</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: low ? "var(--color-warn)" : loaded.colorHex,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-subtle">
                Last scale check <span suppressHydrationWarning>{relativeTime(loaded.lastWeighedAt)}</span> · empty spool {loaded.emptySpoolG} g
              </p>
              {low && (
                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-warn sm:justify-start">
                  <AlertTriangle className="size-4" />
                  Below {loaded.lowG} g — weigh before a long print
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-line px-5 py-10 text-center">
            <p className="text-muted">Load a spool from inventory onto the A1 holder.</p>
            <Button asChild className="mt-4">
              <Link to="/spools">Open spools</Link>
            </Button>
          </div>
        )}

        {loaded && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              size="lg"
              className="col-span-2 sm:col-span-2"
              disabled={!loaded || !!printing}
              onClick={() => setStartOpen(true)}
            >
              <Play className="size-4" />
              {listening ? "Manual job" : "Start print"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setWeighOpen(true)}>
              <Scale className="size-4" />
              Weigh
            </Button>
            <Button
              size="lg"
              variant="ghost"
              disabled={unload.isPending || !!printing}
              onClick={() => unload.mutate()}
            >
              <Unplug className="size-4" />
              Unload
            </Button>
          </div>
        )}
      </section>

      <div className="grid gap-4">
        <PrinterPanel
          printer={printer}
          onOpenLink={() => window.dispatchEvent(new Event("spooldeck:open-link"))}
        />

        <section className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Current job</p>
          {printing && loaded ? (
            <div className="mt-3">
              <h2 className="text-xl font-semibold">{printing.title}</h2>
              <p className="mt-1 text-sm text-muted">
                Studio {formatGrams(printing.slicerG)} · {printing.source === "a1" ? "from A1" : "manual"} ·{" "}
                <span suppressHydrationWarning>{relativeTime(printing.startedAt)}</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${Math.max(4, printing.progress)}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-sm tabular-nums text-muted" suppressHydrationWarning>
                {printing.progress}% · {enoughForJob ? "enough filament" : "not enough filament"}
              </p>
              {!enoughForJob && (
                <p className="mt-2 flex items-center gap-2 text-sm text-danger">
                  <CircleAlert className="size-4" />
                  Slicer needs {printing.slicerG} g, holder has {loaded.remainingG} g
                </p>
              )}
              <p className="mt-3 text-xs text-subtle">
                Finish is automatic when the A1 reports done. Override below if you stopped it by hand.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button size="lg" variant="outline" onClick={() => setFinishMode("finish")}>
                  <Check className="size-4" />
                  Force finish
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setFinishMode("fail")}>
                  <Pause className="size-4" />
                  Failed
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted">
                Listening for a job from Bambu Studio. Send a print to the A1 — or fire the demo below.
              </p>
              {printer.source === "demo" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {DEMO_JOBS.map((job) => (
                    <Button
                      key={job.title}
                      size="sm"
                      variant="subtle"
                      disabled={sendDemo.isPending || !loaded}
                      onClick={() => sendDemo.mutate(job)}
                    >
                      <Radio className="size-3.5" />
                      {job.title} · {job.slicerG} g
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">Workshop</p>
            <Link to="/jobs" className="text-xs text-muted hover:text-fg">
              All jobs
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs text-subtle">Used 7d</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums" suppressHydrationWarning>
                {data.used7d} g
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Spools</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums" suppressHydrationWarning>
                {data.spoolCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">On hand</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums" suppressHydrationWarning>
                {data.remainingTotal} g
              </dd>
            </div>
          </dl>
          {data.lowSpools.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-line pt-3">
              {data.lowSpools.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-warn">
                    {s.colorName} · {s.material}
                  </span>
                  <span className="font-mono tabular-nums text-muted">{s.remainingG} g</span>
                </li>
              ))}
            </ul>
          )}
          {data.recentJobs.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-line pt-3">
              {data.recentJobs.slice(0, 5).map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-muted">{job.title}</span>
                  <span className="shrink-0 font-mono tabular-nums text-subtle">
                    {job.status === "printing"
                      ? `${job.progress}%`
                      : job.deductedG
                        ? `−${job.deductedG} g`
                        : job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <StartJobDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        remainingG={loaded?.remainingG ?? 0}
      />
      <FinishJobDialog
        open={finishMode !== null}
        onOpenChange={(v) => {
          if (!v) setFinishMode(null);
        }}
        job={printing}
        mode={finishMode ?? "finish"}
      />
      <WeighSpoolDialog open={weighOpen} onOpenChange={setWeighOpen} spool={loaded} />
    </div>
  );
}