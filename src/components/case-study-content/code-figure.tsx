import { FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Splits a leading `// file.ts (note)` comment off the snippet so it can sit in the header bar. */
function splitHeader(code: string) {
  const newline = code.indexOf("\n");
  const first = newline === -1 ? code : code.slice(0, newline);
  const match = /^\/\/\s*(\S+\.\w+)\s*(?:\((.+)\))?\s*$/.exec(first);
  if (!match) return { file: null, note: null, body: code };
  return { file: match[1], note: match[2] ?? null, body: newline === -1 ? "" : code.slice(newline + 1) };
}

/**
 * A short, illustrative code excerpt on a frosted tile with a file header bar. Every snippet
 * on the case-study pages is rewritten with fictional names; none of it is production code.
 */
export function CodeFigure({
  code,
  caption,
  label,
}: {
  code: string;
  caption: string;
  /** Accessible name for the scrollable code region. */
  label: string;
}) {
  const { file, note, body } = splitHeader(code);
  return (
    <figure className="max-w-[68ch]">
      <div className="glass-subtle overflow-hidden rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border bg-muted/60 px-4 py-2.5">
          <FileCode2 className="size-3.5 shrink-0 text-brand" aria-hidden />
          <span className="truncate font-mono text-xs font-medium text-foreground">
            {file ?? label}
          </span>
          {note && (
            <span className="font-mono text-xs text-muted-foreground">
              ({note})
            </span>
          )}
          <Badge
            variant="outline"
            className="ml-auto border-border-strong font-mono text-[0.65rem] font-normal text-muted-foreground"
          >
            illustrative
          </Badge>
        </div>
        <pre
          tabIndex={0}
          aria-label={label}
          className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-foreground focus-visible:outline-offset-[-2px] sm:px-5"
        >
          <code>{body}</code>
        </pre>
      </div>
      <figcaption className="mt-3 text-sm text-subtle-foreground">{caption}</figcaption>
    </figure>
  );
}
