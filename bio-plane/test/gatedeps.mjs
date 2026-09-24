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
 * WHAT IT DERIVES. The transitive closure of the LITERAL-SPECIFIER module edges out of each
 * root, over the source with its comments blanked. Both halves are taken from the subject, not
 * re-stated here:
 *
 *   - the matchers are `gates.mjs`'s OWN `IMPORT_RE` and `URL_RE`, READ OUT OF `tools/gates.mjs`
 *     (`matchersFrom`). A second regex written here would be a hand copy one level up — it would
 *     agree for free on the day it was written and drift silently after. If the tool renames or
 *     reshapes those lines this helper THROWS, naming the line it could not find, and the four
 *     suites go red by name: the loud direction.
 *   - comments are blanked by the estate's ONE lexer (`stripComments`, `scripts/walkfloor.mjs`,
 *     D-301: strings kept, since a path is a string), never a second one. MEASURED, 2026-09-24:
 *     without it the closure gains `bio-plane/scripts/op-claims.mjs` and `tools/statepaths.mjs`
 *     from an `import ... from "../scripts/op-claims.mjs"` quoted inside walkfloor.mjs's header
 *     prose — a comment reads nothing, and copying what a comment names is not a dependency.
 *
 * REACH — STATED, because a derivation nobody can bound is a hand list with extra steps. This
 * sees a module edge whose specifier is a RELATIVE STRING LITERAL: `import x from "./a.mjs"`,
 * `import "./a.mjs"`, `export … from "./a.mjs"`, `await import("./a.mjs")` and
 * `new URL("./a.mjs", import.meta.url)`. It CANNOT see: a computed specifier
 * (`import(join(REPO, name))`), a bare or package specifier (deliberately — a fixture installs no
 * node_modules), a `createRequire` load, or a file the tool SPAWNS rather than imports. The last
 * is live here: `tools/gatetrace.mjs` is handed to a child through `NODE_OPTIONS --import=` at a
 * path `gates.mjs` computes, so no import names it — `gateresults.test.mjs` passes it as an extra
 * ROOT and says so at the call. A file this cannot see must be named at the call site; a file it
 * can see is never named there.
 *
 * A DYNAMIC LITERAL IS FOLLOWED LIKE A STATIC ONE, which is right for `gates.mjs` — its lexer and its
 * results module are LOAD-TIME dependencies reached exactly that way — and would OVER-derive for a module
 * whose `await import("./x.mjs")` is a lazy branch. MEASURED 2026-09-24: `tools/coord.mjs` has twelve such
 * branches, so `tools/decided.mjs` derives THIRTEEN files here while its static closure is the three
 * (`decided`, `coord`, `statepaths`) that `pushguard.test.mjs` copies by hand — that hand list is right for
 * its fixture, not behind. A static-only mode is therefore what those other fixtures would need, and this
 * helper does not have one; it is reported rather than guessed at.
 *
 * `without` is for a dependency a fixture deliberately does NOT carry, and it is checked against
 * the derived closure: a name that is not in it throws, so an exclusion cannot outlive the import
 * it excludes (the hand-list failure again, inverted). Each caller states its reason at the call.
 */
import { readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { stripComments } from "../scripts/walkfloor.mjs";

const isFile = (abs) => { try { return statSync(abs).isFile(); } catch { return false; } };
const rel = (repo, abs) => relative(repo, abs).split(sep).join("/");

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
  const matchers = matchersFrom(repo);
  const seen = new Set();
  const stack = [];
  for (const r of roots) {
    const abs = resolve(repo, r);
    if (!isFile(abs)) throw new Error(`gatedeps: root ${r} is not a file in ${repo}`);
    stack.push(abs);
  }
  while (stack.length) {
    const abs = stack.pop();
    if (seen.has(abs)) continue;
    seen.add(abs);
    let code = "";
    try { code = stripComments(readFileSync(abs, "utf8")); } catch { continue; }
    for (const re of matchers) {
      for (const m of code.matchAll(re)) {
        const target = resolve(dirname(abs), m[1]);
        if (isFile(target) && !rel(repo, target).startsWith("..")) stack.push(target);
      }
    }
  }
  const all = [...seen].map((abs) => rel(repo, abs)).sort();
  for (const w of without) {
    if (!all.includes(w)) throw new Error(`gatedeps: \`without\` names ${w}, which is not in the closure of`
      + ` [${roots.join(", ")}] — an exclusion that excludes nothing is a stale hand list (M0-154); the closure is [${all.join(", ")}]`);
    if (roots.includes(w)) throw new Error(`gatedeps: \`without\` names the root ${w}`);
  }
  return all.filter((p) => !without.includes(p));
}
