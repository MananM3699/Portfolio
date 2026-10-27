import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Check,
  FileText,
  GitPullRequest,
  ListChecks,
  Map as MapIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import { Chip, SectionHeading } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { HomeSection } from "./section";

type Step = {
  title: string;
  body: string;
  owner: string;
  gate: string;
  icon: LucideIcon;
};

// The GitHub Spec Kit flow as used on the HRMS: spec → plan → tasks, with the API contract
// agreed before UI work and every stage reviewed by a person before the next one starts.
// TODO(manan): name your test tooling (Vitest / RTL / Playwright) in the last step if you use one.
const steps: Step[] = [
  {
    title: "Spec",
    body: "Requirements become user stories and acceptance criteria.",
    owner: "AI drafts · I edit",
    gate: "Right problem?",
    icon: FileText,
  },
  {
    title: "Plan",
    body: "Data model, endpoints and component tree, mapped onto the existing modules.",
    owner: "AI drafts · I decide",
    gate: "Fits the architecture?",
    icon: MapIcon,
  },
  {
    title: "Tasks",
    body: "The plan is cut into small, ordered tasks, each one a reviewable PR.",
    owner: "Generated · reordered",
    gate: "Small enough?",
    icon: ListChecks,
  },
  {
    title: "Typed contract",
    body: "Zod schemas and types agreed with the backend before UI work starts.",
    owner: "With the API team",
    gate: "API agrees?",
    icon: Braces,
  },
  {
    title: "Build & PR",
    body: "Components built against the contract, one task per pull request.",
    owner: "I write · team reviews",
    gate: "PR review",
    icon: GitPullRequest,
  },
];

const toolkit = ["GitHub Spec Kit", "Claude · OpenAI", "TypeScript strict", "Zod", "RTK Query", "PR review"];

type Principle = {
  id: string;
  tab: string;
  title: string;
  body: string;
  chose: string;
  rejected: string;
  filename: string;
  code: string;
  proof?: { href: string; label: string };
};

const principles: Principle[] = [
  {
    id: "permissions",
    tab: "Permissions are data",
    title: "Permissions live in one typed table",
    body: "Components ask whether an action is allowed. They never compare role names, so adding a role or moving a permission is a one-line change that the compiler checks.",
    chose: "A declarative role → permission map behind usePermission and <Can>.",
    rejected: "Role checks inside JSX. Every new role means hunting down each if (role === …).",
    filename: "permissions.ts",
    code: `
type Role = "employee" | "manager" | "hr_admin";
type Permission =
  | "leave:request" | "leave:approve"
  | "leave:export" | "salary:edit";

export const rolePermissions = {
  employee: ["leave:request"],
  manager: ["leave:request", "leave:approve"],
  hr_admin: [
    "leave:request", "leave:approve",
    "leave:export", "salary:edit",
  ],
} satisfies Record<Role, Permission[]>;

// <Can permission="leave:approve"><ApproveButton /></Can>`,
    proof: { href: "/work/hrms#demo", label: "Try it in the permission playground" },
  },
  {
    id: "contracts",
    tab: "Types are the contract",
    title: "One schema for the form and the API",
    body: "The same Zod schema validates the form and the request payload, and the TypeScript type is inferred from it. When the contract changes, every screen that uses it fails to compile.",
    chose: "Zod schemas as the single source, with types inferred via z.infer.",
    rejected: "Hand-written interfaces plus separate validation rules. They drift apart without an error.",
    filename: "leave-request.schema.ts",
    code: `
import { z } from "zod";

export const LeaveRequest = z
  .object({
    type: z.enum(["annual", "sick", "comp_off"]),
    from: z.iso.date(),
    to: z.iso.date(),
    reason: z.string().min(10).max(500),
  })
  .refine((r) => r.to >= r.from, { path: ["to"], message: "Ends before it starts" });

export type LeaveRequest = z.infer<typeof LeaveRequest>;`,
  },
  {
    id: "cache",
    tab: "Cache invalidation is a decision",
    title: "Decide what goes stale, once",
    body: "Picking the tags a mutation invalidates is picking which screens refresh. Approving leave refreshes the leave list, the balance and the attendance week, and nothing else.",
    chose: "RTK Query providesTags / invalidatesTags declared next to each endpoint.",
    rejected: "Manual refetch() after each mutation. Calls get missed as new screens appear.",
    filename: "leave.api.ts",
    code: `
getLeaves: build.query<Leave[], void>({
  query: () => "/leaves",
  providesTags: [{ type: "Leave", id: "LIST" }],
}),
approveLeave: build.mutation<Leave, string>({
  query: (id) => ({ url: \`/leaves/\${id}/approve\`, method: "POST" }),
  invalidatesTags: [
    { type: "Leave", id: "LIST" },
    "Balance",
    { type: "Attendance", id: "WEEK" },
  ],
}),`,
    proof: { href: "/work/hrms#demo", label: "Watch the tags fire in the demo" },
  },
];

export function HowIWork() {
  return (
    <HomeSection id="process" aria-labelledby="process-title">
      <SectionHeading
        eyebrow="How I work"
        title={<span id="process-title">Spec first. Types as the contract.</span>}
        description="Spec-driven development with GitHub Spec Kit and AI-assisted tooling. AI drafts each stage; a person reviews it before the next one starts."
      />

      <div className="glass mt-10 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle-foreground">
            Requirement → pull request
          </p>
          <Chip tone="accent">
            <Check className="size-3" aria-hidden /> human review at every gate
          </Chip>
        </div>

        <ol className="relative mt-8 grid gap-8 lg:grid-cols-5 lg:gap-4">
          {/* Connector: vertical rail on mobile, horizontal rail through the icons on desktop. */}
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-5 w-px bg-linear-to-b from-brand/60 via-border-strong to-transparent lg:hidden"
          />
          <span
            aria-hidden
            className="absolute top-5 right-[10%] left-[10%] hidden h-px bg-linear-to-r from-brand/10 via-brand/60 to-brand/10 lg:block"
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative pl-14 lg:pl-0 lg:text-center">
              <span className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-xl border border-brand/30 bg-[color-mix(in_oklab,var(--background)_70%,var(--brand)_30%)] text-brand shadow-[0_6px_20px_-8px_var(--brand)] lg:relative lg:mx-auto">
                <step.icon className="size-[1.1rem]" aria-hidden />
              </span>
              <p className="font-mono text-[0.68rem] text-subtle-foreground lg:mt-4">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-0.5 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 lg:justify-center">
                <span className="glass-subtle rounded-md px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground">
                  {step.owner}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-0.5 font-mono text-[0.68rem] text-success">
                  <Check className="size-3" aria-hidden />
                  <span className="sr-only">Review gate: </span>
                  {step.gate}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <span className="mr-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-subtle-foreground">
            Toolkit
          </span>
          {toolkit.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>

      <div className="glass mt-6 rounded-2xl p-5 sm:p-8">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Three principles I build on
        </h3>
        <Tabs defaultValue={principles[0].id} className="mt-5 gap-6">
          <TabsList className="glass-subtle h-auto w-full flex-col items-stretch justify-start gap-1 rounded-xl p-1 group-data-horizontal/tabs:h-auto sm:flex-row sm:items-center">
            {principles.map((p, i) => (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className="h-9 flex-none justify-start rounded-lg px-3 data-active:border-transparent data-active:bg-brand-soft data-active:text-brand dark:data-active:border-transparent dark:data-active:bg-brand-soft dark:data-active:text-brand"
              >
                <span className="font-mono text-[0.7rem] opacity-70">0{i + 1}</span>
                {p.tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {principles.map((p) => (
            <TabsContent
              key={p.id}
              value={p.id}
              className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8"
            >
              <div className="min-w-0">
                <h4 className="text-xl font-semibold tracking-tight text-foreground">{p.title}</h4>
                <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex flex-col gap-1 rounded-xl bg-success-soft p-3 sm:flex-row sm:gap-3">
                    <dt className="flex shrink-0 items-center gap-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-success">
                      <Check className="size-3.5" aria-hidden /> Chose
                    </dt>
                    <dd className="text-foreground">{p.chose}</dd>
                  </div>
                  <div className="glass-subtle flex flex-col gap-1 rounded-xl p-3 sm:flex-row sm:gap-3">
                    <dt className="flex shrink-0 items-center gap-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-subtle-foreground">
                      <X className="size-3.5" aria-hidden /> Rejected
                    </dt>
                    <dd className="text-muted-foreground">{p.rejected}</dd>
                  </div>
                </dl>
                {p.proof && (
                  <Link
                    href={p.proof.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                  >
                    {p.proof.label} <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </div>
              <CodeBlock filename={p.filename} code={p.code} className="min-w-0" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </HomeSection>
  );
}
