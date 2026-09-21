import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listSpools } from "@/lib/filament/actions";
import { Button } from "@/components/ui/button";
import { SpoolCard } from "@/components/spool-card";
import { AddSpoolDialog } from "@/components/add-spool-dialog";
import { BulkAddDialog } from "@/components/bulk-add-dialog";

export const Route = createFileRoute("/spools")({
  loader: () => listSpools(),
  component: SpoolsPage,
});

function SpoolsPage() {
  const initial = Route.useLoaderData();
  const { data, isLoading } = useQuery({
    queryKey: ["spools"],
    queryFn: () => listSpools(),
    initialData: initial,
  });
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const spools = data ?? [];

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Spools</h1>
          <p className="text-sm text-muted">Shelf inventory for the A1 external holder.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            Bulk add
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-xl bg-card" />
          <div className="h-36 animate-pulse rounded-xl bg-card" />
        </div>
      ) : spools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-5 py-12 text-center">
          <p className="text-muted">Shelf is empty. Add the rolls you actually own.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add spool
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {spools.map((spool) => (
            <SpoolCard key={spool.id} spool={spool} />
          ))}
        </div>
      )}
      <AddSpoolDialog open={open} onOpenChange={setOpen} />
      <BulkAddDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}
