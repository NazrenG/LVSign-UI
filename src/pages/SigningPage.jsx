import { useEffect } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  FileQuestion,
  Hourglass,
  Lock,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  SIGNING_ACCESS,
  SIGNING_PHASE,
  SigningAccessDeniedError,
  SigningExperience,
  SigningSessionNotFoundError,
  SigningStatusScreen,
  useSigningSession,
} from "@/features/signing";

/** Screens for sessions the recipient cannot act on (yet, or any more). */
const ACCESS_SCREENS = {
  [SIGNING_ACCESS.NOT_YOUR_TURN]: {
    icon: Hourglass,
    tone: "info",
    title: "It's not your turn yet",
    message:
      "This agreement will become available when the previous signing step is complete. We'll email you when it's ready.",
  },
  [SIGNING_ACCESS.EXPIRED]: {
    icon: Clock,
    tone: "warning",
    title: "This agreement has expired",
    message:
      "It can no longer be signed. Contact the sender if it still needs your signature.",
  },
  [SIGNING_ACCESS.VOIDED]: {
    icon: Ban,
    tone: "neutral",
    title: "This agreement was cancelled",
    message: "The sender voided it, so there is nothing for you to sign.",
  },
  [SIGNING_ACCESS.DECLINED]: {
    icon: XCircle,
    tone: "neutral",
    title: "This agreement was declined",
    message: "Signing has stopped. The sender has been notified.",
  },
  [SIGNING_ACCESS.ALREADY_COMPLETED]: {
    icon: CheckCircle2,
    tone: "success",
    title: "You have already completed your part",
    message: "Nothing else is needed from you for this agreement.",
  },
  [SIGNING_ACCESS.NOTHING_TO_SIGN]: {
    icon: FileQuestion,
    tone: "neutral",
    title: "Nothing to sign here",
    message: "This agreement has no fields assigned to you.",
  },
};

function errorScreen(error) {
  if (error instanceof SigningSessionNotFoundError) {
    return {
      icon: FileQuestion,
      title: "Agreement not found",
      message: "The link may be wrong, or the agreement was removed.",
    };
  }
  if (error instanceof SigningAccessDeniedError) {
    return {
      icon: Lock,
      tone: "danger",
      title: "You don't have access to this agreement",
      message:
        "Only the people it was sent to can open it. Check that you are signed in with the right account.",
    };
  }
  return {
    icon: AlertTriangle,
    tone: "warning",
    title: "We couldn't open this agreement",
    message: error?.message ?? "Please try again.",
  };
}

/** Route: /envelopes/:envelopeId/sign — the recipient's signing flow (full screen). */
export function SigningPage() {
  const { envelopeId } = useParams();
  const navigate = useNavigate();
  const signing = useSigningSession(envelopeId);
  const { load, session, access, phase, result } = signing;

  // Old links may use another id; show the real envelope id in the address bar.
  useEffect(() => {
    if (session && session.envelopeId !== envelopeId) {
      navigate(ROUTES.signEnvelope(session.envelopeId), { replace: true });
    }
  }, [session, envelopeId, navigate]);

  if (load.status === "loading")
    return <SigningStatusScreen isLoading message="Opening your agreement…" />;
  if (load.status === "error")
    return <SigningStatusScreen {...errorScreen(load.error)} />;

  if (phase === SIGNING_PHASE.COMPLETED) {
    const isEnvelopeComplete = result?.envelopeStatus === "completed";
    return (
      <SigningStatusScreen
        icon={CheckCircle2}
        tone="success"
        title="Signing complete"
        message={
          isEnvelopeComplete
            ? "This agreement is complete. Everyone has signed, and a copy will be emailed to you."
            : "Your part is complete. The agreement is waiting for the remaining recipients."
        }
        subject={session.subject}
        note="You can now close this window."
      />
    );
  }

  if (phase === SIGNING_PHASE.DECLINED) {
    return (
      <SigningStatusScreen
        icon={XCircle}
        tone="neutral"
        title="You declined to sign"
        message={`${session.sender.name} has been notified with your reason.`}
        subject={session.subject}
        note="You can now close this window."
      />
    );
  }

  if (access !== SIGNING_ACCESS.READY) {
    return (
      <SigningStatusScreen
        {...ACCESS_SCREENS[access]}
        subject={session.subject}
      />
    );
  }

  return <SigningExperience signing={signing} />;
}
