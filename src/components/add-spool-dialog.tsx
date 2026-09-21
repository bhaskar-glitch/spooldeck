import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CATALOG, EMPTY_SPOOL_PRESETS, MATERIALS } from "@/lib/filament/catalog";
import { createSpool, updateSpool } from "@/lib/filament/actions";
import { queryClient } from "@/lib/query-client";
import { cn, isLightHex } from "@/lib/utils";
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
import type { Spool } from "@/lib/filament/types";

export function AddSpoolDialog({
  open,
  onOpenChange,
  spool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spool?: Spool | null;
}) {
  const editing = Boolean(spool);
  const [brand, setBrand] = useState("Bambu Lab");
  const [material, setMaterial] = useState("PLA");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#F4F1E8");
  const [emptyG, setEmptyG] = useState("250");
  const [initialG, setInitialG] = useState("1000");
  const [remainingG, setRemainingG] = useState("1000");

  useEffect(() => {
    if (!open) return;
    if (spool) {
      setBrand(spool.brand);
      setMaterial(spool.material);
      setColorName(spool.colorName);
      setColorHex(spool.colorHex.toLowerCase());
      setEmptyG(String(spool.emptySpoolG));
      setInitialG(String(spool.initialG));
      setRemainingG(String(spool.remainingG));
      return;
    }
    setBrand("Bambu Lab");
    setMaterial("PLA");
    setColorName("");
    setColorHex("#F4F1E8");
    setEmptyG("250");
    setInitialG("1000");
    setRemainingG("1000");
  }, [open, spool]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand: brand.trim(),
        material,
        colorName: colorName.trim(),
        colorHex,
        emptySpoolG: Number(emptyG) || 250,
        initialG: Number(initialG) || 1000,
        remainingG: Number(remainingG) || 0,
        notes: spool?.notes,
      };
      if (spool) {
        await updateSpool({ data: { id: spool.id, ...payload } });
        return;
      }
      await createSpool({ data: { ...payload, priceCentsPerKg: null } });
    },
    onSuccess: () => {
      toast.success(editing ? "Spool updated" : "Spool added to the shelf");
      queryClient.invalidateQueries();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function pickCatalog(i: (typeof CATALOG)[number]) {
    setBrand(i.brand);
    setMaterial(i.material);
    setColorName(i.colorName);
    setColorHex(i.colorHex);
    setEmptyG(String(i.emptySpoolG));
    setInitialG(String(i.initialG));
    if (!editing) setRemainingG(String(i.initialG));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit spool" : "Add a spool"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Change colour, material, or remaining grams. Remaining edits book as an adjustment."
              : "Pick a Bambu colour or enter a third-party spool. Remaining starts at the full roll unless you type a weighed value."}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATALOG.slice(0, 10).map((item) => (
            <button
              key={`${item.brand}-${item.material}-${item.colorName}`}
              type="button"
              onClick={() => pickCatalog(item)}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "size-9 rounded-full border",
                  isLightHex(item.colorHex) ? "border-line" : "border-transparent",
                )}
                style={{ backgroundColor: item.colorHex }}
              />
              <span className="max-w-14 truncate text-xs text-subtle">{item.colorName}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="material">Material</Label>
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="h-12 rounded-md border border-line bg-elevated px-3 text-base text-fg"
            >
              {[material, ...MATERIALS.filter((m) => m !== material)].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="color">Colour name</Label>
            <Input id="color" value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="Jade White" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hex">Colour</Label>
            <div className="flex gap-2">
              <input
                id="hex"
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-12 w-14 cursor-pointer rounded-md border border-line bg-elevated p-1"
              />
              <Input value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Empty spool (g)</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMPTY_SPOOL_PRESETS.map((p) => (
                <button
                  key={p.g}
                  type="button"
                  onClick={() => setEmptyG(String(p.g))}
                  className={cn(
                    "h-9 rounded-full border px-3 text-xs",
                    emptyG === String(p.g)
                      ? "border-primary bg-primary text-primary-fg"
                      : "border-line text-muted",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Input inputMode="numeric" value={emptyG} onChange={(e) => setEmptyG(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="init">Filament on the roll (g)</Label>
            <Input id="init" inputMode="numeric" value={initialG} onChange={(e) => setInitialG(e.target.value)} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="remain">Remaining now (g)</Label>
            <Input
              id="remain"
              inputMode="numeric"
              value={remainingG}
              onChange={(e) => setRemainingG(e.target.value)}
            />
            <p className="text-xs text-subtle">
              New sealed roll: same as full weight. Partial roll: weigh spool, subtract empty spool, enter the difference.
            </p>
          </div>
        </div>

        <Button
          className="mt-5 w-full"
          size="lg"
          disabled={!colorName.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Add to shelf"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
