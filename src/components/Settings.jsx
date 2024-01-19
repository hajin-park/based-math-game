import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DropDown from "./DropDown";
import SettingsTable from "./SettingsTable";
import DurationSelect from "./DurationSelect";
import Range from "./Range";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Settings() {
    const [settings, setSettings] = useState([]);
    const [fromBase, setFromBase] = useState("");
    const [toBase, setToBase] = useState("");
    const [range, setRange] = useState([]);
    const [duration, setDuration] = useState(120);

    return (
        <div className="mt-12 flex flex-col">
            <Card className="lg:w-[800px] mx-auto">
                <CardHeader>
                    <CardTitle>Based Math Game</CardTitle>
                    <CardDescription>
                        The Base Math Game is a practice tool for converting
                        between different bases.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col">
                    <div className="flex lg:flex-row flex-col">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <DropDown option="From" setBase={setFromBase} />
                                <ArrowRightStartOnRectangleIcon className="w-6 h-6 m-4" />
                                <DropDown option="To" setBase={setToBase} />
                            </div>
                            <div className="flex flex-row">
                                <Range option="min" />
                                <Range option="max" />
                            </div>
                        </div>

                        <Button
                            onClick={() =>
                                setSettings((e) => [
                                    ...e,
                                    {
                                        from: fromBase,
                                        to: toBase,
                                        range: range,
                                    },
                                ])
                            }
                            className="lg:ml-auto my-auto"
                        >
                            Add
                        </Button>
                    </div>
                    <SettingsTable settings={settings} />
                </CardContent>
                <CardFooter>
                    <DurationSelect setDuration={setDuration} />
                </CardFooter>
            </Card>
            <Button className="lg:w-[800px] mx-auto">Play</Button>
        </div>
    );
}
