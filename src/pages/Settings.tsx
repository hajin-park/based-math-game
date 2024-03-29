"use client";

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    SettingsHeader,
    // SettingsFooter,
    BaseSelect,
    RangeInput,
    ChosenSettingsTable,
    DurationSelect,
} from "@features/quiz";
import { QuizContext } from "@/Contexts.js";

const BASE_OPTIONS = ["Binary", "Octal", "Decimal", "Hexadecimal"];
const DURATION_OPTIONS = [10, 15, 30, 60, 120, 180, 300];
const StartFormSchema = z.object({
    duration: z.coerce.number().positive({
        message: "Please select a duration",
    }),
});

export default function Settings() {
    const [fromBaseOptions, setFromBaseOptions] = useState(BASE_OPTIONS);
    const [toBaseOptions, setToBaseOptions] = useState(BASE_OPTIONS);
    const [fromBase, setFromBase] = useState("");
    const [toBase, setToBase] = useState("");
    const [rangeLower, setRangeLower] = useState(0);
    const [rangeUpper, setRangeUpper] = useState(0);
    const [chosenSettings, setChosenSettings] = useState([]); // [fromBase, toBase, rangeLower, rangeUpper]
    const [SettingsFormSchema, setSettingsFormSchema] = useState(
        // Set FormSchema dynamically using state since validation conditions depend on current/past inputs
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
        })
    );

    // @ts-ignore
    const { settings, setSettings } = useContext(QuizContext);
    const navigate = useNavigate();

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
                    message:
                        "Maximum value must be greater than the minimum value",
                }),
            })
        );
    }, [rangeLower]);

    // Keep persistent settings between games
    useEffect(() => {
        setChosenSettings(settings.questions || []);
    }, []);

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
            duration: settings.duration,
        },
    });

    function onSubmitSettings(data: z.infer<typeof SettingsFormSchema>) {
        // newSettings may contain duplicate settings
        const newSettings = [
            // @ts-ignore
            ...chosenSettings,
            // @ts-ignore
            [data.fromBase, data.toBase, data.rangeLower, data.rangeUpper],
        ];

        // Remove duplicate settings
        const t = {};
        // @ts-ignore
        const finalSettings = newSettings.filter((a) => !(t[a] = a in t));

        setChosenSettings(
            // @ts-ignore
            [...finalSettings]
        );
        // console.log(data);
    }

    function onSubmitStart(data: z.infer<typeof StartFormSchema>) {
        setSettings({
            questions: chosenSettings,
            duration: data.duration,
        });
        navigate("/quiz");
        // console.log(data);
    }

    return (
        <Card className="mx-auto w-5/6 md:w-2/3 lg:w-3/5 bg-gray-50">
            <SettingsHeader />
            <CardContent>
                <Form {...settingsForm}>
                    <form
                        onSubmit={settingsForm.handleSubmit(onSubmitSettings)}
                        className="p-4 flex sm:flex-row flex-col sm:justify-between justify-evenly"
                    >
                        <div className="w-full sm:grid sm:grid-cols-6 sm:grid-rows-2">
                            <div className="sm:col-start-1 sm:row-start-1 sm:col-span-3">
                                <BaseSelect
                                    form={settingsForm}
                                    name="fromBase"
                                    label="From"
                                    setBase={setFromBase}
                                    bases={fromBaseOptions}
                                />
                            </div>

                            <div className="sm:col-start-4 sm:row-start-1 sm:col-span-3">
                                <BaseSelect
                                    form={settingsForm}
                                    name="toBase"
                                    label="To"
                                    setBase={setToBase}
                                    bases={toBaseOptions}
                                    className="sm:col-start-4 sm:row-start-1 sm:col-span-3"
                                />
                            </div>

                            <div className="sm:col-start-1 sm:row-start-2 sm:col-span-3">
                                <RangeInput
                                    form={settingsForm}
                                    name="rangeLower"
                                    label="min"
                                    setRange={setRangeLower}
                                    className="sm:col-start-1 sm:row-start-2 sm:col-span-3"
                                />
                            </div>
                            <div className="sm:col-start-4 sm:row-start-2 sm:col-span-3">
                                <RangeInput
                                    form={settingsForm}
                                    name="rangeUpper"
                                    label="max"
                                    setRange={setRangeUpper}
                                    className="sm:col-start-4 sm:row-start-2 sm:col-span-3"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="sm:place-self-end">
                            Add
                        </Button>
                    </form>
                </Form>
                <Form {...startForm}>
                    <form onSubmit={startForm.handleSubmit(onSubmitStart)}>
                        <ChosenSettingsTable
                            chosenSettings={chosenSettings}
                            setChosenSettings={setChosenSettings}
                        />
                        <DurationSelect
                            form={startForm}
                            name="duration"
                            label="Select Duration"
                            durations={DURATION_OPTIONS}
                            settings={settings}
                        />
                        <Button disabled={!chosenSettings.length} type="submit">
                            Submit
                        </Button>
                    </form>
                </Form>
            </CardContent>

            {/* <SettingsFooter /> */}
        </Card>
    );
}
