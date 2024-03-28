import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function SettingsChosenTable({ settings }) {
    return (
        <ScrollArea className="w-full h-32 p-4 rounded-md border">
            {settings.map((setting) => (
                <>
                    <div key={setting} className="text-sm">
                        {setting.from} to {setting.to}
                    </div>
                    <Separator className="my-2" />
                </>
            ))}
        </ScrollArea>
    );
}
