import { useState } from "react";
import { Cloud, FolderOpen, Info } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Input,
  SegmentedControl,
  Select,
  SettingRow,
  Toggle,
} from "@/components/ui";
import { AdminSectionHeader } from "../AdminSectionHeader";

const REMINDER_OPTIONS = [
  { value: "0", label: "No automatic reminders" },
  { value: "1", label: "Every day" },
  { value: "2", label: "Every 2 days" },
  { value: "3", label: "Every 3 days" },
  { value: "7", label: "Every week" },
];

const DOCUMENT_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "Word (.docx)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "images", label: "Images (PNG, JPG)" },
];

const ROUTING_OPTIONS = [
  { value: "sequential", label: "In order" },
  { value: "parallel", label: "All at once" },
];

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <SettingRow
      className="py-3.5"
      title={title}
      description={description}
      control={<Toggle checked={checked} onChange={onChange} label={title} />}
    />
  );
}

/** Disabled control row for storage settings that aren't operational yet. */
function NotConfiguredRow({ title, description, icon }) {
  return (
    <SettingRow
      className="py-3.5"
      icon={icon}
      title={title}
      description={description}
      control={<Badge tone="neutral">Not configured</Badge>}
    />
  );
}

/**
 * Organization-wide agreement defaults. Visual configuration prototype:
 * values live in local demo state and are not applied to any agreement.
 * Separate from template/envelope conditional routing rules.
 */
export function AgreementRulesSection({ agreementRules, saveAgreementRules }) {
  const [values, setValues] = useState(agreementRules);
  const set = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const dirty = JSON.stringify(values) !== JSON.stringify(agreementRules);

  const days = Number(values.expirationDays);
  const expiryError =
    !Number.isInteger(days) || days < 1 || days > 365
      ? "Enter 1–365 days."
      : "";
  const typesError =
    values.allowedDocumentTypes.length === 0
      ? "Allow at least one document type."
      : "";
  const invalid = Boolean(expiryError || typesError);

  const toggleType = (type) =>
    set("allowedDocumentTypes")(
      values.allowedDocumentTypes.includes(type)
        ? values.allowedDocumentTypes.filter((item) => item !== type)
        : [...values.allowedDocumentTypes, type],
    );

  return (
    <>
      <AdminSectionHeader
        title="Agreement rules"
        description="Organization-wide defaults for new agreements, signing and document storage."
      />

      <p className="mb-5 flex items-start gap-2.5 rounded-md border border-line bg-surface px-4 py-3 text-[13px] text-ink-muted">
        <Info
          className="mt-0.5 size-4 shrink-0"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>
          These settings are a configuration preview and are not applied to
          agreements yet. They are separate from the conditional routing rules
          inside templates and envelopes, which keep working as before.
        </span>
      </p>

      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <CardHeader
            title="General agreement policies"
            description="Defaults used when someone starts a new agreement."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Input
                label="Default expiration"
                type="number"
                min={1}
                max={365}
                suffix="days after sending"
                value={values.expirationDays}
                onChange={(event) => set("expirationDays")(event.target.value)}
                aria-invalid={Boolean(expiryError)}
              />
              {expiryError && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {expiryError}
                </p>
              )}
            </div>
            <Select
              label="Default reminder interval"
              value={values.reminderInterval}
              onChange={(event) => set("reminderInterval")(event.target.value)}
              options={REMINDER_OPTIONS}
            />
          </div>

          <fieldset className="mt-6">
            <legend className="mb-2.5 text-sm font-medium text-ink">
              Allowed document types
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {DOCUMENT_TYPES.map((type) => (
                <Checkbox
                  key={type.value}
                  label={type.label}
                  checked={values.allowedDocumentTypes.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                />
              ))}
            </div>
            {typesError && (
              <p role="alert" className="mt-2 text-[13px] text-danger">
                {typesError}
              </p>
            )}
          </fieldset>

          <div className="mt-4 border-t border-line">
            <ToggleRow
              title="Senders can change these defaults"
              description="Allow senders to adjust expiration and reminders per agreement."
              checked={values.sendersCanOverrideDefaults}
              onChange={set("sendersCanOverrideDefaults")}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader
            title="Signing policies"
            description="How recipients sign by default."
          />
          <div className="max-w-sm">
            <p className="mb-2 text-sm font-medium text-ink">
              Default signing order
            </p>
            <SegmentedControl
              label="Default signing order"
              options={ROUTING_OPTIONS}
              value={values.defaultRouting}
              onChange={set("defaultRouting")}
            />
          </div>
          <div className="mt-4 divide-y divide-line border-t border-line">
            <ToggleRow
              title="Recipients can decline"
              description="Show a Decline option in the signing flow."
              checked={values.allowDecline}
              onChange={set("allowDecline")}
            />
            <ToggleRow
              title="Require a reason when declining"
              description="Recipients must explain why they decline."
              checked={values.requireDeclineReason && values.allowDecline}
              onChange={set("requireDeclineReason")}
            />
            <ToggleRow
              title="Recipients can reassign"
              description="Let a recipient forward the signing request to a colleague."
              checked={values.allowReassign}
              onChange={set("allowReassign")}
            />
            <ToggleRow
              title="Typed signatures"
              description="Signature created from the recipient's typed name."
              checked={values.allowTypedSignature}
              onChange={set("allowTypedSignature")}
            />
            <ToggleRow
              title="Drawn signatures"
              description="Signature drawn with a mouse, trackpad or finger."
              checked={values.allowDrawnSignature}
              onChange={set("allowDrawnSignature")}
            />
            <ToggleRow
              title="Uploaded signature images"
              description="Recipients upload a picture of their signature."
              checked={values.allowUploadedSignature}
              onChange={set("allowUploadedSignature")}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader
            title="Document storage & retention"
            description="Where completed agreements will be stored automatically."
            action={<Badge tone="warning">Coming in integration phase</Badge>}
          />
          <p className="mb-2 text-[13px] text-ink-muted">
            Storage automation is not active. OneDrive / SharePoint will be
            connected in a later integration phase; until then completed
            agreements are not copied anywhere.
          </p>
          <div className="divide-y divide-line border-t border-line">
            <NotConfiguredRow
              icon={Cloud}
              title="Automatically store completed agreements"
              description="Copy each completed agreement to a storage destination."
            />
            <NotConfiguredRow
              icon={Cloud}
              title="OneDrive / SharePoint destination"
              description="The site or drive that receives completed documents."
            />
            <NotConfiguredRow
              icon={FolderOpen}
              title="Folder"
              description="Folder for completed PDFs, e.g. per department or year."
            />
            <NotConfiguredRow
              icon={FolderOpen}
              title="Certificate of completion"
              description="Store the certificate next to the completed PDF."
            />
            <NotConfiguredRow
              icon={FolderOpen}
              title="Retention policy"
              description="How long completed agreements are kept."
            />
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col gap-3 border-t border-line bg-canvas px-4 py-4 sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <p className="text-[13px] text-ink-muted">
          {dirty
            ? "You have unsaved changes in this demo."
            : "Saving only updates this demo session."}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={!dirty}
            onClick={() => setValues(agreementRules)}
          >
            Discard changes
          </Button>
          <Button
            disabled={!dirty || invalid}
            onClick={() =>
              saveAgreementRules({
                ...values,
                expirationDays: Number(values.expirationDays),
              })
            }
          >
            Save rules
          </Button>
        </div>
      </div>
    </>
  );
}
