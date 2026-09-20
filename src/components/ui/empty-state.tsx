export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-[2rem] border border-border bg-surface px-8 py-16 text-center">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      {body ? <p className="mt-2 text-muted">{body}</p> : null}
    </div>
  );
}
