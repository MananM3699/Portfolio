import type { Metadata } from "next";
import { Check, Handshake, UserRound, UsersRound } from "lucide-react";
import { CaseSection, CaseStudyShell, Decision, Figure, Prose } from "@/components/case-study/case-study";
import { Point, PointList } from "@/components/case-study-content/point-list";
import { CodeFigure } from "@/components/case-study-content/code-figure";
import { HrmsArchitectureDiagram } from "@/components/case-study-content/hrms-architecture";
import { RbacPlaygroundLazy } from "@/components/demos/rbac/lazy";
import { Card } from "@/components/ui/primitives";
import { Separator } from "@/components/ui/separator";
import { getProject } from "@/content/projects";
import { HRMS_MODULE_COUNT } from "@/content/site";

const project = getProject("hrms");

export const metadata: Metadata = {
  title: "HRMS case study",
  description: `How I architect the frontend of a ${HRMS_MODULE_COUNT}-module enterprise HRMS: a shared component layer, tag-based cache invalidation, shared Zod contracts and a declarative permission map.`,
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "constraints", label: "Constraints" },
  { id: "demo", label: "Try it" },
  { id: "decisions", label: "Decisions" },
  { id: "architecture", label: "Architecture" },
  { id: "scheduling", label: "Scheduling" },
  { id: "my-role", label: "My role" },
  { id: "next", label: "What's next" },
];

const tldr = [
  { label: "Role", value: project.role },
  { label: "Timeline", value: "May 2026 – present (ongoing)" },
  { label: "Stack focus", value: "React, TypeScript, RTK Query, shadcn/ui, Zod" },
  { label: "Outcome", value: project.outcome },
];

const OWN = [
  "Frontend architecture across the modules",
  "The shared Tailwind + shadcn/ui component layer",
  "The RTK Query data layer and its cache-tag design",
  "Permission-aware UI: guards, navigation, actions",
  "Schema-validated forms and scheduling workflows",
];

const SHARED = [
  "Database schema design",
  "Backend business logic",
  "API contracts, agreed through specs",
];

const TAGS_SNIPPET = `// leaveApi.ts (renamed and simplified)
approveLeave: build.mutation<LeaveRequest, ApproveInput>({
  query: ({ id }) => ({
    url: \`/leave-requests/\${id}/approve\`,
    method: "POST",
  }),
  invalidatesTags: (_res, _err, { id, employeeId }) => [
    { type: "LeaveRequest", id },
    { type: "LeaveBalance", id: employeeId },
    { type: "Attendance", id: employeeId },
    "Calendar",
  ],
}),`;

const PERMISSIONS_SNIPPET = `// permissions.ts (renamed and simplified)
export const permissions = {
  "leave.request": ["employee", "manager", "hrAdmin"],
  "leave.approve": ["manager", "hrAdmin"],
  "holiday.manage": ["hrAdmin"],
} as const satisfies Record<string, readonly Role[]>;

// One map, three consumers:
<RequirePermission permission="leave.approve" />  // route guard
navItems.filter((item) => can(item.permission))   // navigation
{can("leave.approve") && <ApproveButton />}       // actions`;

export default function HrmsCaseStudyPage() {
  return (
    <CaseStudyShell project={project} toc={toc} tldr={tldr}>
      <CaseSection id="overview" eyebrow="01 · Overview" title="Many modules, many roles, one codebase">
        <Prose>
          <p>
            The HRMS I work on at IITIL is a single web app that HR teams, managers and employees all
            use. It has {HRMS_MODULE_COUNT} modules covering employee lifecycle, organization
            management, leave, attendance, holidays, shifts and rosters, overtime, employee requests
            and documents. Every module serves more than one role, and most of them read or change
            data that another module displays.
          </p>
          <p>
            My job is the frontend architecture. That means three things: building each module so the
            next one costs less than the last, keeping server data correct on every screen that shows
            it, and making one codebase show each role exactly what it is allowed to do, and nothing
            more.
          </p>
          <p>
            The product and its screens are proprietary, so this page is about decisions rather than
            screenshots. The playground further down is a rebuild from scratch with a fictional brand,
            fictional people and mock data.
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="constraints" eyebrow="02 · Constraints" title="What the design had to survive">
        <PointList>
          <Point>
            <strong>One screen, several audiences.</strong> The same leave screen serves the person
            asking for time off, the manager approving it and the HR admin who sets the policy.
            Each sees different data and different buttons.
          </Point>
          <Point>
            <strong>Modules share data.</strong> Approving a leave request changes a balance, an
            attendance record and a calendar, and those belong to different modules.
          </Point>
          <Point>
            <strong>Contracts move.</strong> Backend APIs and database schemas are designed
            alongside the frontend, so the shape of the data can change under a screen that already
            exists.
          </Point>
          <Point>
            <strong>Rules are dense.</strong> HR policy is full of edge cases, like a leave range
            that crosses a holiday or two shifts that overlap. These are easy to get half right.
          </Point>
          <Point>
            <strong>It never stops shipping.</strong> I joined in May 2026. Modules ship one after
            another rather than in a single launch, so every pattern has to hold up while the
            codebase grows around it.
          </Point>
        </PointList>
      </CaseSection>

      <CaseSection id="demo" eyebrow="03 · Try it" title="Try it: the permission playground">
        <Prose>
          <p>
            Switch between <strong>Employee</strong>, <strong>Manager</strong> and{" "}
            <strong>HR Admin</strong> and watch buttons lock and calendar layers appear or disappear.
            Toggle a cell in the permission matrix to change what a role can do. Then approve a
            pending leave request and check the side panel: it lists the cache tags that one mutation
            invalidated. That is decisions 02 and 04 below, running in front of you.
          </p>
        </Prose>
        <RbacPlaygroundLazy />
      </CaseSection>

      <CaseSection id="decisions" eyebrow="04 · Decisions" title="Five decisions that shaped the code">
        <Prose>
          <p>
            Most of the codebase follows from five choices. For each one I list what I rejected and
            what the choice costs, because every one of them has a cost.
          </p>
        </Prose>

        <Decision
          n={1}
          title="One shared component layer, not per-module styling"
          context={`Every module needs the same parts: data tables with filters, forms, dialogs, status badges, page headers and empty states. With ${HRMS_MODULE_COUNT} modules, each small inconsistency gets repeated ${HRMS_MODULE_COUNT} times, and users notice when "Approve" looks different in two places.`}
          chose={
            <>
              A shared layer on Tailwind and shadcn/ui. The primitives live in the repo as source, and
              app-level components such as a data table, a form field and a status badge are built on
              top of them. Modules are assembled from that layer.
            </>
          }
          rejected={
            <>
              Letting each module style its own screens. It is faster for the first module and slower
              for every one after it, and the drift shows up in review, not in the type checker.
            </>
          }
          why={
            <>
              The layer had to exist before the first module could ship, and a change to a shared
              component now affects every module, so those changes get more review. In return, a new
              module starts from finished parts instead of a blank file.
            </>
          }
        />

        <Decision
          n={2}
          title="Tag-based cache invalidation with RTK Query"
          context="Approving a leave request is one click for the manager. But it changes the request's status, the employee's leave balance, their attendance for those dates and the team calendar. Any of those screens might already be cached."
          chose={
            <>
              RTK Query for all server state. Queries declare the tags they <em>provide</em>, and
              mutations declare the tags they <em>invalidate</em>. Approving leave invalidates Leave,
              Attendance and Calendar, and every mounted view that depends on them refetches.
            </>
          }
          rejected={
            <>
              Calling <code>refetch()</code> by hand after each mutation, or copying server data into a
              global Redux slice and keeping it in sync myself. Both depend on whoever writes the
              mutation remembering every screen it affects.
            </>
          }
          why={
            <>
              The tag vocabulary is a small schema that needs maintaining, and broad tags cause some
              extra requests. I accept a few unnecessary refetches in exchange for screens that are
              never stale after an approval.
            </>
          }
        />
        <CodeFigure
          label="Illustrative RTK Query mutation"
          code={TAGS_SNIPPET}
          caption="Illustrative only: renamed and simplified, not production code. The mutation names everything it affects, so no screen has to know who changed its data."
        />

        <Decision
          n={3}
          title="Zod schemas shared by forms and API contracts"
          context="Each entity, such as a leave request, a shift or an employee record, appears in a form, in a request body and in a response. While the backend contracts were still being designed, those three descriptions could easily drift apart."
          chose={
            <>
              One Zod schema per contract. TypeScript types come from <code>z.infer</code>, forms
              validate against the same schema, and API responses are parsed at the boundary before
              any component sees them.
            </>
          }
          rejected={
            <>
              Hand-written interfaces with separate validation rules in each form. They compile
              cleanly and drift without anyone noticing, because TypeScript trusts whatever the API
              sends back.
            </>
          }
          why={
            <>
              Runtime parsing adds bundle weight and a little work per response. A contract change
              now fails loudly at the boundary, where a loose interface would have rendered something
              subtly wrong. I want that failure to be loud.
            </>
          }
        />

        <Decision
          n={4}
          title="A declarative permission map, not scattered role checks"
          context={`Many roles see the same screens with different abilities. Inline checks like role === "admin" spread through components quickly, and the route, the menu and the button soon stop agreeing about who can do what.`}
          chose={
            <>
              One permission map from capability to roles. The route guard, the navigation builder and
              every action button read it through a single <code>can()</code> helper, so all three
              answer the same question the same way.
            </>
          }
          rejected={
            <>
              Role checks written inline wherever they are needed. They are easy to add, hard to
              audit and impossible to change in one place.
            </>
          }
          why={
            <>
              The map is a single file that every feature touches, so it needs careful review. It also
              only controls what the UI shows: the API has to enforce the same rules, because a hidden
              button is not a security boundary.
            </>
          }
        />
        <CodeFigure
          label="Illustrative permission map"
          code={PERMISSIONS_SNIPPET}
          caption="Illustrative only: renamed and simplified. Adding a capability means editing one map, not hunting for every place a role is checked."
        />

        <Decision
          n={5}
          title="Spec-driven delivery with GitHub Spec Kit"
          context="Requirements arrive as HR policy, and the backend contract for a feature is often being written at the same time as the UI. Going straight from a ticket to code tends to push edge cases and contract mismatches late, into QA or review."
          chose={
            <>
              Write the spec first. Spec Kit turns it into an implementation plan and a task list,
              which I check against the backend API contract before writing code. I then implement in
              small tasks with AI-assisted development and review each change.
            </>
          }
          rejected={
            <>
              Going from ticket to code, with the edge cases worked out during the build. It starts
              faster and pays for it later.
            </>
          }
          why={
            <>
              The first commit on a feature comes later, and a spec that is not kept up to date
              becomes misleading. The gain is that disagreements with the backend contract show up in
              a document review, which is the cheapest place to fix them.
            </>
          }
        />
      </CaseSection>

      <CaseSection id="architecture" eyebrow="05 · Architecture" title="One request, end to end">
        <Figure caption="Read the top row left to right, then the bottom row. Highlighted steps are the ones the playground shows live. On narrow screens the diagram scrolls sideways.">
          <HrmsArchitectureDiagram />
        </Figure>
        <Prose>
          <p>
            A route mounts and the <strong>RBAC guard</strong> checks the permission map before the
            module renders anything. Module components never fetch on their own. They call hooks from
            an <strong>RTK Query slice</strong>, and each endpoint declares the <strong>cache tags</strong>{" "}
            it provides or invalidates. Requests and responses pass through the{" "}
            <strong>Zod contract</strong>, so a component only ever receives data that matches its
            type.
          </p>
          <p>
            On the server side of the HTTP boundary, the REST API applies business rules and the
            database schema backs them. I help design both with the backend team. The permission map
            on the frontend decides what the interface offers. Authorization itself is enforced on
            the server.
            {/* TODO(manan): confirm how the HRMS API enforces permissions (middleware, policy layer, etc.) and add one sentence if it can be shared. */}
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="scheduling" eyebrow="06 · Scheduling" title="Calendars and validated workflows">
        <Prose>
          <p>
            Leave, holidays and attendance each have an interactive calendar built on{" "}
            <strong>FullCalendar</strong>. I treat each calendar as one more view over RTK Query data,
            not as a separate store. Events are mapped from the same endpoint results the list
            screens use, so when an approval invalidates the Calendar tag, the calendar refetches
            along with everything else and never needs its own sync code.
          </p>
          <p>
            Shifts, rosters, overtime and employee requests are form-heavy workflows. Their Zod
            schemas encode the rule as well as the type, for example an end time that must come after
            the start time or a date range that must be valid as a whole, so the form, the request
            and the response all enforce the same constraint. Cross-field checks live in the schema,
            not in the submit handler, where they would be easy to skip.
            {/* TODO(manan): add one concrete, shareable example of a scheduling rule you encoded (no internal policy details). */}
          </p>
          <p>
            The playground shows a small version of this: calendar layers are gated by the permission
            map, like any other action.
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="my-role" eyebrow="07 · My role" title="What I own and what I share">
        <div className="grid max-w-[68ch] gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-brand">
              <UserRound className="size-3.5" aria-hidden /> I own
            </h3>
            <Separator className="my-4" />
            <ul className="space-y-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">
              {OWN.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
              <UsersRound className="size-3.5" aria-hidden /> With the team
            </h3>
            <Separator className="my-4" />
            <ul className="space-y-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">
              {SHARED.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Handshake className="mt-1 size-4 shrink-0 text-subtle-foreground" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <Prose>
          <p>
            To be clear about the timeline: I joined IITIL in May 2026, so this is current work, not
            a finished project. The decisions above are in use today, and the modules keep shipping
            on top of them. I don&apos;t have production metrics I can publish yet, so this page
            describes the architecture rather than quoting numbers.
            {/* TODO(manan): add team size and which modules are in production, if shareable. */}
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="next" eyebrow="08 · Next" title="What I'd do differently, and what's next">
        <PointList>
          <Point>
            <strong>Give the contract one owner.</strong> A Zod schema that mirrors the API by hand
            is a second copy of the contract. I want the schemas generated from, or shared with, the
            backend definition, so a contract change is one edit instead of two.
            {/* TODO(manan): adjust if the schemas are already shared with the backend. */}
          </Point>
          <Point>
            <strong>Test the shared layer as a product.</strong> A change to the data table touches
            every module. I&apos;d add visual regression tests on the shared components so a
            regression shows up before a reviewer has to spot it.
          </Point>
          <Point>
            <strong>Check the permission map against the API.</strong> The frontend map and the
            server rules describe the same policy. A test that compares the two would catch the
            case where the UI offers an action the API will refuse.
          </Point>
          <Point>
            <strong>Measure.</strong> I&apos;d instrument time-to-interactive per module and
            refetch counts per mutation, so the next round of decisions rests on numbers rather
            than judgment.
          </Point>
        </PointList>
      </CaseSection>
    </CaseStudyShell>
  );
}
