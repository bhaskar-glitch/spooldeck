import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, History, Layers, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkDialog } from "@/components/link-dialog";

const NAV = [
  { to: "/", label: "Deck", icon: Printer },
  { to: "/spools", label: "Spools", icon: Layers },
  { to: "/jobs", label: "Jobs", icon: History },
  { to: "/guide", label: "Guide", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    const open = () => setLinkOpen(true);
    window.addEventListener("spooldeck:open-link", open);
    return () => window.removeEventListener("spooldeck:open-link", open);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/92 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">SpoolDeck</span>
          <span className="hidden text-xs tracking-wide text-subtle sm:inline">
            A1 · external holder
          </span>
        </div>
        <button
          type="button"
          onClick={() => setLinkOpen(true)}
          className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted hover:text-fg"
        >
          Bambu Lab A1
        </button>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-7">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <ul className="mx-auto grid max-w-6xl grid-cols-4">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                    active ? "text-fg" : "text-subtle hover:text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <LinkDialog open={linkOpen} onOpenChange={setLinkOpen} />
    </div>
  );
}
