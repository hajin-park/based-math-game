import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const statuses = [
    {
        value: "binary",
        label: "Binary",
    },
    {
        value: "decimal",
        label: "Decimal",
    },
    {
        value: "hexadecimal",
        label: "Hexadecimal",
    },
    {
        value: "ascii",
        label: "ASCII",
    },
];

export default function BasesDropDown({ option, setBase }) {
    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);

    return (
        <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">{option}</p>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[150px] justify-start"
                    >
                        {selectedStatus ? (
                            <>{selectedStatus.label}</>
                        ) : (
                            <i>Set base</i>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="right" align="start">
                    <Command>
                        <CommandInput placeholder="Find base..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {statuses.map((status) => (
                                    <CommandItem
                                        key={status.value}
                                        value={status.value}
                                        onSelect={(value) => {
                                            setSelectedStatus(
                                                statuses.find(
                                                    (priority) =>
                                                        priority.value === value
                                                ) || null
                                            );
                                            setBase(value);
                                            setOpen(false);
                                        }}
                                    >
                                        {status.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
