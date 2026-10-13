/**
 * /multiplayer/create — the room worksheet: format and drill, seats, visual
 * aids and your name, one line each between hairlines. The summary and the
 * Create button stay pinned to the bottom edge while the drill list scrolls.
 */
import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi } from "@/hooks/useRoom";
import { ModePicker } from "@/features/multiplayer/ModePicker";
import {
  modeTitle,
  pickerValueOf,
  roomModeOf,
  type ModePickerValue,
} from "@/features/multiplayer/modeChoice";
import { DisplayNameField } from "@/features/multiplayer/DisplayNameField";
import { FIELD_LABEL, FormRow } from "@/features/multiplayer/FormRow";
import { nameError } from "@/features/multiplayer/names";
import { SeatStepper } from "@/features/multiplayer/SeatStepper";
import { DEFAULT_ROOM_MODE, isRoomModeId } from "@/lib/roomMode";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, ensureUser, updateDisplayName } = useAuth();
  const initialMode = params.get("mode");
  const [mode, setMode] = useState<ModePickerValue>(() =>
    pickerValueOf(
      initialMode && isRoomModeId(initialMode)
        ? { id: initialMode }
        : DEFAULT_ROOM_MODE,
    ),
  );
  const [seats, setSeats] = useState(10);
  const [visualAids, setVisualAids] = useState(true);
  const [name, setName] = useState(user?.displayName ?? "");
  const [nameTouched, setNameTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seatsId = useId();
  const aidsId = useId();

  // The guest name arrives with the anonymous sign-in; fill it in once.
  useEffect(() => {
    if (!nameTouched && user?.displayName) setName(user.displayName);
  }, [user?.displayName, nameTouched]);

  const nameProblem = nameTouched ? nameError(name) : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const problem = nameError(name);
    if (problem) {
      setNameTouched(true);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const me = await ensureUser();
      if (name.trim() !== (me.displayName ?? "")) {
        await updateDisplayName(name.trim());
      }
      const roomId = await roomApi.createRoom(roomModeOf(mode), seats, {
        allowVisualAids: visualAids,
      });
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (err) {
      console.error(err);
      setError(
        "Couldn't create the room. Check your connection and try again.",
      );
      setPending(false);
    }
  };

  return (
    <div className="container max-w-4xl pb-0 pt-8 md:pt-12">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-3 mb-5 text-muted-foreground"
      >
        <Link to="/multiplayer">
          <ArrowLeft aria-hidden />
          Rooms
        </Link>
      </Button>
      <PageHeader
        size="sm"
        title="Set up a room"
        lede="Everyone in the room gets the same questions, in the same order, starting at the same second."
      />

      <form onSubmit={onSubmit} className="mt-8 flex flex-col">
        <ModePicker value={mode} onChange={setMode} />

        <FormRow
          label={
            <Label htmlFor={seatsId} className={FIELD_LABEL}>
              Seats
            </Label>
          }
          note="Including you."
        >
          <SeatStepper id={seatsId} value={seats} onChange={setSeats} />
        </FormRow>

        <FormRow
          label={
            <Label htmlFor={aidsId} className={FIELD_LABEL}>
              Visual aids
            </Label>
          }
        >
          <div className="flex items-start gap-4">
            <Switch
              id={aidsId}
              checked={visualAids}
              onCheckedChange={setVisualAids}
              aria-describedby={`${aidsId}-help`}
              className="mt-0.5"
            />
            <p
              id={`${aidsId}-help`}
              className="max-w-md text-body-sm text-muted-foreground"
            >
              {visualAids ? "Allowed." : "Off."} Digit grouping and place-value
              hints, for players who turned them on.
            </p>
          </div>
        </FormRow>

        <DisplayNameField
          row
          value={name}
          onChange={(v) => {
            setName(v);
            setNameTouched(true);
          }}
          error={nameProblem}
        />

        {/* Pinned to the bottom edge: solid paper and a double rule, no glass. */}
        <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t-[3px] border-double border-foreground/60 bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:mx-0 sm:px-0">
          {error && (
            <p role="alert" className="mb-3 text-body-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="font-sans text-label text-muted-foreground"
              aria-live="polite"
            >
              <span className="font-bold text-foreground">
                {modeTitle(mode)}
              </span>{" "}
              · <span className="font-mono">{seats}</span> seats
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="justify-between sm:min-w-48"
            >
              {pending ? "Creating room…" : "Create room"}
              {!pending && <ArrowRight aria-hidden />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
