"use client";

import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  title: string;
  location: string;
  progress: number;
};

function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function ProgressRow({
  item,
  active,
}: {
  item: Item;
  active: boolean;
}) {
  const value = useCountUp(item.progress, active);

  return (
    <li>
      <div className="flex items-start justify-between gap-3 text-sm">
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-muted">{item.location}</p>
        </div>
        <span className="font-semibold tabular-nums text-[var(--gold)]">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-[var(--gold)] transition-none"
          style={{
            width: `${value}%`,
            transition: active ? "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
          }}
        />
      </div>
    </li>
  );
}

export function HeroProgress({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={ref}
      className="rounded-[1.6rem] bg-white p-5 text-ink shadow-[var(--shadow)] dark:bg-surface dark:text-foreground"
    >
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <ul className="space-y-4">
        {items.map((item) => (
          <ProgressRow key={item.id} item={item} active={active} />
        ))}
      </ul>
    </aside>
  );
}
