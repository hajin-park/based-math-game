import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CloudUpload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Field,
  FormError,
  GoogleButton,
  OrRule,
  PasswordField,
} from "@/components/auth/AuthFields";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_GAME_SETTINGS, getLocalRuns } from "@/data";
import { getLocalSettings } from "@/data/localStore";
import { saveUserSettings } from "@/data/profile";
import { auth } from "@/firebase/app";
import { friendlyAuthError, safeNextPath } from "@/lib/authErrors";
import {
  DISPLAY_NAME_MAX,
  validateDisplayName,
} from "@/utils/displayNameValidator";

const PASSWORD_MIN = 8;
type Busy = null | "email" | "google";

/** Guest settings live in localStorage; carry them into the new account. */
async function carryOverGuestSettings(settings: ReturnType<typeof getLocalSettings>) {
  const uid = auth.currentUser?.uid;
  if (!uid || auth.currentUser?.isAnonymous) return;
  const changed = (
    Object.keys(DEFAULT_GAME_SETTINGS) as (keyof typeof settings)[]
  ).some((k) => settings[k] !== DEFAULT_GAME_SETTINGS[k]);
  if (!changed) return;
  await saveUserSettings(uid, settings).catch(() => undefined);
}

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next"), "/");
  const { user, isGuest, loading, signUpWithEmail, signInWithGoogle } =
    useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
  }>({});

  // Offer the guest's generated name (it's what rooms already show).
  const guestName = isGuest ? user?.displayName ?? "" : "";
  useEffect(() => {
    if (guestName) setDisplayName((cur) => cur || guestName);
  }, [guestName]);

  const guestRuns = useMemo(() => (isGuest ? getLocalRuns().length : 0), [isGuest]);
  const loginHref = `/login${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`;

  const fail = (e: unknown) => {
    const f = friendlyAuthError(e);
    if (f.silent) return;
    if (f.field) {
      setFieldErrors({ [f.field]: f.message });
      setError(null);
    } else {
      setError(f.message);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: typeof fieldErrors = {};
    const name = validateDisplayName(displayName);
    if (!name.isValid) errs.displayName = name.error;
    if (!email.trim()) errs.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errs.email = "That doesn’t look like an email address.";
    if (password.length < PASSWORD_MIN)
      errs.password = `Use at least ${PASSWORD_MIN} characters.`;
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      const first = (["displayName", "email", "password"] as const).find(
        (k) => errs[k],
      );
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setBusy("email");
    const settings = getLocalSettings();
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      await carryOverGuestSettings(settings);
      navigate(next, { replace: true });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setFieldErrors({});
    setBusy("google");
    const settings = getLocalSettings();
    try {
      await signInWithGoogle();
      await carryOverGuestSettings(settings);
      navigate(next, { replace: true });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  if (!loading && user && !isGuest && busy === null) {
    return (
      <div className="container flex max-w-md flex-col gap-8 py-12 md:py-20">
        <PageHeader
          eyebrow="Account"
          title={
            <>
              You already have an <em>account</em>
            </>
          }
          lede={`Signed in as ${user.displayName || user.email}.`}
          size="sm"
        />
        <Button asChild size="lg" className="w-full">
          <Link to={next === "/" ? "/profile" : next}>Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container flex max-w-md flex-col gap-8 py-12 md:py-20">
      <PageHeader
        eyebrow="Account"
        title={
          <>
            Keep your <em>progress</em>
          </>
        }
        lede="Save every run, track your personal bests and get on the leaderboard. Free, and guests can keep playing without one."
        size="sm"
      />

      {isGuest && (
        <div className="flex gap-3 rounded-lg border bg-card px-4 py-3">
          <CloudUpload
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <p className="text-body-sm text-muted-foreground text-pretty">
            {guestRuns > 0 ? (
              <>
                Your{" "}
                <span className="font-medium text-foreground">
                  {guestRuns} {guestRuns === 1 ? "run" : "runs"}
                </span>{" "}
                on this device will be saved to your account, along with your
                game settings.
              </>
            ) : (
              <>
                Your game settings and any room you’re in carry over to your new
                account.
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <GoogleButton
          onClick={onGoogle}
          busy={busy === "google"}
          disabled={busy !== null}
        />
        <OrRule />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <FormError message={error} />
          <Field
            id="displayName"
            label="Display name"
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_MAX}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName}
            help="Shown on leaderboards and in rooms. You can change it later."
          />
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            help="Only used to sign in and reset your password. Never shown."
          />
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            help={`At least ${PASSWORD_MIN} characters.`}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={busy !== null}
            aria-busy={busy === "email" || undefined}
          >
            {busy === "email" && (
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
            )}
            Create account
          </Button>
          <p className="text-[0.8125rem] text-muted-foreground text-pretty">
            By creating an account you agree to the{" "}
            <Link className="link" to="/terms">
              Terms
            </Link>{" "}
            and confirm you’ve read the{" "}
            <Link className="link" to="/privacy">
              Privacy notice
            </Link>
            .
          </p>
        </form>

        <p className="text-center text-body-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="link" to={loginHref}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
