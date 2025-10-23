import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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

  if (chosenSettings.length === 0) {
    return (
      <div className="h-32 w-full rounded-md border flex items-center justify-center bg-muted/50">
        <p className="text-sm text-muted-foreground">No question types added</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-40 w-full rounded-md border bg-card">
      <div className="p-3 space-y-2">
        {chosenSettings.map(
          (
            setting: [
              fromBase: string,
              toBase: string,
              rangeLower: number,
              rangeUpper: number,
            ],
            index: number,
          ) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">
                  {setting[0]}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline" className="font-mono">
                  {setting[1]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Range: {setting[2]} - {setting[3]}
                </span>
              </div>
              <Button
                onClick={(e) => handleOnClick(e, index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          ),
        )}
      </div>
    </ScrollArea>
  );
}
