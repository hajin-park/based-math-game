import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { generateQuestion } from "./generator";
import { validateAnswer } from "./validator";
import { convertBase } from "./converter";
import { cn } from "@/lib/utils";
import { GameSettings } from "@/hooks/useGameSettings";

// Maximum input lengths per base type to prevent performance issues
const MAX_INPUT_LENGTHS: { [key: string]: number } = {
  binary: 64, // 64 bits max
  octal: 22, // ~64 bits in octal
  decimal: 20, // Max safe integer length
  hexadecimal: 16, // 64 bits in hex
};

// Valid character patterns for each base
const VALID_PATTERNS: { [key: string]: RegExp } = {
  binary: /^[01]*$/,
  octal: /^[0-7]*$/,
  decimal: /^[0-9]*$/,
  hexadecimal: /^[0-9a-fx]*$/, // Allow 'x' for '0x' prefix
};

/**
 * Helper function to get base value
 */
function getBaseValue(base: string): number | null {
  const baseLower = base.toLowerCase();
  switch (baseLower) {
    case "binary":
      return 2;
    case "octal":
      return 8;
    case "decimal":
      return 10;
    case "hexadecimal":
      return 16;
    default:
      return null;
  }
}

/**
 * Component to render a single digit with its hint below
 */
function DigitWithHint({
  digit,
  hint,
  className = "",
}: {
  digit: string;
  hint: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono">
        {digit}
      </span>
      <span className="text-xs font-mono text-muted-foreground font-normal whitespace-nowrap">
        {hint}
      </span>
    </span>
  );
}

/**
 * Component to display number with index value hints, rendering each digit individually
 */
function NumberWithHints({
  value,
  base,
  grouped,
  showHints,
}: {
  value: string;
  base: string;
  grouped: boolean;
  showHints: boolean;
}) {
  const baseValue = getBaseValue(base);
  if (!value) return null;

  const baseLower = base.toLowerCase();
  const length = value.length;

  // Calculate hints for each digit
  const digits: { char: string; hint: string; isPadding: boolean }[] = [];
  for (let i = 0; i < length; i++) {
    const power = length - 1 - i;
    const hintValue = baseValue ? Math.pow(baseValue, power).toString() : "";
    digits.push({
      char: value[i],
      hint: hintValue,
      isPadding: false,
    });
  }

  // If grouped, add padding
  if (grouped) {
    const groupSize =
      baseLower === "binary" || baseLower === "hexadecimal"
        ? 4
        : baseLower === "octal"
          ? 3
          : 0;

    if (groupSize > 0) {
      const paddingNeeded =
        (groupSize - (value.length % groupSize)) % groupSize;
      for (let i = 0; i < paddingNeeded; i++) {
        digits.unshift({ char: "0", hint: "0", isPadding: true });
      }
    }
  }

  // Group digits if needed
  const groupSize =
    grouped && (baseLower === "binary" || baseLower === "hexadecimal")
      ? 4
      : grouped && baseLower === "octal"
        ? 3
        : 0;

  return (
    <div className="inline-flex items-start">
      {digits.map((item, index) => {
        const shouldAddSpace =
          groupSize > 0 && index > 0 && index % groupSize === 0;

        return (
          <span key={index} className="inline-flex">
            {shouldAddSpace && (
              <span className="inline-block w-2 sm:w-3" aria-hidden="true" />
            )}
            {showHints ? (
              <DigitWithHint digit={item.char} hint={item.hint} />
            ) : (
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono">
                {item.char}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

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
  onBackspace,
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
        setting[1],
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
            {/* Question number with optional hints */}
            <div className="relative bg-muted px-4 sm:px-6 py-3 sm:py-4 rounded-lg min-w-[160px] sm:min-w-[180px] flex justify-center">
              <NumberWithHints
                value={question}
                base={setting[0]}
                grouped={showGroupedDigits ?? false}
                showHints={
                  !!(
                    showIndexHints &&
                    setting[0].toLowerCase() !== "decimal" &&
                    question
                  )
                }
              />
            </div>
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
                showSuccess && "ring-2 ring-success bg-success/10 scale-105",
              )}
              inputMode="text"
              pattern={VALID_PATTERNS[setting[1].toLowerCase()]?.source}
            />

            {/* Success animation */}
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-5xl font-bold text-success animate-bounce">
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
        <span className="text-xs">
          Click the{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
            ✕
          </kbd>{" "}
          button in the top-left to exit
        </span>
      </div>
    </section>
  );
}
