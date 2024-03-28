import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NavigationBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white">
            <div
                className="mx-auto flex items-center justify-between py-4 px-6 lg:px-8"
                aria-label="Global"
            >
                <div className="flex lg:flex-1">
                    <NavLink to="/" className="-m-1.5 p-1.5">
                        <span className="">a very based math game</span>
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
                <NavLink
                    to="/how-to-play"
                    className="hidden lg:flex pr-8 text-sm font-semibold leading-6 text-gray-900 hover:animate-pulse"
                >
                    How To Play
                </NavLink>
                <NavLink
                    to="/tutorials"
                    className="hidden lg:flex pr-8 text-sm font-semibold leading-6 text-gray-900 hover:animate-pulse"
                >
                    Tutorials
                </NavLink>
                <NavLink
                    to="/"
                    className="hidden lg:flex pr-8 text-sm font-semibold leading-6 text-gray-900 hover:animate-pulse"
                >
                    Home
                </NavLink>
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
                            <NavLink to="/" className="-m-1.5 p-1.5">
                                <span className="">a very based math game</span>
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
                            <div className="-my-6 divide-y divide-gray-500/10"></div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </nav>
    );
}
