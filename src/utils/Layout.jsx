import { Outlet } from "react-router-dom";
import { NavigationBar, Footer } from "@features/ui";
import ScrollToTop from "./ScrollToTop.jsx";

export const Layout = () => {
    return (
        <main className="flex flex-col w-full h-screen">
            <ScrollToTop />
            <div className="flex-none">
                <NavigationBar />
            </div>
            <div className="flex-auto">
                <Outlet />
            </div>
            <div className="flex-none">
                <Footer />
            </div>
        </main>
    );
};
