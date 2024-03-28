import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function RangeInput({ form, name, label, setRange }) {
    function handleOnChange(value) {
        setRange(value);
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex space-x-4">
                        <FormLabel className="my-auto">{label}</FormLabel>
                        <FormControl>
                            <Input
                                onChangeCapture={(e) =>
                                    handleOnChange(e.currentTarget.value)
                                }
                                type="number"
                                placeholder="0"
                                {...field}
                            />
                        </FormControl>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
