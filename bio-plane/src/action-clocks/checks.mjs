/* action-clocks — its catalogue rows (requirements: `build/requirements/action-clocks.md`, R1, R4–R6; K617, K624).
 *
 * `PENDING_CLOCKS_BAD_BEFORE` (C-117.5) is copied from `actions/checks.mjs` with its comment (R1 was `actions` R31),
 * its `where` re-pointed here; `actions`' copy is gone (K914), so this row is the only one. New here (R4, R6):
 * C-123.1–C-123.3, the reminders' three refusals. `NO_SUCH_ACTION` is `actions`' row (its R43), answered through `actions.noSuchAction`. */

export const ACTION_CLOCK_CHECKS = {
  /* R1: the date the pending-clock read looks before is a date; the condition is this read's own. */
  PENDING_CLOCKS_BAD_BEFORE: {
    check: 'C-117.5',
    where: 'src/action-clocks/index.mjs pendingClocks > is-pending-before',
    translation: 'The deadlines are listed up to a date written year-month-day, and the date given was not one. '
      + 'Nothing was read.',
  },
  /* R4, R6, R8 (DEC-94, DEC-69): a reminder is a member's own request; a machine never sets, changes or answers one. */
  MACHINE_CANNOT_SET_REMINDER: {
    check: 'C-123.1',
    where: 'src/action-clocks/index.mjs #machineReminder > is-machine-reminder',
    translation: 'A reminder is something a member asks for, for themselves. This request came from no signed-in '
      + 'member, so nothing was set. Sign in as a member to ask for a reminder.',
  },
  /* R4, R6: the request's own shape: the entry, the day, the reminder it changes, and the action's bound. */
  REMINDER_REFUSED: {
    check: 'C-123.2',
    where: 'src/action-clocks/index.mjs reminderRefused > is-reminder-refused',
    translation: 'A reminder is set on a deadline of the action that has a date, for a day written year-month-day; '
      + 'it changes or removes only a reminder of your own; it is not set twice on one day; and an action holds at '
      + 'most 50 reminders. This request did not meet one of those, so nothing was changed.',
  },
  /* R6: an answer is to a reminder of the member's own that has come due and is not yet answered. */
  NO_SUCH_REMINDER: {
    check: 'C-123.3',
    where: 'src/action-clocks/index.mjs reminderAnswer > is-no-such-reminder',
    translation: 'There is no reminder of yours on that deadline that has come due and is waiting for an answer, so '
      + 'nothing was answered.',
  },
};
