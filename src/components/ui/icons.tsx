export function IconArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        className="rtl:hidden"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12H5M11 6l-6 6 6 6"
        className="hidden rtl:block"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHouse() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path d="m14 6 4 4-9 9H5v-4l9-9Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSofa() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path d="M4 14V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 14h18v4H3z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M8 4h3l1 5-2 1a12 12 0 0 0 6 6l1-2 5 1v3c0 1-1 2-2 2C9 20 4 15 4 6c0-1 1-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path d="M12 4v12M7 12l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
