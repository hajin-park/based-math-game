import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FIELD_LABEL, FormRow } from "./FormRow";
import { NAME_MAX } from "./names";

/**
 * "Your name" on a room form. `row` sets it as a worksheet line (label in the
 * left column); otherwise label, field and note stack.
 */
export function DisplayNameField({
  value,
  onChange,
  error,
  help = "Shown to everyone in the room. You can change it later.",
  row,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  help?: string;
  row?: boolean;
}) {
  const id = useId();
  const label = (
    <Label htmlFor={id} className={FIELD_LABEL}>
      Your name
    </Label>
  );
  const field = (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        name="displayName"
        value={value}
        maxLength={NAME_MAX}
        autoComplete="nickname"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="go"
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(e.target.value)}
        className={cn(row && "max-w-sm")}
      />
      <p
        id={`${id}-help`}
        className={cn(
          "font-sans text-[0.8125rem]",
          error ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {error ?? help}
      </p>
    </div>
  );
  if (row) return <FormRow label={label}>{field}</FormRow>;
  return (
    <div className="flex flex-col gap-2">
      {label}
      {field}
    </div>
  );
}
