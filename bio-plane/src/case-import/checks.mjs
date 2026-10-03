/* case-import's refusal rows (requirements: `build/requirements/case-import.md` R1, R5–R8, R14; DEC-49).
 *
 * A new family, C-130 (C-129 is docket's), arriving at T28, each row `awaiting stamp` until T29's promotion stamp
 * (`plan/next.md` S5); the number is the stamp's to confirm. The translations are this job's plain drafts for BOB to
 * redraft (R14); the words a member sees on the import screens (the origin marks, the statement that recreating is not
 * endorsing) are the UX design stream's. Each row only says why an act was refused and that nothing changed. This file
 * imports nothing. */

const at = (fn, region) => `src/case-import/index.mjs ${fn} > ${region}`;
const CALLER = at("#callerRefusal", "is-import-caller");
const FILE = at("importCaseFile", "is-import-case-file");
const EDITION = at("#noSuchEdition", "is-import-edition");
const FINDING = at("acceptImported", "is-import-finding");
const ACCEPT = at("acceptImported", "is-import-accept");
const WITHDRAW = at("withdrawAcceptance", "is-import-withdraw");
const FLAG = at("#flagRefusal", "is-import-flag");
const OPEN = at("clearFlag", "is-import-flag-open");
const DOCUMENT = at("completeImportedDocument", "is-import-document");

export const CASE_IMPORT_CHECKS = Object.freeze({
  MACHINE_CANNOT_IMPORT: {
    check: "C-130.1", where: CALLER,
    translation: "Only a member, signed in as themselves, imports another group's case or acts on one. A machine, the "
      + "assistant or an operator token cannot. Nothing was written.",
  },
  IMPORT_NOT_A_MEMBER: {
    check: "C-130.2", where: CALLER,
    translation: "Only an active member of this group imports another group's case or acts on one. Nothing was "
      + "written.",
  },
  IMPORT_NOT_A_CASE_FILE: {
    check: "C-130.3", where: FILE,
    translation: "What was given is not a case file this copy can read: each way it departs from the case-file format "
      + "is named. Nothing was imported.",
  },
  IMPORT_PART_TOO_LARGE: {
    check: "C-130.4", where: FILE,
    translation: "A part of this case file is larger than the largest part a case file is split into. Nothing was "
      + "imported.",
  },
  IMPORT_EDITION_DIFFERS: {
    check: "C-130.5", where: FILE,
    translation: "This copy already holds this edition of the case, and the case file given differs from it. An edition "
      + "never changes, so both fingerprints are named for you to compare. Nothing was imported.",
  },
  IMPORT_DOCUMENT_NOT_MISSING: {
    check: "C-130.6", where: DOCUMENT,
    translation: "The document given matches nothing this imported edition is missing. Its fingerprint is named. "
      + "Nothing was stored.",
  },
  IMPORT_NO_SUCH_EDITION: {
    check: "C-130.7", where: EDITION,
    translation: "This copy holds no imported edition by that name. Nothing was written.",
  },
  IMPORT_ACCEPT_NO_REASON: {
    check: "C-130.8", where: ACCEPT,
    translation: "Say, in your own words and at most 2,000 characters each, what you checked and why the group accepts "
      + "it, or why it withdraws the acceptance. Nothing was written.",
  },
  IMPORT_NO_SUCH_FINDING: {
    check: "C-130.9", where: FINDING,
    translation: "A finding named is not one of this imported edition's findings. Nothing was written.",
  },
  IMPORT_ACCEPT_NOT_RECREATED: {
    check: "C-130.10", where: ACCEPT,
    translation: "A finding named did not recreate from its case file, and only a finding that recreated, wholly or in "
      + "part, can be accepted. Each one is named. Nothing was accepted.",
  },
  IMPORT_ACCEPT_GAPS_UNSTATED: {
    check: "C-130.11", where: ACCEPT,
    translation: "A finding named recreated only in part, and accepting it needs each gap stated in your own words. "
      + "Each gap left unstated is named. Nothing was accepted.",
  },
  IMPORT_NOTHING_ACCEPTED: {
    check: "C-130.12", where: WITHDRAW,
    translation: "No acceptance of this imported edition is in force, so there is nothing to withdraw. Nothing was "
      + "written.",
  },
  IMPORT_FLAG_NO_ISSUE: {
    check: "C-130.13", where: FLAG,
    translation: "A flag names the specific issue, and clearing one gives the reason, in your own words and at most "
      + "2,000 characters. Nothing was written.",
  },
  IMPORT_FLAG_NOT_OPEN: {
    check: "C-130.14", where: OPEN,
    translation: "There is no open flag here by that name: it was never raised, or it has been cleared. Nothing was "
      + "written.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(CASE_IMPORT_CHECKS, code) ? CASE_IMPORT_CHECKS[code] : null;
}
