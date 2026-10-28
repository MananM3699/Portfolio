import Link from "next/link";
import { SectionHeading } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { HomeSection } from "./section";

// The GitHub Spec Kit flow as used on the HRMS: spec → plan → tasks, the API contract agreed before
// UI work, and a person reviewing every stage before the next one starts.
// TODO(manan): name your test tooling (Vitest / RTL / Playwright) in the last step if you use one.
const steps = [
  { title: "Spec", body: "Requirements become user stories and acceptance criteria.", owner: "AI drafts · I edit", gate: "Right problem?" },
  { title: "Plan", body: "Data model, endpoints and component tree, mapped onto the existing modules.", owner: "AI drafts · I decide", gate: "Fits the architecture?" },
  { title: "Tasks", body: "The plan is cut into small, ordered tasks, each one a reviewable PR.", owner: "Generated · reordered", gate: "Small enough?" },
  { title: "Typed contract", body: "Zod schemas and types agreed with the backend before UI work starts.", owner: "With the API team", gate: "API agrees?" },
  { title: "Build & PR", body: "Components built against the contract, one task per pull request.", owner: "I write · team reviews", gate: "PR review" },
] as const;

type Principle = {
  id: string;
  tab: string;
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
        index="04"
        eyebrow="Method"
        title="Spec first. Types as the contract."
        titleId="process-title"
        description="Spec-driven development with GitHub Spec Kit and AI-assisted tooling. AI drafts each stage; a person reviews it before the next one starts."
      />

      <ol className="mt-14 grid gap-x-6 gap-y-10 lg:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.title} className="border-t border-border-strong pt-4">
            <p className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-6 font-serif text-3xl leading-none text-foreground">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            <p className="mt-4 font-mono text-[0.7rem] text-subtle-foreground">{step.owner}</p>
            <p className="mt-1 font-mono text-[0.7rem] text-foreground">
              <span className="sr-only">Review gate: </span>✓ {step.gate}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-24">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
          Three principles I build on
        </p>
        <Tabs
          defaultValue={principles[0].id}
          orientation="vertical"
          className="mt-6 flex-col gap-10 lg:flex-row lg:gap-12"
        >
          <TabsList className="h-auto w-full flex-col items-stretch justify-start gap-0 rounded-none bg-transparent p-0 lg:w-[18rem] lg:shrink-0">
            {principles.map((p, i) => (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className="h-auto flex-none justify-start gap-4 rounded-none border-0 border-t border-border-strong bg-transparent px-0 py-5 text-left font-serif text-2xl whitespace-normal text-subtle-foreground shadow-none hover:text-foreground data-active:border-border-strong data-active:bg-transparent data-active:text-brand dark:data-active:bg-transparent dark:data-active:border-border-strong dark:data-active:text-brand"
              >
                <span className="font-mono text-xs text-subtle-foreground">0{i + 1}</span>
                {p.tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {principles.map((p) => (
            <TabsContent
              key={p.id}
              value={p.id}
              className="grid min-w-0 flex-1 items-start gap-8 border-t border-border-strong pt-5 xl:grid-cols-2"
            >
              <div>
                <p className="leading-relaxed text-muted-foreground">{p.body}</p>
                <dl className="mt-6 space-y-5 text-sm leading-relaxed">
                  <div>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand">Chose</dt>
                    <dd className="mt-1 text-foreground">{p.chose}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle-foreground">
                      Rejected
                    </dt>
                    <dd className="mt-1 text-muted-foreground">{p.rejected}</dd>
                  </div>
                </dl>
                {p.proof && (
                  <Link
                    href={p.proof.href}
                    className="mt-6 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                  >
                    {p.proof.label} ↗
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
