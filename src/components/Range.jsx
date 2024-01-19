import { Input } from "@/components/ui/input";

export default function Range({ option }) {
    return (
        <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">{option}</p>
            <Input type="number" placeholder="0000" className="w-[150px]" />
        </div>
    );
}
