import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-sd-256.png"
        alt="SAAD International Projects"
        width={36}
        height={36}
        className="size-9 rounded-full object-cover"
        priority
      />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[0.92rem] font-semibold tracking-tight">
            SAAD International
          </span>
          <span className="block text-[0.68rem] text-muted">Projects W.L.L.</span>
        </span>
      )}
    </span>
  );
}
