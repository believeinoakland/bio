/* case-checker — the one checker of a case file (requirements: `build/requirements/case-checker.md`; DEC-112 (3)(6);
 * `BIO_Publication_v0_1.md` §5C; K1256, K1257).
 *
 * Anybody can check a published case, and recreate its findings, without a Civicsmith copy. This module is the one
 * checker:
 *
 *   checkCaseFile        R1–R11, R18, R20, R22–R24 (`./check.mjs`): a pure function Civicsmith runs on import (`case-import`);
 *   checkAccount         R24 (`./account.mjs`): the account's sentences judged against what they cite, for
 *                        `case-disclosures` R30 at the act and R1 offline;
 *   reweigh              R23 (`./check.mjs`, `./lens.mjs`; K2529): each finding's pair re-weighed under another lens, pure
 *                        and synchronous, over an answer already checked; `checkCaseFile`'s lens arm and `case-import` R4;
 *   the program          R13 (`./main.mjs`, built by `./build-program.mjs` into `./program.mjs`): the same code, one
 *                        file anyone runs offline with nothing to install;
 *   the specification    R14 (`./spec.mjs`): the readable text of each case-file format version;
 *   standards' use       R21 (`./standards.mjs`): `checkStandardsUse`, a pure check of how a case quotes the standards it
 *                        measures against and what it calls a benchmark; its caller with the record refuses (N717);
 *   the public reads     R15: `casechecker` (the program) and `casefilespec` (a specification), registered once with
 *                        `public-read` (its R18) and served with no credential.
 *
 * Recreating shows a case intact and consistent, not true (R12). No place is named here (R17). */

import { PROGRAM, PROGRAM_SHA256, PROGRAM_BODY_SHA256 } from "./program.mjs";
import { CASE_FILE_SPECS, CASE_FILE_SPEC_VERSIONS } from "./spec.mjs";
import { publicReadOf } from "../public-read/index.mjs";

export { checkCaseFile, RESULTS, RESULT_WORDS, CHECKER_VERSIONS, RECREATION_STATEMENT, REST_ON_ANOTHER_GROUP_STATEMENT,
         KEYS_NOT_CHECKED_STATEMENT, CHECKS_VERSION_STATEMENT, NOT_RECOMPUTED_STATEMENT, CAPTURES_NOT_CARRIED_STATEMENT, CALCULATION_RESULTS, accountStatement,
         keyFingerprint, readCaseFile, textAtExtent, reweigh } from "./check.mjs";
export { runProgram } from "./main.mjs";
export { checkAccount, ACCOUNT_CODES, DETERMINATION_WORDS, SUPPORT_WORDS, CONTRARY_WORDS } from "./account.mjs";
export { LENS_LIMIT_STATEMENT, LENS_NAMES } from "./lens.mjs";
export { checkStandardsUse, STANDARDS_USE_CODES, NONCONFORMING_WORDS } from "./standards.mjs";
export { CASE_FILE_SPECS, CASE_FILE_SPEC_VERSIONS } from "./spec.mjs";
export { PROGRAM, PROGRAM_SHA256, PROGRAM_BODY_SHA256 } from "./program.mjs";

/** R13: the program file as served: its text, its SHA-256, the SHA-256 its first line names, and how to run it. */
export function caseCheckerProgram() {
  return { file: "case-checker.mjs", media_type: "text/javascript", sha256: PROGRAM_SHA256, body_sha256: PROGRAM_BODY_SHA256,
           bytes: new TextEncoder().encode(PROGRAM).length, program: PROGRAM,
           run: "node case-checker.mjs <part> [<part> ...] [--document <file> ...] [--keys <file>]" };
}

/** R14, R15: the specification of one case-file format version. An unknown or absent version is answered, not
 *  refused, with the versions held (`held: false`), so the read raises no refusal of its own. */
export function caseFileSpec(version) {
  const v = typeof version === "string" ? version : null;
  if (v === null || !Object.hasOwn(CASE_FILE_SPECS, v))
    return { held: false, version: v === null ? null : v.slice(0, 80), versions: [...CASE_FILE_SPEC_VERSIONS],
             detail: `${v === null ? "no version was named" : "this group's Civicsmith holds no specification of that version"}; it holds `
                   + (CASE_FILE_SPEC_VERSIONS.length === 1 ? `the specification of ${CASE_FILE_SPEC_VERSIONS[0]}, named as version`
                     : `the specifications of ${CASE_FILE_SPEC_VERSIONS.slice(0, -1).join(", ")} and ${CASE_FILE_SPEC_VERSIONS.at(-1)}, each named as version`) };
  return { held: true, version: v, media_type: "text/markdown", text: CASE_FILE_SPECS[v], versions: [...CASE_FILE_SPEC_VERSIONS] };
}

/** R15: the two credential-free public reads, as `public-read` R18 registers them. */
export function caseCheckerPublicReads() {
  return {
    casechecker: { read: () => caseCheckerProgram(), params: [] },
    casefilespec: { read: (a) => caseFileSpec(a.version ?? null), params: ["version"] },
  };
}

const registered = new WeakMap();

/** R15: at start, register the public reads once per host with `public-read` (its R18); the registration's answer is
 *  kept and returned, so a refused one is seen. */
export function registerCaseCheckerPublicReads(host, deps = {}) {
  if (registered.has(host)) return registered.get(host);
  const publicRead = deps.publicRead || publicReadOf(host);
  const answer = publicRead.registerPublicReads("case-checker", caseCheckerPublicReads());
  registered.set(host, answer);
  return answer;
}
