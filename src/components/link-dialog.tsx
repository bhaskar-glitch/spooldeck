import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  LAN_CODE_KEY,
  LAN_HOST_KEY,
  LAN_SERIAL_KEY,
  LINK_MODE_KEY,
  REGION_KEY,
  TOKEN_KEY,
} from "@/lib/filament/link-keys";
import { cn } from "@/lib/utils";

type Mode = "demo" | "cloud" | "lan";

export function LinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("demo");
  const [token, setToken] = useState("");
  const [region, setRegion] = useState<"global" | "cn">("global");
  const [host, setHost] = useState("");
  const [serial, setSerial] = useState("");
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const storedMode = window.localStorage.getItem(LINK_MODE_KEY);
    setMode(storedMode === "cloud" || storedMode === "lan" ? storedMode : "demo");
    setToken(window.localStorage.getItem(TOKEN_KEY) ?? "");
    const stored = window.localStorage.getItem(REGION_KEY);
    if (stored === "cn" || stored === "global") setRegion(stored);
    setHost(window.localStorage.getItem(LAN_HOST_KEY) ?? "");
    setSerial(window.localStorage.getItem(LAN_SERIAL_KEY) ?? "");
    setAccessCode(window.localStorage.getItem(LAN_CODE_KEY) ?? "");
  }, [open]);

  function save() {
    if (mode === "lan") {
      if (!host.trim() || !serial.trim() || !accessCode.trim()) {
        toast.error("IP, serial, and access code are required for LAN");
        return;
      }
      window.localStorage.setItem(LINK_MODE_KEY, "lan");
      window.localStorage.setItem(LAN_HOST_KEY, host.trim());
      window.localStorage.setItem(LAN_SERIAL_KEY, serial.trim().toUpperCase());
      window.localStorage.setItem(LAN_CODE_KEY, accessCode.trim());
      toast.success("Listening to the A1 over LAN MQTT from this host");
    } else if (mode === "cloud") {
      const trimmed = token.trim();
      if (!trimmed) {
        toast.error("Paste a Bambu Cloud token, or switch to LAN / demo");
        return;
      }
      window.localStorage.setItem(LINK_MODE_KEY, "cloud");
      window.localStorage.setItem(TOKEN_KEY, trimmed);
      window.localStorage.setItem(REGION_KEY, region);
      toast.success("A1 will sync from Bambu Cloud while this page is open");
    } else {
      window.localStorage.setItem(LINK_MODE_KEY, "demo");
      toast.success("Using the live A1 demo");
    }
    window.dispatchEvent(new Event("spooldeck:creds-changed"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect the A1</DialogTitle>
          <DialogDescription>
            LAN MQTT is the same live feed Bambu Studio uses — retries on the printer screen show
            here. Run SpoolDeck on the laptop that shares Wi-Fi with the printer.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex gap-2">
          {([
            ["lan", "LAN"],
            ["cloud", "Cloud"],
            ["demo", "Demo"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "h-11 flex-1 rounded-md border text-sm",
                mode === id
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "lan" && (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lan-host">Printer IP</Label>
              <Input
                id="lan-host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.50"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lan-serial">Serial</Label>
              <Input
                id="lan-serial"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="From Settings → Device"
                autoComplete="off"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lan-code">Access code</Label>
              <Input
                id="lan-code"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="8-character LAN code"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-subtle">
              Username is always <span className="font-mono">bblp</span>, port 8883. Leave LAN Only
              off on the A1. Stored on this browser, used by the laptop process to open MQTT.
            </p>
          </div>
        )}

        {mode === "cloud" && (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Region</Label>
              <div className="flex gap-2">
                {(["global", "cn"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={cn(
                      "h-11 flex-1 rounded-md border text-sm",
                      region === r
                        ? "border-primary bg-primary text-primary-fg"
                        : "border-line text-muted",
                    )}
                  >
                    {r === "global" ? "Global" : "China"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="token">Bambu access token</Label>
              <Input
                id="token"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="MakerWorld / Handy account token"
              />
              <p className="text-xs text-subtle">
                Cloud lists jobs from Studio/Handy. Screen retries often keep the same task id —
                use LAN for those.
              </p>
            </div>
          </div>
        )}

        {mode === "demo" && (
          <p className="text-sm text-muted">
            No printer required. Demo buttons on the deck simulate a Studio send, progress, and
            auto-deduct.
          </p>
        )}

        <Button className="mt-5 w-full" size="lg" onClick={save}>
          {mode === "lan" ? "Listen over LAN" : mode === "cloud" ? "Listen to Cloud" : "Keep live demo"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}