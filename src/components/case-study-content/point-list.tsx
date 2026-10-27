import type { ReactNode } from "react";

/**
 * A short list of key points on one frosted tile, rows split by hairlines. Replaces a bulleted
 * list inside <Prose> where each item leads with a bold claim.
 */
export function PointList({ children }: { children: ReactNode }) {
  return (
    <ul className="glass-subtle max-w-[68ch] divide-y divide-border overflow-hidden rounded-2xl backdrop-blur-md">
      {children}
    </ul>
  );
}

export function Point({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3.5 px-4 py-4 sm:px-5">
      <span
        aria-hidden
        className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_4px_var(--brand-soft)]"
      />
      <p className="prose-case [&_code]:whitespace-nowrap">{children}</p>
    </li>
  );
}
