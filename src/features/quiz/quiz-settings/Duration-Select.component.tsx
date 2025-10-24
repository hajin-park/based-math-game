"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";

export default function DurationSelect({
  form,
  name,
  label,
  durations,
  settings,
  allowUnlimited = false,
  isMultiplayer = false,
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-medium">{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={`${settings.duration}`}
          >
            <FormControl>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select quiz duration" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                {durations
                  .filter((duration: number) => {
                    // Filter out unlimited (0) if multiplayer
                    if (duration === 0 && isMultiplayer) return false;
                    return true;
                  })
                  .map((duration: number) => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration === 0 ? "Unlimited" : `${duration} seconds`}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {isMultiplayer && allowUnlimited && (
            <FormDescription className="text-xs text-muted-foreground">
              Unlimited time is not available for multiplayer games
            </FormDescription>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
