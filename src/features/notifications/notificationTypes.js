export const NOTIFICATION_TYPES = {
  ENVELOPE_SENT: 1,
  SIGNING_REMINDER: 2,
  ENVELOPE_COMPLETED: 3,
  ENVELOPE_DECLINED: 4,
  ENVELOPE_VOIDED: 5,
  RECIPIENT_SIGNED: 6,
};

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  inAppEnabled: true,
  emailEnabled: true,

  envelopeSentEnabled: true,
  signingReminderEnabled: true,
  envelopeCompletedEnabled: true,
  envelopeDeclinedEnabled: true,
  envelopeVoidedEnabled: true,
  recipientSignedEnabled: true,
};