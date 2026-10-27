import { cn } from "@/lib/cn";

/** Plain, unhighlighted code panel with a filename bar. Keeps the page free of client JS. */
export function CodeBlock({
  filename,
  code,
  className,
}: {
  filename: string;
  code: string;
  className?: string;
}) {
  return (
    <figure className={cn("glass-subtle overflow-hidden rounded-xl", className)}>
      <figcaption className="flex items-center gap-3 border-b border-border bg-muted/60 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-danger/60" />
          <span className="size-2 rounded-full bg-warning/60" />
          <span className="size-2 rounded-full bg-success/60" />
        </span>
        <span className="font-mono text-[0.72rem] text-muted-foreground">{filename}</span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed text-foreground">
        <code>{code.trim()}</code>
      </pre>
    </figure>
  );
}
