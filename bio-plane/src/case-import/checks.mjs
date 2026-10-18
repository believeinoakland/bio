/* case-import's refusal rows (requirements: `build/requirements/case-import.md` R1, R5–R8, R14, R17, R18; DEC-49).
 *
 * A new family, C-130 (C-129 is docket's), arriving at T28, each row `awaiting stamp` until T29's promotion stamp
 * (`plan/next.md` S5); the number is the stamp's to confirm. Each row's `translation` is the word of its key
 * `refusal.<CODE>` (plan rule 6; `words.mjs`), the design stream's; the words a member sees on the import screens (the
 * origin marks, the statement that recreating is not endorsing) are theirs too. Each row only says why an act was refused
 * and that nothing changed. This file imports `words.mjs` alone. */
import { rowWord } from "./words.mjs";

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
const WATCH = at("watchImport", "is-import-watch-address");
const WATCHED = at("#notWatched", "is-import-watched");

export const CASE_IMPORT_CHECKS = Object.freeze({
  MACHINE_CANNOT_IMPORT: {
    check: "C-130.1", where: CALLER,
    translation: rowWord("MACHINE_CANNOT_IMPORT"),
  },
  IMPORT_NOT_A_MEMBER: {
    check: "C-130.2", where: CALLER,
    translation: rowWord("IMPORT_NOT_A_MEMBER"),
  },
  IMPORT_NOT_A_CASE_FILE: {
    check: "C-130.3", where: FILE,
    translation: rowWord("IMPORT_NOT_A_CASE_FILE"),
  },
  IMPORT_PART_TOO_LARGE: {
    check: "C-130.4", where: FILE,
    translation: rowWord("IMPORT_PART_TOO_LARGE"),
  },
  IMPORT_EDITION_DIFFERS: {
    check: "C-130.5", where: FILE,
    translation: rowWord("IMPORT_EDITION_DIFFERS"),
  },
  IMPORT_DOCUMENT_NOT_MISSING: {
    check: "C-130.6", where: DOCUMENT,
    translation: rowWord("IMPORT_DOCUMENT_NOT_MISSING"),
  },
  IMPORT_NO_SUCH_EDITION: {
    check: "C-130.7", where: EDITION,
    translation: rowWord("IMPORT_NO_SUCH_EDITION"),
  },
  IMPORT_ACCEPT_NO_REASON: {
    check: "C-130.8", where: ACCEPT,
    translation: rowWord("IMPORT_ACCEPT_NO_REASON"),
  },
  IMPORT_NO_SUCH_FINDING: {
    check: "C-130.9", where: FINDING,
    translation: rowWord("IMPORT_NO_SUCH_FINDING"),
  },
  IMPORT_ACCEPT_NOT_RECREATED: {
    check: "C-130.10", where: ACCEPT,
    translation: rowWord("IMPORT_ACCEPT_NOT_RECREATED"),
  },
  IMPORT_ACCEPT_GAPS_UNSTATED: {
    check: "C-130.11", where: ACCEPT,
    translation: rowWord("IMPORT_ACCEPT_GAPS_UNSTATED"),
  },
  IMPORT_NOTHING_ACCEPTED: {
    check: "C-130.12", where: WITHDRAW,
    translation: rowWord("IMPORT_NOTHING_ACCEPTED"),
  },
  IMPORT_FLAG_NO_ISSUE: {
    check: "C-130.13", where: FLAG,
    translation: rowWord("IMPORT_FLAG_NO_ISSUE"),
  },
  IMPORT_FLAG_NOT_OPEN: {
    check: "C-130.14", where: OPEN,
    translation: rowWord("IMPORT_FLAG_NOT_OPEN"),
  },
  IMPORT_WATCH_BAD_ADDRESS: {
    check: "C-130.15", where: WATCH,
    translation: rowWord("IMPORT_WATCH_BAD_ADDRESS"),
  },
  IMPORT_NOT_WATCHED: {
    check: "C-130.16", where: WATCHED,
    translation: rowWord("IMPORT_NOT_WATCHED"),
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(CASE_IMPORT_CHECKS, code) ? CASE_IMPORT_CHECKS[code] : null;
}
