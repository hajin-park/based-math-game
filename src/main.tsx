import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Layout } from "./utils/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Error from "./pages/Error";
import LegacyRedirect from "./components/LegacyRedirect";
// Home is the landing page: keep it in the entry chunk for first paint.
import Home from "./pages/Home";
import "./index.css";
import { registerServiceWorker } from "@/lib/serviceWorker";

// Every other route is code-split; Layout wraps <Outlet /> in <Suspense>.
const Play = lazy(() => import("./pages/Play"));
const PlayRun = lazy(() => import("./pages/PlayRun"));
const Daily = lazy(() => import("./pages/Daily"));
const Usage = lazy(() => import("./pages/Usage"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Results = lazy(() => import("./pages/Results"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Stats = lazy(() => import("./pages/Stats"));
const ProfileLayout = lazy(() => import("./pages/profile/ProfileLayout"));
const ProfileOverview = lazy(() => import("./pages/profile/ProfileOverview"));
const ProfileSettings = lazy(() => import("./pages/profile/ProfileSettings"));
const ProfileGameSettings = lazy(
  () => import("./pages/profile/ProfileGameSettings"),
);
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const MultiplayerHome = lazy(() => import("./pages/MultiplayerHome"));
const CreateRoom = lazy(() => import("./pages/CreateRoom"));
const JoinRoom = lazy(() => import("./pages/JoinRoom"));
const RoomLobby = lazy(() => import("./pages/RoomLobby"));
const ToRoom = lazy(() =>
  import("./pages/RoomLobby").then((m) => ({ default: m.ToRoom })),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/play",
        element: <Play />,
      },
      {
        path: "/play/:modeId",
        element: <PlayRun />,
      },
      {
        path: "/daily",
        element: <Daily />,
      },
      {
        path: "/results",
        element: <Results />,
      },
      // Old single-player URLs.
      {
        path: "/singleplayer",
        element: <LegacyRedirect to="/play" />,
      },
      {
        path: "/quiz",
        element: <LegacyRedirect to="/play" />,
      },
      {
        path: "/settings",
        element: <Navigate to="/play?panel=settings" replace />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/stats",
        element: <Stats />,
      },
      {
        path: "/profile",
        element: <ProfileLayout />,
        children: [
          {
            path: "",
            element: <ProfileOverview />,
          },
          {
            path: "settings",
            element: <ProfileSettings />,
          },
          {
            path: "game-settings",
            element: <ProfileGameSettings />,
          },
        ],
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/how-to-play",
        element: <Usage />,
      },
      {
        path: "/learn",
        element: <Tutorials />,
      },
      {
        // Legacy URL: keep old links (and their #anchors) working.
        path: "/tutorials",
        element: <LegacyRedirect to="/learn" />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/multiplayer",
        element: <MultiplayerHome />,
      },
      {
        path: "/multiplayer/create",
        element: <CreateRoom />,
      },
      {
        path: "/multiplayer/join",
        element: <JoinRoom />,
      },
      {
        path: "/multiplayer/lobby/:roomId",
        element: <RoomLobby />,
      },
      {
        path: "/multiplayer/join/:code",
        element: <JoinRoom />,
      },
      {
        path: "/join/:code",
        element: <JoinRoom />,
      },
      {
        path: "/multiplayer/game/:roomId",
        element: <ToRoom />,
      },
      {
        path: "/multiplayer/results/:roomId",
        element: <ToRoom />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

registerServiceWorker();
