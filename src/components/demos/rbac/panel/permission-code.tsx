"use client";

import { cn } from "@/lib/utils";
import { defaultRolePermissions, PERMISSIONS, ROLES, type Permission, type Role } from "../model/permissions";
import { useAppSelector } from "../store/store";

type Token = { text: string; className?: string };
type Line = { tokens: Token[]; tone?: "active" | "added" | "removed" };

const kw = (text: string): Token => ({ text, className: "text-brand" });
const str = (text: string): Token => ({ text: `"${text}"`, className: "text-foreground" });
const plain = (text: string): Token => ({ text, className: "text-muted-foreground" });
const comment = (text: string): Token => ({ text, className: "text-subtle-foreground italic" });

/** Builds the source listing from live state, one permission per line so diffs read clearly. */
function buildLines(matrix: Record<Role, Permission[]>, activeRole: Role): Line[] {
  const lines: Line[] = [
    { tokens: [kw("export const "), plain("rolePermissions: "), kw("Record"), plain("<Role, Permission[]> = {")] },
  ];
  for (const role of ROLES) {
    const granted = matrix[role];
    const defaults = defaultRolePermissions[role];
    const active = role === activeRole;
    lines.push({
      tokens: [plain(`  ${role}: [`), ...(active ? [comment("  // ← viewing as")] : [])],
      tone: active ? "active" : undefined,
    });
    for (const permission of PERMISSIONS) {
      if (granted.includes(permission)) {
        const added = !defaults.includes(permission);
        lines.push({
          tokens: [plain("    "), str(permission), plain(","), ...(added ? [comment("  // granted")] : [])],
          tone: added ? "added" : undefined,
        });
      } else if (defaults.includes(permission)) {
        lines.push({ tokens: [comment(`    // "${permission}",  revoked`)], tone: "removed" });
      }
    }
    lines.push({ tokens: [plain("  ],")] });
  }
  lines.push({ tokens: [plain("};")] });
  return lines;
}

const usage: Line[] = [
  { tokens: [comment("// Components ask about permissions, never roles")] },
  { tokens: [kw("const "), plain("canApprove = "), kw("usePermission"), plain("("), str("leave:approve"), plain(");")] },
  { tokens: [] },
  { tokens: [plain("<"), kw("Can "), plain("permission="), str("reports:view"), plain(" fallback={<"), kw("Forbidden"), plain(" />}>")] },
  { tokens: [plain("  <"), kw("ReportsPage"), plain(" />")] },
  { tokens: [plain("</"), kw("Can"), plain(">")] },
];

function CodeBlock({ label, lines }: { label: string; lines: Line[] }) {
  return (
    <figure className="border border-border bg-surface overflow-hidden rounded-md">
      <figcaption className="border-b border-border bg-muted/60 px-3 py-1.5 font-mono text-[0.68rem] text-muted-foreground">
        {label}
      </figcaption>
      {/* Focusable so keyboard users can scroll the listing. */}
      <pre tabIndex={0} aria-label={label} className="max-h-96 overflow-auto py-2 font-mono text-[0.7rem] leading-5">
        <code>
          {lines.map((line, i) => (
            <span
              key={i}
              className={cn(
                "block px-3 whitespace-pre",
                line.tone === "active" && "bg-brand-soft",
                line.tone === "added" && "bg-success-soft",
                line.tone === "removed" && "bg-danger-soft line-through decoration-danger",
              )}
            >
              {line.tokens.map((t, j) => (
                <span key={j} className={t.className}>
                  {t.text}
                </span>
              ))}
              {line.tokens.length === 0 && " "}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

export function PermissionCode() {
  const { matrix, role } = useAppSelector((s) => s.session);
  return (
    <div className="space-y-3">
      <CodeBlock label="permissions.ts · generated from the matrix" lines={buildLines(matrix, role)} />
      <CodeBlock label="usage" lines={usage} />
    </div>
  );
}
