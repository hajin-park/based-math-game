import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

/**
 * Pause overlay for the run screen. The clock is stopped and the question is
 * hidden while it is open. Resume has focus, so Enter or Escape resumes.
 */
export function PauseOverlay({
  open,
  onResume,
  onLeave,
  practice,
}: {
  open: boolean;
  onResume: () => void;
  onLeave: () => void;
  practice: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onResume()}>
      <DialogContent
        hideClose
        className="max-w-sm gap-6 text-center"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (
            document.getElementById("pause-resume") as HTMLButtonElement | null
          )?.focus();
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="eyebrow">Clock stopped</p>
          <DialogTitle className="font-serif text-headline font-medium">
            Paused
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground text-pretty">
            {practice
              ? "Leaving ends this practice session without saving it."
              : "Leaving ends this run. It is not saved or ranked."}
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-2">
          <Button id="pause-resume" size="lg" onClick={onResume}>
            <Play aria-hidden />
            Resume
            <Kbd
              size="sm"
              tone="inverse"
              className="hidden pointer-fine:inline-flex"
              aria-hidden
            >
              Esc
            </Kbd>
          </Button>
          <Button size="lg" variant="ghost" onClick={onLeave}>
            Leave run
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
