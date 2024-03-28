import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./utils/Layout.jsx";
import Error from "./pages/Error.jsx";
import Usage from "./pages/Usage.jsx";
import Tutorials from "./pages/Tutorials.jsx";
import Settings from "./pages/Settings.jsx";
import Quiz from "./pages/Quiz.jsx";
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

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
