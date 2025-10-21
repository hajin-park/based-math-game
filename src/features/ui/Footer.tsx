import { AiFillGithub } from "react-icons/ai";
import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Based Math Game
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Master base conversion through interactive practice and timed quizzes.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com/hajin-park/based-math-game"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                aria-label="GitHub"
                            >
                                <AiFillGithub className="h-6 w-6" aria-hidden="true" />
                            </a>
                        </div>
                    </div>

                    {/* Learn Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Learn
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/tutorials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Tutorials
                                </Link>
                            </li>
                            <li>
                                <Link to="/how-to-play" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    How to Play
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Play Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Play
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/singleplayer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Singleplayer
                                </Link>
                            </li>
                            <li>
                                <Link to="/multiplayer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Multiplayer
                                </Link>
                            </li>
                            <li>
                                <Link to="/leaderboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Leaderboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/stats" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Stats
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/hajin-park/based-math-game/blob/main/LICENSE"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                                >
                                    License (GPL-3.0)
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            © {currentYear} Based Math Game. Open source under GPL-3.0.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Inspired by{' '}
                            <a
                                href="https://arithmetic.zetamac.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary underline"
                            >
                                zetamac
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
