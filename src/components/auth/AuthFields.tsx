import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Form-page building blocks shared by Login, Signup and the account settings:
 * a labelled field with help/error text, a password field with a show toggle,
 * a Google button and an "or" rule.
 */

interface FieldProps extends Omit<InputProps, "id"> {
  id: string;
  label: ReactNode;
  /** Right side of the label row (e.g. a "Forgot password?" link). */
  labelAside?: ReactNode;
  help?: ReactNode;
  error?: string | null;
}

export function Field({
  id,
  label,
  labelAside,
  help,
  error,
  className,
  ...input
}: FieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-medium text-foreground">
          {label}
        </label>
        {labelAside}
      </div>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn("h-11", className)}
        {...input}
      />
      {error && (
        <p id={errorId} className="text-[0.8125rem] text-destructive">
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className="text-[0.8125rem] text-muted-foreground">
          {help}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const { id, label, labelAside, help, error, className, ...input } = props;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-medium text-foreground">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn("h-11 pr-12", className)}
          {...input}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0.5 top-0.5 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error && (
        <p id={errorId} className="text-[0.8125rem] text-destructive">
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className="text-[0.8125rem] text-muted-foreground">
          {help}
        </p>
      )}
    </div>
  );
}

/** Monochrome Google "G" (inherits text colour). */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.67 3.71 14.53 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51Z" />
    </svg>
  );
}

export function GoogleButton({
  onClick,
  busy,
  disabled,
  children = "Continue with Google",
}: {
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? (
        <Loader2 className="motion-safe:animate-spin" aria-hidden />
      ) : (
        <GoogleGlyph />
      )}
      {children}
    </Button>
  );
}

export function OrRule() {
  const id = useId();
  return (
    <div className="flex items-center gap-3" role="separator" aria-labelledby={id}>
      <span className="h-px flex-1 bg-border" />
      <span id={id} className="eyebrow">
        or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  // Always mounted so screen readers announce changes.
  return (
    <div role="alert" aria-live="assertive" className="empty:hidden">
      {message ? (
        <p className="rounded-lg border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-body-sm text-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
