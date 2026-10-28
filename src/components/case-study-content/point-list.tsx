import type { ReactNode } from "react";

/** A short list of key points, rows split by hairlines. Used where each item leads with a claim. */
export function PointList({ children }: { children: ReactNode }) {
  return <ul className="max-w-[68ch] divide-y divide-border border-y border-border">{children}</ul>;
}

export function Point({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1.5rem_minmax(0,1fr)] py-4">
      <span aria-hidden className="text-brand">
        –
      </span>
      <p className="prose-case [&_code]:whitespace-nowrap">{children}</p>
    </li>
  );
}
