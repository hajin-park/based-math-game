import { AiFillGithub } from "react-icons/ai";

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950 mx-auto max-w-7xl pb-4 px-6 md:flex md:items-start md:justify-center lg:px-8">
            <div className="md:order-1 mt-0">
                <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Inspired by{" "}
                    <a href={"https://arithmetic.zetamac.com"} className="hover:text-primary">
                        https://arithmetic.zetamac.com/
                    </a>
                </p>
                <div className="flex justify-center space-x-6 md:order-2">
                    <a
                        key={"Github"}
                        href={"https://github.com/hajin-park/Based-Math-Game"}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <span className="sr-only">{"Github"}</span>
                        <AiFillGithub className="h-6 w-6" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
