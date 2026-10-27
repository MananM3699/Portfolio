import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...props} />;
}

/** Mono, uppercase label used above section headings and for metadata. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

const chipTones = {
  neutral: "glass-subtle text-muted-foreground",
  accent: "border border-transparent bg-brand-soft text-brand",
  success: "border border-transparent bg-success-soft text-success",
  warning: "border border-transparent bg-warning-soft text-warning",
  danger: "border border-transparent bg-danger-soft text-danger",
} as const;

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
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[0.72rem] leading-5",
        chipTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Frosted glass panel. Prefer this over shadcn's Card for page-level surfaces. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass rounded-2xl", className)} {...props} />;
}

const buttonStyles = {
  primary:
    "bg-brand text-brand-foreground shadow-[0_8px_24px_-8px_var(--brand)] hover:bg-brand/90 hover:shadow-[0_10px_28px_-8px_var(--brand)]",
  secondary: "glass-subtle text-foreground backdrop-blur-md hover:bg-card",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

/** shadcn button base with the site's glass variants layered on top. */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    buttonVariants({ variant: "ghost", size: "lg" }),
    "h-10 rounded-xl px-4",
    buttonStyles[variant],
    className,
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
