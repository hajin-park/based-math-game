import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/logo";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
  componentStack: string | null;
}

/** A stale tab after a deploy can't fetch the old code-split chunks. */
function isChunkLoadError(error: Error | null): boolean {
  return (
    !!error &&
    /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
      error.message,
    )
  );
}

/**
 * App-level error boundary (outside the router and providers, so it uses
 * plain links): "This page didn’t print", Reload, back to the cover, and no
 * stack traces in production builds.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error:", error);
    if (import.meta.env.DEV) {
      this.setState({ componentStack: info.componentStack ?? null });
    }
  }

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const stale = isChunkLoadError(error);

    return (
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="container flex h-[var(--nav-h)] items-center justify-between">
            <a
              href="/"
              aria-label="Based Math Game — the cover"
              className="-ml-1 flex items-center rounded-sm p-1"
            >
              <Wordmark />
            </a>
            <span className="smallcaps">
              {stale ? "New edition" : "Misprint"}
            </span>
          </div>
        </header>
        <main
          id="main"
          className="container flex flex-1 flex-col justify-center gap-5 py-12"
        >
          <h1 className="max-w-[40rem] text-display-xl font-bold text-balance">
            {stale ? "A new edition is ready." : "This page didn’t print."}
          </h1>
          <p className="max-w-prose text-body-lg text-muted-foreground text-pretty">
            {stale
              ? "The game was updated while this tab was open. Reload to get the latest version."
              : "A bug stopped the page from working. Your saved runs and settings are safe. Reloading usually fixes it; if it keeps happening, please report it on GitHub."}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" onClick={() => window.location.reload()}>
              <RefreshCw aria-hidden />
              Reload
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/">Back to the cover</a>
            </Button>
          </div>
          {!stale && (
            <p className="text-body-sm text-muted-foreground">
              <a
                className="link"
                href="https://github.com/hajin-park/based-math-game/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report the problem
              </a>
            </p>
          )}
          {import.meta.env.DEV && (
            <details className="max-w-3xl text-[0.75rem] text-muted-foreground">
              <summary className="cursor-pointer">
                Details (development only)
              </summary>
              <pre className="mt-2 overflow-x-auto border border-border-strong bg-card p-3">
                {String(error)}
                {componentStack}
              </pre>
            </details>
          )}
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
