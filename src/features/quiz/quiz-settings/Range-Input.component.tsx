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
          <div className="grid grid-rows-1 grid-cols-5">
            <FormLabel className="my-auto">{label}</FormLabel>
            <div className="sm:col-span-3 col-span-4">
              <FormControl>
                <Input
                  onChangeCapture={(e) => handleOnChange(e.currentTarget.value)}
                  type="number"
                  placeholder="0"
                  {...field}
                />
              </FormControl>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
