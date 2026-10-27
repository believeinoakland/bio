/* action-clocks — its catalogue rows (requirements: `build/requirements/action-clocks.md`, R1, R4–R6, R13; K617, K624).
 *
 * `PENDING_CLOCKS_BAD_BEFORE` (C-117.5) is copied from `actions/checks.mjs` with its comment (R1 was `actions` R31),
 * its `where` re-pointed here; `actions`' copy is gone (K914), so this row is the only one. New here (R4, R6):
 * C-123.1–C-123.3, the reminders' three refusals. New in T33-74 (R13): C-123.4–C-123.6, the adoption's three refusals,
 * in this module's own family. New in T45 (R18): C-123.7 and C-123.8, the statement's refusals (C-123.8 also R13's
 * amended entry). `NO_SUCH_ACTION` is `actions`' row (its R43), answered through `actions.noSuchAction`. */

import { word } from '../setup-words/index.mjs';

export const ACTION_CLOCK_CHECKS = {
  /* R1: the date the pending-clock read looks before is a date; the condition is this read's own. */
  PENDING_CLOCKS_BAD_BEFORE: {
    check: 'C-117.5',
    where: 'src/action-clocks/index.mjs pendingClocks > is-pending-before',
    translation: word('refusal.PENDING_CLOCKS_BAD_BEFORE'),
  },
  /* R4, R6, R8 (DEC-94, DEC-69): a reminder is a member's own request; a machine never sets, changes or answers one. */
  MACHINE_CANNOT_SET_REMINDER: {
    check: 'C-123.1',
    where: 'src/action-clocks/index.mjs #machineReminder > is-machine-reminder',
    translation: word('refusal.MACHINE_CANNOT_SET_REMINDER'),
  },
  /* R4, R6: the request's own shape: the entry, the day, the reminder it changes, and the action's bound. */
  REMINDER_REFUSED: {
    check: 'C-123.2',
    where: 'src/action-clocks/index.mjs reminderRefused > is-reminder-refused',
    translation: word('refusal.REMINDER_REFUSED'),
  },
  /* R6: an answer is to a reminder of the member's own that has come due and is not yet answered. */
  NO_SUCH_REMINDER: {
    check: 'C-123.3',
    where: 'src/action-clocks/index.mjs reminderAnswer > is-no-such-reminder',
    translation: word('refusal.NO_SUCH_REMINDER'),
  },
  /* R13, R8 (K1440): adopting a computed deadline into an action's clock is a member's own act. */
  MACHINE_CANNOT_ADOPT_CLOCK: {
    check: 'C-123.4',
    where: 'src/action-clocks/index.mjs clockAdopt > is-machine-adopt',
    translation: word('refusal.MACHINE_CANNOT_ADOPT_CLOCK'),
  },
  /* R13: the proposal adopted is one that stands on this action. */
  NO_SUCH_CLOCK_PROPOSAL: {
    check: 'C-123.5',
    where: 'src/action-clocks/index.mjs clockAdopt > is-no-such-clock-proposal',
    translation: word('refusal.NO_SUCH_CLOCK_PROPOSAL'),
  },
  /* R13: an undetermined date is never adopted; a member states such an entry by their own revision. */
  CLOCK_PROPOSAL_UNDETERMINED: {
    check: 'C-123.6',
    where: 'src/action-clocks/index.mjs clockAdopt > is-clock-proposal-undetermined',
    translation: word('refusal.CLOCK_PROPOSAL_UNDETERMINED'),
  },
  /* R18 (T45; reconciliation R7): stating a deadline on an action's clock is a member's own act. */
  MACHINE_CANNOT_STATE_CLOCK: {
    check: 'C-123.7',
    where: 'src/action-clocks/index.mjs clockState > is-machine-state-clock',
    translation: word('refusal.MACHINE_CANNOT_STATE_CLOCK'),
  },
  /* R13, R18 (T45): the entry's own shape, the arm naming the field: its words, a calendar date, one of the basis kinds
     with that kind's own fields, who owes it, and a time of day on its own date. */
  CLOCK_ENTRY_REFUSED: {
    check: 'C-123.8',
    where: 'src/action-clocks/index.mjs clockEntryRefused > is-clock-entry-refused',
    translation: word('refusal.CLOCK_ENTRY_REFUSED'),
  },
};
