import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QuizPrompt, QuizStats } from "@features/quiz";
import { QuizContext, ResultContext } from "@/Contexts.js";

export default function Quiz() {
    // @ts-ignore
    const { settings } = useContext(QuizContext);
    // @ts-ignore
    const { setResults } = useContext(ResultContext);
    const [running, setRunning] = useState(true);
    const [score, setScore] = useState(0);
    const [randomSetting, setRandomSetting] = useState(
        settings.questions[
            Math.floor(Math.random() * settings.questions.length)
        ]
    );
    const navigate = useNavigate();
    // @ts-ignore
    const time = new Date();
    time.setSeconds(time.getSeconds() + settings.duration);

    console.log(settings);

    useEffect(() => {
        if (!running) {
            setResults({ score: score });
            navigate("/results");
        }
    }, [running]);

    useEffect(() => {
        const randomIndex = Math.floor(
            Math.random() * settings.questions.length
        );
        setRandomSetting(settings.questions[randomIndex]);
    }, [score]);

    return (
        <Card className="mx-auto w-5/6 md:w-2/3 lg:w-3/5 bg-gray-50">
            <QuizStats
                expiryTimestamp={time}
                setRunning={setRunning}
                score={score}
            />
            <CardContent>
                <QuizPrompt
                    score={score}
                    setScore={setScore}
                    setting={randomSetting}
                />
            </CardContent>
        </Card>
    );
}
