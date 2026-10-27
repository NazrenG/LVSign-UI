import { useCallback, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { EnvelopeEditor, useEnvelopeEditor } from "@/features/envelopes";

const BACK_TO = ROUTES.agreements;

function StatusScreen({ title, message, isLoading = false }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      {isLoading ? (
        <Loader2 className="size-6 animate-spin text-ink-muted" aria-hidden />
      ) : (
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
      )}
      <p className="text-ink-muted">{message}</p>
      {!isLoading && (
        <Button as={Link} to={BACK_TO} variant="secondary" icon={ArrowLeft}>
          Back to agreements
        </Button>
      )}
    </main>
  );
}

/** Route: /envelopes/:envelopeId/prepare?document=<documentId> */
export function EnvelopeEditorPage() {
  const { envelopeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const onIdResolved = useCallback(
    (id) =>
      navigate(`${ROUTES.prepareEnvelope(id)}${window.location.search}`, {
        replace: true,
      }),
    [navigate],
  );

  const editor = useEnvelopeEditor({
    envelopeId,
    initialDocumentId: searchParams.get("document"),
    onIdResolved,
  });

  // Keep ?document= in step with the open document, so refresh/share reopen it.
  const activeDocumentId = editor.activeDocument?.id;
  useEffect(() => {
    if (!activeDocumentId || searchParams.get("document") === activeDocumentId)
      return;
    const next = new URLSearchParams(searchParams);
    next.set("document", activeDocumentId);
    setSearchParams(next, { replace: true });
  }, [activeDocumentId, searchParams, setSearchParams]);

  if (editor.status === "loading" || !editor.envelope) {
    if (editor.status === "notFound") {
      return (
        <StatusScreen
          title="Envelope not found"
          message="It may have been removed, or the link is wrong."
        />
      );
    }
    if (editor.status === "error") {
      return (
        <StatusScreen
          title="Couldn’t open the envelope"
          message={editor.error?.message ?? "Please try again."}
        />
      );
    }

    return <StatusScreen isLoading message="Opening envelope…" />;
  }
  if (editor.envelope.status !== "draft") {
    return (
      <StatusScreen
        title="Envelope can’t be edited"
        message="This envelope has already been sent and can no longer be changed."
      />
    );
  }

  return (
    <EnvelopeEditor
      editor={editor}
      backTo={BACK_TO}
      onSent={() => navigate(BACK_TO)}
    />
  );
}
