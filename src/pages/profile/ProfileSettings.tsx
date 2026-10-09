import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2, LogOut, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FormError, PasswordField } from "@/components/auth/AuthFields";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalRuns, modeIdFromBestsKey, isRankedModeId, useUserStats } from "@/data";
import { friendlyAuthError } from "@/lib/authErrors";
import {
  DISPLAY_NAME_MAX,
  validateDisplayName,
} from "@/utils/displayNameValidator";
import { toast } from "@/components/ui/use-toast";

function Section({
  id,
  title,
  description,
  children,
  tone,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-b py-8 first:pt-0 last:border-b-0 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-10"
    >
      <div className="flex flex-col gap-1.5">
        <h2
          id={id}
          className={tone === "danger" ? "text-title font-semibold text-destructive" : "text-title font-semibold"}
        >
          {title}
        </h2>
        {description && (
          <p className="text-body-sm text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      <div className="flex min-w-0 max-w-lg flex-col gap-4">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function DisplayNameForm() {
  const { user, isGuest, updateDisplayName } = useAuth();
  const current = user?.displayName ?? "";
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setValue(current), [current]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const v = validateDisplayName(value);
    if (!v.isValid) {
      setError(v.error ?? "Pick a different display name.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await updateDisplayName(value.trim());
      setSaved(true);
    } catch (err) {
      setError(friendlyAuthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const dirty = value.trim() !== current;
  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      <Field
        id="displayName"
        label="Display name"
        value={value}
        maxLength={DISPLAY_NAME_MAX}
        autoComplete="nickname"
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        error={error}
        help={
          isGuest
            ? `Shown to other players in multiplayer rooms. 1–${DISPLAY_NAME_MAX} characters.`
            : `Shown on leaderboards and in rooms; your existing leaderboard entries update too. 1–${DISPLAY_NAME_MAX} characters.`
        }
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={busy || !dirty}>
          {busy && <Loader2 className="motion-safe:animate-spin" aria-hidden />}
          Save name
        </Button>
        <p role="status" className="flex items-center gap-1.5 text-[0.8125rem] text-success">
          {saved && (
            <>
              <Check className="size-4" aria-hidden /> Saved
            </>
          )}
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function PasswordSection() {
  const { user, sendPasswordReset } = useAuth();
  const providers = user?.providerData.map((p) => p.providerId) ?? [];
  const hasPassword = providers.includes("password");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasPassword) {
    return (
      <p className="text-body-sm text-muted-foreground">
        You sign in with Google, so there’s no separate password here. Manage
        it in your Google account.
      </p>
    );
  }

  const onSend = async () => {
    if (!user?.email) return;
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(user.email);
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-muted-foreground text-pretty">
        We’ll email a secure link to{" "}
        <span className="font-medium text-foreground">{user?.email}</span>. Open
        it to choose a new password.
      </p>
      <div>
        <Button variant="outline" onClick={onSend} disabled={busy || sent}>
          {busy ? (
            <Loader2 className="motion-safe:animate-spin" aria-hidden />
          ) : sent ? (
            <MailCheck aria-hidden />
          ) : null}
          {sent ? "Reset email sent" : "Send password reset email"}
        </Button>
      </div>
      <p role="status" className="text-[0.8125rem] text-muted-foreground">
        {sent
          ? "Check your inbox (and spam folder). The link expires after an hour."
          : ""}
      </p>
      <FormError message={error} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function DeleteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const { user, isGuest, deleteAccount } = useAuth();
  const { stats } = useUserStats();
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGoogle = user?.providerData.some((p) => p.providerId === "google.com");
  const localRuns = useMemo(() => (open ? getLocalRuns().length : 0), [open]);
  const rankedModes = useMemo(
    () =>
      Object.keys(stats.bests || {})
        .map(modeIdFromBestsKey)
        .filter(isRankedModeId).length,
    [stats.bests],
  );

  // Email accounts that signed in more than a few minutes ago must confirm
  // their password (Firebase requires a recent sign-in to delete a user).
  const hasPassword = user?.providerData.some((p) => p.providerId === "password");
  useEffect(() => {
    if (!open) {
      setConfirm("");
      setPassword("");
      setNeedPassword(false);
      setError(null);
      return;
    }
    const last = Date.parse(user?.metadata.lastSignInTime || "");
    const recent = Number.isFinite(last) && Date.now() - last < 3 * 60_000;
    setNeedPassword(!isGuest && !isGoogle && !!hasPassword && !recent);
  }, [open, user, isGuest, isGoogle, hasPassword]);

  const word = isGuest ? "RESET" : "DELETE";
  const ready = confirm.trim().toUpperCase() === word && (!needPassword || password);

  const onDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(needPassword ? { password } : undefined);
      onOpenChange(false);
      toast({
        title: isGuest ? "Guest data cleared" : "Account deleted",
        description: isGuest
          ? "This device starts fresh as a new guest."
          : "Your account and everything listed were removed.",
      });
      navigate("/", { replace: true });
    } catch (err) {
      const f = friendlyAuthError(err);
      if (f.silent) return;
      if (f.code === "auth/requires-recent-login" && !isGoogle) {
        setNeedPassword(true);
        setError(
          needPassword
            ? f.message
            : "For your security, enter your password to confirm.",
        );
      } else if (f.code === "auth/wrong-password" || f.code === "auth/invalid-credential") {
        setError("That password isn’t right.");
      } else {
        setError(f.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={onDelete} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>
              {isGuest ? "Clear guest data?" : "Delete your account?"}
            </DialogTitle>
            <DialogDescription>
              This can’t be undone. Here’s exactly what goes:
            </DialogDescription>
          </DialogHeader>

          <ul className="list-disc space-y-1.5 pl-5 text-body-sm marker:text-muted-foreground">
            {isGuest ? (
              <>
                <li>
                  {localRuns} {localRuns === 1 ? "run" : "runs"} and your game
                  settings stored in this browser
                </li>
                <li>Your anonymous guest ID and guest name</li>
                <li>Your online status record used by multiplayer</li>
              </>
            ) : (
              <>
                <li>
                  Your profile: display name and game settings
                </li>
                <li>
                  Your run history, stats and personal bests ({stats.gamesPlayed}{" "}
                  {stats.gamesPlayed === 1 ? "run" : "runs"})
                </li>
                <li>
                  Your leaderboard entries ({rankedModes}{" "}
                  {rankedModes === 1 ? "mode" : "modes"})
                </li>
                <li>
                  Your sign-in account
                  {user?.email ? (
                    <>
                      {" "}(<span className="font-medium">{user.email}</span>)
                    </>
                  ) : null}
                </li>
                <li>Settings and guest data stored in this browser</li>
              </>
            )}
          </ul>
          <p className="text-[0.8125rem] text-muted-foreground text-pretty">
            Multiplayer rooms and their chat are temporary and are deleted
            when everyone leaves or after 6 hours without activity.
          </p>

          <Field
            id="confirm-delete"
            label={
              <>
                Type <span className="font-mono">{word}</span> to confirm
              </>
            }
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          {needPassword && (
            <PasswordField
              id="delete-password"
              label="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          {isGoogle && !isGuest && (
            <p className="text-[0.8125rem] text-muted-foreground">
              Google may ask you to sign in again to confirm.
            </p>
          )}
          <FormError message={error} />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!ready || busy}>
              {busy && <Loader2 className="motion-safe:animate-spin" aria-hidden />}
              {isGuest ? "Clear guest data" : "Delete account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, isGuest, loading, signOut } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (loading && !user) return null;

  return (
    <div className="flex flex-col">
      <Section
        id="name-title"
        title="Profile"
        description="How you appear to other players."
      >
        <DisplayNameForm />
      </Section>

      {isGuest ? (
        <Section
          id="account-title"
          title="Account"
          description="Guests play with an anonymous ID stored in this browser."
        >
          <p className="text-body-sm text-muted-foreground text-pretty">
            Create an account to keep your runs and settings on every device
            and appear on the leaderboard. Your guest runs move over
            automatically.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/signup?next=%2Fprofile">Create an account</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/login?next=%2Fprofile">Sign in</Link>
            </Button>
          </div>
        </Section>
      ) : (
        <>
          <Section
            id="password-title"
            title="Password"
            description="Change it with a reset link sent to your email."
          >
            <PasswordSection />
          </Section>
          <Section
            id="signout-title"
            title="Sign out"
            description="This device goes back to playing as a new guest."
          >
            <div>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut aria-hidden />
                Sign out
              </Button>
            </div>
          </Section>
        </>
      )}

      <Section
        id="delete-title"
        title={isGuest ? "Clear guest data" : "Delete account"}
        tone="danger"
        description={
          isGuest
            ? "Remove your guest runs, settings and anonymous ID from this device."
            : "Permanently delete your account and everything stored with it."
        }
      >
        <p className="text-body-sm text-muted-foreground text-pretty">
          {isGuest
            ? "You can keep playing afterwards as a brand-new guest."
            : "Your profile, run history, stats, leaderboard entries and sign-in are deleted right away. See the "}
          {!isGuest && (
            <>
              <Link className="link" to="/privacy#deletion">
                privacy notice
              </Link>{" "}
              for details.
            </>
          )}
        </p>
        <div>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/[0.06]"
            onClick={() => setDeleteOpen(true)}
          >
            {isGuest ? "Clear guest data…" : "Delete account…"}
          </Button>
        </div>
      </Section>

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
