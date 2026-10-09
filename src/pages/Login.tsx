import { useEffect, useMemo, useState, type FormEvent } from "react";
import { warmUpGoogleSignIn } from "@/lib/googleAuth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

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

  // Already signed in with a real account.
  if (!loading && user && !isGuest) {
    return (
      <div className="container flex max-w-md flex-col gap-8 py-12 md:py-20">
        <PageHeader
          eyebrow="Account"
          title={
            <>
              You’re <em>signed in</em>
            </>
          }
          lede={
            <>
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user.displayName || user.email}
              </span>
              .
            </>
          }
          size="sm"
        />
        <div className="flex flex-col gap-3">
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
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="container flex max-w-md flex-col gap-8 py-12 md:py-20">
        <PageHeader
          eyebrow="Account"
          title={
            <>
              Reset your <em>password</em>
            </>
          }
          lede="Enter the email you signed up with and we’ll send you a link to choose a new password."
          size="sm"
        />
        {resetSentTo ? (
          <div
            role="status"
            className="flex flex-col gap-4 rounded-lg border bg-card p-5"
          >
            <MailCheck className="size-5 text-success" aria-hidden />
            <div className="flex flex-col gap-1.5">
              <p className="text-title-sm font-semibold">Check your inbox</p>
              <p className="text-body-sm text-muted-foreground text-pretty">
                If an account exists for{" "}
                <span className="font-medium text-foreground">
                  {resetSentTo}
                </span>
                , a reset link is on its way. It can take a few minutes; check
                your spam folder too.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setMode("signin");
                setResetSentTo(null);
              }}
            >
              <ArrowLeft aria-hidden />
              Back to sign in
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={onReset} noValidate>
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode("signin");
                setError(null);
                setFieldErrors({});
              }}
            >
              <ArrowLeft aria-hidden />
              Back to sign in
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="container flex max-w-md flex-col gap-8 py-12 md:py-20">
      <PageHeader
        eyebrow="Account"
        title={
          <>
            Welcome <em>back</em>
          </>
        }
        lede="Sign in to keep your runs, stats and leaderboard places across devices."
        size="sm"
      />

      <div className="flex flex-col gap-5">
        <GoogleButton
          onClick={onGoogle}
          busy={busy === "google"}
          disabled={busy !== null}
        />
        <OrRule />
        <form className="flex flex-col gap-5" onSubmit={onSignIn} noValidate>
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
                className="link text-[0.8125rem] pointer-coarse:py-2"
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
            className="w-full"
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
          <p className="rounded-lg border bg-card px-4 py-3 text-body-sm text-muted-foreground text-pretty">
            You have{" "}
            <span className="font-medium text-foreground">
              {guestRuns} {guestRuns === 1 ? "run" : "runs"}
            </span>{" "}
            saved as a guest on this device. Signing in to an existing account
            doesn’t move them;{" "}
            <Link className="link" to={signupHref}>
              create an account
            </Link>{" "}
            to keep them.
          </p>
        )}

        <p className="text-center text-body-sm text-muted-foreground">
          New here?{" "}
          <Link className="link" to={signupHref}>
            Create an account
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <Link className="link" to="/play">
            Keep playing as a guest
          </Link>
        </p>
      </div>
    </div>
  );
}
