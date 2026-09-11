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
 * WHAT IT CAN AND CANNOT SEE, because a resolver that hides its limits is read as
 * though it had none:
 *  - CAN: static `import … from "./x.mjs"` and `export … from "./x.mjs"`, at any
 *    depth, including a cycle (the fixpoint terminates on the seen set).
 *  - CANNOT: `await import()` with a computed specifier, `require()`, a bare
 *    specifier resolved through `node_modules` (deliberately — those are installed
 *    in the scratch repository rather than copied), or an import that reaches OUT
 *    of `scripts/`.  The last is asserted rather than assumed: `outside` is
 *    returned so a caller can fail on it instead of copying a truncated set.
 *  - It reads NAMED FILES and walks no directory, so it is invisible to the class
 *    census in `hygiene.test.mjs` by construction rather than by exemption.
 */

import { readFileSync } from "node:fs";
import { dirname, join, basename, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCRIPTS = join(HERE, "..", "scripts");

/* Relative specifiers only. Comments are not stripped: a specifier is a string
   literal in an import STATEMENT, and the anchor below requires the statement. */
const SPEC = /(?:^|\n)\s*(?:import|export)[^;\n]*?from\s*["'](\.[^"'\n]+)["']/g;

export function instrumentDeps(entry = "coverage.mjs", scripts = SCRIPTS) {
  const seen = new Set();
  const outside = [];
  const queue = [join(scripts, entry)];
  while (queue.length) {
    const file = queue.shift();
    const key = resolve(file);
    if (seen.has(key)) continue;
    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    seen.add(key);
    for (const m of src.matchAll(SPEC)) {
      const target = resolve(dirname(file), m[1]);
      const rel = relative(scripts, target);
      if (rel.startsWith("..")) { outside.push(rel); continue; }
      queue.push(target);
    }
  }
  return {
    files: [...seen].map((f) => basename(f)).sort(),
    outside: [...new Set(outside)].sort(),
  };
}
