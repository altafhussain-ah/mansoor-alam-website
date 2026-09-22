/**
 * Lets the assistant drive the Publications search box.
 *
 * The two components are siblings with no shared parent state, and this is the
 * only thing they need to say to each other — so a tiny subscription beats
 * threading a context provider through the page.
 */
type Listener = (query: string) => void;

const listeners = new Set<Listener>();

export function requestPublicationSearch(query: string): void {
  for (const listener of listeners) listener(query);
}

export function onPublicationSearch(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
