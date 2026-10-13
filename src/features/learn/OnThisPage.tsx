import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cn } from "@/lib/utils";
import { scrollToSection } from "./useToc";

export interface TocItem {
  id: string;
  label: string;
  /** Section number printed before the label ("2.3", "A.4"). */
  number?: string;
  /** Optional group heading shown above the first item of each group. */
  group?: string;
  /** Number printed before the group heading ("2" for Chapter 2). */
  groupNumber?: string;
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
                className={cn(
                  "flex items-baseline gap-2 px-2 pb-1 font-serif text-[0.9375rem] font-bold text-foreground",
                  index > 0 && "mt-4",
                )}
              >
                {item.groupNumber && (
                  <span className="text-primary">{item.groupNumber}</span>
                )}
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
                "flex min-h-8 items-baseline gap-2.5 rounded-sm px-2 py-1 text-body-sm transition-colors duration-fast pointer-coarse:min-h-11 pointer-coarse:items-center",
                current
                  ? "bg-tint font-bold text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.number && (
                <span
                  aria-hidden
                  className={cn(
                    "w-8 shrink-0 font-mono text-[0.8125rem] font-medium",
                    current ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.number}
                </span>
              )}
              <span className="min-w-0">
                {item.group && <span className="sr-only">{item.group}: </span>}
                {item.label}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * OnThisPage — the book's contents rail, with scroll-spy.
 *  - `variant="sidebar"`: sticky column for lg+ (render inside an <aside>).
 *  - `variant="bar"`: a compact jump menu that sticks under the nav on
 *    small screens.
 */
export function OnThisPage({
  items,
  active,
  variant,
  label = "Contents",
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
        <p className="smallcaps mb-3 border-b border-foreground/20 px-2 pb-1.5 text-foreground">
          {label}
        </p>
        <TocLinks items={items} active={active} onNavigate={navigate} />
      </nav>
    );
  }

  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-[var(--nav-h)] z-30 border-b border-foreground/20 bg-background",
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
          <span className="smallcaps shrink-0">{label}</span>
          <span className="flex min-w-0 flex-1 items-baseline gap-2 truncate text-body-sm font-bold text-foreground">
            {current?.number && (
              <span className="font-mono text-[0.8125rem] font-medium text-primary">
                {current.number}
              </span>
            )}
            <span className="truncate">{current?.label}</span>
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
          className="max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain border-t border-border pb-3 pt-2"
        >
          <TocLinks items={items} active={active} onNavigate={navigate} />
        </div>
      </div>
    </nav>
  );
}
