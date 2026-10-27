import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/primitives";

/** Home-page section: transparent, so the colour field shows through; rhythm comes from spacing. */
export function HomeSection({
  className,
  containerClassName,
  children,
  ...props
}: ComponentProps<"section"> & { containerClassName?: string }) {
  return (
    <section className={cn("py-12 sm:py-16", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Hover treatment for glass cards: a small lift and a brighter edge. */
export const glassHoverClass =
  "transition-[translate,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-white hover:shadow-[0_18px_48px_-16px_rgb(49_46_129/0.28)] dark:hover:border-white/20 dark:hover:shadow-[0_20px_56px_-18px_rgb(0_0_0/0.75)]";

/** Stretched-link card: the title link covers the card, so the whole card is clickable
 * while screen readers only announce the title as the link name. */
export const stretchedCardClass = cn(
  "group relative has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
  glassHoverClass,
);

export const stretchedLinkClass =
  "after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none";
