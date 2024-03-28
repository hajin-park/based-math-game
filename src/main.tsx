import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./utils/Layout";
import Error from "./pages/Error";
import Usage from "./pages/Usage";
import Tutorials from "./pages/Tutorials";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
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
                path: "/how-to-play",
                element: <Usage />,
            },
            {
                path: "/tutorials",
                element: <Tutorials />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
