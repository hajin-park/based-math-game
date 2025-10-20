import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function NavigationBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isGuest } = useAuth();

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Play", href: "/singleplayer" },
        { name: "Multiplayer", href: "/multiplayer" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Stats", href: "/stats" },
        { name: "Tutorials", href: "/tutorials" },
    ];

    return (
        <nav className="bg-white border-b">
            <div
                className="mx-auto flex items-center justify-between py-4 px-6 lg:px-8"
                aria-label="Global"
            >
                <div className="flex lg:flex-1">
                    <NavLink to="/" className="-m-1.5 p-1.5 font-bold text-lg">
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Based Math Game
                        </span>
                    </NavLink>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-6 items-center">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `text-sm font-semibold leading-6 transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-gray-900 hover:text-primary"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                    {isGuest ? (
                        <Button asChild size="sm">
                            <NavLink to="/signup">Sign Up</NavLink>
                        </Button>
                    ) : (
                        <Button asChild size="sm" variant="outline">
                            <NavLink to="/profile">Profile</NavLink>
                        </Button>
                    )}
                </div>
            </div>
            <Dialog
                as="div"
                className="lg:hidden"
                open={mobileMenuOpen}
                onClose={setMobileMenuOpen}
            >
                <div className="fixed inset-0 z-10" />
                <Dialog.Panel className="fixed inset-y-0 right-0 z-10 flex w-full flex-col justify-between overflow-y-auto bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <NavLink to="/" className="-m-1.5 p-1.5 font-bold">
                                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Based Math Game
                                </span>
                            </NavLink>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}
                                <div className="pt-4 border-t">
                                    {isGuest ? (
                                        <Button asChild className="w-full">
                                            <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                                Sign Up
                                            </NavLink>
                                        </Button>
                                    ) : (
                                        <Button asChild variant="outline" className="w-full">
                                            <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                                Profile
                                            </NavLink>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </nav>
    );
}
