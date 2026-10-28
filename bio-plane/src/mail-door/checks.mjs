/* mail-door's refusal rows (R13; requirements: `build/requirements/mail-door.md`). DEC-49: every refusal this module
 * raises carries its code, its row and the member's translation, read by key through `setup-words`; the translation
 * names no figure (`doorbell` R9): a figure travels in `stated`, `size` and `bound` beside it.
 *
 * C-156 is this module's family, the next above C-155 (R13). One code is defined in one module's table (`doorbell` R21):
 * `MAIL_NO_STATEMENT` is `capture`'s row (C-118.12, raised at `emailCapture`) and is relayed here, never defined;
 * `mail-reader`'s nesting refusal (its ML10) is relayed unchanged (R10). Each row's `where` names the function in
 * `index.mjs` and the DEC-49 region that raises it. NOT FROZEN, as doorbell's C-85: a code whose row is missing fails
 * loud (`rowOf` throws) rather than reach a member bare, and the test removes a row to prove it. */

import { localize } from '../setup-words/index.mjs';

const at = (fn, region) => `src/mail-door/index.mjs ${fn} > ${region}`;

export const MAIL_CHECKS = {
  MAIL_OFF: {
    check: 'C-156.1', where: at('receiveMail', 'is-mail-door-open'),
    translation: localize('mail-door.checks.mail_off', 'This team does not take mail at its own addresses. Nothing was received. A member can still bring in a saved message by uploading it.'),
  },
  MAIL_NOT_SET_UP: {
    check: 'C-156.2', where: at('mailAddressMake', 'is-mail-set-up'),
    translation: localize('mail-door.checks.mail_not_set_up', 'Your team has not set up its mail domain, so no private address can be made yet. Nothing was changed. You can still bring in a saved message by uploading it.'),
  },
  MAIL_NO_SUCH_ADDRESS: {
    check: 'C-156.3', where: at('receiveMail', 'is-mail-address-live'),
    translation: localize('mail-door.checks.mail_no_such_address', 'No member of this team uses that address, so the message was not received. Nothing was kept.'),
  },
  MAIL_TOO_LARGE: {
    check: 'C-156.4', where: at('receiveMail', 'is-mail-within-bound'),
    translation: localize('mail-door.checks.mail_too_large', 'This message is larger than a message sent to a private address may be, so it was not received and nothing was kept. Save it and upload it instead, or send its attachments one by one.'),
  },
  MAIL_EMPTY: {
    check: 'C-156.5', where: at('receiveMail', 'is-mail-not-empty'),
    translation: localize('mail-door.checks.mail_empty', 'The message had nothing in it, so nothing was received.'),
  },
  MAIL_RATE_MEMBER: {
    check: 'C-156.6', where: at('receiveMail', 'is-mail-rate'),
    translation: localize('mail-door.checks.mail_rate_member', 'This private address has taken as many messages as it takes in an hour, so this one was not received and nothing was kept. It lifts on its own; send it again a little later. The bound is stated beside this message.'),
  },
  MAIL_RATE_TEAM: {
    check: 'C-156.7', where: at('receiveMail', 'is-mail-rate'),
    translation: localize('mail-door.checks.mail_rate_team', 'This team has taken as many messages as it takes in a day, so this one was not received and nothing was kept. It lifts on its own; send it again later. The bound is stated beside this message.'),
  },
  MAIL_ALREADY_IN: {
    check: 'C-156.8', where: at('mailBringIn', 'is-mail-waiting'),
    translation: localize('mail-door.checks.mail_already_in', 'You have already brought this message into the record, so it was not filed again. The record holds it once.'),
  },
  NO_SUCH_MAIL: {
    check: 'C-156.9', where: at('#noSuchMail', 'is-mail-yours'),
    translation: localize('mail-door.checks.no_such_mail', 'There is no message by that name in your waiting mail. Nothing was read or changed.'),
  },
};

/** R13: the row of `code`, read at the moment of the refusal; a code with no row and translation throws (fails loud). */
export function rowOf(code) {
  const row = MAIL_CHECKS[code];
  if (!row || typeof row.translation !== 'string' || !row.translation)
    throw new Error(`mail-door: ${code} has no MAIL_CHECKS row with a translation (DEC-49); a code with no sentence must not reach a member`);
  return row;
}
