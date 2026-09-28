import { useState } from "react";
import { Database, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { PEOPLE } from "@/data/people";
import { calculateField } from "../../fieldCalculations";
import { FILLER } from "../../templateConstants";
import { findPersonByName } from "../../templateSelectors";

const PREFILL_FILLERS = [FILLER.SENDER, FILLER.HR_SYSTEM, FILLER.CALCULATED];

/** Values that come from the HR system, looked up from the named employee. */
const HR_SYSTEM_LOOKUPS = {
  "employee.department": (person) => person?.department ?? "",
};

function getEmployeeHint(person) {
  if (!person) return "Department head resolves when you send";
  const manager = PEOPLE[person.managerId];
  return manager
    ? `Department head resolves to ${manager.name}`
    : "No department head on record";
}

/** Renders the right control for one field type. */
function PrefillField({ field, value, values, employee, onChange }) {
  const label = field.required ? field.label : `${field.label} (optional)`;

  if (field.filledBy === FILLER.CALCULATED) {
    return (
      <div className="col-span-2 flex items-center justify-between rounded-sm bg-canvas px-3.5 py-3 text-[15px]">
        <span className="text-ink-muted">{field.label} (calculated)</span>
        <span className="font-semibold text-ink">
          {calculateField(field, values) || "—"}
        </span>
      </div>
    );
  }

  if (field.filledBy === FILLER.HR_SYSTEM) {
    return (
      <Input
        label={field.label}
        icon={Database}
        value={HR_SYSTEM_LOOKUPS[field.dataKey]?.(employee) ?? ""}
        placeholder="Filled when the employee is known"
        hint="From the HR system · read only"
        readOnly
        wrapperClassName="col-span-2"
      />
    );
  }

  const common = {
    label,
    value: value ?? "",
    onChange: (event) => onChange(field.dataKey, event.target.value),
    required: field.required,
  };

  switch (field.type) {
    case "dropdown":
      return (
        <Select
          {...common}
          options={field.options}
          wrapperClassName="col-span-2"
        />
      );
    case "date":
      return (
        <Input
          {...common}
          type="date"
          wrapperClassName="col-span-2 sm:col-span-1"
        />
      );
    case "fullName":
      return (
        <Input
          {...common}
          icon={User}
          placeholder="Full name"
          hint={getEmployeeHint(employee)}
          wrapperClassName="col-span-2"
        />
      );
    default:
      return (
        <Input
          {...common}
          type={field.type === "number" ? "number" : "text"}
          placeholder={PLACEHOLDERS[field.dataKey]}
          wrapperClassName="col-span-2"
        />
      );
  }
}

const PLACEHOLDERS = { "leave.cover_person": "Name of colleague" };

const EXAMPLE_VALUES = {
  "employee.full_name": "Aysel Mammadova",
  "leave.type": "Annual leave",
  "leave.start_date": "2026-10-06",
  "leave.end_date": "2026-10-10",
};

/** "Pre-fill before sending": the sender fills their fields, then starts the document. */
export function PrefillForm({ template }) {
  const navigate = useNavigate();
  const fields = template.fields.filter((field) =>
    PREFILL_FILLERS.includes(field.filledBy),
  );

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.dataKey,
        EXAMPLE_VALUES[field.dataKey] ?? field.options?.[0] ?? "",
      ]),
    ),
  );

  const employee = findPersonByName(values["employee.full_name"] ?? "");
  const setValue = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: POST the values to the API; the editor then opens the new document.
    navigate(ROUTES.editDocument("new"));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Pre-fill before sending"
          description="You fill these now. Signers only see and sign."
        />
        {fields.length === 0 ? (
          <p className="text-[15px] text-ink-muted">
            This template has no fields for the sender.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <PrefillField
                key={field.id}
                field={field}
                value={values[field.dataKey]}
                values={values}
                employee={employee}
                onChange={setValue}
              />
            ))}
          </div>
        )}
      </Card>

      <Button type="submit" size="lg" icon={Send} fullWidth>
        Use template
      </Button>
      <p className="text-center text-[13px] text-ink-muted">
        You can review the document before it is sent.
      </p>
    </form>
  );
}
