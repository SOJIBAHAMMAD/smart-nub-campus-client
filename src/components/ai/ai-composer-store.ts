/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useSyncExternalStore } from "react";

/**
 * Tiny in-memory store that lets the disconnected sidebars (rendered as
 * page props) pre-fill the chat composer without polluting the URL.
 *
 * A real chat app keeps the draft in component/state — not in the address
 * bar. Popular-prompt clicks call `set()`; the composer reads `useComposerValue()`.
 */
let draft = "";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const aiComposer = {
  get: () => draft,
  /** Replace the composer draft (used by prompt shortcuts). */
  set: (next: string) => {
    draft = next;
    emit();
  },
  /** Append to the existing draft (used by tool shortcuts). */
  append: (next: string) => {
    draft = draft ? `${draft} ${next}` : next;
    emit();
  },
  clear: () => {
    draft = "";
    emit();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Subscribe a component to the composer draft value. */
export function useComposerValue(): string {
  return useSyncExternalStore(
    aiComposer.subscribe,
    aiComposer.get,
    aiComposer.get,
  );
}
