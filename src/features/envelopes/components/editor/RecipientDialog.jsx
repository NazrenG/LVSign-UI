import {
  Button,
  Dialog,
  Input,
  OptionButtons,
  SettingRow,
  Toggle,
  Select,
} from "@/components/ui";
import { ROUTING_MODE } from "../../models/envelopeModel";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";
import { useState,useRef } from "react";
import { isClientId } from "../../api/clientIds";

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
export function RecipientDialog({
  envelope,
  recipient,
  users,
  commands,
  onClose,
  actions,
}) {
  const [draftRecipient, setDraftRecipient] = useState(() =>
    recipient
      ? {
          ...recipient,
          permissions: {
            ...recipient.permissions,
          },
        }
      : null,
  );
  const [saveState, setSaveState] = useState({
    isSaving: false,
    error: "",
  });
  const requestInFlightRef = useRef(false);
  if (!recipient || !draftRecipient) {
    return null;
  }

  const isNewRecipient = isClientId(recipient.id);
  const save = async () => {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;

    try {
      setSaveState({
        isSaving: true,
        error: "",
      });

      await commands.saveRecipient(draftRecipient);

      onClose();
    } catch (error) {
      setSaveState({
        isSaving: false,
        error: error.message ?? "Recipient could not be saved.",
      });
    } finally {
      requestInFlightRef.current = false;
    }
  };
  const update = (patch) => {
    setDraftRecipient((current) => ({
      ...current,
      ...patch,
    }));
  };

  const setPermission = (key, value) => {
    setDraftRecipient((current) => ({
      ...current,

      permissions: {
        ...current.permissions,
        [key]: value,
      },
    }));
  };
  const isParallel = envelope.routingMode === ROUTING_MODE.PARALLEL;
  const type = RECIPIENT_TYPES[draftRecipient.recipientType];
  const fieldCount = envelope.fields.filter(
    (field) => field.recipientId === recipient.id,
  ).length;

  const remove = async () => {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;

    try {
      setSaveState({
        isSaving: true,
        error: "",
      });

      await commands.removeRecipient(recipient.id);

      onClose();
    } catch (error) {
      setSaveState({
        isSaving: false,
        error: error.message ?? "Recipient could not be removed.",
      });
    } finally {
      requestInFlightRef.current = false;
    }
  };

  return (
    <Dialog
      isOpen
      title={recipient.displayName.trim() ? "Edit recipient" : "Add recipient"}
      onClose={() => {
        if (!saveState.isSaving) {
          onClose();
        }
      }}
      footer={
        <>
          <Button
            variant="danger"
            onClick={remove}
            className="mr-auto"
            disabled={
              saveState.isSaving ||
              !recipient.permissions.allowSenderDeleteRecipient
            }
          >
            {saveState.isSaving ? "Working…" : "Remove recipient"}
          </Button>
          {saveState.error && (
            <p className="mr-auto text-[13px] text-danger">{saveState.error}</p>
          )}

          <Button
            onClick={save}
            disabled={!draftRecipient.userId || saveState.isSaving}
          >
            {saveState.isSaving ? "Saving…" : "Done"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Employee"
            value={draftRecipient.userId ?? ""}
            options={[
              {
                value: "",
                label: "Select employee",
              },

              ...users.map((user) => ({
                value: user.id,
                label: user.displayName,
              })),
            ]}
            onChange={(event) => {
              const user = users.find((item) => item.id === event.target.value);

              if (!user) {
                update({
                  userId: null,
                  displayName: "",
                  email: "",
                });

                return;
              }

              update({
                userId: user.id,
                displayName: user.displayName,
                email: user.email,
              });
            }}
          />

          <Input label="Email" value={draftRecipient.email} disabled />
        </div>
        <Input
          label="Role (optional)"
          value={draftRecipient.roleName ?? ""}
          placeholder="e.g. Operations manager"
          hint="Shown to other recipients next to the name."
          onChange={(event) => update({ roleName: event.target.value })}
        />

        <div>
          <OptionButtons
            legend="Recipient type"
            options={TYPE_OPTIONS}
            value={draftRecipient.recipientType}
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
            value={isParallel ? 1 : draftRecipient.routingOrder}
            disabled={
              isParallel ||
              !draftRecipient.permissions.allowSenderChangeRoutingOrder
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
              checked={draftRecipient.isRequired}
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
                  checked={draftRecipient.permissions[permission.key]}
                  disabled={!isNewRecipient}
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
