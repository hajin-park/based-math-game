import {
  Link,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BaseOdometer } from "@/components/ui/base-odometer";
import { Wordmark } from "@/components/ui/logo";

/**
 * Route error boundary. Rendered outside <Layout>, so it prints its own
 * running head. A 404 is a page missing from this copy of the book, with
 * the status code in four bases; anything else is a page that didn't print.
 */
const ErrorPage = () => {
  const error = useRouteError();
  const { pathname } = useLocation();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const notFound = status === 404;

  if (!notFound) console.error(error);

  const detail = isRouteErrorResponse(error)
    ? error.statusText || error.data
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border">
        <div className="container flex h-[var(--nav-h)] items-center justify-between">
          <Link
            to="/"
            aria-label="Based Math Game — the cover"
            className="-ml-1 flex items-center rounded-sm p-1"
          >
            <Wordmark />
          </Link>
          <span className="smallcaps">Error {status}</span>
        </div>
      </header>
      <main
        id="main"
        className="container grid flex-1 content-center items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20"
      >
        <div className="flex max-w-[40rem] flex-col items-start gap-5">
          <h1 className="text-display-xl font-bold text-balance">
            {notFound ? (
              <>Page {status} is missing from this copy.</>
            ) : (
              <>This page didn’t print.</>
            )}
          </h1>
          {notFound ? (
            <p className="max-w-prose text-body-lg text-pretty text-muted-foreground">
              Nothing is printed at{" "}
              <code className="break-all font-mono text-[0.9em] text-foreground">
                {pathname}
              </code>
              . The link may be mistyped, or the page may have moved. The
              contents list every drill.
            </p>
          ) : (
            <p className="max-w-prose text-body-lg text-pretty text-muted-foreground">
              An unexpected error stopped this page from loading. Reloading
              usually fixes it.
            </p>
          )}
          {!notFound && detail && (
            <pre className="max-w-full overflow-x-auto border border-border-strong bg-card px-3 py-2 text-[0.75rem] text-muted-foreground">
              {String(detail)}
            </pre>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {notFound ? (
              <Button asChild size="lg">
                <Link to="/play">
                  Contents
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => window.location.reload()}>
                <RefreshCw aria-hidden />
                Reload
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="/">Back to the cover</Link>
            </Button>
          </div>
        </div>
        <figure className="flex w-full max-w-sm flex-col gap-2 justify-self-start lg:justify-self-end">
          <BaseOdometer
            value={status}
            bits={12}
            size="md"
            header
            caption={`Error ${status}`}
          />
          <figcaption className="font-sans text-[0.8125rem] text-muted-foreground">
            {status} in the four bases.
          </figcaption>
        </figure>
      </main>
    </div>
  );
};

export default ErrorPage;
