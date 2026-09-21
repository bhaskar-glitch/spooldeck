import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { weighPrint, weighSpool } from "@/lib/filament/actions";
import { queryClient } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Numpad } from "@/components/numpad";
import type { Job, Spool } from "@/lib/filament/types";

export function WeighSpoolDialog({
  open,
  onOpenChange,
  spool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spool: Spool | null;
}) {
  const [scale, setScale] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      if (!spool) throw new Error("No spool");
      return weighSpool({ data: { id: spool.id, scaleG: Number(scale) || 0 } });
    },
    onSuccess: (res) => {
      const sign = res.delta >= 0 ? "+" : "";
      toast.success(`Remaining set to ${res.remaining} g (${sign}${res.delta} g)`);
      queryClient.invalidateQueries();
      onOpenChange(false);
      setScale("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!spool) return null;
  const scaleN = Number(scale) || 0;
  const filament = Math.max(0, scaleN - spool.emptySpoolG);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Weigh the spool</DialogTitle>
          <DialogDescription>
            Put the whole roll on a kitchen scale. Empty {spool.brand} spool is {spool.emptySpoolG} g — that gets subtracted automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-3 flex items-end justify-between rounded-lg bg-elevated px-4 py-3">
          <span className="font-mono text-4xl tabular-nums">{scale || "0"}</span>
          <span className="text-sm text-muted">g on scale</span>
        </div>
        <p className="mb-3 text-sm text-muted">
          Filament remaining: <span className="font-mono text-fg tabular-nums">{filament} g</span>
        </p>
        <Numpad value={scale} onChange={setScale} max={4} />
        <Button
          className="mt-4 w-full"
          size="lg"
          disabled={scaleN < spool.emptySpoolG || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving…" : "Set remaining from scale"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function WeighPrintDialog({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}) {
  const [grams, setGrams] = useState("");
  const mutation = useMutation({
    mutationFn: () => {
      if (!job) throw new Error("No print");
      return weighPrint({ data: { jobId: job.id, actualG: Number(grams) || 0 } });
    },
    onSuccess: (res) => {
      toast.success(
        res.delta === 0
          ? "Weight matches the deduction"
          : `Corrected remaining by ${res.delta > 0 ? "+" : ""}${res.delta} g`,
      );
      queryClient.invalidateQueries();
      onOpenChange(false);
      setGrams("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Weigh finished print</DialogTitle>
          <DialogDescription>
            {job.title} was booked at {job.deductedG} g. Weighing the part overwrites that with the true mass.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-3 flex items-end justify-between rounded-lg bg-elevated px-4 py-3">
          <span className="font-mono text-4xl tabular-nums">{grams || "0"}</span>
          <span className="text-sm text-muted">g</span>
        </div>
        <Numpad value={grams} onChange={setGrams} max={4} />
        <Button
          className="mt-4 w-full"
          size="lg"
          disabled={!grams || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving…" : "Correct remaining"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
