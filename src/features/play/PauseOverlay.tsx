import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

/**
 * Pause: a sheet laid over the exercise page. The clock is stopped and the
 * question is hidden while it is open. Resume has focus, so Enter or Escape
 * resumes.
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
        className="paper-sheet max-w-sm gap-0 rounded-sm border-0 p-0 data-[state=open]:animate-sheet-in"
        onCloseAutoFocus={(e) => {
          // The game surface was hidden while paused; put the caret back in
          // the answer field once it is visible again.
          e.preventDefault();
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLInputElement>("[data-answer-field]")
              ?.focus({ preventScroll: true }),
          );
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (
            document.getElementById("pause-resume") as HTMLButtonElement | null
          )?.focus();
        }}
      >
        <div className="flex flex-col gap-5 p-6 sm:p-7">
          <p className="smallcaps border-b border-foreground/20 pb-2">
            Clock stopped
          </p>
          <div className="flex flex-col gap-2">
            <DialogTitle className="font-serif text-headline font-bold">
              Paused
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground text-pretty">
              {practice
                ? "Quitting ends this practice session without saving it."
                : "Quitting ends this run. It is not saved or ranked."}
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <Button id="pause-resume" size="lg" onClick={onResume}>
              Resume
              <Kbd
                size="sm"
                tone="inverse"
                className="ml-auto hidden pointer-fine:inline-flex"
                aria-hidden
              >
                Esc
              </Kbd>
            </Button>
            <Button size="lg" variant="ghost" onClick={onLeave}>
              Quit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
