import { SignatureDialog } from "./SignatureDialog";

/** Initials use the same capture flow as signatures, tuned for short marks. */
export function InitialsDialog(props) {
  return <SignatureDialog {...props} kind="initials" />;
}
