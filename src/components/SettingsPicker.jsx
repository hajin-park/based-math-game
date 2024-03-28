import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import BasesDropDown from "./BasesDropDown";
import IntRangeInput from "./IntRangeInput";
import SettingsChosenTable from "./SettingsChosenTable";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SettingsPicker({
    setFromBase,
    setToBase,
    setSettings,
    fromBase,
    toBase,
    range,
    settings,
}) {
    return (
        <CardContent className="flex flex-col">
            <div className="flex lg:flex-row flex-col py-4">
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <BasesDropDown option="From" setBase={setFromBase} />
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 mx-4 my-auto" />
                        <BasesDropDown option="To" setBase={setToBase} />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-row">
                        <IntRangeInput option="min" />
                        <p className="mx-4">___</p>
                        <IntRangeInput option="max" />
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
            <SettingsChosenTable settings={settings} className="max-h-full" />
        </CardContent>
    );
}
