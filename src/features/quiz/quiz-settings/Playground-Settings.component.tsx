import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Zap, Plus } from "lucide-react";
import { ChosenSettingsTable, DurationSelect } from "@features/quiz";
import { QuestionSetting } from "@/contexts/GameContexts";

const BASE_OPTIONS = ["Binary", "Octal", "Decimal", "Hexadecimal"];
const DURATION_OPTIONS = [0, 10, 15, 30, 60, 120, 180, 300]; // 0 = unlimited
const TARGET_QUESTIONS_OPTIONS = [5, 10, 15, 20, 25, 30, 50, 100];

const StartFormSchema = z
  .object({
    gameMode: z.enum(["timed", "speedrun"]),
    duration: z.coerce.number().nonnegative().optional(),
    targetQuestions: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.gameMode === "timed") return data.duration !== undefined;
      if (data.gameMode === "speedrun")
        return data.targetQuestions !== undefined;
      return false;
    },
    {
      message: "Please select a duration or target questions",
    },
  );

interface PlaygroundSettingsProps {
  onStartQuiz: (settings: {
    questions: QuestionSetting[];
    duration: number;
    targetQuestions?: number;
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
      gameMode: "timed",
      duration: initialSettings?.duration || 60,
      targetQuestions: 10,
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
      duration: data.gameMode === "timed" ? data.duration || 60 : 0,
      targetQuestions:
        data.gameMode === "speedrun" ? data.targetQuestions : undefined,
    });
  }

  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Custom Playground</h3>
          <p className="text-sm text-muted-foreground">
            Create your own quiz with custom base conversions and number ranges
          </p>
        </div>
      )}

      {/* Step 1: Add Question Settings */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            1
          </div>
          <h4 className="text-sm font-semibold">Add Question Types</h4>
        </div>

        <Form {...settingsForm}>
          <form
            onSubmit={settingsForm.handleSubmit(onSubmitSettings)}
            className="space-y-2"
          >
            <div className="grid gap-2 rounded-lg border-2 p-2 bg-card">
              {/* Base Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* From Base */}
                <FormField
                  control={settingsForm.control}
                  name="fromBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        From Base
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setFromBase(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select base" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>From Base</SelectLabel>
                            {fromBaseOptions.map((base: string) => (
                              <SelectItem key={base} value={base}>
                                {base}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* To Base */}
                <FormField
                  control={settingsForm.control}
                  name="toBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        To Base
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setToBase(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select base" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>To Base</SelectLabel>
                            {toBaseOptions.map((base: string) => (
                              <SelectItem key={base} value={base}>
                                {base}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Range Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Minimum Value */}
                <FormField
                  control={settingsForm.control}
                  name="rangeLower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Minimum Value
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8 text-xs"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setRangeLower(value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Maximum Value */}
                <FormField
                  control={settingsForm.control}
                  name="rangeUpper"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Maximum Value
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          className="h-8 text-xs"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setRangeUpper(value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1 border-t">
                {/* Base Conversion Presets */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Base Presets:
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("fromBase", "Binary");
                        settingsForm.setValue("toBase", "Decimal");
                        setFromBase("Binary");
                        setToBase("Decimal");
                      }}
                    >
                      Bin → Dec
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("fromBase", "Decimal");
                        settingsForm.setValue("toBase", "Binary");
                        setFromBase("Decimal");
                        setToBase("Binary");
                      }}
                    >
                      Dec → Bin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("fromBase", "Hexadecimal");
                        settingsForm.setValue("toBase", "Decimal");
                        setFromBase("Hexadecimal");
                        setToBase("Decimal");
                      }}
                    >
                      Hex → Dec
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("fromBase", "Decimal");
                        settingsForm.setValue("toBase", "Hexadecimal");
                        setFromBase("Decimal");
                        setToBase("Hexadecimal");
                      }}
                    >
                      Dec → Hex
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("fromBase", "Octal");
                        settingsForm.setValue("toBase", "Decimal");
                        setFromBase("Octal");
                        setToBase("Decimal");
                      }}
                    >
                      Oct → Dec
                    </Button>
                  </div>
                </div>

                {/* Range Presets */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Range Presets:
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("rangeLower", 0);
                        settingsForm.setValue("rangeUpper", 15);
                        setRangeLower(0);
                        setRangeUpper(15);
                      }}
                    >
                      Easy (0-15)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("rangeLower", 0);
                        settingsForm.setValue("rangeUpper", 255);
                        setRangeLower(0);
                        setRangeUpper(255);
                      }}
                    >
                      Medium (0-255)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        settingsForm.setValue("rangeLower", 0);
                        settingsForm.setValue("rangeUpper", 4095);
                        setRangeLower(0);
                        setRangeUpper(4095);
                      }}
                    >
                      Hard (0-4095)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <Button type="submit" className="w-full h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Question Type
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Step 2: Review & Configure */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            2
          </div>
          <h4 className="text-sm font-semibold">Review & Configure</h4>
        </div>

        <Form {...startForm}>
          <form
            onSubmit={startForm.handleSubmit(onSubmitStart)}
            className="space-y-2"
          >
            {/* Question Settings Table */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Question Types</label>
                {chosenSettings.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {chosenSettings.length}{" "}
                    {chosenSettings.length === 1 ? "type" : "types"}
                  </Badge>
                )}
              </div>
              <ChosenSettingsTable
                chosenSettings={chosenSettings}
                setChosenSettings={setChosenSettings}
              />
            </div>

            {/* Game Mode Selection */}
            <FormField
              control={startForm.control}
              name="gameMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Game Mode
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg">
                      <Button
                        type="button"
                        variant={field.value === "timed" ? "default" : "ghost"}
                        className="h-8 text-xs"
                        onClick={() => field.onChange("timed")}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Timed
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "speedrun" ? "default" : "ghost"
                        }
                        className="h-8 text-xs"
                        onClick={() => field.onChange("speedrun")}
                      >
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Speed Run
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value === "timed"
                      ? "Answer as many questions as possible within the time limit"
                      : "Complete the target number of questions as fast as possible"}
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Conditional: Duration or Target Questions */}
            {startForm.watch("gameMode") === "timed" ? (
              <DurationSelect
                form={startForm}
                name="duration"
                label="Quiz Duration"
                durations={DURATION_OPTIONS}
                settings={{ duration: startForm.watch("duration") || 60 }}
                allowUnlimited={true}
                isMultiplayer={isMultiplayer}
              />
            ) : (
              <FormField
                control={startForm.control}
                name="targetQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Target Questions
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={`${startForm.watch("targetQuestions") || 10}`}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select target questions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Target Questions</SelectLabel>
                          {TARGET_QUESTIONS_OPTIONS.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} questions
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {/* Start Button */}
            <Button
              disabled={!chosenSettings.length}
              type="submit"
              className="w-full h-9 text-sm font-semibold"
              size="default"
            >
              {buttonText}
            </Button>
            {!chosenSettings.length && (
              <p className="text-xs text-center text-muted-foreground">
                Add at least one question type to start
              </p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
