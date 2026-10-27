/* network-notices' refusal rows (requirements: `build/requirements/network-notices.md` R1, R4, R6, R11; DEC-49).
 * A new family, C-127 (BOB's ruling at review, K1119), arrived at T23 and stamped by 1.54.0 (promotion's T24 job).
 * The words a member reads before posting (the warning, the caution, the ceremony) are the UX design stream's (K1031);
 * these rows only say why an act was refused and that nothing was published. A member reads the group's own
 * installation named "your group's Civicsmith", never "this copy" (DEC-149, T34-87). */

import { word } from "../setup-words/index.mjs";

const at = (fn, region) => `src/network-notices/index.mjs ${fn} > ${region}`;

export const NETWORK_NOTICE_CHECKS = Object.freeze({
  MACHINE_CANNOT_POST_NOTICE: {
    check: "C-127.1", where: at("#callerRefusal", "is-notice-caller"),
    translation: word("refusal.MACHINE_CANNOT_POST_NOTICE"),
  },
  NOTICE_NOT_THE_OWNER: {
    check: "C-127.2", where: at("#callerRefusal", "is-notice-caller"),
    translation: word("refusal.NOTICE_NOT_THE_OWNER"),
  },
  NOTICE_PROJECT_CLOSED: {
    check: "C-127.3", where: at("#callerRefusal", "is-notice-caller"),
    translation: word("refusal.NOTICE_PROJECT_CLOSED"),
  },
  NOTICE_NO_GROUP_SLUG: {
    check: "C-127.4", where: at("#callerRefusal", "is-notice-caller"),
    translation: word("refusal.NOTICE_NO_GROUP_SLUG"),
  },
  NOTICE_NO_INSTANCE_KEY: {
    check: "C-127.5", where: at("#callerRefusal", "is-notice-caller"),
    translation: word("refusal.NOTICE_NO_INSTANCE_KEY"),
  },
  NOTICE_WORDING_MALFORMED: {
    check: "C-127.6", where: at("#fieldRefusal", "is-notice-fields"),
    translation: word("refusal.NOTICE_WORDING_MALFORMED"),
  },
  NOTICE_SINCE_MALFORMED: {
    check: "C-127.7", where: at("#fieldRefusal", "is-notice-fields"),
    translation: word("refusal.NOTICE_SINCE_MALFORMED"),
  },
  NOTICE_SINCE_BEFORE_PROJECT: {
    check: "C-127.8", where: at("#fieldRefusal", "is-notice-fields"),
    translation: word("refusal.NOTICE_SINCE_BEFORE_PROJECT"),
  },
  NOTICE_SINCE_IN_FUTURE: {
    check: "C-127.9", where: at("#fieldRefusal", "is-notice-fields"),
    translation: word("refusal.NOTICE_SINCE_IN_FUTURE"),
  },
  NOTICE_ALREADY_OPEN: {
    check: "C-127.10", where: at("#noticeRefusal", "is-notice-state"),
    translation: word("refusal.NOTICE_ALREADY_OPEN"),
  },
  NOTICE_WARNING_NOT_ACKNOWLEDGED: {
    check: "C-127.11", where: at("postNotice", "is-notice-post"),
    translation: word("refusal.NOTICE_WARNING_NOT_ACKNOWLEDGED"),
  },
  NOTICE_STALE: {
    check: "C-127.12", where: at("postNotice", "is-notice-post"),
    translation: word("refusal.NOTICE_STALE"),
  },
  NOTICE_SIGNATURE_REFUSED: {
    check: "C-127.13", where: at("postNotice", "is-notice-post"),
    translation: word("refusal.NOTICE_SIGNATURE_REFUSED"),
  },
  NOTICE_NOT_OPEN: {
    check: "C-127.14", where: at("#noticeRefusal", "is-notice-state"),
    translation: word("refusal.NOTICE_NOT_OPEN"),
  },
  NOTICE_SINCE_EARLIER: {
    check: "C-127.15", where: at("#noticeRefusal", "is-notice-state"),
    translation: word("refusal.NOTICE_SINCE_EARLIER"),
  },
  NOTICE_UNCHANGED: {
    check: "C-127.16", where: at("#noticeRefusal", "is-notice-state"),
    translation: word("refusal.NOTICE_UNCHANGED"),
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(NETWORK_NOTICE_CHECKS, code) ? NETWORK_NOTICE_CHECKS[code] : null;
}
