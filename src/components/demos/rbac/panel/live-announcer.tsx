"use client";

import { useAppSelector } from "../store/store";

/**
 * One polite live region for the whole playground. Only entries that carry an
 * `announce` sentence are read out (role changes, grants, 403s, invalidations),
 * so screen-reader users get the story without every fetch.
 */
export function LiveAnnouncer() {
  const message = useAppSelector((s) => s.activity.entries.findLast((e) => e.announce)?.announce ?? "");
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
