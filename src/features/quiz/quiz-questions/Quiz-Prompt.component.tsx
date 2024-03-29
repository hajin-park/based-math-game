import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { generateQuestion } from "./generator";
import { validateAnswer } from "./validator";
import { convertBase } from "./converter";

export default function QuizPrompt({ score, setScore, setting }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        setQuestion(generateQuestion(setting[0], setting[2], setting[3]));
    }, [score, setting]);

    function handleOnChange(event) {
        setAnswer(event.currentTarget.value.toLowerCase());
        if (
            validateAnswer(
                convertBase(question, setting[0], setting[1]),
                event.currentTarget.value.toLowerCase(),
                setting[1]
            )
        ) {
            setAnswer("");
            setScore((e: number) => e + 1);
        }
    }

    return (
        <section className="grid sm:grid-rows-3 grid-rows-5 sm:grid-cols-2 grid-cols-1">
            <h1 className="row-start-1 col-start-1 sm:col-span-2 text-center font-bold">
                Convert
            </h1>
            <p className="row-start-2 col-start-1 col-span-1 row-span-1 text-center">
                {setting[0]}
            </p>
            <p className="row-start-3 col-start-1 col-span-1 row-span-1 text-center">
                {question}
            </p>
            <p className="sm:row-start-2 row-start-4 sm:col-start-2 col-start-1 col-span-1 row-span-1 text-center">
                {setting[1]}
            </p>
            <div className="sm:row-start-3 row-start-5 sm:col-start-2 col-start-1 col-span-1 row-span-1 text-center">
                <Input
                    onChange={(e) => handleOnChange(e)}
                    type="text"
                    value={answer}
                ></Input>
            </div>
        </section>
    );
}
