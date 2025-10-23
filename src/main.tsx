import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./utils/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Error from "./pages/Error";
import Home from "./pages/Home";
import SingleplayerMode from "./pages/SingleplayerMode";
import Usage from "./pages/Usage";
import Tutorials from "./pages/Tutorials";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import Stats from "./pages/Stats";
import ProfileLayout from "./pages/profile/ProfileLayout";
import ProfileOverview from "./pages/profile/ProfileOverview";
import ProfileSettings from "./pages/profile/ProfileSettings";
import ProfileGameSettings from "./pages/profile/ProfileGameSettings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MultiplayerHome from "./pages/MultiplayerHome";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import RoomLobby from "./pages/RoomLobby";
import MultiplayerGame from "./pages/MultiplayerGame";
import MultiplayerResults from "./pages/MultiplayerResults";
import "./index.css";

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
        path: "/singleplayer",
        element: <SingleplayerMode />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/quiz",
        element: <Quiz />,
      },
      {
        path: "/results",
        element: <Results />,
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
        path: "/tutorials",
        element: <Tutorials />,
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
        path: "/multiplayer/game/:roomId",
        element: <MultiplayerGame />,
      },
      {
        path: "/multiplayer/results/:roomId",
        element: <MultiplayerResults />,
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

// Register service worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });

  // Handle controller change (new service worker took over) - auto reload
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
