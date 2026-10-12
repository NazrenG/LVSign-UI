import { useCallback, useEffect, useRef, useState } from "react";

const AUTOSAVE_DELAY_MS = 1500;

/**
 * Saves the draft shortly after the last change, and on demand.
 *
 * save(value) must return a Promise. `revision` comes from useUndoableReducer
 * and increases with every saveable change.
 *
 * status: "saved" | "unsaved" | "saving" | "error"
 */
export function useDraftAutosave({ value, revision, isEnabled, save }) {
  const [savedRevision, setSavedRevision] = useState(revision);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  // Latest value/save for the async callback without re-creating timers.
  const latest = useRef({ value, revision, save });
  useEffect(() => {
    latest.current = { value, revision, save };
  });

  const isDirty = revision !== savedRevision;

  const saveNow = useCallback(async () => {
    const {
      value: snapshot,
      revision: snapshotRevision,
      save: saveFn,
    } = latest.current;
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveFn(snapshot);
      setSavedRevision(snapshotRevision);
      setSavedAt(result?.updatedAt ?? new Date().toISOString());
      return true;
    } catch (saveError) {
      setError(saveError);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled || !isDirty || isSaving || error) return undefined;
    const timer = setTimeout(saveNow, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled, isDirty, isSaving, error, revision, saveNow]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const status = isSaving
    ? "saving"
    : error
      ? "error"
      : isDirty
        ? "unsaved"
        : "saved";

  return { status, savedAt, error, isDirty, saveNow };
}
