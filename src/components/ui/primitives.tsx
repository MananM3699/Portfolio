import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Page gutter and max width. Every section and the header/footer share it. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[72rem] px-5 sm:px-8", className)} {...props} />;
}

/**
 * Section opener used by every section on every page: a hairline rule, an index and label in
 * mono, then a serif headline and an optional lede.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  className,
  titleId,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <header className={cn("border-t border-border-strong pt-4", className)}>
      {(index || eyebrow) && (
        <p className="flex items-baseline gap-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
          {index && <span className="text-brand">{index}</span>}
          {eyebrow && <span>{eyebrow}</span>}
        </p>
      )}
      <h2
        id={titleId}
        className="mt-8 max-w-3xl font-serif text-4xl leading-[1.05] text-balance text-foreground sm:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}

const chipTones = {
  neutral: "border-border text-muted-foreground",
  accent: "border-brand/50 text-brand",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
} as const;

/** Flat outlined tag. Mono, small, square-cornered. */
export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof chipTones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[0.7rem] leading-4",
        chipTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const buttonStyles = {
  primary: "bg-brand text-brand-foreground hover:bg-brand/90",
  secondary: "border border-border-strong text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

/** shadcn button base with the site's three variants. */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    buttonVariants({ variant: "ghost", size: "lg" }),
    "h-10 rounded-md px-4 text-sm font-medium",
    buttonStyles[variant],
    className,
  );
}
