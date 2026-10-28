
/** Splits a leading `// file.ts (note)` comment off the snippet so it can sit in the header bar. */
function splitHeader(code: string) {
  const newline = code.indexOf("\n");
  const first = newline === -1 ? code : code.slice(0, newline);
  const match = /^\/\/\s*(\S+\.\w+)\s*(?:\((.+)\))?\s*$/.exec(first);
  if (!match) return { file: null, note: null, body: code };
  return { file: match[1], note: match[2] ?? null, body: newline === -1 ? "" : code.slice(newline + 1) };
}

/**
 * A short, illustrative code excerpt: flat panel with a thin file bar. Every snippet on the
 * case-study pages is rewritten with fictional names; none of it is production code.
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
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-x-3 border-b border-border px-4 py-2 font-mono text-[0.7rem] text-subtle-foreground">
          <span className="text-foreground">{file ?? label}</span>
          {note && <span>({note})</span>}
          <span className="ml-auto">illustrative</span>
        </div>
        <pre
          tabIndex={0}
          aria-label={label}
          className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-foreground focus-visible:outline-offset-[-2px] sm:px-5"
        >
          <code>{body}</code>
        </pre>
      </div>
      <figcaption className="mt-3 font-mono text-xs text-subtle-foreground">{caption}</figcaption>
    </figure>
  );
}
