/* case-checker — the one checker of a case file (requirements: `build/requirements/case-checker.md`; DEC-112 (3)(6);
 * `BIO_Publication_v0_1.md` §5C; K1256, K1257).
 *
 * Anybody can check a published case, and recreate its findings, without a CivicOS copy. This module is the one
 * checker:
 *
 *   checkCaseFile        R1–R11, R18 (`./check.mjs`): a pure function CivicOS runs on import (`case-import`);
 *   the program          R13 (`./main.mjs`, built by `./build-program.mjs` into `./program.mjs`): the same code, one
 *                        file anyone runs offline with nothing to install;
 *   the specification    R14 (`./spec.mjs`): the readable text of each case-file format version;
 *   the public reads     R15: `casechecker` (the program) and `casefilespec` (a specification), registered once with
 *                        `public-read` (its R18) and served with no credential.
 *
 * Recreating shows a case intact and consistent, not true (R12). No place is named here (R17). */

import { PROGRAM, PROGRAM_SHA256, PROGRAM_BODY_SHA256 } from "./program.mjs";
import { CASE_FILE_SPECS, CASE_FILE_SPEC_VERSIONS } from "./spec.mjs";
import { publicReadOf } from "../public-read/index.mjs";

export { checkCaseFile, RESULTS, RESULT_WORDS, CHECKER_VERSIONS, RECREATION_STATEMENT, REST_ON_ANOTHER_GROUP_STATEMENT,
         KEYS_NOT_CHECKED_STATEMENT, CHECKS_VERSION_STATEMENT, accountStatement, keyFingerprint, readCaseFile,
         textAtExtent } from "./check.mjs";
export { runProgram } from "./main.mjs";
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
             detail: `${v === null ? "no version was named" : "this copy holds no specification of that version"}; it holds `
                   + `the specification of ${CASE_FILE_SPEC_VERSIONS.join(", ")}, named as version` };
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
