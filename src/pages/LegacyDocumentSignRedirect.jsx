import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

/**
 * /documents/:documentId/sign predates envelopes. Existing links (Home
 * "Sign document") pass an envelope id, so forward them to the signing flow.
 */
export function LegacyDocumentSignRedirect() {
  const { documentId } = useParams();
  return <Navigate to={ROUTES.signEnvelope(documentId)} replace />;
}
