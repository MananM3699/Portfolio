"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">Contents</p>
      <ol className="mt-4 space-y-1 border-l border-border">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px grid grid-cols-[1.75rem_minmax(0,1fr)] border-l py-1.5 pl-3 font-mono text-xs transition-colors",
                active === item.id
                  ? "border-brand text-foreground"
                  : "border-transparent text-subtle-foreground hover:text-foreground",
              )}
            >
              <span className={active === item.id ? "text-brand" : undefined}>{String(i + 1).padStart(2, "0")}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
