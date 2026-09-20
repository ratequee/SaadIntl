import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  defaultValue,
  textarea,
  dir,
  required,
  type = "text",
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  textarea?: boolean;
  dir?: string;
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
}) {
  const className = cn(
    "w-full border border-border bg-background px-4 py-3 text-sm",
    textarea ? "min-h-36 rounded-[1.2rem]" : "rounded-full",
  );
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue ?? ""} required={required} dir={dir} className={className} />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          required={required}
          dir={dir}
          min={min}
          max={max}
          className={className}
        />
      )}
    </label>
  );
}
