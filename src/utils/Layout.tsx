import { useState } from "react";
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

export const Layout = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    questions: [],
    duration: 60,
  });
  const [results, setResults] = useState<QuizResults>({
    score: 0,
  });
  const location = useLocation();

  // Check if current route is a multiplayer room page (lobby, game, or results)
  const isMultiplayerRoom = /^\/multiplayer\/(lobby|game|results)\//.test(
    location.pathname,
  );

  // Check if current route is the active quiz page (singleplayer game)
  const isActiveQuiz = location.pathname === "/quiz";

  // Hide nav/footer for multiplayer rooms and active quiz
  const hideNavAndFooter = isMultiplayerRoom || isActiveQuiz;

  // Auth no longer blocks rendering: pages render immediately and the
  // components that need a uid wait for `user` (or call ensureUser()).
  return (
    <main className="flex flex-col w-full h-screen">
      <ScrollToTop />
      <ConnectionStatus />
      <CookieConsent />
      {!hideNavAndFooter && (
        <div className="flex-none">
          <NavigationBar />
        </div>
      )}
      <div className="flex-auto">
        <ResultContext.Provider value={{ results, setResults }}>
          <QuizContext.Provider value={{ settings, setSettings }}>
            <Outlet />
          </QuizContext.Provider>
        </ResultContext.Provider>
      </div>
      {!hideNavAndFooter && (
        <div className="flex-none">
          <Footer />
        </div>
      )}
    </main>
  );
};
