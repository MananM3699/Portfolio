/**
 * A replay transport that speaks Server-Sent Events.
 *
 * `createReplayStream` produces the same bytes an SSE endpoint would
 * (`event: token\ndata: {...}\n\n`), and `readEvents` parses any such byte stream,
 * so swapping the replay for `fetch(url).then((r) => r.body!)` changes one line.
 */
import type { Emitter } from "./emitter";
import type { Fixture } from "./fixtures";

type StreamEvent =
  | { type: "token"; text: string }
  | { type: "data"; payload: unknown }
  | { type: "done" }
  | { type: "error"; message: string };

export type StreamEventType = StreamEvent["type"];

/** Event map for the emitter: each event type carries its own event object. */
export type StreamEvents = { [K in StreamEventType]: Extract<StreamEvent, { type: K }> };

type ReplayOptions = {
  signal: AbortSignal;
  /** Skip all delays (used for prefers-reduced-motion). */
  instant?: boolean;
  /** Emit an `error` event after this many tokens instead of finishing. */
  failAfter?: number;
};

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function frame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createReplayStream(
  fixture: Fixture,
  { signal, instant = false, failAfter }: ReplayOptions,
): ReadableStream<Uint8Array> {
  const wait = (ms: number) => sleep(instant ? 0 : ms, signal);

  async function* frames(): AsyncGenerator<string> {
    await wait(fixture.firstTokenMs);
    for (const [index, chunk] of fixture.chunks.entries()) {
      if (index === failAfter) {
        yield frame("error", { message: "Upstream closed the connection (simulated)." });
        return;
      }
      await wait(chunk.delayMs);
      yield frame("token", { text: chunk.text });
    }
    await wait(fixture.payloadDelayMs);
    yield frame("data", fixture.payload);
    yield frame("done", {});
  }

  const source = frames();
  const encoder = new TextEncoder();

  // Pull-based: the next frame is produced only when the reader asks for it,
  // which gives the replay the same backpressure as a network body.
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await source.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(value));
    },
    async cancel() {
      await source.return(undefined);
    },
  });
}

function parseFrame(raw: string): StreamEvent | null {
  let type = "message";
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) type = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  const body: unknown = data.length ? JSON.parse(data.join("\n")) : {};
  const field = (key: string) =>
    typeof body === "object" && body !== null ? (body as Record<string, unknown>)[key] : undefined;

  switch (type) {
    case "token": {
      const text = field("text");
      return typeof text === "string" ? { type, text } : null;
    }
    case "data":
      return { type, payload: body };
    case "done":
      return { type };
    case "error": {
      const message = field("message");
      return { type, message: typeof message === "string" ? message : "Stream failed." };
    }
    default:
      return null; // Unknown event types are ignored, as the SSE spec intends.
  }
}

/** Parses an SSE byte stream into typed events. Rejects with the abort reason on abort. */
export async function* readEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const event = parseFrame(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (event) yield event;
      }
    }
  } finally {
    // Runs on normal end, on error, and when the consumer stops early.
    reader.cancel().catch(() => {});
  }
}

/** Publishes every event on the bus. The emitter, not React, sees each token. */
export async function pipeToEmitter(
  events: AsyncIterable<StreamEvent>,
  bus: Emitter<StreamEvents>,
): Promise<void> {
  for await (const event of events) {
    bus.emit(event.type, event);
    if (event.type === "done" || event.type === "error") return;
  }
}
