import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./utils/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Error from "./pages/Error";
import Home from "./pages/Home";
import SingleplayerMode from "./pages/SingleplayerMode";
import Usage from "./pages/Usage";
import Tutorials from "./pages/Tutorials";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
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
                element: <Profile />,
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
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
