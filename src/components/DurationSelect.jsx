import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CardFooter } from "@/components/ui/card";

let DURATION_OPTIONS = [15, 30, 60, 90, 120, 150, 180, 300];

export default function DurationSelect({ setDuration }) {
    return (
        <CardFooter>
            <Select onValueChange={setDuration} defaultValue={60}>
                <p className="text-sm text-muted-foreground mr-4">Duration</p>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a duration" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Select duration...</SelectLabel>
                        {DURATION_OPTIONS.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                                {duration} seconds
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </CardFooter>
    );
}
