import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { generateQuestion } from "./generator";
import { validateAnswer } from "./validator";
import { convertBase } from "./converter";
import { cn } from "@/lib/utils";

// Maximum input lengths per base type to prevent performance issues
const MAX_INPUT_LENGTHS: { [key: string]: number } = {
    binary: 64,      // 64 bits max
    octal: 22,       // ~64 bits in octal
    decimal: 20,     // Max safe integer length
    hexadecimal: 16, // 64 bits in hex
};

// Valid character patterns for each base
const VALID_PATTERNS: { [key: string]: RegExp } = {
    binary: /^[01]*$/,
    octal: /^[0-7]*$/,
    decimal: /^[0-9]*$/,
    hexadecimal: /^[0-9a-fx]*$/, // Allow 'x' for '0x' prefix
};

export default function QuizPrompt({ score, setScore, setting }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [comboCount, setComboCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuestion(generateQuestion(setting[0], setting[2], setting[3]));
        // Auto-focus input for better UX (especially mobile)
        inputRef.current?.focus();
    }, [score, setting]);

    // Reset combo counter when a new question is generated
    useEffect(() => {
        // Clear any pending combo timeout
        if (comboTimeoutRef.current) {
            clearTimeout(comboTimeoutRef.current);
        }
    }, [question]);

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget.value.toLowerCase();
        const targetBase = setting[1].toLowerCase();

        // Get max length for target base
        const maxLength = MAX_INPUT_LENGTHS[targetBase] || 20;

        // Reject if input exceeds max length
        if (input.length > maxLength) return;

        // Get validation pattern for target base
        const pattern = VALID_PATTERNS[targetBase];

        // Reject if contains invalid characters
        if (pattern && !pattern.test(input)) return;

        setAnswer(input);

        // Validate answer
        if (
            validateAnswer(
                convertBase(question, setting[0], setting[1]),
                input,
                setting[1]
            )
        ) {
            setAnswer("");
            setScore((e: number) => e + 1);

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 300);

            // Update combo counter
            setComboCount((prev) => prev + 1);

            // Reset combo after 5 seconds of inactivity
            if (comboTimeoutRef.current) {
                clearTimeout(comboTimeoutRef.current);
            }
            comboTimeoutRef.current = setTimeout(() => {
                setComboCount(0);
            }, 5000);
        }
    }

    return (
        <section className="grid sm:grid-rows-3 grid-rows-5 sm:grid-cols-2 grid-cols-1 relative">
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
            <div className="sm:row-start-3 row-start-5 sm:col-start-2 col-start-1 col-span-1 row-span-1 text-center relative">
                <Input
                    ref={inputRef}
                    onChange={(e) => handleOnChange(e)}
                    type="text"
                    value={answer}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className={cn(
                        "transition-all duration-200",
                        showSuccess && "ring-2 ring-green-500 bg-green-50 dark:bg-green-950"
                    )}
                    inputMode="text"
                    pattern={VALID_PATTERNS[setting[1].toLowerCase()]?.source}
                />

                {/* Success animation */}
                {showSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 animate-bounce">
                            ✓
                        </div>
                    </div>
                )}

                {/* Combo counter - show at 3+ */}
                {comboCount >= 3 && (
                    <div className="absolute -top-8 right-0 text-sm font-bold text-orange-600 dark:text-orange-400 animate-pulse">
                        🔥 {comboCount} combo!
                    </div>
                )}
            </div>
        </section>
    );
}
