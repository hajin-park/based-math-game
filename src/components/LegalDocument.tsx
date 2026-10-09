import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/page-header";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * Long-form legal page: header with a fixed "last updated" date, a
 * plain-language summary, a table of contents (sticky on wide screens) and
 * numbered sections set at reading width.
 */
export function LegalDocument({
  eyebrow,
  title,
  lede,
  updated,
  updatedIso,
  summary,
  sections,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  /** Human date, e.g. "9 October 2026". Fixed, never computed. */
  updated: string;
  updatedIso: string;
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  return (
    <div className="container flex flex-col gap-10 py-10 md:gap-14 md:py-14">
      <PageHeader eyebrow={eyebrow} title={title} lede={lede} divider size="md">
        <p className="text-body-sm text-muted-foreground">
          Last updated: <time dateTime={updatedIso}>{updated}</time>
        </p>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start"
        >
          <p className="eyebrow mb-3">On this page</p>
          <ol className="flex flex-col border-l">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px flex min-h-9 items-baseline gap-2 border-l border-transparent py-1.5 pl-4 text-body-sm text-muted-foreground transition-colors duration-fast hover:border-border-strong hover:text-foreground"
                >
                  <span className="font-mono text-[0.6875rem] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex min-w-0 max-w-prose flex-col gap-12">
          <section
            aria-labelledby="short-version"
            className="rounded-xl border bg-card p-5 sm:p-6"
          >
            <h2 id="short-version" className="text-title font-semibold">
              The short version
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {summary.map((item, i) => (
                <li key={i} className="flex gap-3 text-body text-pretty">
                  <span
                    aria-hidden
                    className="mt-[0.7em] h-px w-3 shrink-0 bg-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-h`}
              className="scroll-mt-[calc(var(--nav-h)+1.5rem)]"
            >
              <h2
                id={`${s.id}-h`}
                className="flex items-baseline gap-3 font-serif text-headline font-medium"
              >
                <span className="font-mono text-[0.8125rem] font-normal text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-body text-pretty [&_h3]:mt-2 [&_h3]:text-title-sm [&_h3]:font-semibold [&_li]:pl-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
