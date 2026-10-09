import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";
import {
  QuizContext,
  ResultContext,
  QuizSettings,
  QuizResults,
} from "@/contexts/GameContexts";
import ConnectionStatus from "@/components/ConnectionStatus";
import { CookieConsent } from "@/components/CookieConsent";
import RouteFallback from "@/components/RouteFallback";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Layout = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    questions: [],
    duration: 60,
  });
  const [results, setResults] = useState<QuizResults>({
    score: 0,
  });
  const location = useLocation();

  // Immersive routes: multiplayer room pages and the active quiz hide chrome.
  const isMultiplayerRoom = /^\/multiplayer\/(lobby|game|results)\//.test(
    location.pathname,
  );
  const isActiveQuiz = location.pathname === "/quiz";
  const immersive = isMultiplayerRoom || isActiveQuiz;

  // Auth no longer blocks rendering: pages render immediately and the
  // components that need a uid wait for `user` (or call ensureUser()).
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh w-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ScrollToTop />
        <ConnectionStatus />
        <CookieConsent />
        {!immersive && <NavigationBar />}
        <main id="main" tabIndex={-1} className="flex-auto outline-none">
          <ResultContext.Provider value={{ results, setResults }}>
            <QuizContext.Provider value={{ settings, setSettings }}>
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </QuizContext.Provider>
          </ResultContext.Provider>
        </main>
        {!immersive && <Footer />}
      </div>
    </TooltipProvider>
  );
};
