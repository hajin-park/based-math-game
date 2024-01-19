import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DurationSelect({ setDuration }) {
    return (
        <Select onValueChange={setDuration} defaultValue={120}>
            <p className="text-sm text-muted-foreground mr-4">Duration</p>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a duration" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Select duration...</SelectLabel>
                    <SelectItem value={30}>30 seconds</SelectItem>
                    <SelectItem value={60}>60 seconds</SelectItem>
                    <SelectItem value={90}>90 seconds</SelectItem>
                    <SelectItem value={120}>120 seconds</SelectItem>
                    <SelectItem value={150}>150 seconds</SelectItem>
                    <SelectItem value={180}>180 seconds</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
