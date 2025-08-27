import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Field({
  control,
  name,
  label,
  placeholder,
  rules,
  type = "text",
  textarea = false,
  transformValue,
}) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel className="text-gray-200">{label}</FormLabel> : null}
          <FormControl>
            {textarea ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                className="bg-white/[0.03] border-white/10 text-gray-100 placeholder:text-gray-400"
              />
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className="bg-white/[0.03] border-white/10 text-gray-100 placeholder:text-gray-400"
                onChange={(e) => {
                  if (transformValue) field.onChange(transformValue(e));
                  else field.onChange(e);
                }}
                value={field.value ?? (type === "number" ? "" : field.value)}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
