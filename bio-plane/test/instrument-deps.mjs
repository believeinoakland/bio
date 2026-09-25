/* WHICH MODULES THE REAL INSTRUMENT NEEDS, DERIVED FROM ITS OWN IMPORTS.  D-265.
 *
 * ------------------------------------------------------- why this file exists
 *
 * `coverage-provenance.test.mjs` and `owed-controls.test.mjs` both copy the REAL
 * `scripts/coverage.mjs` into a scratch repository and run it there, because a
 * fixture copy of a check agrees with itself at zero cost and proves nothing about
 * what runs.  To do that they must also copy every module it imports, and BOTH
 * SUITES KEPT THAT LIST BY HAND, in two places, as a literal array.
 *
 * BOTH FILES PREDICTED THIS FAILURE IN PROSE AND BOTH PREDICTIONS CAME TRUE.
 * `coverage-provenance.test.mjs`: *"this list being hand-kept is why the addition is
 * stated rather than made quietly … Miss either here and the scratch repository
 * throws ERR_MODULE_NOT_FOUND, this suite reports nineteen failures with no obvious
 * cause, and the failure is in the HARNESS. Measured on the day: dropping them left
 * `9 pass, 19 fail`."*  `owed-controls.test.mjs`: *"eleven failures whose cause is
 * entirely in the HARNESS … DELEGATED in CLAIMS.md: two hand-kept copies of one
 * instrument's dependency list is a thing that will go stale."*
 *
 * D-265 added ONE import — `scripts/walkfloor.mjs` gained `./walkfigure.mjs` — and
 * the full battery came back at exactly `9 pass, 19 fail` and exactly `29 pass, 11
 * fail`, the two signatures those paragraphs name, to the assertion.  A warning
 * written twice and honoured twice is a warning that has been paid for; this is
 * WORKER.md's *invert, do not lengthen a list* applied to the list that asked for it.
 *
 * ------------------------------------------------------------------ what it does
 *
 * Start at `scripts/coverage.mjs`, follow every RELATIVE import to a fixpoint, and
 * return the basenames.  A module the instrument stops importing drops off on its
 * own; a module it starts importing arrives on its own.  Neither needs a human to
 * notice, which is the whole property the hand-kept arrays did not have.
 *
 * SINCE M0-170 THE WALK IS NOT HERE. This file was the THIRD derivation of "a
 * fixture's module closure" that M0-169 reported and did not take (its own header,
 * `./moduleclosure.mjs`, "A THIRD DERIVATION EXISTS"): the same class, with its own
 * regex and no comment lexer.  It is now a thin adapter over `moduleClosure`'s
 * STATIC mode, which keeps THIS file's two contracts and drops its second spelling
 * of "a static relative import":
 *  - `files` are BASENAMES of the modules under `bio-plane/scripts/`, as the three
 *    callers (`coverage-provenance`, `owed-controls`, `m051-driver-census`) copy
 *    them into a scratch `bio-plane/scripts/`.
 *  - `outside` is still returned and still asserted by the callers: a module in the
 *    closure that is NOT under `scripts/` is named there (relative to `scripts/`)
 *    instead of being copied as a truncated set.  One difference, stated: the old
 *    walk stopped at such a module, the shared one walks THROUGH it, so `outside`
 *    now names its dependencies too — a strictly larger, never smaller, refusal.
 *    A module in a SUBDIRECTORY of `scripts/` is named in `outside` as well: the
 *    callers copy by basename into one flat directory, so it could not be carried.
 *  - an import naming a file that does not exist was SKIPPED silently here (a bare
 *    `catch { continue; }`); `moduleClosure`'s default THROWS naming it.  Kept the
 *    loud way: a fixture cannot copy what it cannot find, and the old silence was
 *    the hand-list failure again.  MEASURED 2026-09-24 over `coverage.mjs`: the
 *    closure is the same six modules under the old walk and the new, in either
 *    `unresolved` mode, with `outside` empty — so the fold moved nothing today.
 *
 * WHAT IT CAN AND CANNOT SEE is `./moduleclosure.mjs`'s REACH, static mode: a
 * relative literal specifier in a static `import`/`export` statement, with
 * comments blanked by the estate's one lexer.  NOT a dynamic or computed import, a
 * `require()`, or a bare specifier (those are installed in the scratch repository
 * rather than copied).  It reads NAMED FILES and walks no directory, so it is
 * invisible to the class census in `hygiene.test.mjs` by construction rather than
 * by exemption.
 *
 * NEGATIVE CONTROL (M0-170, RUN 2026-09-24): a probe module `bio-plane/scripts/m0170probe.mjs` created and
 * `import "./m0170probe.mjs";` added to `scripts/walkfloor.mjs`, each arm ALONE, restored by sha256 AND `cmp` (MATCH).
 * Baselines coverage-provenance 38 / 0, owed-controls 49 / 0, m051-driver-census 9 / 0. (A4) the import, this file
 * DERIVING -> 38 / 0, 49 / 0, 9 / 0, AS DECLARED. (B4) the same import with `instrumentDeps` replaced by a HAND LIST
 * of today's six basenames -> 19 / 19 (first "(a) it still states the provenance question was ASKED and answered"),
 * 38 / 11 (first "B1 the undeclared FLEET suite is NAMED"), 2 / 7 (first "(A1) a suite whose ONLY driver …") — the
 * D-265 signatures, to the assertion.
 */

import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { moduleClosure } from "./moduleclosure.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCRIPTS = join(HERE, "..", "scripts");
const REPO = resolve(HERE, "..", "..");

export function instrumentDeps(entry = "coverage.mjs", scripts = SCRIPTS) {
  const rels = moduleClosure({
    repo: REPO,
    roots: [relative(REPO, join(scripts, entry)).split(sep).join("/")],
    dynamic: false,
    includeRoots: true,             /* the fixture copies the instrument itself as well */
  });
  const files = [], outside = [];
  for (const rel of rels) {
    const fromScripts = relative(scripts, resolve(REPO, rel));
    if (fromScripts.startsWith("..") || fromScripts.includes(sep)) outside.push(fromScripts);
    else files.push(basename(rel));
  }
  return { files: files.sort(), outside: outside.sort() };
}
