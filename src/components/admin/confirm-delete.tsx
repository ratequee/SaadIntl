"use client";

export function ConfirmDelete({
  action,
  id,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this item? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-red-700">
        Delete
      </button>
    </form>
  );
}
