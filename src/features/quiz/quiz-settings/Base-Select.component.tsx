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

export default function BaseSelect({ form, name, label, setBase, bases }) {
    function handleOnChange(value: string) {
        setBase(value);
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex space-x-8">
                        <FormLabel className="my-auto">{label}</FormLabel>
                        <Select
                            onValueChange={(e) => {
                                handleOnChange(e);
                                field.onChange(e);
                            }}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select base" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>{label}</SelectLabel>
                                    {bases.map((base: string) => (
                                        <SelectItem key={base} value={base}>
                                            {base}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
