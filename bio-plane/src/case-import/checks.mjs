/* case-import's refusal rows (requirements: `build/requirements/case-import.md` R1, R5–R8, R14, R17, R18, R27, R29, R30; DEC-49).
 *
 * A new family, C-130 (C-129 is docket's), arriving at T28, each row `awaiting stamp` until T29's promotion stamp
 * (`plan/next.md` S5); the number is the stamp's to confirm. Each row's `translation` is the word of its key
 * `refusal.<CODE>` (plan rule 6; `words.mjs`), the design stream's; the words a member sees on the import screens (the
 * origin marks, the statement that recreating is not endorsing) are theirs too. Each row only says why an act was refused
 * and that nothing changed. This file imports `words.mjs` and, for the rerun's six rows (C-130.17 onward, T51), `localize`. */
import { rowWord } from "./words.mjs";
import { localize } from "../setup-words/index.mjs";

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
const RERUN_CALLER = at("#rerunCaller", "is-rerun-caller");
const RERUN_ALREADY = at("rerunStart", "is-rerun-already");
const NOT_A_RERUN = at("rerunPair", "is-not-a-rerun");
const SOURCE_FINDING = at("#noSuchSource", "is-rerun-source-finding");
const OWN_FINDING = at("rerunPair", "is-rerun-own-finding");
const LENS_UNKNOWN = at("regradeImported", "is-regrade-lens");

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
  /* T51 (K4169): the rerun's rows, C-130.17 onward, awaiting promotion's stamp; their sentences are written once, here, by
     `localize` (the design stream's key list is not extended by this module) */
  MACHINE_CANNOT_RERUN: {
    check: "C-130.17", where: RERUN_CALLER,
    translation: localize("case-import.checks.machine_cannot_rerun", "Re-running another team's work, and pairing its findings with ours, is a member's act, signed in as themselves; this caller is not one. Nothing was written."),
  },
  RERUN_ALREADY: {
    check: "C-130.18", where: RERUN_ALREADY,
    translation: localize("case-import.checks.rerun_already", "This project is already declared a re-run of this edition. Declare it for a later edition to re-run that one. Nothing was written."),
  },
  NOT_A_RERUN: {
    check: "C-130.19", where: NOT_A_RERUN,
    translation: localize("case-import.checks.not_a_rerun", "This project is not declared a re-run of that imported edition, so there is no work to pair with. Declare it a re-run first. Nothing was written."),
  },
  NO_SUCH_SOURCE_FINDING: {
    check: "C-130.20", where: SOURCE_FINDING,
    translation: localize("case-import.checks.no_such_source_finding", "That is not a finding of the imported edition this project re-runs. Nothing was written."),
  },
  NO_SUCH_OWN_FINDING: {
    check: "C-130.21", where: OWN_FINDING,
    translation: localize("case-import.checks.no_such_own_finding", "That is not one of this project's findings. Pair one of the project's own. Nothing was written."),
  },
  REGRADE_LENS_UNKNOWN: {
    check: "C-130.22", where: LENS_UNKNOWN,
    translation: localize("case-import.checks.regrade_lens_unknown", "That is not a lens this case can be read under: choose as the source published it, with the source's bias removed, or under our own. Nothing was written."),
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(CASE_IMPORT_CHECKS, code) ? CASE_IMPORT_CHECKS[code] : null;
}
