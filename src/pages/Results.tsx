import { useEffect, useContext } from "react";
import {} from "@features/quiz";
import { QuizContext } from "@/Contexts.js";

export default function Quiz() {
    // @ts-ignore
    const { settings, setSettings } = useContext(QuizContext);
    useEffect(() => {
        console.log(settings);
    }, []);

    return <>Results TODO</>;
}
