/**
 * A minimal typed event emitter (mitt-style).
 *
 * The transport publishes stream events here instead of calling React setters,
 * so a token arriving costs one function call, not one render.
 */
type Handler<T> = (payload: T) => void;

export type Emitter<Events extends Record<string, unknown>> = {
  on<K extends keyof Events>(type: K, handler: Handler<Events[K]>): () => void;
  emit<K extends keyof Events>(type: K, payload: Events[K]): void;
  clear(): void;
};

export function createEmitter<Events extends Record<string, unknown>>(): Emitter<Events> {
  const handlers: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {};

  return {
    on(type, handler) {
      const set = (handlers[type] ??= new Set());
      set.add(handler);
      return () => set.delete(handler);
    },
    emit(type, payload) {
      handlers[type]?.forEach((handler) => handler(payload));
    },
    clear() {
      for (const key of Object.keys(handlers)) delete handlers[key as keyof Events];
    },
  };
}
