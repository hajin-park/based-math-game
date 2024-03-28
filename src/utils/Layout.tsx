import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";
import { QuizContext } from "@/Contexts.js";

export const Layout = () => {
    const [settings, setSettings] = useState([]);

    return (
        <main className="flex flex-col w-full h-screen">
            <ScrollToTop />
            <div className="flex-none">
                <NavigationBar />
            </div>
            <div className="flex-auto">
                <QuizContext.Provider value={{ settings, setSettings }}>
                    <Outlet />
                </QuizContext.Provider>
            </div>
            <div className="flex-none">
                <Footer />
            </div>
        </main>
    );
};
