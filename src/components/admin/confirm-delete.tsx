"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { buttonClass, goldHoverClass } from "@/components/ui/button";

export function ConfirmDelete({
  action,
  id,
  name,
  kind = "item",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name?: string;
  kind?: "project" | "article" | "document" | "item";
}) {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const kindLabel =
    kind === "project"
      ? t("kindProject")
      : kind === "article"
        ? t("kindArticle")
        : kind === "document"
          ? t("kindDocument")
          : t("kindItem");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const dialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-ink/70"
              aria-label={t("cancel")}
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-t-[1.6rem] bg-background p-5 shadow-[var(--shadow)] max-h-[min(90dvh,36rem)] sm:rounded-[1.6rem] sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t("deleteThis", { kind: kindLabel })}
              </h2>
              <p className="mt-3 break-words text-sm text-muted">
                {name ? t("willBeDeletedNamed", { name }) : t("willBeDeleted", { kind: kindLabel })}{" "}
                {t("cannotUndo")}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  className={buttonClass("ghost", "w-full border border-border sm:w-auto")}
                  onClick={() => setOpen(false)}
                >
                  {t("cancel")}
                </button>
                <form action={action} className="sm:contents">
                  <input type="hidden" name="id" value={id} />
                  <button
                    type="submit"
                    className={buttonClass(
                      "dark",
                      `w-full sm:w-auto ${goldHoverClass} bg-red-700 text-white hover:bg-red-800`,
                    )}
                  >
                    {t("delete")}
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button type="button" className="text-red-700" onClick={() => setOpen(true)}>
        {t("delete")}
      </button>
      {dialog}
    </>
  );
}
