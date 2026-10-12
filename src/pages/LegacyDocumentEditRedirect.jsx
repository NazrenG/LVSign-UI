import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

/**
 * /documents/:documentId/edit predates envelopes. Existing links pass either
 * "new" or an envelope id, so forward them to the envelope editor.
 */
export function LegacyDocumentEditRedirect() {
  const { documentId } = useParams();
  return <Navigate to={ROUTES.prepareEnvelope(documentId)} replace />;
}
