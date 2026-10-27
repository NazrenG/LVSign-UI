import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useDisclosure } from "@/hooks/useDisclosure";
import { SIGNING_PHASE } from "../models/signingModel";
import { isFieldComplete } from "../utils/fieldValues";
import { loadSignatureFonts } from "../utils/signatureFonts";
import { DeclineDialog } from "./dialogs/DeclineDialog";
import { FinishSigningDialog } from "./dialogs/FinishSigningDialog";
import { InitialsDialog } from "./dialogs/InitialsDialog";
import { SignatureDialog } from "./dialogs/SignatureDialog";
import { StampDialog } from "./dialogs/StampDialog";
import { DocumentNavigator } from "./DocumentNavigator";
import { NextFieldBar } from "./NextFieldBar";
import { pageAnchorId } from "./SigningDocumentPage";
import { SigningDocumentViewer } from "./SigningDocumentViewer";
import { SigningGuidePanel } from "./SigningGuidePanel";
import { SigningHeader } from "./SigningHeader";

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The recipient's signing screen for a session they can act on.
 *
 *   ≥ xl   documents | document | your fields
 *   lg–xl  documents | document
 *   < lg   document only (documents in a sheet, bottom action bar)
 *
 * Owns only UI state (dialogs, sheet, scrolling); session state comes from
 * useSigningSession via `signing`.
 */
export function SigningExperience({ signing }) {
  const {
    session,
    values,
    activeFieldId,
    hasStarted,
    adopted,
    progress,
    myFields,
    nextRequiredField,
    actions,
    phase,
    submitError,
  } = signing;
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const documentsSheet = useDisclosure();
  const [markDialog, setMarkDialog] = useState(null); // { field }
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [visible, setVisible] = useState(null);
  const isSubmitting = phase === SIGNING_PHASE.SUBMITTING;

  useEffect(loadSignatureFonts, []);

  const documentsById = useMemo(
    () =>
      Object.fromEntries(
        session.documents.map((document) => [document.id, document]),
      ),
    [session.documents],
  );

  /** Scroll a field into view, then focus its control (input, select or button). */
  const goToField = useCallback(
    (field) => {
      if (!field) return;
      actions.focusField(field.id);
      requestAnimationFrame(() => {
        const element = scrollRef.current?.querySelector(
          `[data-field-id="${field.id}"]`,
        );
        if (!element) return;
        element.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
        element
          .querySelector(
            "input:not([type=radio]), input[type=radio], select, button",
          )
          ?.focus({ preventScroll: true });
      });
    },
    [actions],
  );

  const scrollToPage = useCallback(
    (documentId, pageNumber) => {
      document
        .getElementById(pageAnchorId(documentId, pageNumber))
        ?.scrollIntoView({ block: "start" });
      documentsSheet.close();
    },
    [documentsSheet],
  );

  /** Signature/initials reuse the mark adopted earlier; stamps always ask. */
  const openMark = useCallback(
    (field) => {
      actions.focusField(field.id);
      const reusable = adopted[field.fieldType];
      if (reusable && !values[field.id] && field.fieldType !== "stamp") {
        actions.applyMark(field.id, field.fieldType, reusable);
        return;
      }
      setMarkDialog({ field });
    },
    [actions, adopted, values],
  );

  const handlers = useMemo(
    () => ({
      activate: actions.focusField,
      change: actions.setValue,
      openMark,
    }),
    [actions, openMark],
  );

  const closeMark = () => setMarkDialog(null);
  const applyMark = (mark) => {
    const { field } = markDialog;
    actions.applyMark(field.id, field.fieldType, mark);
    closeMark();
  };
  const removeMark = () => {
    actions.clearValue(markDialog.field.id);
    closeMark();
  };

  const openFinish = () => setIsFinishOpen(true);
  const next = () =>
    progress.isComplete ? openFinish() : goToField(nextRequiredField);

  const menuItems = [
    { label: "Finish later", onSelect: () => navigate(ROUTES.agreements) },
    {
      label: "Decline to sign",
      onSelect: () => setIsDeclineOpen(true),
      tone: "danger",
    },
  ];

  const navigator = (
    <DocumentNavigator
      session={session}
      myFields={myFields}
      values={values}
      visible={visible}
      onSelectPage={scrollToPage}
    />
  );

  const markField = markDialog?.field;
  const markDialogProps = {
    isOpen: Boolean(markField),
    recipientName: session.recipient.name,
    currentMark:
      markField && isFieldComplete(markField, values[markField.id])
        ? values[markField.id]
        : null,
    onAdopt: applyMark,
    onRemove: removeMark,
    onClose: closeMark,
  };

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <SigningHeader
        session={session}
        progress={progress}
        canFinish={progress.isComplete}
        isSubmitting={isSubmitting}
        onFinish={openFinish}
        menuItems={menuItems}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[208px] shrink-0 overflow-y-auto border-r border-line px-3 py-5 lg:block">
          {navigator}
        </aside>

        <SigningDocumentViewer
          ref={scrollRef}
          session={session}
          values={values}
          activeFieldId={activeFieldId}
          handlers={handlers}
          onVisibleChange={setVisible}
          onOpenDocuments={documentsSheet.open}
          footer={
            <NextFieldBar
              progress={progress}
              hasStarted={hasStarted}
              nextField={nextRequiredField}
              documentsById={documentsById}
              onStart={() => goToField(nextRequiredField)}
              onNext={next}
              onFinish={openFinish}
              isSubmitting={isSubmitting}
            />
          }
        />

        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-line px-5 py-6 xl:block">
          <SigningGuidePanel
            session={session}
            myFields={myFields}
            values={values}
            activeFieldId={activeFieldId}
            onSelectField={goToField}
          />
        </aside>
      </div>

      <Sheet
        isOpen={documentsSheet.isOpen}
        title="Documents"
        side="left"
        onClose={documentsSheet.close}
      >
        {navigator}
      </Sheet>

      {markField?.fieldType === "stamp" ? (
        <StampDialog
          {...markDialogProps}
          stamps={session.stamps}
          onApply={applyMark}
        />
      ) : markField?.fieldType === "initials" ? (
        <InitialsDialog {...markDialogProps} saved={session.savedInitials} />
      ) : (
        <SignatureDialog {...markDialogProps} saved={session.savedSignatures} />
      )}

      <FinishSigningDialog
        isOpen={isFinishOpen}
        session={session}
        progress={progress}
        isSubmitting={isSubmitting}
        error={submitError}
        onConfirm={signing.finish}
        onClose={() => setIsFinishOpen(false)}
      />
      <DeclineDialog
        isOpen={isDeclineOpen}
        senderName={session.sender.name}
        onDecline={signing.decline}
        onClose={() => setIsDeclineOpen(false)}
      />
    </div>
  );
}
