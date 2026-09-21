import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"] as const;

export function Numpad({
  value,
  onChange,
  max = 4,
}: {
  value: string;
  onChange: (next: string) => void;
  max?: number;
}) {
  function press(key: (typeof KEYS)[number]) {
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= max) return;
    if (key === "00") {
      const next = (value + "00").slice(0, max);
      onChange(next.replace(/^0+(?=\d)/, ""));
      return;
    }
    if (value === "0") onChange(key);
    else onChange(value + key);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          className={cn(
            "flex h-14 items-center justify-center rounded-md bg-elevated font-mono text-xl font-medium text-fg transition-colors duration-150 hover:bg-line",
            key === "del" && "text-muted",
          )}
        >
          {key === "del" ? <Delete className="size-5" /> : key}
        </button>
      ))}
    </div>
  );
}
