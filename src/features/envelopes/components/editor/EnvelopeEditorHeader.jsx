import { ArrowLeft, Check, Redo2, Send, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/formatters";

function SaveStatus({ save }) {
  const text = {
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Couldn’t save",
    saved: save.savedAt
      ? `Saved ${formatTime(save.savedAt)}`
      : "All changes saved",
  }[save.status];

  return (
    <span
      role="status"
      className={cn(
        "font-mono text-[13px] whitespace-nowrap",
        save.status === "error" ? "text-danger" : "text-ink-muted",
      )}
    >
      {text}
      {save.status === "error" && (
        <button
          type="button"
          onClick={save.saveNow}
          className="ml-2 font-sans text-primary underline"
        >
          Retry
        </button>
      )}
    </span>
  );
}

/** Upload ✓ / Recipients ✓ / Place fields / Review — progress, not navigation. */
function PrepareProgress({ checks }) {
  const isValid = (id) => checks.find((check) => check.id === id)?.isValid;
  const steps = [
    { label: "Upload", done: isValid("documents") },
    { label: "Recipients", done: isValid("recipients") },
    { label: "Place fields", done: isValid("fields") },
    { label: "Review", done: false },
  ];
  const current = steps.findIndex((step) => !step.done);

  return (
    <ol
      className="flex flex-wrap items-center gap-x-2 text-[13px]"
      aria-label="Preparation progress"
    >
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-ink-subtle" aria-hidden>
              /
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1",
              step.done
                ? "text-ink-muted"
                : index === current
                  ? "font-medium text-ink"
                  : "text-ink-subtle",
            )}
          >
            {step.done && (
              <Check
                className="size-3.5 text-success"
                strokeWidth={2.5}
                aria-hidden
              />
            )}
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function EnvelopeEditorHeader({
  envelope,
  backTo,
  checks,
  save,
  history,
  actions,
  onReview,
}) {
  return (
    <header className="shrink-0 border-b border-line bg-canvas">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:flex-1">
          <Button
            as={Link}
            to={backTo}
            variant="secondary"
            size="icon"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <input
                value={envelope.title}
                onChange={(event) =>
                  actions.updateDetails({ title: event.target.value })
                }
                aria-label="Envelope title"
                placeholder="Untitled envelope"
                // `size` makes the input as wide as its text, so the badge sits right after it.
                size={Math.max(envelope.title.length, 12)}
                className="-ml-1 max-w-full min-w-0 truncate rounded-sm border border-transparent bg-transparent px-1 font-serif text-xl text-ink hover:border-line focus:border-primary focus:bg-surface focus:outline-none"
              />
              <Badge tone="neutral">Draft</Badge>
            </div>
            <div className="hidden sm:block">
              <PrepareProgress checks={checks} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <SaveStatus save={save} />
          <div className="flex items-center gap-2">
            <div className="hidden gap-1 md:flex">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Undo"
                title="Undo (⌘/Ctrl+Z)"
                disabled={!history.canUndo}
                onClick={history.undo}
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Redo"
                title="Redo (⇧⌘/Ctrl+Z)"
                disabled={!history.canRedo}
                onClick={history.redo}
              >
                <Redo2 className="size-4" />
              </Button>
            </div>
            <span className="hidden sm:block">
              <Button
                variant="secondary"
                onClick={save.saveNow}
                disabled={save.status === "saving" || save.status === "saved"}
              >
                Save draft
              </Button>
            </span>
            <Button icon={Send} onClick={onReview}>
              Review &amp; send
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
