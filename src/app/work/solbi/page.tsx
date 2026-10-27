import type { Metadata } from "next";
import { CaseSection, CaseStudyShell, Decision, Figure, Prose } from "@/components/case-study/case-study";
import { Point, PointList } from "@/components/case-study-content/point-list";
import { SolbiPipelineDiagram } from "@/components/case-study-content/solbi-pipeline";
import { StreamReplayLazy } from "@/components/demos/stream/lazy";
import { getProject } from "@/content/projects";

const project = getProject("solbi");

export const metadata: Metadata = {
  title: "SolBI case study",
  description:
    "Chat-driven business intelligence: plain-English questions, answers streamed over Server-Sent Events, and Plotly charts and Leaflet maps that render once the data validates.",
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "demo", label: "Try it" },
  { id: "pipeline", label: "Pipeline" },
  { id: "decisions", label: "Decisions" },
  { id: "backend", label: "Backend" },
  { id: "next", label: "What I'd change" },
];

const tldr = [
  { label: "Role", value: project.role },
  // TODO(manan): narrow this to the months you worked on SolBI within your Helios tenure.
  { label: "Timeline", value: "At Helios Solutions, 2024 – 2026" },
  { label: "Stack focus", value: "Next.js, SSE, Plotly, React-Leaflet, Express, MongoDB" },
  { label: "Outcome", value: project.outcome },
];

export default function SolbiCaseStudyPage() {
  return (
    <CaseStudyShell project={project} toc={toc} tldr={tldr}>
      <CaseSection id="overview" eyebrow="01 · Overview" title="Ask in plain English, get a visual representation with AI insights">
        <Prose>
          <p>
            SolBI is a chat-driven business intelligence tool I worked on at Helios Solutions. A user
            types a business question in plain English and the answer streams back as it is
            generated. When the answer includes data, it turns into an interactive Plotly chart or
            a Leaflet map, and the user can save it to a dashboard.
          </p>
          <p>
            Calling a model was the easy part. The hard part was the frontend: keeping the interface
            responsive while many small chunks arrive, deciding when partial data is safe to draw,
            and keeping sessions available when the network is not. I built the Next.js and React
            client and contributed to the Express and MongoDB backend behind it.
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="demo" eyebrow="02 · Try it" title="Try it: a replay of the streaming answer">
        <Prose>
          <p>
            This is a recorded answer replayed through the same rendering rules, using mock data and
            no live model. Start it and watch the order: text appears token by token first, and the
            chart only appears once its structured payload has fully arrived and passed validation.
            Replay it and compare how it feels to an answer that shows nothing until it is done.
          </p>
        </Prose>
        <StreamReplayLazy />
      </CaseSection>

      <CaseSection id="pipeline" eyebrow="03 · Pipeline" title="From question to dashboard">
        <Figure caption="The top row runs left to right, and the answer comes back right to left on the bottom row. The dashed line separates browser from server. On narrow screens the diagram scrolls sideways.">
          <SolbiPipelineDiagram />
        </Figure>
        <Prose>
          <p>
            A question starts in the <strong>query editor</strong>, which validates it before
            anything is sent. The <strong>Express API</strong> records it in the chat session in
            MongoDB and calls the model.
            {/* TODO(manan): name the LLM provider used in production, if it can be shared. */}
          </p>
          <p>
            The answer returns as a <strong>Server-Sent Events</strong> stream. On the client, the
            stream handler doesn&apos;t touch React state. It publishes each chunk on a{" "}
            <strong>mitt event bus</strong>, and only the message being written subscribes to it.
            Text renders as it arrives. Structured data for a chart or map is held back until it is
            complete and valid, and only then rendered with Plotly or React-Leaflet. A finished answer
            can be saved as a dashboard, and sessions are kept in IndexedDB so they reopen quickly
            and survive a dropped connection.
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="decisions" eyebrow="04 · Decisions" title="Five decisions behind the stream">
        <Decision
          n={1}
          title="Server-Sent Events, not WebSockets"
          context="The question goes up once, and the answer comes down as a stream. Nothing needs to travel from client to server while the answer is being written."
          chose={
            <>
              SSE: a long-lived HTTP response with the <code>text/event-stream</code> content type.
              Express writes events as the model produces them, and the browser reads them over plain
              HTTP.
            </>
          }
          rejected={
            <>
              WebSockets. They give a two-way channel we had no use for, plus a separate connection
              lifecycle, reconnection logic and proxy setup to own.
            </>
          }
          why={
            <>
              SSE only goes one way, so cancelling an answer is a separate request. The native{" "}
              <code>EventSource</code> API only makes GET requests without custom headers, which
              affects how the question and auth are sent. On HTTP/1.1, open streams also count
              against the browser&apos;s per-host connection limit.
              {/* TODO(manan): say whether the client used EventSource or fetch() with a ReadableStream, and how auth was passed. */}
            </>
          }
        />

        <Decision
          n={2}
          title="Tokens on an event bus, not in Redux"
          context="App state such as sessions, dashboards and settings lived in Redux Toolkit. A streamed answer arrives as many small chunks, and dispatching each one would run every subscribed selector and re-render far more of the tree than the one message being written."
          chose={
            <>
              The SSE handler emits chunks on a <code>mitt</code> event bus. Only the streaming message
              subscribes and appends to its own local state. Redux receives the message once, when it
              is complete.
            </>
          }
          rejected={
            <>
              Dispatching a Redux action per token. It is simple and easy to inspect in DevTools, and
              it causes a re-render storm on long answers.
            </>
          }
          why={
            <>
              While an answer is streaming there are two sources of truth, the bus and the store, and
              stream events don&apos;t appear in Redux DevTools. Subscribers have to unsubscribe on
              unmount, or a closed chat keeps listening.
            </>
          }
        />

        <Decision
          n={3}
          title="Progressive render: text first, chart only when valid"
          context="One answer can carry both prose and structured data for a chart or map. The prose is useful immediately. Half of a chart specification is not."
          chose={
            <>
              Render text as it streams. Hold the structured payload until it is complete and passes
              validation, then mount the Plotly chart or Leaflet map.
            </>
          }
          rejected={
            <>
              Waiting for the full response before showing anything, which leaves a blank screen. Or
              drawing the chart from partial data, which makes axes jump and series appear and vanish.
            </>
          }
          why={
            <>
              The chart lands after the text, so the layout has to make room for it without pushing
              the user&apos;s reading position around. A payload that fails validation needs its own
              error state instead of a broken chart.
            </>
          }
        />

        <Decision
          n={4}
          title="IndexedDB for sessions, not server-only"
          context="Chat sessions and their answers live in MongoDB. Loading every session from the server on each visit is slow for long histories, and a dropped connection would leave the user with an empty screen."
          chose={
            <>
              A local copy of sessions in IndexedDB. The UI opens from the local copy and reconciles
              with the server, which remains the source of truth.
            </>
          }
          rejected={
            <>
              Server-only persistence. It is simpler, with one copy and no sync, but every reload is a
              network round trip and offline means nothing to show.
            </>
          }
          why={
            <>
              Two copies can disagree, especially across devices, so the reconcile rules matter more
              than the storage. IndexedDB storage limits and browsers that clear site data also mean
              the local copy is a cache, never the record.
            </>
          }
        />

        <Decision
          n={5}
          title="A validated query editor alongside free-form chat"
          context="Free-form questions are flexible and often ambiguous. A vague or malformed question still costs a full model call and returns an answer the user can't trust."
          chose={
            <>
              A query editor that validates input before it is sent, used as a guardrail next to
              free-form chat rather than in place of it.
              {/* TODO(manan): describe what the editor validated (fields, date ranges, metrics?) in one line, if shareable. */}
            </>
          }
          rejected={
            <>
              Free-form chat only, which leaves the model to interpret every question and the user to
              spot when it guessed wrong.
            </>
          }
          why={
            <>
              It is more UI to build and keep aligned with the data the backend can actually answer
              about, and it can feel restrictive to experienced users. In return, bad questions fail
              fast and cost nothing.
            </>
          }
        />
      </CaseSection>

      <CaseSection id="backend" eyebrow="05 · Backend" title="The API behind the chat">
        <Prose>
          <p>
            On the backend I contributed REST APIs and data models in <strong>Express</strong> and{" "}
            <strong>MongoDB</strong> for the two things users keep: chat sessions and saved
            dashboards. Modelling a session is a read-pattern question. A session is almost always
            loaded as a whole, which argues for embedding its messages in one document. The pressure
            in the other direction is MongoDB&apos;s document size limit on very long sessions, along
            with any query that needs individual messages across sessions.
            {/* TODO(manan): state which shape SolBI used for sessions (embedded vs referenced messages) and why. */}
          </p>
          <p>
            Saved dashboards raise a similar question: store the rendered chart definition, a
            snapshot of the data, or the query to run again. Each one trades freshness against cost
            and against whether the dashboard looks the same the next time it is opened.
            {/* TODO(manan): confirm what a saved dashboard stores (spec only, data snapshot, or the query to re-run). */}
          </p>
          <p>
            I also built <strong>localization</strong> for the interface and the{" "}
            <strong>PayPal</strong> payment integration.
            {/* TODO(manan): add the localization approach and what PayPal was used for (subscriptions vs one-off), if shareable. */}
          </p>
        </Prose>
      </CaseSection>

      <CaseSection id="next" eyebrow="06 · Next" title="What I'd do differently">
        <PointList>
          <Point>
            <strong>Validate the payload on the server too.</strong> The client only draws a chart
            once the payload validates. Running the same schema on the server before the payload is
            sent would mean the client never receives a malformed chart spec at all.
          </Point>
          <Point>
            <strong>Make streams resumable.</strong> SSE supports event IDs and{" "}
            <code>Last-Event-ID</code> on reconnect. Using them would let a dropped connection pick
            up mid-answer instead of starting over.
          </Point>
          <Point>
            <strong>Make &ldquo;stop&rdquo; a first-class action.</strong> A clear way to cancel a
            long answer saves model cost and respects the user&apos;s time.
            {/* TODO(manan): drop this bullet (or the resumable-streams one) if SolBI already had it. */}
          </Point>
          <Point>
            <strong>Measure what I argued for.</strong> I chose the event bus to avoid re-render
            storms, but I don&apos;t have production numbers I can quote. Next time I&apos;d record
            time to first token and render cost per stream from the start.
          </Point>
        </PointList>
      </CaseSection>
    </CaseStudyShell>
  );
}
