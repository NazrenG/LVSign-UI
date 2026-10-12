import { cn } from "@/utils/cn";
import { UNASSIGNED_COLORS } from "../../utils/recipientColors";

/** Small colour dot identifying a recipient everywhere in the editor. */
export function RecipientDot({ colors = UNASSIGNED_COLORS, className }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        colors.dot,
        className,
      )}
      aria-hidden
    />
  );
}

/** "Farid Aliyev", or a readable placeholder while the name is still empty. */
export const recipientName = (recipient) =>
  recipient?.displayName.trim() || "Unnamed recipient";
