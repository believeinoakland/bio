/* docket's refusal rows (requirements: `build/requirements/docket.md` R1, R2, R4, R5, R7, R8, R10–R12, R22; DEC-49).
 * A new family, C-129 (C-128 is acquisition's, stamped by 1.54.0), arriving at T27 and stamped in 1.57.0. At T28 (N526)
 * C-129.10's code became this module's own `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`, its check id kept (a renamed code
 * keeps its id, K238), the row `awaiting stamp` until T29's promotion stamp. `NO_SUCH_CASE` is the shared answer for an absent case, a case with no ratified edition and one
 * the viewer does not see, and has no row here (R22). The words a member reads before posting (the outward-act warning,
 * the invitation, the shelves' labels) are the UX design stream's; these rows only say why an act was refused and that
 * nothing changed. */

const at = (fn, region) => `src/docket/index.mjs ${fn} > ${region}`;
const FILER = at("#filerRefusal", "is-docket-filer");
const FORM = at("#formRefusal", "is-docket-form");
const PRESSURE = at("docketPressure", "is-docket-pressure");
const MANAGER = at("#managerRefusal", "is-docket-manager");
const ENTRY = at("#entryRefusal", "is-docket-entry");
const KIND = at("#kindRefusal", "is-docket-kind");
const POST = at("docketPost", "is-docket-post");

export const DOCKET_CHECKS = Object.freeze({
  MACHINE_CANNOT_FILE_DOCKET: {
    check: "C-129.1", where: FILER,
    translation: "Only a member, signed in as themselves, files to a case's docket. A machine, the assistant or an "
      + "operator token cannot. Nothing was filed.",
  },
  DOCKET_NOT_A_PARTICIPANT: {
    check: "C-129.2", where: FILER,
    translation: "Only a joined participant of the case's project files to its docket. Nothing was filed.",
  },
  DOCKET_NO_EDITION: {
    check: "C-129.3", where: FORM,
    translation: "Every docket entry names the edition of the case it concerns, and the edition named is not one this "
      + "case has published. Name a published edition. Nothing was written.",
  },
  DOCKET_NOT_ATTRIBUTED: {
    check: "C-129.4", where: FORM,
    translation: "Every docket entry says who it is from: the case's subject, someone granted standing, or the "
      + "source's name, in at most 200 characters. This one names nobody. Nothing was written.",
  },
  DOCKET_NOT_THE_SUBJECT: {
    check: "C-129.5", where: FORM,
    translation: "The entry says it is from the case's subject, and the one it names is not a subject of the "
      + "edition named. Nothing was written.",
  },
  DOCKET_NO_STANDING: {
    check: "C-129.6", where: FORM,
    translation: "The entry relies on a grant of standing that is not in force: it was never made on this case's "
      + "docket, or it has ended. Nothing was written.",
  },
  DOCKET_NO_CAPTURE: {
    check: "C-129.7", where: FORM,
    translation: "Every docket entry has a captured copy with its origin, and the capture named is not one this "
      + "record holds with the address it came from. Capture it first. Nothing was written.",
  },
  DOCKET_KIND_UNKNOWN: {
    check: "C-129.8", where: FORM,
    translation: "The entry's kind is not one the docket takes, or does not fit who it is from: a response or a "
      + "statement comes from the subject or someone granted standing, a reaction from anyone else, and an outcome "
      + "from anyone. Nothing was written.",
  },
  DOCKET_NO_REASON: {
    check: "C-129.9", where: FORM,
    translation: "Say, in your own words and at most 2,000 characters, why, and choose whether the entry is for the "
      + "record, for the public docket, or both. Nothing was written.",
  },
  /* R2, R22 (N526): this module's own code; `action-grammar`'s `MACHINE_CANNOT_MARK_PRESSURE` (C-117.14) is `actions`'
     and is never answered here (DEC-49: one code, one row). */
  MACHINE_CANNOT_MARK_DOCKET_PRESSURE: {
    check: "C-129.10", where: PRESSURE,
    translation: "Only a member, signed in as themselves, marks a docket entry as a threat. Nothing was marked.",
  },
  NO_SUCH_DOCKET_ENTRY: {
    check: "C-129.11", where: ENTRY,
    translation: "There is no docket entry here by that name for you: it does not exist, or it belongs to a case "
      + "you do not see. Nothing was written.",
  },
  PRESSURE_MARKED: {
    check: "C-129.12", where: PRESSURE,
    translation: "This docket entry is already marked as a threat; a mark is never rewritten. Nothing was marked.",
  },
  PRESSURE_REFUSED: {
    check: "C-129.13", where: PRESSURE,
    translation: "A threat is marked as legal, retaliation, discrediting or other, with a note of at most 500 "
      + "characters. Nothing was marked.",
  },
  MACHINE_CANNOT_PLACE_DOCKET: {
    check: "C-129.14", where: MANAGER,
    translation: "Only the case's manager, signed in as themselves, places, declines or signs a public docket entry. "
      + "A machine, the assistant or an operator token cannot. Nothing was published.",
  },
  DOCKET_NOT_THE_MANAGER: {
    check: "C-129.15", where: MANAGER,
    translation: "Only an owner of the case's project manages its public docket. Nothing was published.",
  },
  DOCKET_NO_GROUP_SLUG: {
    check: "C-129.16", where: MANAGER,
    translation: "This copy has no group name recorded, and a docket entry is never anonymous. Record the group's "
      + "name first. Nothing was published.",
  },
  DOCKET_ENTRY_SETTLED: {
    check: "C-129.17", where: ENTRY,
    translation: "That entry is already settled: placed in public, declined, listed as received, or taken back. A "
      + "later entry says what changed. Nothing was written.",
  },
  DOCKET_WRONG_SHELF: {
    check: "C-129.18", where: KIND,
    translation: "A reaction goes only under reactions elsewhere, and every other public entry only on the listed "
      + "shelf. Nothing was published.",
  },
  DOCKET_NO_SUMMARY: {
    check: "C-129.19", where: KIND,
    translation: "A reaction elsewhere is shown with a short summary in the group's own words: one paragraph of at "
      + "most 600 characters. Nothing was published.",
  },
  DOCKET_NO_ARCHIVE_COPY: {
    check: "C-129.20", where: KIND,
    translation: "A reaction elsewhere links to an independent archive's copy, and this capture has none. Ask for "
      + "the archive copy again, then place it. Nothing was published.",
  },
  DOCKET_WARNING_NOT_ACKNOWLEDGED: {
    check: "C-129.21", where: POST,
    translation: "A public docket entry is permanent: a later entry can take it back but never unsay it, and "
      + "posting it says you have read that. Nothing was published.",
  },
  DOCKET_STALE: {
    check: "C-129.22", where: POST,
    translation: "This copy holds no prepared docket entry from you with this fingerprint, it was prepared more "
      + "than an hour ago, or the docket has moved since. Prepare it again and sign what it shows. Nothing was "
      + "published.",
  },
  DOCKET_SIGNATURE_REFUSED: {
    check: "C-129.23", where: POST,
    translation: "The signature is not a valid signature of this docket entry by one of your own registered signing "
      + "keys, for the reason named. Nothing was published.",
  },
  DOCKET_WITHDRAWAL_FINAL: {
    check: "C-129.24", where: KIND,
    translation: "A withdrawal is never taken back. To stand behind the case again, publish a new edition. Nothing "
      + "was published.",
  },
  DOCKET_TAKE_BACK_FINAL: {
    check: "C-129.25", where: KIND,
    translation: "A take-back is never itself taken back. Place the entry again if it should stand. Nothing was "
      + "published.",
  },
  DOCKET_ALREADY_WITHDRAWN: {
    check: "C-129.26", where: KIND,
    translation: "That edition is already withdrawn, and a withdrawal is never repeated or lifted. Nothing was "
      + "published.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(DOCKET_CHECKS, code) ? DOCKET_CHECKS[code] : null;
}
