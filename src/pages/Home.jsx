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
import SettingTable from "../components/SettingTable";
import SettingOptions from "../components/SettingOptions";
import DurationSelect from "../components/DurationSelect";

export default function Home() {
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
                    <SettingOptions
                        setFromBase={setFromBase}
                        setToBase={setToBase}
                        setSettings={setSettings}
                        fromBase={fromBase}
                        toBase={toBase}
                        range={range}
                    />
                    <SettingTable settings={settings} />
                </CardContent>
                <CardFooter>
                    <DurationSelect setDuration={setDuration} />
                </CardFooter>
            </Card>
            <Button className="lg:w-[800px] mx-auto">Play</Button>
        </div>
    );
}
