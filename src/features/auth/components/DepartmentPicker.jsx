import { OptionButtons } from "@/components/ui";
import { DEPARTMENTS } from "@/constants/departments";

/** Staff | System Developer | Finance | Admin — buttons stretch to fill the row. */
export function DepartmentPicker({ value, onChange }) {
  return (
    <OptionButtons
      legend="I work in"
      options={DEPARTMENTS}
      value={value}
      onChange={onChange}
      className="*:flex-1"
    />
  );
}
