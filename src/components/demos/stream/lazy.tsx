"use client";

import dynamic from "next/dynamic";
import { DemoSkeleton } from "@/components/case-study/case-study";

// Client-only: the replay depends on requestAnimationFrame, ResizeObserver and
// matchMedia, and nothing in it is useful before hydration.
const StreamReplay = dynamic(() => import("./stream-replay").then((mod) => mod.StreamReplay), {
  ssr: false,
  loading: () => <DemoSkeleton height={520} label="Loading streaming replay…" />,
});

export function StreamReplayLazy() {
  return <StreamReplay />;
}
