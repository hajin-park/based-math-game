import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cn } from "@/lib/utils";
import { scrollToSection } from "./useToc";

export interface TocItem {
  id: string;
  label: string;
  /** Optional group heading shown above the first item of each group. */
  group?: string;
}

function TocLinks({
  items,
  active,
  onNavigate,
  className,
}: {
  items: readonly TocItem[];
  active: string;
  onNavigate: (id: string) => void;
  className?: string;
}) {
  let lastGroup: string | undefined;
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const showGroup = item.group && item.group !== lastGroup;
        lastGroup = item.group;
        const current = item.id === active;
        return (
          <li key={item.id} className="flex flex-col">
            {showGroup && (
              <span
                aria-hidden
                className={cn("eyebrow mb-1 px-3", index > 0 && "mt-5")}
              >
                {item.group}
              </span>
            )}
            <a
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
                  return;
                e.preventDefault();
                onNavigate(item.id);
              }}
              className={cn(
                "relative flex min-h-9 items-center rounded-md px-3 py-1.5 text-body-sm transition-colors duration-fast pointer-coarse:min-h-11",
                current
                  ? "bg-accent font-medium text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {item.group && <span className="sr-only">{item.group}: </span>}
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * OnThisPage — table of contents with scroll-spy.
 *  - `variant="sidebar"`: sticky column for lg+ (render inside an <aside>).
 *  - `variant="bar"`: collapsible bar that sticks under the nav on small screens.
 */
export function OnThisPage({
  items,
  active,
  variant,
  label = "On this page",
  className,
}: {
  items: readonly TocItem[];
  active: string;
  variant: "sidebar" | "bar";
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const navigate = (id: string) => {
    setOpen(false);
    window.history.replaceState(window.history.state, "", `#${id}`);
    scrollToSection(id, !reduce);
  };

  if (variant === "sidebar") {
    return (
      <nav aria-label={label} className={className}>
        <p className="eyebrow mb-3 px-3 text-foreground">{label}</p>
        <TocLinks items={items} active={active} onNavigate={navigate} />
      </nav>
    );
  }

  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-[var(--nav-h)] z-30 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85",
        className,
      )}
    >
      <div className="container">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-12 w-full items-center gap-3 text-left"
        >
          <span className="eyebrow shrink-0">{label}</span>
          <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-foreground">
            {current?.label}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-base",
              open && "rotate-180",
            )}
          />
        </button>
        <div
          id={panelId}
          hidden={!open}
          className="max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain border-t pb-3 pt-2"
        >
          <TocLinks items={items} active={active} onNavigate={navigate} />
        </div>
      </div>
    </nav>
  );
}
