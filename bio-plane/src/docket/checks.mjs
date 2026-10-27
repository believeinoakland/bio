/* docket's refusal rows (requirements: `build/requirements/docket.md` R1, R2, R4, R5, R7, R8, R10–R12, R22; DEC-49).
 * A new family, C-129 (C-128 is acquisition's, stamped by 1.54.0), arriving at T27 and stamped in 1.57.0. At T28 (N526)
 * C-129.10's code became this module's own `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`, its check id kept (a renamed code
 * keeps its id, K238), the row `awaiting stamp` until T29's promotion stamp. At T29 (N533, K1331) C-129.12 and C-129.13
 * became this module's own `DOCKET_PRESSURE_MARKED` and `DOCKET_PRESSURE_REFUSED`, their ids kept, in place of
 * `PRESSURE_MARKED` and `PRESSURE_REFUSED`, which are `action-grammar`'s (C-117.17, C-117.15); both rows read changed
 * until T30's stamp. No code here is a code another module's table holds (R22). `NO_SUCH_CASE` is the shared answer for an absent case, a case with no ratified edition and one
 * the viewer does not see, and has no row here (R22). The words a member reads before posting (the outward-act warning,
 * the invitation, the shelves' labels) are the UX design stream's; these rows only say why an act was refused and that
 * nothing changed. At T33 (K1480, T33-64) C-129.27 and C-129.28 arrived for a court order (R25), awaiting the stamp.
 * At T34 (DEC-149, T34-87) C-129.16 and C-129.22 call the group's Civicsmith "your group's Civicsmith", not "this
 * copy"; both rows read changed until T35's promotion stamp moves `CATALOG_VERSION`. At T35 (N685, K1834) the two
 * rows say what `network-notices`' C-127.4 and C-127.12 say, the same way: C-129.16 "Your group has no name recorded
 * yet", as C-127.4; C-129.22 already has C-127.12's form, its third clause (the docket has moved since) being R5's own
 * condition. Both await the stamp (T36's promotion job).
 * At T45 (N855, N880; K2781 (3)) C-129.29 arrived for an outcome entry's own statement (R1), awaiting the stamp, and
 * C-129.19 (DOCKET_NO_SUMMARY) re-worded to cover an outcome's summary too (R1), reading changed until the stamp. A
 * counsel matter's refusal (R28) is `publication`'s row C-122 (its R78), answered from its export, never copied here.
 * At T47 (R29; DEC-199, N992) C-129.29 takes its translation from `words.json`'s `refusal.DOCKET_OUTCOME_UNREADABLE`, read
 * by key (`DOCKET_WORDS` below), its code, number and `where` unmoved; the row reads changed until T48's stamp. K3110:
 * C-129.13 `DOCKET_PRESSURE_REFUSED` reads `refusal.DOCKET_PRESSURE_REFUSED` by key the same way, its sentence unchanged. */

import { word, localize } from "../setup-words/index.mjs";

const at = (fn, region) => `src/docket/index.mjs ${fn} > ${region}`;
const FILER = at("#filerRefusal", "is-docket-filer");
const FORM = at("#formRefusal", "is-docket-form");
const PRESSURE = at("docketPressure", "is-docket-pressure");
const MANAGER = at("#managerRefusal", "is-docket-manager");
const ENTRY = at("#entryRefusal", "is-docket-entry");
const KIND = at("#kindRefusal", "is-docket-kind");
const POST = at("docketPost", "is-docket-post");
const ORDER = at("#orderRefusal", "is-docket-order");

/* T47 (R29; DEC-194, DEC-199, N992): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) a
   row translates by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and
   extraction's `TRANSCRIBE_WORDS` are. The design stream's words: re-worded there, then re-taken here by key; a row
   never holds a copy of its sentence. DEC-199's sentence is true of every arm R1 refuses with it. */
export const DOCKET_WORDS = Object.freeze({
  "refusal.DOCKET_OUTCOME_UNREADABLE": word("refusal.DOCKET_OUTCOME_UNREADABLE"),
  /* K3110: C-129.13 likewise, its sentence unchanged by the taking */
  "refusal.DOCKET_PRESSURE_REFUSED": word("refusal.DOCKET_PRESSURE_REFUSED"),
});

export const DOCKET_CHECKS = Object.freeze({
  MACHINE_CANNOT_FILE_DOCKET: {
    check: "C-129.1", where: FILER,
    translation: word("refusal.MACHINE_CANNOT_FILE_DOCKET"),
  },
  /* K4557, K231: no longer answered: `docketFile` answers membership's PROJECT_ACT_NOT_A_PARTICIPANT, the one code for a member
     not yet joined. The row stays, its number and words as stamped, until BOB's requirements retire it (C-129.2 keeps its place
     in the family's numbering). */
  DOCKET_NOT_A_PARTICIPANT: {
    check: "C-129.2", where: FILER,
    translation: word("refusal.DOCKET_NOT_A_PARTICIPANT"),
  },
  DOCKET_NO_EDITION: {
    check: "C-129.3", where: FORM,
    translation: word("refusal.DOCKET_NO_EDITION"),
  },
  DOCKET_NOT_ATTRIBUTED: {
    check: "C-129.4", where: FORM,
    translation: word("refusal.DOCKET_NOT_ATTRIBUTED"),
  },
  DOCKET_NOT_THE_SUBJECT: {
    check: "C-129.5", where: FORM,
    translation: word("refusal.DOCKET_NOT_THE_SUBJECT"),
  },
  DOCKET_NO_STANDING: {
    check: "C-129.6", where: FORM,
    translation: word("refusal.DOCKET_NO_STANDING"),
  },
  DOCKET_NO_CAPTURE: {
    check: "C-129.7", where: FORM,
    translation: word("refusal.DOCKET_NO_CAPTURE"),
  },
  DOCKET_KIND_UNKNOWN: {
    check: "C-129.8", where: FORM,
    translation: word("refusal.DOCKET_KIND_UNKNOWN"),
  },
  DOCKET_NO_REASON: {
    check: "C-129.9", where: FORM,
    translation: word("refusal.DOCKET_NO_REASON"),
  },
  /* R2, R22 (N526): this module's own code; `action-grammar`'s `MACHINE_CANNOT_MARK_PRESSURE` (C-117.14) is `actions`'
     and is never answered here (DEC-49: one code, one row). */
  MACHINE_CANNOT_MARK_DOCKET_PRESSURE: {
    check: "C-129.10", where: PRESSURE,
    translation: word("refusal.MACHINE_CANNOT_MARK_DOCKET_PRESSURE"),
  },
  NO_SUCH_DOCKET_ENTRY: {
    check: "C-129.11", where: ENTRY,
    translation: word("refusal.NO_SUCH_DOCKET_ENTRY"),
  },
  /* R2, R22 (N533): this module's own codes; `action-grammar`'s `PRESSURE_MARKED` (C-117.17) and `PRESSURE_REFUSED`
     (C-117.15) are `actions`' and are never answered here. */
  DOCKET_PRESSURE_MARKED: {
    check: "C-129.12", where: PRESSURE,
    translation: word("refusal.DOCKET_PRESSURE_MARKED"),
  },
  DOCKET_PRESSURE_REFUSED: {
    check: "C-129.13", where: PRESSURE,
    translation: DOCKET_WORDS["refusal.DOCKET_PRESSURE_REFUSED"],   /* R29 (K3110): read by key */
  },
  MACHINE_CANNOT_PLACE_DOCKET: {
    check: "C-129.14", where: MANAGER,
    translation: word("refusal.MACHINE_CANNOT_PLACE_DOCKET"),
  },
  DOCKET_NOT_THE_MANAGER: {
    check: "C-129.15", where: MANAGER,
    translation: word("refusal.DOCKET_NOT_THE_MANAGER"),
  },
  DOCKET_NO_GROUP_SLUG: {
    check: "C-129.16", where: MANAGER,
    translation: word("refusal.DOCKET_NO_GROUP_SLUG"),
  },
  DOCKET_ENTRY_SETTLED: {
    check: "C-129.17", where: ENTRY,
    translation: word("refusal.DOCKET_ENTRY_SETTLED"),
  },
  DOCKET_WRONG_SHELF: {
    check: "C-129.18", where: KIND,
    translation: word("refusal.DOCKET_WRONG_SHELF"),
  },
  DOCKET_NO_SUMMARY: {
    check: "C-129.19", where: KIND,
    translation: word("refusal.DOCKET_NO_SUMMARY"),
  },
  DOCKET_NO_ARCHIVE_COPY: {
    check: "C-129.20", where: KIND,
    translation: word("refusal.DOCKET_NO_ARCHIVE_COPY"),
  },
  DOCKET_WARNING_NOT_ACKNOWLEDGED: {
    check: "C-129.21", where: POST,
    translation: word("refusal.DOCKET_WARNING_NOT_ACKNOWLEDGED"),
  },
  DOCKET_STALE: {
    check: "C-129.22", where: POST,
    translation: word("refusal.DOCKET_STALE"),
  },
  DOCKET_SIGNATURE_REFUSED: {
    check: "C-129.23", where: POST,
    translation: word("refusal.DOCKET_SIGNATURE_REFUSED"),
  },
  DOCKET_WITHDRAWAL_FINAL: {
    check: "C-129.24", where: KIND,
    translation: localize("docket.checks.withdrawal_final", "A withdrawal is never taken back. To stand behind the case again, publish a new edition. Nothing was published."),
  },
  DOCKET_TAKE_BACK_FINAL: {
    check: "C-129.25", where: KIND,
    translation: localize("docket.checks.take_back_final", "A take-back is never itself taken back. Place the entry again if it should stand. Nothing was published."),
  },
  DOCKET_ALREADY_WITHDRAWN: {
    check: "C-129.26", where: KIND,
    translation: word("refusal.DOCKET_ALREADY_WITHDRAWN"),
  },
  /* R25 (K1480, T33-64): a court order's own refusals; rows awaiting promotion's stamp. */
  DOCKET_ORDER_UNREADABLE: {
    check: "C-129.27", where: ORDER,
    translation: localize("docket.checks.order_unreadable", "A court order is placed with what it orders (remove, redact, seal or unseal), the published editions it names, and, to redact, seal or unseal, the parts of the edition it names. This one does not say so. Nothing was published."),
  },
  DOCKET_NOTHING_SEALED: {
    check: "C-129.28", where: ORDER,
    translation: word("refusal.DOCKET_NOTHING_SEALED"),
  },
  /* R1 (T45; N855, N880): an outcome entry's own statement; R29 (T47): its words read by key, the row awaiting T48's stamp. */
  DOCKET_OUTCOME_UNREADABLE: {
    check: "C-129.29", where: FORM,
    translation: DOCKET_WORDS["refusal.DOCKET_OUTCOME_UNREADABLE"],
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(DOCKET_CHECKS, code) ? DOCKET_CHECKS[code] : null;
}
