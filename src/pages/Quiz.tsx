import { useEffect, useContext } from "react";
import { QuizScore, QuizTimer, QuizPrompt, QuizInput } from "@features/quiz";
import { QuizContext } from "@/Contexts.js";

export default function Quiz() {
    // @ts-ignore
    const { settings, setSettings } = useContext(QuizContext);

    useEffect(() => {
        console.log(settings);
    }, []);

    return (
        <>
            <QuizScore />
            <QuizTimer />
            <QuizPrompt />
            <QuizInput />
        </>
    );
}
