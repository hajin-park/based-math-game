"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={`${settings.duration}`}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select quiz duration" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>{label}</SelectLabel>
                                {durations.map((duration: number) => (
                                    <SelectItem
                                        key={duration}
                                        value={duration.toString()}
                                    >
                                        {duration} seconds
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
