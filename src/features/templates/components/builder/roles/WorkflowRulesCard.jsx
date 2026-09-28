import { Card, CardHeader, Select, SettingRow, Toggle } from "@/components/ui";
import { COMPLETE_RULES, DECLINE_RULES } from "../../../templateConstants";

export function WorkflowRulesCard({ rules, actions }) {
  const setRule = (patch) => actions.updateSection("rules", patch);

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader title="Rules" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="If someone declines"
          options={DECLINE_RULES}
          value={rules.onDecline}
          onChange={(event) => setRule({ onDecline: event.target.value })}
        />
        <Select
          label="When everyone has signed"
          options={COMPLETE_RULES}
          value={rules.onComplete}
          onChange={(event) => setRule({ onComplete: event.target.value })}
        />
      </div>
      <div className="mt-5 space-y-5">
        <SettingRow
          title="Skip the department head when the employee is the department head"
          description="The document moves straight to the next approver."
          control={
            <Toggle
              label="Skip self-approval"
              checked={rules.skipSelfApproval}
              onChange={(skipSelfApproval) => setRule({ skipSelfApproval })}
            />
          }
        />
        <SettingRow
          title="Require a comment when approving"
          control={
            <Toggle
              label="Require a comment when approving"
              checked={rules.requireComment}
              onChange={(requireComment) => setRule({ requireComment })}
            />
          }
        />
      </div>
    </Card>
  );
}
