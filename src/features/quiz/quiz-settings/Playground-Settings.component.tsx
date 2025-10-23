import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BaseSelect,
  RangeInput,
  ChosenSettingsTable,
  DurationSelect,
} from "@features/quiz";
import { QuestionSetting } from "@/contexts/GameContexts";

const BASE_OPTIONS = ["Binary", "Octal", "Decimal", "Hexadecimal"];
const DURATION_OPTIONS = [0, 10, 15, 30, 60, 120, 180, 300]; // 0 = unlimited

const StartFormSchema = z.object({
  duration: z.coerce.number().nonnegative({
    message: "Please select a duration",
  }),
});

interface PlaygroundSettingsProps {
  onStartQuiz: (settings: {
    questions: QuestionSetting[];
    duration: number;
  }) => void;
  initialSettings?: { questions: QuestionSetting[]; duration: number };
  buttonText?: string;
  showHeader?: boolean;
  isMultiplayer?: boolean;
}

export default function PlaygroundSettings({
  onStartQuiz,
  initialSettings,
  buttonText = "Start Quiz",
  showHeader = false,
  isMultiplayer = false,
}: PlaygroundSettingsProps) {
  const [fromBaseOptions, setFromBaseOptions] = useState(BASE_OPTIONS);
  const [toBaseOptions, setToBaseOptions] = useState(BASE_OPTIONS);
  const [fromBase, setFromBase] = useState("");
  const [toBase, setToBase] = useState("");
  const [rangeLower, setRangeLower] = useState(0);
  const [rangeUpper, setRangeUpper] = useState(0);
  const [chosenSettings, setChosenSettings] = useState<QuestionSetting[]>(
    initialSettings?.questions || [],
  );
  const [SettingsFormSchema, setSettingsFormSchema] = useState(
    z.object({
      rangeLower: z.coerce
        .number()
        .lte(rangeUpper, {
          message: "Minimum value must be greater than 0",
        })
        .nonnegative({
          message: "Minimum value must be greater than 0",
        }),
      rangeUpper: z.coerce.number().gte(rangeLower, {
        message: "Maximum value must be greater than the minimum value",
      }),
      fromBase: z.string().min(1, {
        message: "Please select a base.",
      }),
      toBase: z.string().min(1, {
        message: "Please select a base.",
      }),
    }),
  );

  // Update FormSchema to take into account the current/past input values
  useEffect(() => {
    setSettingsFormSchema(
      z.object({
        fromBase: z.string({
          required_error: "Please select a base.",
        }),
        toBase: z.string({
          required_error: "Please select a base.",
        }),
        rangeLower: z.coerce.number().nonnegative({
          message: "Minimum value must be greater than 0",
        }),
        rangeUpper: z.coerce.number().gte(rangeLower, {
          message: "Maximum value must be greater than the minimum value",
        }),
      }),
    );
  }, [rangeLower]);

  // Update fromBaseOptions to prevent fromBase and toBase from having the same value
  useEffect(() => {
    const newBases = BASE_OPTIONS.filter((base) => base !== toBase);
    setFromBaseOptions(newBases);
  }, [toBase]);

  // Update toBaseOptions to prevent fromBase and toBase from having the same value
  useEffect(() => {
    const newBases = BASE_OPTIONS.filter((base) => base !== fromBase);
    setToBaseOptions(newBases);
  }, [fromBase]);

  const settingsForm = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      rangeLower: 0,
      rangeUpper: 0,
      fromBase: undefined,
      toBase: undefined,
    },
  });

  const startForm = useForm<z.infer<typeof StartFormSchema>>({
    resolver: zodResolver(StartFormSchema),
    defaultValues: {
      duration: initialSettings?.duration || 60,
    },
  });

  function onSubmitSettings(data: z.infer<typeof SettingsFormSchema>) {
    // newSettings may contain duplicate settings
    const newSettings: QuestionSetting[] = [
      ...chosenSettings,
      [data.fromBase, data.toBase, data.rangeLower, data.rangeUpper],
    ];

    // Remove duplicate settings
    const seen = new Set<string>();
    const finalSettings = newSettings.filter((setting) => {
      const key = JSON.stringify(setting);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    setChosenSettings(finalSettings);
    settingsForm.reset();
  }

  function onSubmitStart(data: z.infer<typeof StartFormSchema>) {
    onStartQuiz({
      questions: chosenSettings,
      duration: data.duration,
    });
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Custom Playground</h3>
          <p className="text-sm text-muted-foreground">
            Create your own quiz with custom base conversions and number ranges
          </p>
        </div>
      )}

      {/* Step 1: Add Question Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            1
          </div>
          <h4 className="font-semibold">Add Question Types</h4>
        </div>

        <Form {...settingsForm}>
          <form
            onSubmit={settingsForm.handleSubmit(onSubmitSettings)}
            className="space-y-4"
          >
            <div className="grid gap-4 rounded-lg border p-4 bg-card">
              {/* Base Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseSelect
                  form={settingsForm}
                  name="fromBase"
                  label="Convert From"
                  setBase={setFromBase}
                  bases={fromBaseOptions}
                />
                <BaseSelect
                  form={settingsForm}
                  name="toBase"
                  label="Convert To"
                  setBase={setToBase}
                  bases={toBaseOptions}
                />
              </div>

              {/* Range Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RangeInput
                  form={settingsForm}
                  name="rangeLower"
                  label="Minimum Value"
                  setRange={setRangeLower}
                />
                <RangeInput
                  form={settingsForm}
                  name="rangeUpper"
                  label="Maximum Value"
                  setRange={setRangeUpper}
                />
              </div>

              {/* Add Button */}
              <Button type="submit" className="w-full md:w-auto md:ml-auto">
                Add Question Type
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Step 2: Review & Configure */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            2
          </div>
          <h4 className="font-semibold">Review & Configure</h4>
        </div>

        <Form {...startForm}>
          <form
            onSubmit={startForm.handleSubmit(onSubmitStart)}
            className="space-y-4"
          >
            {/* Question Settings Table */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Question Types ({chosenSettings.length})
              </label>
              <ChosenSettingsTable
                chosenSettings={chosenSettings}
                setChosenSettings={setChosenSettings}
              />
              {!chosenSettings.length && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No question types added yet. Add at least one to continue.
                </p>
              )}
            </div>

            {/* Duration Selection */}
            <DurationSelect
              form={startForm}
              name="duration"
              label="Quiz Duration"
              durations={DURATION_OPTIONS}
              settings={{ duration: startForm.watch("duration") }}
              allowUnlimited={true}
              isMultiplayer={isMultiplayer}
            />

            {/* Start Button */}
            <Button
              disabled={!chosenSettings.length}
              type="submit"
              className="w-full"
              size="lg"
            >
              {buttonText}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
