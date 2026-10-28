import type { ComponentProps } from "react";
import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Every home section: transparent, one consistent vertical rhythm, shared gutter. */
export function HomeSection({
  className,
  containerClassName,
  children,
  ...props
}: ComponentProps<"section"> & { containerClassName?: string }) {
  return (
    <section className={cn("py-20 sm:py-28", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Whole-row link: the title link stretches over the row, so the row is one click target. */
export const rowLinkClass =
  "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
