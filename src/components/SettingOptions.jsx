import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import DropDown from "../components/DropDown";
import Range from "../components/Range";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SettingOptions({
    setFromBase,
    setToBase,
    setSettings,
    fromBase,
    toBase,
    range,
}) {
    return (
        <div className="flex lg:flex-row flex-col py-4">
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <DropDown option="From" setBase={setFromBase} />
                    <ArrowRightStartOnRectangleIcon className="w-6 h-6 mx-4 my-auto" />
                    <DropDown option="To" setBase={setToBase} />
                </div>
                <Separator className="my-4" />
                <div className="flex flex-row">
                    <Range option="min" />
                    <p className="mx-4">___</p>
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
    );
}
