import { Card, CardHeader } from "@/components/ui";
import { pluralize } from "@/utils/formatters";
import { countSenderFilled, getFieldTableRows } from "../../templateSelectors";

const COLUMNS = ["Field", "Type", "Filled by", "Required", "Data key"];

export function FormFieldsTable({ template }) {
  const rows = getFieldTableRows(template);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Form fields"
        action={
          <span className="text-[13px] text-ink-muted">
            {pluralize(rows.length, "field")} · {countSenderFilled(template)}{" "}
            filled by the sender
          </span>
        }
        className="mb-0 px-5 pt-5 pb-4 sm:px-6"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[15px]">
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
                <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                <td className="px-4 py-3 text-ink-muted">{row.type}</td>
                <td className="px-4 py-3 text-ink">{row.filledBy}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {row.required ? "Required" : "Optional"}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-ink-muted">
                  {row.dataKey || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
