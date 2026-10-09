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
    <div className="container max-w-3xl py-10 md:py-14">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-3 mb-6 text-muted-foreground"
      >
        <Link to="/multiplayer">
          <ArrowLeft aria-hidden />
          Multiplayer
        </Link>
      </Button>
      <PageHeader
        size="sm"
        eyebrow="New room"
        title={
          <>
            Set up a <em>room</em>
          </>
        }
        lede="Everyone in the room gets the same questions, in the same order, starting at the same second."
      />

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-10">
        <ModePicker value={mode} onChange={setMode} />

        <div className="grid gap-8 border-t pt-8 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={seatsId}>Seats</Label>
            <SeatStepper id={seatsId} value={seats} onChange={setSeats} />
            <p className="text-[0.8125rem] text-muted-foreground">
              Up to {seats} players, including you.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <Label htmlFor={aidsId}>Visual aids</Label>
              <Switch
                id={aidsId}
                checked={visualAids}
                onCheckedChange={setVisualAids}
                aria-describedby={`${aidsId}-help`}
              />
            </div>
            <p
              id={`${aidsId}-help`}
              className="text-[0.8125rem] text-muted-foreground"
            >
              Allow digit grouping and place-value hints for players who
              turned them on.
            </p>
          </div>
          <div className="sm:col-span-2 sm:max-w-sm">
            <DisplayNameField
              value={name}
              onChange={(v) => {
                setName(v);
                setNameTouched(true);
              }}
              error={nameProblem}
            />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {error && (
            <p role="alert" className="text-body-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-muted-foreground" aria-live="polite">
              <span className="font-medium text-foreground">
                {modeTitle(mode)}
              </span>{" "}
              · {seats} seats
            </p>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Creating room…" : "Create room"}
              {!pending && <ArrowRight aria-hidden />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
