import { execFileSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";
/* D-257 / M0-16 — THIS RUNNER IS `battery.mjs` ONE ESTATE OVER, AND ITS TOTAL IS
 * A BASELINE. It DISCOVERS `.test.mjs` in a directory it does not control and
 * prints the number a session quotes as "the UI harness is N green". `refs/stash`
 * is repository-wide across all sixty worktrees of this repository and `git stash
 * push -u` carries UNTRACKED files, so a `pop` deposits another worker's suite
 * here and this runner RUNS IT AND COUNTS IT — which is precisely how M0-15's
 * phantom (`machinefences-dec49.test.mjs`, 57 assertions, in no commit, gone by
 * the next run) got into a baseline. The hygiene census named this file as the
 * one member of that class worth an item; this is that item's other half.
 *
 * IT REPORTS AND IT DOES NOT FAIL, which is M0-15's provisional kept for its
 * stated reason: a worker writes a suite and runs this runner before committing
 * it dozens of times an hour, and failing on that would be a FALSE RED. THE
 * RESIDUAL IS THEREFORE REAL AND IS STATED — a run whose total includes a
 * phantom is still green, and only this report says so. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";
const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const tests = fs.readdirSync(new URL(".", import.meta.url)).filter(f=>f.endsWith(".test.mjs")).sort();
let fail = 0;
for(const t of tests){
  try{ execFileSync("node", [new URL(t, import.meta.url).pathname], {stdio:"pipe"}); console.log("PASS", t); }
  catch(e){ fail++; console.error("FAIL", t, "\n"+String(e.stdout||"")+String(e.stderr||"")); }
}
/* THE PROVENANCE OF WHAT WAS JUST RUN — every suite this runner ADMITTED,
   classified against `git ls-tree HEAD`, with the reproducible total printed
   beside the one above so a reader about to quote a baseline is told which
   figure another checkout at this HEAD reproduces (M0-16 rule 3). */
{
  const prov = readGitProvenance(REPO);
  const items = tests.map(t => ({ path: repoPath(REPO, HERE + t), what: t,
    counted: "run by this runner, and counted into the UI baseline" }));
  const repro = prov.inHead === null ? tests.length
    : items.filter(i => prov.inHead.has(i.path)).length;
  reportProvenance({
    prov, items, instrument: "the UI runner",
    corpus: `civicos-ui/test/: ${tests.length} suite(s) discovered and run`,
    totals: prov.inHead === null ? []
      : [{ label: "suites run", contaminated: tests.length, reproducible: repro, source: "suites" }],
  });
}
/* CORRECTED 2026-08-07 (VF-2), never exempted: this call was NOT in a try/catch
   while both guards below are. `execFileSync` throws on a non-zero exit, so a
   failing check-semantics ABORTED this runner — and the two guards after it
   never ran, on the one path where that matters most. That is D-93's class
   exactly (`npm test` chaining suites with `&&` and stopping at the first
   failure), one directory over. It still fails the run; it no longer hides what
   is behind it. */
try{ execFileSync("node", [new URL("../check-semantics.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
/* THE DEC-49 GUARD (VF-2). Bob ruled 2026-08-06 that surfaces MAY render an
   authored translation keyed on a code the plane sent, and the guard is what
   makes that safe: every code a surface can receive has a translation, and an
   UNTRANSLATED CODE FAILS THE HARNESS rather than reaching a member. It runs
   here, in the loop the reader actually runs, because a guard that is documented
   and not in the loop is not a mechanism (CLAUDE.md). Its own suite is
   test/refusal-codes.test.mjs, which runs it over fixture trees. */
try{ execFileSync("node", [new URL("../check-refusal-codes.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
/* THE D-173 GUARD (UI-23). It re-runs every suite above with an envelope probe
   preloaded, so it costs a second pass; that is deliberate and it is the only
   way to see what shape a mock ANSWERED rather than what its source looks like.
   It runs here, in the loop the reader actually runs, because a guard that is
   documented and not in the loop is not a mechanism (CLAUDE.md) — and because
   the class it closes shipped five times under a green harness. */
try{ execFileSync("node", [new URL("../check-mock-envelope.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
if(fail) process.exit(1);
console.log("civicos-ui: all harnesses green");
