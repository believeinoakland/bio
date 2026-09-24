/* gatedeps.mjs — WHAT A GATE FIXTURE MUST CARRY, DERIVED FROM `tools/gates.mjs` ITSELF.
 *
 * WHY (M0-154). Four suites — `gates.test.mjs`, `gateresults.test.mjs`, `train.test.mjs` and
 * `entries.test.mjs` — build a fixture repository and copy the REAL tools into it, because a
 * fixture running a stub proves nothing about the gate. Each kept its own HAND LIST of what to
 * copy:
 *
 *     for (const f of ["gates.mjs", "pushguard.mjs"]) put(root, `tools/${f}`, ...)
 *     for (const f of ["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"]) put(root, ...)
 *
 * Four copies of one fact, and the fact is `gates.mjs`'s import list. That is the D-93/D-113
 * defect (`VERIFICATION.md`, "The battery runs every suite": the set is DISCOVERED, never
 * listed) wearing a fixture: the lists cannot fail when they fall behind. They fail LATER and
 * somewhere else — `gates.mjs` loads each of these under a `try`, so a fixture missing one does
 * not crash, it DEGRADES (the lexer's own catch reads `/* read whole, and say so *\/`), and the
 * suite measures a gate that is not the gate. A missing copy is a silent weakening of every
 * assertion in the file, which is why this is derived rather than reviewed.
 *
 * WHAT IS HERE AND WHAT IS NOT, SINCE M0-169. The WALK — the transitive closure of the
 * literal-specifier module edges, over source with its comments blanked by the estate's one lexer —
 * moved to `./moduleclosure.mjs`, which `civicos-ui/test/refusal-codes.test.mjs` now reads as well:
 * M0-154 reported TWO derivations of that one fact and M0-169 folded them, so read that file's header
 * for the reach, the modes and what the walk cannot see. What stays HERE is the half that is about
 * GATES and could not be generalised without becoming a hand copy:
 *
 *   - `matchersFrom`, which READS `gates.mjs`'s OWN `IMPORT_RE` and `URL_RE` out of
 *     `tools/gates.mjs`. A second regex written in a shared helper would be a hand copy one level
 *     up — it would agree for free on the day it was written and drift silently after. If the tool
 *     renames or reshapes those lines this THROWS, naming the line it could not find, and the four
 *     suites go red by name: the loud direction. This is why `moduleClosure`'s dynamic mode REFUSES
 *     to supply a matcher of its own and demands the subject's.
 *   - the DYNAMIC mode itself, which is right for `gates.mjs` — its lexer and its results module are
 *     LOAD-TIME dependencies reached exactly that way — and would OVER-derive for a module whose
 *     `await import("./x.mjs")` is a lazy branch. That is why the mode is a stated argument rather
 *     than the helper's default, and why the hand lists in `pushguard.test.mjs` and
 *     `retirable.test.mjs` need the STATIC mode instead (M0-170).
 *   - `unresolved: "skip"`, M0-154's behaviour, preserved deliberately at this call rather than
 *     tightened by the fold: this walk runs the SUBJECT's matcher over source in which the lexer
 *     keeps strings, so a specifier-shaped string that names no file is a false match and not a
 *     missing dependency. MEASURED 2026-09-24 over `tools/gates.mjs`, `tools/train.mjs` and
 *     `tools/gatetrace.mjs`: ZERO edges are skipped today, in either direction — so this is a stated
 *     guarantee and not an exercised one.
 *
 * A FILE THE WALK CANNOT SEE MUST BE NAMED AT THE CALL SITE; one it can see is never named there.
 * That is live here: `tools/gatetrace.mjs` is handed to a child through `NODE_OPTIONS --import=` at a
 * path `gates.mjs` computes, so no import names it — `gateresults.test.mjs` passes it as an extra
 * ROOT and says so at the call.
 *
 * `without` is for a dependency a fixture deliberately does NOT carry, and it is checked against
 * the derived closure: a name that is not in it throws, so an exclusion cannot outlive the import
 * it excludes (the hand-list failure again, inverted). Each caller states its reason at the call.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { moduleClosure } from "./moduleclosure.mjs";

/* `gates.mjs`'s own matchers, by name. The line is `const <NAME> = /…/<flags>;` — the greedy body
   stops at the LAST `/` on the line, which is the closing delimiter, since the flags carry none. */
export function matchersFrom(repo) {
  const abs = join(repo, "tools/gates.mjs");
  const src = readFileSync(abs, "utf8");
  return ["IMPORT_RE", "URL_RE"].map((name) => {
    const m = new RegExp(`^const ${name} = /(.+)/([a-z]*);`, "m").exec(src);
    if (!m) throw new Error(`gatedeps: tools/gates.mjs no longer declares \`const ${name} = /…/\` —`
      + " the fixtures derive their copy list from that line and cannot fall back to a hand list (M0-154)");
    return new RegExp(m[1], m[2].includes("g") ? m[2] : `${m[2]}g`);
  });
}

/* Repo-relative paths, sorted, of everything a fixture must carry for `roots` to load whole. */
export function gateDeps({ repo, roots = ["tools/gates.mjs"], without = [] } = {}) {
  if (!repo) throw new Error("gatedeps: repo is required");
  return moduleClosure({
    repo,
    roots,
    without,
    dynamic: true,                  /* gates.mjs reaches its lexer and its results module that way */
    matchers: matchersFrom(repo),   /* the SUBJECT's own selector, never a second spelling of it */
    includeRoots: true,             /* the fixture copies the tool itself as well as its closure */
    unresolved: "skip",             /* M0-154's, preserved — see the header's measurement */
  });
}
