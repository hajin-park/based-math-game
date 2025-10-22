import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { generateQuestion } from "./generator";
import { validateAnswer } from "./validator";
import { convertBase } from "./converter";
import { formatWithGrouping, getIndexHints } from "./formatters";
import { cn } from "@/lib/utils";
import { GameSettings } from "@/hooks/useGameSettings";

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

interface QuizPromptProps {
    score: number;
    setScore: (score: number | ((prev: number) => number)) => void;
    setting: [string, string, number, number];
    seed?: number;
    gameSettings?: GameSettings;
    allowVisualAids?: boolean; // For multiplayer: host can disable visual aids
    onKeystroke?: () => void; // Callback for tracking keystrokes
    onBackspace?: () => void; // Callback for tracking backspaces
}

export default function QuizPrompt({
    score,
    setScore,
    setting,
    seed,
    gameSettings,
    allowVisualAids = true,
    onKeystroke,
    onBackspace
}: QuizPromptProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [previousAnswerLength, setPreviousAnswerLength] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Determine if visual aids should be shown
    const showGroupedDigits = allowVisualAids && gameSettings?.groupedDigits;
    const showIndexHints = allowVisualAids && gameSettings?.indexValueHints;

    useEffect(() => {
        // Generate question with optional seed for multiplayer determinism
        setQuestion(generateQuestion(setting[0], setting[2], setting[3], seed));
        // Auto-focus input for better UX (especially mobile)
        inputRef.current?.focus();
    }, [score, setting, seed]);

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget.value.toLowerCase();
        const targetBase = setting[1].toLowerCase();

        // Track keystrokes and backspaces
        const currentLength = input.length;
        if (currentLength > previousAnswerLength) {
            // User added characters (keystroke)
            const addedChars = currentLength - previousAnswerLength;
            for (let i = 0; i < addedChars; i++) {
                onKeystroke?.();
            }
        } else if (currentLength < previousAnswerLength) {
            // User removed characters (backspace)
            const removedChars = previousAnswerLength - currentLength;
            for (let i = 0; i < removedChars; i++) {
                onBackspace?.();
            }
        }
        setPreviousAnswerLength(currentLength);

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
            setPreviousAnswerLength(0); // Reset for next question
            setScore((e: number) => e + 1);

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 300);
        }
    }

    return (
        <section className="py-8 px-4 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-muted-foreground mb-2">
                    Convert
                </h1>
            </div>

            {/* Question Display */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                {/* From Base */}
                <div className="flex flex-col items-center gap-3 min-w-[200px]">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {setting[0]}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono bg-muted px-4 sm:px-6 py-3 sm:py-4 rounded-lg min-w-[160px] sm:min-w-[180px] text-center break-all">
                            {showGroupedDigits ? formatWithGrouping(question, setting[0]) : question}
                        </div>
                        {/* Index hints - only show if not converting from decimal */}
                        {showIndexHints && setting[0].toLowerCase() !== 'decimal' && question && (
                            <div className="text-xs font-mono text-muted-foreground px-4 sm:px-6 text-center whitespace-pre font-normal tracking-wider overflow-x-auto max-w-full">
                                {getIndexHints(question, setting[0], showGroupedDigits)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow Indicator */}
                <div className="text-4xl text-muted-foreground rotate-90 md:rotate-0">
                    →
                </div>

                {/* To Base */}
                <div className="flex flex-col items-center gap-3 min-w-[200px]">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {setting[1]}
                    </div>
                    <div className="relative w-full max-w-[280px]">
                        <Input
                            ref={inputRef}
                            onChange={(e) => handleOnChange(e)}
                            type="text"
                            value={answer}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder={showSuccess ? "" : "Type your answer..."}
                            className={cn(
                                "text-lg md:text-xl font-bold font-mono text-center h-14 px-3 transition-all duration-200",
                                showSuccess && "ring-2 ring-green-500 bg-green-50 dark:bg-green-950 scale-105"
                            )}
                            inputMode="text"
                            pattern={VALID_PATTERNS[setting[1].toLowerCase()]?.source}
                        />

                        {/* Success animation */}
                        {showSuccess && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-5xl font-bold text-green-600 dark:text-green-400 animate-bounce">
                                    ✓
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Helper Text */}
            <div className="text-center text-sm text-muted-foreground">
                <p>Type your answer and press Enter or continue typing</p>
                <p className="text-xs mt-1">Press <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to exit</p>
            </div>
        </section>
    );
}
