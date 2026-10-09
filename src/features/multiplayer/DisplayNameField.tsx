import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NAME_MAX } from "./names";

export function DisplayNameField({
  value,
  onChange,
  error,
  help = "Shown to everyone in the room. You can change it later.",
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Your name</Label>
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
      />
      <p
        id={`${id}-help`}
        className={
          error
            ? "text-[0.8125rem] text-destructive"
            : "text-[0.8125rem] text-muted-foreground"
        }
      >
        {error ?? help}
      </p>
    </div>
  );
}
