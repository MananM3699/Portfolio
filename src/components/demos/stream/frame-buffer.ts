/**
 * Collects items and hands them to `flush` at most once per animation frame.
 *
 * A replayed answer emits 50+ tokens in about two seconds. Rendering on every token
 * would re-run reconciliation for each word; batching per frame caps the work at the
 * display's refresh rate and lets several tokens land in a single commit.
 */
export function createFrameBuffer<T>(flush: (items: T[]) => void) {
  let pending: T[] = [];
  let frame: number | null = null;

  const run = () => {
    frame = null;
    if (pending.length === 0) return;
    const items = pending;
    pending = [];
    flush(items);
  };

  return {
    push(item: T) {
      pending.push(item);
      frame ??= requestAnimationFrame(run);
    },
    /** Flush synchronously, e.g. before a terminal event so no tail tokens are lost. */
    flushNow() {
      if (frame !== null) cancelAnimationFrame(frame);
      run();
    },
    cancel() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      pending = [];
    },
  };
}
