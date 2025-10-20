import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";
import { QuizContext, ResultContext, QuizSettings, QuizResults } from "@/contexts/GameContexts";
import { useAuth } from "@/contexts/AuthContext";
import ConnectionStatus from "@/components/ConnectionStatus";

export const Layout = () => {
    const [settings, setSettings] = useState<QuizSettings>({
        questions: [],
        duration: 60
    });
    const [results, setResults] = useState<QuizResults>({
        score: 0
    });
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="flex flex-col w-full h-screen">
            <ScrollToTop />
            <ConnectionStatus />
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
