import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ExitButtonProps {
  onExit: () => void;
  title?: string;
  message?: string;
  /** Controlled open state (e.g. to open the dialog with Escape). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Exit control for immersive screens: a quiet icon button that asks for
 * confirmation. "Keep playing" has focus, so Enter or Escape returns to the
 * game.
 */
export default function ExitButton({
  onExit,
  title = "Leave this run?",
  message = "This run ends here and is not saved.",
  open,
  onOpenChange,
  className,
}: ExitButtonProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground",
            className,
          )}
          aria-label="Exit game"
          aria-keyshortcuts="Escape"
        >
          <X aria-hidden className="size-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus>Keep playing</AlertDialogCancel>
          <AlertDialogAction
            onClick={onExit}
            className={buttonVariants({ variant: "destructive" })}
          >
            Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
