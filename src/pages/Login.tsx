/**
 * "/login" — the library card: sign in with Google or email, reset a
 * password, or go back to playing as a guest.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { warmUpGoogleSignIn } from "@/lib/googleAuth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PenTick } from "@/components/ui/pen-mark";
import {
  AuthCard,
  CardNote,
  Field,
  FormError,
  GoogleButton,
  OrRule,
  PasswordField,
} from "@/components/auth/AuthFields";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalRuns } from "@/data";
import { friendlyAuthError, safeNextPath } from "@/lib/authErrors";

type Mode = "signin" | "reset";
type Busy = null | "email" | "google" | "reset";

export default function Login() {
  // Google sign-in opens a popup; load its helper before the click.
  useEffect(warmUpGoogleSignIn, []);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next"), "/");
  const {
    user,
    isGuest,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<Mode>(
    params.get("reset") === "1" ? "reset" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);

  const guestRuns = useMemo(
    () => (isGuest ? getLocalRuns().length : 0),
    [isGuest],
  );
  const signupHref = `/signup${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`;

  const fail = (e: unknown) => {
    const f = friendlyAuthError(e);
    if (f.silent) return;
    if (f.field === "email" || f.field === "password") {
      setFieldErrors({ [f.field]: f.message });
      setError(null);
    } else {
      setError(f.message);
    }
  };

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Enter your email address.";
    if (!password) errs.password = "Enter your password.";
    setFieldErrors(errs);
    if (errs.email || errs.password) return;
    setBusy("email");
    try {
      await signInWithEmail(email.trim(), password);
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
    try {
      await signInWithGoogle();
      navigate(next, { replace: true });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setFieldErrors({ email: "Enter the email you signed up with." });
      return;
    }
    setFieldErrors({});
    setBusy("reset");
    try {
      await sendPasswordReset(email.trim());
      setResetSentTo(email.trim());
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const backToSignIn = () => {
    setMode("signin");
    setResetSentTo(null);
    setError(null);
    setFieldErrors({});
  };

  // Already signed in with a real account.
  if (!loading && user && !isGuest) {
    return (
      <AuthCard
        folio="On file"
        title="You’re signed in"
        lede={
          <>
            Signed in as{" "}
            <span className="font-mono text-foreground">
              {user.displayName || user.email}
            </span>
            .
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full">
            <Link to={next}>Continue</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => void signOut()}
          >
            Sign out and use another account
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (mode === "reset") {
    return (
      <AuthCard
        folio="Password"
        title="Reset your password"
        lede="Enter the email you signed up with and we’ll send a link to choose a new password."
        foot={
          <button
            type="button"
            className="link inline-flex items-center gap-1.5 self-start pointer-coarse:py-2"
            onClick={backToSignIn}
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Back to sign in
          </button>
        }
      >
        {resetSentTo ? (
          <div role="status" className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-serif text-title-sm font-bold">
              <PenTick className="size-5" />
              Check your inbox
            </p>
            <p className="text-body-sm text-muted-foreground text-pretty">
              If an account exists for{" "}
              <span className="font-mono text-foreground">{resetSentTo}</span>,
              a reset link is on its way. It can take a few minutes; check your
              spam folder too.
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={onReset} noValidate>
            <FormError message={error} />
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
              autoFocus
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={busy !== null}
            >
              {busy === "reset" && (
                <Loader2 className="motion-safe:animate-spin" aria-hidden />
              )}
              Send reset link
            </Button>
          </form>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      folio="Sign in"
      title="Sign in"
      lede="Keep your runs, stats and leaderboard places on every device."
      foot={
        <>
          <p>
            New here?{" "}
            <Link className="link" to={signupHref}>
              Create an account
            </Link>
          </p>
          <p>
            Or{" "}
            <Link className="link" to="/play">
              play as a guest
            </Link>
            ; everything works without an account.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <GoogleButton
          onClick={onGoogle}
          busy={busy === "google"}
          disabled={busy !== null}
        />
        <OrRule />
        <form className="flex flex-col gap-6" onSubmit={onSignIn} noValidate>
          <FormError message={error} />
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
          />
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            labelAside={
              <button
                type="button"
                className="link font-sans text-[0.8125rem] pointer-coarse:py-2"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                  setFieldErrors({});
                }}
              >
                Forgot password?
              </button>
            }
          />
          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={busy !== null}
            aria-busy={busy === "email" || undefined}
          >
            {busy === "email" && (
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
            )}
            Sign in
          </Button>
        </form>

        {guestRuns > 0 && (
          <CardNote>
            You have{" "}
            <span className="font-mono text-foreground">
              {guestRuns} {guestRuns === 1 ? "run" : "runs"}
            </span>{" "}
            saved as a guest on this device. Signing in to an existing account
            doesn’t move them;{" "}
            <Link className="link" to={signupHref}>
              create an account
            </Link>{" "}
            to keep them.
          </CardNote>
        )}
      </div>
    </AuthCard>
  );
}
