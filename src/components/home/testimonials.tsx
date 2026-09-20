"use client";

import { useState } from "react";
import Image from "next/image";
import { localized } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

export function Testimonials({
  title,
  imageAlt,
  customers,
  testimonials,
  locale,
}: {
  title: string;
  imageAlt: string;
  customers: string;
  testimonials: Testimonial[];
  locale: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animating, setAnimating] = useState(false);
  const current = testimonials[index];

  function show(nextIndex: number) {
    if (animating || nextIndex === index || testimonials.length < 2) return;
    setDirection(nextIndex > index || (index === testimonials.length - 1 && nextIndex === 0) ? 1 : -1);
    setAnimating(true);
    window.setTimeout(() => {
      setIndex(nextIndex);
      setAnimating(false);
    }, 220);
  }

  function go(step: 1 | -1) {
    show((index + step + testimonials.length) % testimonials.length);
  }

  if (!current) return null;

  return (
    <section className="container-site grid items-center gap-10 pb-20 lg:grid-cols-2">
      <Image
        src="/images/design-tools.jpg"
        alt={imageAlt}
        width={900}
        height={700}
        className="h-[380px] w-full rounded-[2rem] object-cover md:h-[460px]"
      />
      <div>
        <h2 className="display text-4xl md:text-6xl">{title}</h2>
        <div
          className={`transition-all duration-300 ease-out ${
            animating
              ? `translate-y-3 opacity-0 ${direction > 0 ? "md:translate-x-4" : "md:-translate-x-4"}`
              : "translate-x-0 translate-y-0 opacity-100"
          }`}
        >
          <blockquote className="mt-8 text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            “{localized(current.quote, locale)}”
          </blockquote>
          <p className="mt-6 font-medium">{localized(current.clientName, locale)}</p>
          <p className="text-sm text-muted">{localized(current.clientRole, locale)}</p>
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            {testimonials.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => show(itemIndex)}
                className={`grid place-items-center rounded-full font-semibold text-espresso transition ${
                  itemIndex === index
                    ? "size-14 bg-[var(--gold)] text-sm"
                    : "size-12 bg-gold/30 text-xs hover:bg-gold/50"
                }`}
                aria-label={localized(item.clientName, locale)}
                aria-current={itemIndex === index}
              >
                {item.initials}
              </button>
            ))}
            <span className="ms-1 text-sm text-muted">{customers}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="grid size-11 place-items-center rounded-full border border-border hover:bg-cream"
              aria-label={locale === "ar" ? "السابق" : "Previous"}
            >
              <svg viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" aria-hidden>
                <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="grid size-11 place-items-center rounded-full border border-border hover:bg-cream"
              aria-label={locale === "ar" ? "التالي" : "Next"}
            >
              <svg viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
