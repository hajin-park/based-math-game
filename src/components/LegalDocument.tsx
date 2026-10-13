import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { OnThisPage, type TocItem } from "@/features/learn/OnThisPage";
import { useHashScroll, useScrollSpy } from "@/features/learn/useToc";
import { SectionNumber } from "@/features/learn/book";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * A legal page set as an appendix of the book: running head, a fixed "last
 * updated" date, a summary box, a contents rail (sticky on wide screens, a
 * jump menu on phones) and numbered clauses ("A.4 Deleting your data") at
 * reading width. Section ids are linked from elsewhere (/privacy#deletion).
 */
export function LegalDocument({
  appendix,
  eyebrow,
  title,
  lede,
  updated,
  updatedIso,
  summary,
  sections,
}: {
  /** Appendix letter: clauses are numbered A.1, A.2… */
  appendix: string;
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  /** Human date, e.g. "9 October 2026". Fixed, never computed. */
  updated: string;
  updatedIso: string;
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  const toc: TocItem[] = sections.map((s, i) => ({
    id: s.id,
    label: s.title,
    number: `${appendix}.${i + 1}`,
  }));
  const active = useScrollSpy(toc.map((t) => t.id));
  useHashScroll();

  return (
    <div className="overflow-x-clip">
      <div className="container pb-8 pt-10 md:pb-10 md:pt-14">
        <PageHeader
          eyebrow={eyebrow}
          number={appendix}
          title={title}
          lede={lede}
          divider
          size="md"
        >
          <p className="font-sans text-[0.875rem] text-muted-foreground">
            Last updated <time dateTime={updatedIso}>{updated}</time>
          </p>
        </PageHeader>
      </div>

      <OnThisPage
        items={toc}
        active={active}
        variant="bar"
        className="lg:hidden"
      />

      <div className="container grid gap-10 pb-16 pt-8 md:pb-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 lg:pt-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] max-h-[calc(100dvh-var(--nav-h)-3rem)] overflow-y-auto pb-6">
            <OnThisPage items={toc} active={active} variant="sidebar" />
          </div>
        </aside>

        <div className="flex min-w-0 max-w-prose flex-col">
          <section
            aria-labelledby="short-version"
            className="rounded-sm bg-tint px-4 py-4 sm:px-5"
          >
            <h2
              id="short-version"
              className="smallcaps text-[0.9375rem] font-medium text-primary"
            >
              The short version
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {summary.map((item, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2 text-body text-pretty"
                >
                  <span aria-hidden className="text-muted-foreground">
                    –
                  </span>
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
              className="scroll-mt-0 pt-10 lg:-scroll-mt-10"
            >
              <h2
                id={`${s.id}-h`}
                tabIndex={-1}
                className="text-title font-bold md:text-[1.375rem]"
              >
                <SectionNumber>
                  {appendix}.{i + 1}
                </SectionNumber>
                {s.title}
              </h2>
              <div className="mt-3 flex flex-col gap-4 text-body text-pretty [&_h3]:mt-2 [&_h3]:font-serif [&_h3]:text-body-lg [&_h3]:font-bold [&_li]:pl-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
