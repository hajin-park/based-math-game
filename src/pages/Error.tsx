import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BaseOdometer } from "@/components/ui/base-odometer";
import { GridPaper } from "@/components/ui/grid-paper";
import { Logomark } from "@/components/ui/logo";

/**
 * Route error boundary. Rendered outside <Layout>, so it carries its own
 * minimal chrome. 404s show the status code in four bases.
 */
const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const notFound = status === 404;

  if (!notFound) console.error(error);

  const detail = isRouteErrorResponse(error)
    ? error.statusText || error.data
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <GridPaper fade />
      <header className="container flex h-[var(--nav-h)] items-center">
        <Link
          to="/"
          aria-label="Based Math Game — home"
          className="-ml-1 flex items-center rounded-md p-1"
        >
          <Logomark />
        </Link>
      </header>
      <main
        id="main"
        className="container grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:gap-20"
      >
        <div className="flex flex-col items-start gap-6">
          <p className="eyebrow">Error {status}</p>
          <h1 className="text-display-xl font-serif font-normal [font-variation-settings:'opsz'_72]">
            {notFound ? (
              <>
                This page doesn’t exist{" "}
                <em className="italic text-primary">in any base</em>.
              </>
            ) : (
              <>
                Something <em className="italic text-primary">overflowed</em>.
              </>
            )}
          </h1>
          <p className="max-w-lede text-body-lg text-muted-foreground">
            {notFound
              ? "The link may be mistyped or the page may have moved. Everything else is one click away."
              : "An unexpected error stopped this page from loading. Reloading usually fixes it."}
          </p>
          {!notFound && detail && (
            <pre className="max-w-full overflow-x-auto rounded-md border bg-sunken px-3 py-2 text-[0.75rem] text-muted-foreground">
              {String(detail)}
            </pre>
          )}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeft aria-hidden />
                Back to home
              </Link>
            </Button>
            {notFound ? (
              <Button asChild size="lg" variant="outline">
                <Link to="/play">Start a sprint</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw aria-hidden />
                Reload
              </Button>
            )}
          </div>
        </div>
        <BaseOdometer
          value={status}
          bits={12}
          size="md"
          header
          caption={`${status} · 12-bit`}
          className="max-w-md justify-self-center lg:justify-self-end"
        />
      </main>
    </div>
  );
};

export default ErrorPage;
