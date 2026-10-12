import { useCallback, useReducer } from "react";

const HISTORY_LIMIT = 50;
const COALESCE_MS = 800;

/**
 * useReducer with undo/redo.
 *
 * Action `meta` controls history:
 *   meta.skipHistory     change present only (e.g. initial load)
 *   meta.applyToHistory  apply to past/present/future (e.g. temp id → server id)
 *   meta.coalesceKey     consecutive actions with the same key within 800 ms
 *                        become one undo step (typing, repeated nudges)
 *
 * `revision` increases on every change that should be saved, so callers can
 * compare it with the revision they last persisted.
 */
export function useUndoableReducer(reducer, initialPresent) {
  const [state, dispatch] = useReducer(
    (history, action) => historyReducer(reducer, history, action),
    {
      past: [],
      present: initialPresent,
      future: [],
      revision: 0,
      lastKey: null,
      lastAt: 0,
    },
  );

  const undo = useCallback(() => dispatch({ type: "@@history/undo" }), []);
  const redo = useCallback(() => dispatch({ type: "@@history/redo" }), []);

  return {
    present: state.present,
    revision: state.revision,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    dispatch,
    undo,
    redo,
  };
}

function historyReducer(reducer, history, action) {
  const { past, present, future } = history;

  if (action.type === "@@history/undo") {
    if (past.length === 0) return history;
    return {
      ...history,
      past: past.slice(0, -1),
      present: past.at(-1),
      future: [present, ...future],
      revision: history.revision + 1,
      lastKey: null,
    };
  }

  if (action.type === "@@history/redo") {
    if (future.length === 0) return history;
    return {
      ...history,
      past: [...past, present],
      present: future[0],
      future: future.slice(1),
      revision: history.revision + 1,
      lastKey: null,
    };
  }

  const next = reducer(present, action);
  if (next === present) return history;

  const meta = action.meta ?? {};
  if (meta.skipHistory) return { ...history, present: next };
  if (meta.applyToHistory) {
    return {
      ...history,
      past: past.map((entry) => reducer(entry, action)),
      present: next,
      future: future.map((entry) => reducer(entry, action)),
    };
  }

  const now = Date.now();
  const coalesce =
    meta.coalesceKey &&
    meta.coalesceKey === history.lastKey &&
    now - history.lastAt < COALESCE_MS;

  return {
    past: coalesce ? past : [...past, present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    revision: history.revision + 1,
    lastKey: meta.coalesceKey ?? null,
    lastAt: now,
  };
}
