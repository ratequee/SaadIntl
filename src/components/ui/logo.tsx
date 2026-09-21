import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_NAME = "SAAD International Projects W.L.L.";

function companyLockup(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { primary: words.join(" "), secondary: "" };
  }
  if (words.length === 3) {
    return { primary: words.slice(0, 2).join(" "), secondary: words[2] };
  }
  return {
    primary: words.slice(0, -2).join(" "),
    secondary: words.slice(-2).join(" "),
  };
}

export function Logo({
  className,
  compact = false,
  name = FALLBACK_NAME,
}: {
  className?: string;
  compact?: boolean;
  name?: string;
}) {
  const displayName = name.trim() || FALLBACK_NAME;
  const { primary, secondary } = companyLockup(displayName);

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-sd-256.png"
        alt={displayName}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
        priority
      />
      {!compact && (
        <span className="min-w-0 max-w-[11rem] leading-tight sm:max-w-[14rem]">
          <span className="block text-[0.92rem] font-semibold tracking-tight">
            {primary}
          </span>
          {secondary ? (
            <span className="block text-[0.68rem] text-muted">{secondary}</span>
          ) : null}
        </span>
      )}
    </span>
  );
}
