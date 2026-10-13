import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { PenCross } from "@/components/ui/pen-mark";
import { cn } from "@/lib/utils";

/**
 * Form-page building blocks shared by Login, Signup and the account settings,
 * set like a printed card: a small-caps label over a ruled line you type on
 * (typewriter), help in pencil, errors corrected in red pen. Also the library
 * card that holds the sign-in and sign-up forms, a Google button and an "or"
 * rule.
 */

interface FieldProps extends Omit<InputProps, "id"> {
  id: string;
  label: ReactNode;
  /** Right side of the label row (e.g. a "Forgot password?" link). */
  labelAside?: ReactNode;
  help?: ReactNode;
  error?: string | null;
}

/** The ruled line: no box, one rule to write on, blue when focused. */
const ruled = cn(
  "h-11 rounded-none border-0 border-b border-foreground/45 bg-transparent px-1 font-mono shadow-none",
  "hover:border-foreground/75",
  "focus-visible:border-primary focus-visible:bg-tint/45 focus-visible:shadow-[inset_0_-1px_0_rgb(var(--primary))]",
  "aria-[invalid=true]:border-pen aria-[invalid=true]:shadow-[inset_0_-1px_0_rgb(var(--pen))]",
  "dark:bg-transparent dark:focus-visible:bg-tint/45",
);

function FieldLabel({
  id,
  label,
  aside,
}: {
  id: string;
  label: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label
        htmlFor={id}
        className="smallcaps text-[0.9375rem] tracking-[0.05em] text-muted-foreground"
      >
        {label}
      </label>
      {aside}
    </div>
  );
}

function FieldNotes({
  id,
  help,
  error,
}: {
  id: string;
  help?: ReactNode;
  error?: string | null;
}) {
  return (
    <>
      {error && (
        <p
          id={`${id}-error`}
          className="font-sans text-[0.8125rem] font-medium text-pen"
        >
          {error}
        </p>
      )}
      {help && (
        <p
          id={`${id}-help`}
          className="font-sans text-[0.8125rem] text-muted-foreground text-pretty"
        >
          {help}
        </p>
      )}
    </>
  );
}

function describedBy(id: string, help?: ReactNode, error?: string | null) {
  return (
    [error ? `${id}-error` : null, help ? `${id}-help` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
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
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} aside={labelAside} />
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={cn(ruled, className)}
        {...input}
      />
      <FieldNotes id={id} help={help} error={error} />
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const { id, label, labelAside, help, error, className, ...input } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} aside={labelAside} />
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn(ruled, "pr-12", className)}
          {...input}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute bottom-0.5 right-0 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      <FieldNotes id={id} help={help} error={error} />
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
    <div
      className="flex items-center gap-3"
      role="separator"
      aria-labelledby={id}
    >
      <span className="h-px flex-1 bg-foreground/20" />
      <span id={id} className="smallcaps text-[0.9375rem]">
        or
      </span>
      <span className="h-px flex-1 bg-foreground/20" />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  // Always mounted so screen readers announce changes.
  return (
    <div role="alert" aria-live="assertive" className="empty:hidden">
      {message ? (
        <p className="flex items-start gap-2.5 border-y border-pen/35 py-2.5 font-sans text-body-sm text-foreground">
          <PenCross className="mt-0.5 size-[1.125rem]" />
          <span className="min-w-0 text-pretty">{message}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * The library card: a sheet laid on the page with a framed face, a running
 * head ("Library card" and what this card is for), the h1, and a ruled foot
 * for the way back.
 */
export function AuthCard({
  folio,
  title,
  lede,
  children,
  foot,
}: {
  /** Right side of the running head ("Sign in", "New reader"). */
  folio: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  /** Links under the card's bottom rule. */
  foot?: ReactNode;
}) {
  return (
    <div className="container flex justify-center px-4 py-8 sm:py-14 md:py-20">
      <section className="paper-sheet w-full max-w-[29rem] animate-sheet-in rounded-sm p-1.5 sm:p-2">
        <div className="flex flex-col border border-foreground/30 px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <div className="smallcaps flex items-baseline justify-between gap-4 border-b border-foreground/25 pb-1.5 text-[0.9375rem]">
            <span className="text-primary">Library card</span>
            <span className="shrink-0">{folio}</span>
          </div>
          <div className="flex flex-col gap-2 pb-6 pt-6">
            <h1 className="text-headline font-bold">{title}</h1>
            {lede && (
              <p className="text-body-sm text-muted-foreground text-pretty">
                {lede}
              </p>
            )}
          </div>
          {children}
          {foot && (
            <div className="mt-7 flex flex-col gap-2 border-t border-foreground/25 pt-4 font-sans text-[0.875rem] text-muted-foreground">
              {foot}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** A quiet note on the card: blue small-caps label, pencil text, no box. */
export function CardNote({
  label = "Note",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <p className="text-body-sm text-muted-foreground text-pretty">
      <span className="smallcaps mr-2 text-[0.9375rem] text-primary">
        {label}
      </span>
      {children}
    </p>
  );
}
