import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function ChosenSettingsTable({
    chosenSettings,
    setChosenSettings,
}) {
    // Delete existing setting if clicked
    function handleOnClick(e, index: number) {
        e.preventDefault();
        const newSettings = [...chosenSettings];
        newSettings.splice(index, 1);
        setChosenSettings(newSettings);
    }

    return (
        <ScrollArea className="h-36 w-full rounded-md border p-2 bg-muted">
            <h4 className="text-sm font-medium leading-none">Settings</h4>
            {chosenSettings.map(
                (
                    setting: [
                        fromBase: string,
                        toBase: string,
                        rangeLower: number,
                        rangeUpper: number
                    ],
                    index: number
                ) => (
                    <>
                        <div
                            key={index}
                            className="flex items-center w-full px-4"
                        >
                            <div className="text-sm text-center">
                                {setting[0]} to {setting[1]} [{setting[2]},{" "}
                                {setting[3]}]
                            </div>
                            <Button
                                onClick={(e) => handleOnClick(e, index)}
                                className="ml-auto"
                            >
                                Delete
                            </Button>
                        </div>
                        <Separator className="my-2" />
                    </>
                )
            )}
        </ScrollArea>
    );
}
