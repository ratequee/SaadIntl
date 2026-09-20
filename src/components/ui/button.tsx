import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "dark";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90",
  secondary:
    "bg-background text-foreground hover:bg-surface",
  ghost:
    "bg-transparent text-foreground hover:bg-surface",
  gold:
    "bg-gold text-espresso hover:brightness-105",
  dark:
    "bg-ink text-cream hover:bg-ink-2 dark:bg-cream dark:text-ink",
};

export const goldHoverClass =
  "hover:bg-gold hover:text-espresso dark:hover:bg-gold dark:hover:text-espresso";

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );
}
