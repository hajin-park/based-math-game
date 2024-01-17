import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function SettingsTable({ settings }) {
    return (
        <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none">
                    Settings
                </h4>
                {settings.map((setting) => (
                    <>
                        <div key={setting} className="text-sm">
                            {setting}
                        </div>
                        <Separator className="my-2" />
                    </>
                ))}
            </div>
        </ScrollArea>
    );
}
