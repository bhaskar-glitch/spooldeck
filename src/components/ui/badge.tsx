import { cn } from "@/lib/utils";

function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "neutral" | "ok" | "warn" | "danger" | "print";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tone === "neutral" && "bg-elevated text-muted",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "danger" && "bg-danger/15 text-danger",
        tone === "print" && "bg-primary/12 text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
