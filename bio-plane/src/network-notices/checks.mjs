/* network-notices' refusal rows (requirements: `build/requirements/network-notices.md` R1, R4, R6, R11; DEC-49).
 * A new family, C-127 (BOB's ruling at review, K1119), arrived at T23 and stamped by 1.54.0 (promotion's T24 job).
 * The words a member reads before posting (the warning, the caution, the ceremony) are the UX design stream's (K1031);
 * these rows only say why an act was refused and that nothing was published. */

const at = (fn, region) => `src/network-notices/index.mjs ${fn} > ${region}`;

export const NETWORK_NOTICE_CHECKS = Object.freeze({
  MACHINE_CANNOT_POST_NOTICE: {
    check: "C-127.1", where: at("#callerRefusal", "is-notice-caller"),
    translation: "Only a member, signed in as themselves, prepares or posts a notice that the group is working on "
      + "something. A machine, the assistant or an operator token cannot. Nothing was published.",
  },
  NOTICE_NOT_THE_OWNER: {
    check: "C-127.2", where: at("#callerRefusal", "is-notice-caller"),
    translation: "Only an owner of the project tells the network the group is working on it. Nothing was published.",
  },
  NOTICE_PROJECT_CLOSED: {
    check: "C-127.3", where: at("#callerRefusal", "is-notice-caller"),
    translation: "The project is closed, so it takes no new notice and no change to one. An owner may still stop an "
      + "open notice, with a note on where the work went. Nothing was published.",
  },
  NOTICE_NO_GROUP_SLUG: {
    check: "C-127.4", where: at("#callerRefusal", "is-notice-caller"),
    translation: "This copy has no group name recorded, and a notice is never anonymous. Record the group's name "
      + "first. Nothing was published.",
  },
  NOTICE_NO_INSTANCE_KEY: {
    check: "C-127.5", where: at("#callerRefusal", "is-notice-caller"),
    translation: "This copy holds no signing key of its own, so it cannot sign the activity level a notice is always "
      + "published with. The operator binds one. Nothing was published.",
  },
  NOTICE_WORDING_MALFORMED: {
    check: "C-127.6", where: at("#fieldRefusal", "is-notice-fields"),
    translation: "Say what the group is working on in one line of at most 280 characters. A subject or a body named "
      + "with it is one line of at most 120 characters, and a hand-off note one line of at most 280, given only when "
      + "stopping. Nothing was published.",
  },
  NOTICE_SINCE_MALFORMED: {
    check: "C-127.7", where: at("#fieldRefusal", "is-notice-fields"),
    translation: "Give the date the work began as a calendar date, year-month-day. Nothing was published.",
  },
  NOTICE_SINCE_BEFORE_PROJECT: {
    check: "C-127.8", where: at("#fieldRefusal", "is-notice-fields"),
    translation: "The date the work began is earlier than the project itself, whose first record is dated as named. "
      + "A notice never claims work from before its project. Nothing was published.",
  },
  NOTICE_SINCE_IN_FUTURE: {
    check: "C-127.9", where: at("#fieldRefusal", "is-notice-fields"),
    translation: "The date the work began is later than today. Nothing was published.",
  },
  NOTICE_ALREADY_OPEN: {
    check: "C-127.10", where: at("#noticeRefusal", "is-notice-state"),
    translation: "The project already has an open notice, as named. Change that notice with a new revision of it, "
      + "or stop it, rather than opening a second. Nothing was published.",
  },
  NOTICE_WARNING_NOT_ACKNOWLEDGED: {
    check: "C-127.11", where: at("postNotice", "is-notice-post"),
    translation: "A notice is public and permanent, and posting it says you have read that. Nothing was published.",
  },
  NOTICE_STALE: {
    check: "C-127.12", where: at("postNotice", "is-notice-post"),
    translation: "This copy holds no prepared notice from you with this fingerprint, or it was prepared more than an "
      + "hour ago. Prepare it again and sign what it shows. Nothing was published.",
  },
  NOTICE_SIGNATURE_REFUSED: {
    check: "C-127.13", where: at("postNotice", "is-notice-post"),
    translation: "The signature is not a valid signature of this notice by one of your own registered signing keys, "
      + "for the reason named. Nothing was published.",
  },
  NOTICE_NOT_OPEN: {
    check: "C-127.14", where: at("#noticeRefusal", "is-notice-state"),
    translation: "That notice is not this project's open notice: it was stopped, or another one is open, or there is "
      + "none to change or stop. A stopped notice takes no further revision. Nothing was published.",
  },
  NOTICE_SINCE_EARLIER: {
    check: "C-127.15", where: at("#noticeRefusal", "is-notice-state"),
    translation: "A change may move the date the work began later, never earlier than the notice already says. "
      + "Nothing was published.",
  },
  NOTICE_UNCHANGED: {
    check: "C-127.16", where: at("#noticeRefusal", "is-notice-state"),
    translation: "This revision says exactly what the notice already says, so there is nothing to publish.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(NETWORK_NOTICE_CHECKS, code) ? NETWORK_NOTICE_CHECKS[code] : null;
}
