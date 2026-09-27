import { AGREEMENT_STATUS, SIGNER_STATE } from '@/features/agreements/agreementStatus';

const { AWAITING, COMPLETED, DRAFT, DECLINED, VOIDED, EXPIRED } = AGREEMENT_STATUS;
const { SIGNED, CURRENT, PENDING, NOT_SENT, DECLINED: SIGNER_DECLINED } = SIGNER_STATE;

/**
 * Mock agreements. Shape mirrors what the API is expected to return,
 * so swapping this file for a fetch call won't touch any component.
 */
export const AGREEMENTS = [
  {
    id: 'inv-2291',
    documentId: 'LVS-2026-0922-7C41',
    title: 'Vendor Invoice INV-2291 Approval',
    senderId: 'nk',
    status: AWAITING,
    updatedAt: '2026-09-23T09:41',
    dueAt: '2026-09-26',
    pages: 2,
    signers: [
      { personId: 'lh', state: SIGNED, date: '2026-09-23T09:41' },
      { personId: 'fa', state: CURRENT, date: '2026-09-23T09:41' },
      { personId: 'og', state: PENDING },
    ],
    history: [
      { at: '2026-09-23T09:41', action: 'Signed by Leyla Hasanova' },
      { at: '2026-09-23T09:12', action: 'Viewed by Leyla Hasanova' },
      { at: '2026-09-22T17:30', action: 'Sent by Nigar Karimli' },
      { at: '2026-09-22T17:24', action: 'Created by Nigar Karimli' },
    ],
  },
  {
    id: 'leave-am',
    documentId: 'LVS-2026-0922-3B18',
    title: 'Leave Request — Aysel Mammadova',
    senderId: 'am',
    status: AWAITING,
    updatedAt: '2026-09-23T09:02',
    dueAt: '2026-09-26',
    pages: 1,
    signers: [
      { personId: 'am', state: SIGNED, date: '2026-09-22T14:06' },
      { personId: 'fa', state: SIGNED, date: '2026-09-23T08:51' },
      { personId: 'nk', state: CURRENT, date: '2026-09-23T08:51' },
    ],
    history: [
      { at: '2026-09-23T08:51', action: 'Signed by Farid Aliyev' },
      { at: '2026-09-22T14:06', action: 'Signed by Aysel Mammadova' },
    ],
  },
  {
    id: 'rota-koroglu',
    documentId: 'LVS-2026-0919-A2D0',
    title: 'Night Shift Rota — Koroglu Depot',
    senderId: 'fa',
    status: COMPLETED,
    updatedAt: '2026-09-22T16:05',
    pages: 1,
    signers: [
      { personId: 'fa', state: SIGNED, date: '2026-09-19T10:00' },
      { personId: 'rm', state: SIGNED, date: '2026-09-21T12:10' },
      { personId: 'nk', state: SIGNED, date: '2026-09-22T16:05' },
    ],
    history: [{ at: '2026-09-22T16:05', action: 'Completed' }],
  },
  {
    id: 'fuel-depot-4',
    documentId: 'LVS-2026-0922-9E07',
    title: 'Fuel Supply Addendum — Depot 4',
    senderId: 'nk',
    status: DRAFT,
    updatedAt: '2026-09-22T14:20',
    dueAt: '2026-09-26',
    pages: 1,
    draftNote: '2 signers added, fields not placed',
    signers: [
      { personId: 'fa', state: NOT_SENT },
      { personId: 'lh', state: NOT_SENT },
    ],
    history: [{ at: '2026-09-22T14:20', action: 'Created by Nigar Karimli' }],
  },
  {
    id: 'overtime-w38',
    documentId: 'LVS-2026-0918-51F2',
    title: 'Overtime Approval — Week 38',
    senderId: 'rm',
    status: COMPLETED,
    updatedAt: '2026-09-20T11:32',
    pages: 1,
    signers: [
      { personId: 'rm', state: SIGNED, date: '2026-09-18T09:00' },
      { personId: 'nk', state: SIGNED, date: '2026-09-20T11:32' },
    ],
    history: [{ at: '2026-09-20T11:32', action: 'Completed' }],
  },
  {
    id: 'forklift-fl07',
    documentId: 'LVS-2026-0917-0B3A',
    title: 'Equipment Handover — Forklift FL-07',
    senderId: 'ti',
    status: DECLINED,
    updatedAt: '2026-09-19T15:48',
    pages: 1,
    signers: [
      { personId: 'ti', state: SIGNED, date: '2026-09-17T11:00' },
      { personId: 'fa', state: SIGNER_DECLINED, date: '2026-09-19T15:48' },
    ],
    history: [{ at: '2026-09-19T15:48', action: 'Declined by Farid Aliyev' }],
  },
  {
    id: 'fire-safety-q3',
    documentId: 'LVS-2026-0901-44C9',
    title: 'Training Attendance — Fire Safety Q3',
    senderId: 'am',
    status: EXPIRED,
    updatedAt: '2026-09-12T00:00',
    pages: 3,
    signers: [
      { personId: 'am', state: SIGNED, date: '2026-09-01T10:00' },
      { personId: 'og', state: PENDING },
    ],
    history: [{ at: '2026-09-12T00:00', action: 'Expired' }],
  },
  {
    id: 'inv-2274',
    documentId: 'LVS-2026-0908-7710',
    title: 'Vendor Invoice INV-2274 Approval',
    senderId: 'nk',
    status: VOIDED,
    updatedAt: '2026-09-10T10:15',
    pages: 2,
    signers: [
      { personId: 'lh', state: NOT_SENT },
      { personId: 'fa', state: NOT_SENT },
    ],
    history: [{ at: '2026-09-10T10:15', action: 'Voided by Nigar Karimli' }],
  },
];
