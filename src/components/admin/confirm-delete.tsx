"use client";

import { useState } from "react";
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
  kind?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="text-red-700" onClick={() => setOpen(true)}>
        Delete
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4">
          <div className="w-full max-w-md rounded-[1.6rem] bg-background p-6 shadow-[var(--shadow)]">
            <h2 className="text-2xl font-semibold tracking-tight">Delete this {kind}?</h2>
            <p className="mt-3 text-sm text-muted">
              {name ? (
                <>
                  <strong className="text-foreground">{name}</strong> will be permanently deleted.
                </>
              ) : (
                `This ${kind} will be permanently deleted.`
              )}{" "}
              This cannot be undone.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className={buttonClass("ghost", "border border-border")}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className={buttonClass("dark", `${goldHoverClass} bg-red-700 text-white hover:bg-red-800`)}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
