import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { failJob, finishJob, startJob } from "@/lib/filament/actions";
import { parseSlicerUsage } from "@/lib/filament/math";
import { queryClient } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Numpad } from "@/components/numpad";
import type { Job } from "@/lib/filament/types";

export function StartJobDialog({
  open,
  onOpenChange,
  remainingG,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingG: number;
}) {
  const [title, setTitle] = useState("");
  const [grams, setGrams] = useState("48");
  const [paste, setPaste] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      startJob({
        data: {
          title: title.trim() || "Untitled print",
          slicerG: Number(grams) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Print logged — remaining drops when the A1 reports done");
      queryClient.invalidateQueries();
      onOpenChange(false);
      setTitle("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function applyPaste() {
    const parsed = parseSlicerUsage(paste);
    if (parsed == null) {
      toast.error("No gram value found — paste ‘Filament used: 36.8g’ from Bambu Studio");
      return;
    }
    setGrams(String(parsed));
    toast.success(`Captured ${parsed} g from slicer`);
  }

  const g = Number(grams) || 0;
  const enough = g > 0 && g <= remainingG;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a print</DialogTitle>
          <DialogDescription>
            Fallback if Studio is not linked. Copy grams from Bambu Studio (Prepare tab, filament used). Linked prints open themselves.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="job-title">Job name</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Toolhead cover"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Slicer grams</Label>
            <div className="flex items-end justify-between rounded-lg bg-elevated px-4 py-3">
              <span className="font-mono text-4xl tabular-nums tracking-tight">{grams || "0"}</span>
              <span className="text-sm text-muted">g</span>
            </div>
            <p className={enough ? "text-xs text-ok" : "text-xs text-danger"}>
              {g === 0
                ? "Enter grams from the slicer"
                : enough
                  ? `${remainingG - g} g will remain after this print`
                  : `Need ${g} g — only ${remainingG} g on the holder`}
            </p>
          </div>
          <Numpad value={grams} onChange={setGrams} />
          <div className="grid gap-1.5">
            <Label htmlFor="paste">Or paste Studio output</Label>
            <Textarea
              id="paste"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Filament used: 1.62 m / 48.30 g"
            />
            <Button type="button" variant="outline" onClick={applyPaste}>
              Read grams from paste
            </Button>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={!enough || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Starting…" : "Start on loaded spool"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FinishJobDialog({
  open,
  onOpenChange,
  job,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  mode: "finish" | "fail";
}) {
  const [actual, setActual] = useState("");
  const [progress, setProgress] = useState("40");

  const finishMut = useMutation({
    mutationFn: () => {
      if (!job) throw new Error("No print");
      return finishJob({
        data: {
          id: job.id,
          actualG: actual ? Number(actual) : null,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Deducted ${res.deducted} g · ${res.remaining} g left`);
      queryClient.invalidateQueries();
      onOpenChange(false);
      setActual("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const failMut = useMutation({
    mutationFn: () => {
      if (!job) throw new Error("No print");
      return failJob({
        data: {
          id: job.id,
          progress: Number(progress) || 0,
          actualG: actual ? Number(actual) : null,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Failed print · deducted ${res.deducted} g`);
      queryClient.invalidateQueries();
      onOpenChange(false);
      setActual("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "finish" ? "Finish print" : "Mark as failed"}</DialogTitle>
          <DialogDescription>
            {mode === "finish"
              ? `Slicer said ${job.slicerG} g. Leave the scale blank to auto-deduct that, or weigh the part for a precision correction.`
              : "Deducts a fraction of the slicer grams based on how far the print got — or weigh the failed part."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-lg bg-elevated px-4 py-3">
            <p className="text-sm text-muted">{job.title}</p>
            <p className="font-mono text-2xl tabular-nums">{job.slicerG} g slicer</p>
          </div>
          {mode === "fail" && (
            <div className="grid gap-1.5">
              <Label htmlFor="pct">Percent completed</Label>
              <Input
                id="pct"
                inputMode="numeric"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="actual">Weigh the print (optional)</Label>
            <Input
              id="actual"
              inputMode="numeric"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="Leave empty to use slicer grams"
            />
            <p className="text-xs text-subtle">
              Kitchen scale the finished part. If you skip this, remaining still updates from the slicer estimate.
            </p>
          </div>
          {mode === "finish" ? (
            <Button size="lg" disabled={finishMut.isPending} onClick={() => finishMut.mutate()}>
              {finishMut.isPending ? "Saving…" : actual ? `Deduct ${actual} g` : `Deduct ${job.slicerG} g`}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="danger"
              disabled={failMut.isPending}
              onClick={() => failMut.mutate()}
            >
              {failMut.isPending ? "Saving…" : "Record failed print"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
