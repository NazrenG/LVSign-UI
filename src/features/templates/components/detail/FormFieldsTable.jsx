import { Card, CardHeader } from "@/components/ui";

import { pluralize } from "@/utils/formatters";

import { FIELD_TYPES } from "../../templateConstants";

const COLUMNS = ["Type", "Recipient", "Page", "Required"];

export function FormFieldsTable({ template }) {
  const roleMap = new Map(template.roles.map((role) => [role.id, role.name]));

  const rows = template.fields.map((field) => ({
    key: field.id,

    type: FIELD_TYPES[field.type]?.label ?? field.type,

    recipient: field.recipientRoleId
      ? (roleMap.get(field.recipientRoleId) ?? "Unknown")
      : "Sender / system",

    page: field.pageNumber,

    required: field.required,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Document fields"
        action={
          <span className="text-[13px] text-ink-muted">
            {pluralize(rows.length, "field")}
          </span>
        }
        className="mb-0 px-5 pt-5 pb-4 sm:px-6"
      />

      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-[15px] text-ink-muted">
          No fields have been configured.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <thead className="border-y border-line bg-canvas/60 text-[13px] text-ink-muted">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-2.5 font-medium"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-3 font-medium text-ink">{row.type}</td>

                  <td className="px-4 py-3 text-ink">{row.recipient}</td>

                  <td className="px-4 py-3 text-ink-muted">Page {row.page}</td>

                  <td className="px-4 py-3 text-ink-muted">
                    {row.required ? "Required" : "Optional"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
