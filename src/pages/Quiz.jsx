import { QuizScore, QuizTimer, QuizPrompt, QuizInput } from "@features/quiz";

export default function Quiz() {
    return (
        <>
            <QuizScore />
            <QuizTimer />
            <QuizPrompt />
            <QuizInput />
        </>
    );
}
