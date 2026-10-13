import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { minSeatsFor, roomApi, type Room } from "@/hooks/useRoom";
import { ModePicker } from "./ModePicker";
import { pickerValueOf, roomModeOf, type ModePickerValue } from "./modeChoice";
import { SeatStepper } from "./SeatStepper";
import { FIELD_LABEL, FormRow } from "./FormRow";

/** Host-only: change mode, seats and visual aids between rounds. */
export function RoomSettingsDialog({
  room,
  open,
  onOpenChange,
}: {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<ModePickerValue>(() =>
    pickerValueOf(room.mode),
  );
  const [seats, setSeats] = useState(room.maxPlayers);
  const [aids, setAids] = useState(room.allowVisualAids);
  const [saving, setSaving] = useState(false);
  const seatsId = useId();
  const aidsId = useId();

  // Fresh values every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setMode(pickerValueOf(room.mode));
    setSeats(room.maxPlayers);
    setAids(room.allowVisualAids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const minSeats = minSeatsFor(room);

  const save = async () => {
    setSaving(true);
    try {
      const next = roomModeOf(mode);
      if (next.id !== room.mode.id || room.mode.custom) {
        await roomApi.updateGameMode(room.id, next);
      }
      const settings: { allowVisualAids?: boolean; maxPlayers?: number } = {};
      if (aids !== room.allowVisualAids) settings.allowVisualAids = aids;
      if (seats !== room.maxPlayers) settings.maxPlayers = seats;
      if (Object.keys(settings).length) {
        await roomApi.updateRoomSettings(room.id, settings);
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Settings not saved",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(52rem,92dvh)] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="rule-double px-6 pb-4 pt-6">
          <DialogTitle>Room settings</DialogTitle>
          <DialogDescription>
            Changes apply to the next round for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-2 [&>div:first-child]:border-t-0">
          <ModePicker dense value={mode} onChange={setMode} />
          <FormRow
            dense
            label={
              <Label htmlFor={seatsId} className={FIELD_LABEL}>
                Seats
              </Label>
            }
            note={
              minSeats > 2
                ? `At least ${minSeats}, for the seats in use.`
                : undefined
            }
          >
            <SeatStepper
              id={seatsId}
              value={seats}
              min={minSeats}
              onChange={setSeats}
            />
          </FormRow>
          <FormRow
            dense
            label={
              <Label htmlFor={aidsId} className={FIELD_LABEL}>
                Visual aids
              </Label>
            }
          >
            <div className="flex items-center gap-4">
              <Switch id={aidsId} checked={aids} onCheckedChange={setAids} />
              <span className="text-body-sm text-muted-foreground">
                {aids ? "Allowed" : "Off"}
              </span>
            </div>
          </FormRow>
        </div>
        <DialogFooter className="border-t border-foreground/20 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
