"use client";

import dynamic from "next/dynamic";
import { DemoSkeleton } from "@/components/case-study/case-study";

// Client-only: the playground owns a Redux store and timers, and nothing in it
// is useful to a crawler. Loading it lazily keeps RTK out of the page's first chunk.
const RbacPlayground = dynamic(() => import("./rbac-playground").then((m) => m.RbacPlayground), {
  ssr: false,
  loading: () => <DemoSkeleton height={1100} label="Loading permission playground…" />,
});

export function RbacPlaygroundLazy() {
  return <RbacPlayground />;
}
