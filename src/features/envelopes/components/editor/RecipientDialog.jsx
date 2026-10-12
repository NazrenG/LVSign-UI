import {
  Button,
  Dialog,
  Input,
  OptionButtons,
  SettingRow,
  Toggle,
} from "@/components/ui";
import { ROUTING_MODE } from "../../models/envelopeModel";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";

const TYPE_OPTIONS = Object.entries(RECIPIENT_TYPES).map(
  ([value, { label, icon }]) => ({ value, label, icon }),
);

const PERMISSIONS = [
  {
    key: "allowSenderEditRecipient",
    title: "Sender can change this recipient",
    description:
      "When this envelope is reused, the name and email can be replaced.",
  },
  {
    key: "allowSenderDeleteRecipient",
    title: "Sender can remove this recipient",
    description: "Turn off for people who must always be part of the route.",
  },
  {
    key: "allowSenderChangeRoutingOrder",
    title: "Sender can change the signing order",
    description: "When off, this recipient keeps its place in the route.",
  },
];

/**
 * Edit one recipient. Changes apply immediately (and can be undone);
 * "Done" just closes.
 */
export function RecipientDialog({ envelope, recipient, onClose, actions }) {
  if (!recipient) return null;

  const update = (patch) => actions.updateRecipient(recipient.id, patch);
  const setPermission = (key, value) =>
    update({ permissions: { ...recipient.permissions, [key]: value } });
  const isParallel = envelope.routingMode === ROUTING_MODE.PARALLEL;
  const type = RECIPIENT_TYPES[recipient.recipientType];
  const fieldCount = envelope.fields.filter(
    (field) => field.recipientId === recipient.id,
  ).length;

  const remove = () => {
    actions.removeRecipient(recipient.id);
    onClose();
  };

  return (
    <Dialog
      isOpen
      title={recipient.displayName.trim() ? "Edit recipient" : "Add recipient"}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="danger"
            onClick={remove}
            className="mr-auto"
            disabled={!recipient.permissions.allowSenderDeleteRecipient}
          >
            Remove recipient
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={recipient.displayName}
            autoComplete="off"
            onChange={(event) => update({ displayName: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={recipient.email}
            autoComplete="off"
            placeholder="name.surname@company"
            onChange={(event) => update({ email: event.target.value.trim() })}
          />
        </div>
        <Input
          label="Role (optional)"
          value={recipient.roleName ?? ""}
          placeholder="e.g. Operations manager"
          hint="Shown to other recipients next to the name."
          onChange={(event) => update({ roleName: event.target.value })}
        />

        <div>
          <OptionButtons
            legend="Recipient type"
            options={TYPE_OPTIONS}
            value={recipient.recipientType}
            onChange={(recipientType) => update({ recipientType })}
          />
          <p className="mt-1.5 text-[13px] text-ink-muted">
            {type.description}.
            {!type.canOwnFields && fieldCount > 0 && (
              <span className="text-danger">
                {" "}
                Their {fieldCount} placed field(s) need another recipient.
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Signing step"
            type="number"
            min={1}
            value={isParallel ? 1 : recipient.routingOrder}
            disabled={
              isParallel || !recipient.permissions.allowSenderChangeRoutingOrder
            }
            onChange={(event) =>
              update({
                routingOrder: Math.max(
                  1,
                  Number.parseInt(event.target.value, 10) || 1,
                ),
              })
            }
            hint={
              isParallel
                ? "Everyone receives it at once."
                : "Same number = sign at the same time."
            }
          />
        </div>

        <SettingRow
          title="Must act before the envelope completes"
          control={
            <Toggle
              label="Required"
              checked={recipient.isRequired}
              onChange={(isRequired) => update({ isRequired })}
            />
          }
        />

        <section className="space-y-4 border-t border-line pt-4">
          <h3 className="text-sm font-medium text-ink">Sender permissions</h3>
          {PERMISSIONS.map((permission) => (
            <SettingRow
              key={permission.key}
              title={permission.title}
              description={permission.description}
              control={
                <Toggle
                  label={permission.title}
                  checked={recipient.permissions[permission.key]}
                  onChange={(value) => setPermission(permission.key, value)}
                />
              }
            />
          ))}
        </section>
      </div>
    </Dialog>
  );
}
