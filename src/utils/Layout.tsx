import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";
import { QuizContext, ResultContext } from "@/Contexts.js";

export const Layout = () => {
    const [settings, setSettings] = useState({});
    const [results, setResults] = useState({});

    return (
        <main className="flex flex-col w-full h-screen">
            <ScrollToTop />
            <div className="flex-none">
                <NavigationBar />
            </div>
            <div className="flex-auto">
                <ResultContext.Provider value={{ results, setResults }}>
                    <QuizContext.Provider value={{ settings, setSettings }}>
                        <Outlet />
                    </QuizContext.Provider>
                </ResultContext.Provider>
            </div>
            <div className="flex-none">
                <Footer />
            </div>
        </main>
    );
};
