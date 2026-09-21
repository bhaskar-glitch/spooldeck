import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkCreateSpools } from "@/lib/filament/actions";
import { queryClient } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function BulkAddDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      const parsed = lines.map(line => {
        // Format: Brand, Material, ColorName, Hex, EmptyG, InitG, RemainG
        const parts = line.split(",").map(p => p.trim());
        if (parts.length < 4) throw new Error(`Invalid format on line: ${line}`);
        const brand = parts[0];
        const material = parts[1];
        const colorName = parts[2];
        const colorHex = parts[3].startsWith("#") ? parts[3] : `#${parts[3]}`;
        const emptySpoolG = parts.length > 4 ? Number(parts[4]) : 250;
        const initialG = parts.length > 5 ? Number(parts[5]) : 1000;
        const remainingG = parts.length > 6 ? Number(parts[6]) : initialG;

        if (Number.isNaN(emptySpoolG) || Number.isNaN(initialG) || Number.isNaN(remainingG)) {
          throw new Error(`Invalid number on line: ${line}`);
        }

        return {
          brand,
          material,
          colorName,
          colorHex,
          emptySpoolG,
          initialG,
          remainingG
        };
      });

      if (parsed.length === 0) throw new Error("No valid spools found.");
      return bulkCreateSpools({ data: parsed });
    },
    onSuccess: (res) => {
      toast.success(`Successfully added ${res.count} spools in bulk!`);
      queryClient.invalidateQueries();
      setText("");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Add Spools</DialogTitle>
          <DialogDescription>
            Paste your spool data in CSV format, one spool per line.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Format: Brand, Material, Color, Hex, EmptyG, InitG, RemainG</Label>
            <p className="text-xs text-subtle">
              Example:<br/>
              Bambu Lab, PLA, Jade White, #FFFFFF, 250, 1000, 1000<br/>
              Sunlu, PETG, Black, #000000<br/>
              (EmptyG defaults to 250, InitG to 1000)
            </p>
            <textarea
              className="mt-2 min-h-[200px] w-full rounded-md border border-line bg-elevated p-3 text-sm font-mono text-fg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Bambu Lab, PLA, Jade White, #FFFFFF, 250, 1000, 1000"}
            />
          </div>
        </div>

        <Button
          className="mt-5 w-full"
          size="lg"
          disabled={!text.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Adding…" : "Add to shelf"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
