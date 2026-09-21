import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Scale, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteSpool, getSpoolDetail, loadSpool } from "@/lib/filament/actions";
import { metersFromGrams, remainingPct } from "@/lib/filament/math";
import { queryClient } from "@/lib/query-client";
import { formatGrams, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpoolReel } from "@/components/spool-reel";
import { WeighSpoolDialog } from "@/components/weigh-dialog";
import { AddSpoolDialog } from "@/components/add-spool-dialog";

export const Route = createFileRoute("/spools_/$id")({
  loader: ({ params }) => getSpoolDetail({ data: { id: Number(params.id) } }),
  component: SpoolDetailPage,
});

function SpoolDetailPage() {
  const { id } = Route.useParams();
  const spoolId = Number(id);
  const navigate = useNavigate();
  const initial = Route.useLoaderData();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["spool", spoolId],
    queryFn: () => getSpoolDetail({ data: { id: spoolId } }),
    enabled: Number.isFinite(spoolId),
    initialData: initial,
  });
  const [weighOpen, setWeighOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useMutation({
    mutationFn: () => loadSpool({ data: { id: spoolId } }),
    onSuccess: () => {
      toast.success("Loaded on the A1 holder");
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteSpool({ data: { id: spoolId } }),
    onSuccess: () => {
      toast.success("Spool removed");
      queryClient.invalidateQueries();
      setDeleteOpen(false);
      void navigate({ to: "/spools" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="h-80 animate-pulse rounded-2xl bg-card" />;
  if (isError || !data) {
    return (
      <p className="text-danger">{error instanceof Error ? error.message : "Spool not found"}</p>
    );
  }

  const { spool, jobs, ledger, usedTotal } = data;
  const pct = remainingPct(spool.remainingG, spool.initialG);
  const meters = metersFromGrams(spool.remainingG, spool.material);
  const printingHere = jobs.some((job) => job.status === "printing");

  return (
    <div className="grid gap-5">
      <Link to="/spools" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" />
        All spools
      </Link>

      <section className="rounded-2xl border border-line bg-card p-5 sm:p-7">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <SpoolReel color={spool.colorHex} remaining={spool.remainingG} initial={spool.initialG} size={180} />
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{spool.colorName}</h1>
              <Badge
                tone={
                  spool.location === "loaded"
                    ? "print"
                    : spool.location === "empty"
                      ? "danger"
                      : spool.remainingG <= spool.lowG
                        ? "warn"
                        : "neutral"
                }
              >
                {spool.location === "loaded" ? "on A1" : spool.location}
              </Badge>
            </div>
            <p className="text-sm text-muted">
              {spool.brand} · {spool.material}
            </p>
            <p className="mt-4 font-mono text-5xl tracking-tight tabular-nums">{spool.remainingG}</p>
            <p className="mt-1 text-sm text-muted">
              grams · {meters.toFixed(1)} m · {Math.round(pct)}% of {spool.initialG} g
            </p>
            <p className="mt-2 text-xs text-subtle">
              Used on record {formatGrams(usedTotal)} · last weighed{" "}
              <span suppressHydrationWarning>{relativeTime(spool.lastWeighedAt)}</span>
            </p>
            {spool.notes && <p className="mt-3 text-sm text-muted">{spool.notes}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                disabled={spool.location === "loaded" || spool.location === "empty" || load.isPending}
                onClick={() => load.mutate()}
              >
                <Upload className="size-4" />
                Load on A1
              </Button>
              <Button variant="outline" onClick={() => setWeighOpen(true)}>
                <Scale className="size-4" />
                Weigh spool
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button variant="ghost" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">Prints on this roll</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-subtle">No prints yet.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-subtle">
                    {job.status} · slicer {job.slicerG} g
                    {job.actualG != null ? ` · weighed ${job.actualG} g` : ""}
                  </p>
                </div>
                <span className="font-mono text-sm tabular-nums text-muted">−{job.deductedG} g</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">Ledger</h2>
        <ul className="space-y-2">
          {ledger.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted">
                {entry.kind.replace("_", " ")}
                {entry.note ? ` · ${entry.note}` : ""}
              </span>
              <span className="shrink-0 font-mono tabular-nums text-subtle">
                {entry.grams > 0 ? "+" : ""}
                {entry.grams} → {entry.remainingAfter} g
              </span>
            </li>
          ))}
        </ul>
      </section>

      <WeighSpoolDialog open={weighOpen} onOpenChange={setWeighOpen} spool={spool} />
      <AddSpoolDialog open={editOpen} onOpenChange={setEditOpen} spool={spool} />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {spool.colorName}?</DialogTitle>
            <DialogDescription>
              {printingHere
                ? "This roll is on a running print. Finish or fail that job first."
                : jobs.length > 0
                  ? `Removes this roll and ${jobs.length} print${jobs.length === 1 ? "" : "s"} logged against it. That cannot be undone.`
                  : "Removes this roll from the shelf. That cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep
            </Button>
            <Button
              variant="danger"
              disabled={printingHere || remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
