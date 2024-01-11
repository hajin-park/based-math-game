import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar.jsx";
import Footer from "../components/Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

export const Layout = () => {
    return (
        <main className="w-screen h-screen">
            <ScrollToTop />
            <NavigationBar />
            <Outlet />
            <Footer />
        </main>
    );
};
