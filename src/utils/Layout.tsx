import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";
import ConnectionStatus from "@/components/ConnectionStatus";
import RouteFallback from "@/components/RouteFallback";

// Toasts only ever follow a user action, so their Radix code loads after
// first paint; toasts raised before it arrives are kept and shown then.
const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);

export const Layout = () => {
  const location = useLocation();

  // Immersive routes: multiplayer room pages and the run screen hide chrome.
  const isMultiplayerRoom = /^\/multiplayer\/(lobby|game|results)\//.test(
    location.pathname,
  );
  // The run screen (/play/:modeId) is immersive; the /play hub is not.
  const isActiveQuiz = /^\/play\/[^/]+\/?$/.test(location.pathname);
  const immersive = isMultiplayerRoom || isActiveQuiz;

  // Auth no longer blocks rendering: pages render immediately and the
  // components that need a uid wait for `user` (or call ensureUser()).
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <ConnectionStatus />
      {!immersive && <NavigationBar />}
      <main id="main" tabIndex={-1} className="flex-auto outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!immersive && <Footer />}
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </div>
  );
};
