import { cn } from "@/lib/utils";

/** Plain, unhighlighted code panel: flat, hairline, with a thin filename bar. */
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
    <figure className={cn("overflow-hidden rounded-md border border-border bg-surface", className)}>
      <figcaption className="border-b border-border px-4 py-2 font-mono text-[0.7rem] text-subtle-foreground">
        {filename}
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
        <code>{code.trim()}</code>
      </pre>
    </figure>
  );
}
