import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listJobs } from "@/lib/filament/actions";
import { relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeighPrintDialog } from "@/components/weigh-dialog";
import type { Job } from "@/lib/filament/types";

export const Route = createFileRoute("/jobs")({
  loader: () => listJobs(),
  component: JobsPage,
});

function toneFor(status: Job["status"]) {
  if (status === "completed") return "ok" as const;
  if (status === "failed") return "danger" as const;
  if (status === "printing") return "print" as const;
  return "neutral" as const;
}

function JobsPage() {
  const initial = Route.useLoaderData();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => listJobs(),
    initialData: initial,
  });
  const [weighJob, setWeighJob] = useState<Job | null>(null);
  const jobs = data ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted">
          Every print the A1 finishes is booked automatically. Weigh a finished part later if you want the ledger exact.
        </p>
      </div>
      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-card" />
      ) : jobs.length === 0 ? (
        <p className="text-sm text-subtle">No prints logged yet.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 size-3 shrink-0 rounded-full border border-line"
                  style={{ backgroundColor: job.spoolColorHex }}
                />
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted">
                    {job.spoolColorName} · {job.spoolMaterial}
                  </p>
                  <p className="text-xs text-subtle">
                    <span suppressHydrationWarning>
                      {relativeTime(job.finishedAt ?? job.startedAt)}
                    </span>{" "}
                    · {job.source === "a1" ? "A1" : "manual"} · slicer {job.slicerG} g
                    {job.actualG != null ? ` · scale ${job.actualG} g` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center gap-2">
                  <Badge tone={toneFor(job.status)}>{job.status}</Badge>
                  <span className="font-mono text-sm tabular-nums">
                    {job.status === "printing" ? `${job.progress}%` : `−${job.deductedG} g`}
                  </span>
                </div>
                {(job.status === "completed" || job.status === "failed") && job.actualG == null && (
                  <Button size="sm" variant="ghost" onClick={() => setWeighJob(job)}>
                    Weigh print
                  </Button>
                )}
                {job.status === "printing" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/">Open deck</Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <WeighPrintDialog
        open={weighJob !== null}
        onOpenChange={(v) => {
          if (!v) setWeighJob(null);
        }}
        job={weighJob}
      />
    </div>
  );
}
