/* op-claims: prose naming `op=<name>` is a CLAIM about the dispatch table.
 *
 * WHY THIS EXISTS, and it is a receipt rather than a rationale. REC-58 was a whole
 * queue item raised on one sentence in IC-22's SETTLED text, which said that the
 * op reaching `Store.publishCase()` returns `opened`. It does not and never did.
 * The item ran to completion and established that there was nothing there. Worse,
 * the sentence had PROPAGATED — CONDUCT copied it out of IC-22 into REC-58's own
 * scope, so the false claim stood in two authoritative places before anybody drove
 * the op. It was struck at both. Nothing prevented the next one. This module is the
 * thing that prevents the next one, and its subject is the CLAIM, not the op.
 *
 * The dispatch table is the AUTHORITY, and prose about it rots silently the moment
 * an op moves, is renamed, is deleted, or is aliased. That is this project's
 * most-repeated finding — the hand-carried figure nobody re-measures, wrong about
 * `store.mjs`'s line count four separate times, once by more than 3x — arriving
 * with an op name in place of the number.
 *
 * ------------------------------------------------------------------- the table
 *
 * There are TWO levels, and conflating them is the defect this catches:
 *
 *   1. `OPS` in `src/index.mjs` — a STRICT WHITELIST. This is the entire set of
 *      names the `op=` parameter may take. A name absent from it is `unknown op`
 *      to every real caller.
 *   2. the store's dispatch `map` in `src/store.mjs` — DO paths, resolved from
 *      `url.pathname.slice(1)`. **There is no `op=` at this level at all.**
 *
 * `DO_PATH` in `src/index.mjs` joins them, and the join is NOT the identity:
 * `op=publish` is an ALIAS routed to the DO path `publishcase`, so the op whose
 * NAME matches the spreading method is routed away from it. A check that verified
 * only that a name existed SOMEWHERE would have passed IC-22's sentence. The
 * WRONG-LEVEL finding — a name that is a DO path and not an op — is therefore its
 * own class, and it NAMES the op that actually routes there.
 *
 * ------------------------------------------- WHAT THIS CANNOT SEE. READ THIS.
 *
 * Stated here, at the site, rather than left for a later session to rediscover.
 * REC-58 measured its own limit precisely and the record nearly lost it.
 *
 *  - **IT DOES NOT VERIFY WHAT AN OP RETURNS. NOT ONE ASSERTION HERE READS A
 *    RESPONSE SHAPE.** IC-22's sentence had two halves and this catches ONE: the
 *    op name was at the wrong level, and that is mechanically decidable. The half
 *    that says `returns opened` is not checked by anything in this file. A sentence
 *    making the identical false claim under the CORRECT op name passes every check
 *    here. **A field arriving through a SPREAD declares no key**, so a source-level
 *    reader cannot see it at all — REC-58 measured exactly this: `...cs` spread
 *    into the container manifest moved a published shape while the source-level key
 *    arm stayed green. **Half a defence, named as half.**
 *  - It reads the token `op=<lowercase-name>` and nothing else. A claim phrased
 *    "the publish-case op" or "`Store.publishCase()` returns …" carries no token
 *    and is invisible here.
 *  - It cannot tell WHY a document names a non-op. See the LEDGER note (its head is in `./op-claims-ledger.mjs`): that
 *    judgment is a human's, recorded once per (file, name), and held exactly.
 *  - A dynamic name (`op=version${act}`) cannot be resolved from source. It is
 *    counted as DYNAMIC and reported, never guessed at.
 */

import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, extname } from "node:path";
/* M0-18 — ONE mechanism, imported, never a copy of the rule. Why the module
   exists and what it cannot see is in its own header; why this walk needed it is
   at the classification block inside `corpus()`. */
import { readGitProvenance } from "./provenance.mjs";
/* D-265: the classification this module's exported walks carry. */
import { walkResult } from "./walkfigure.mjs";
/* M0-110: the STATE files (CLAIMS, QUEUE, BACKLOG, DEBT, the handoffs, the archive ledgers) left `main` for the
   branch `coord` (TREE-SHARING.md §1). Their op= claims are judged by the coord write's ledger checks — BOB #28's
   ruling 2: a check of a ledger's CONTENT leaves the battery — so this walk, which the battery floors on, sweeps
   `main`'s files only, and `sweep({ files })` is the one mechanism the ledger check runs over the state texts. */
/* M0-121: from the module that WALKS NOTHING. `coord.mjs` re-exports the same binding, but importing it from there
   made every importer of this module inherit `coord.mjs`' walks of `docs/` in `tools/gates.mjs`' selection (M-106). */
import { isMovedPath } from "../../tools/statepaths.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLANE = join(HERE, "..");
export const REPO = join(PLANE, "..");

/* ------------------------------------------------------------- the authority */

/* The body of a `<name> = { ... }` object literal, brace-matched out of source so a
   table read this way cannot fall behind a hand-kept list (D-113/D-93). The same
   reader `coverage.mjs` uses on the same table, for the same reason. */
function tableBody(src, name) {
  const decl = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`);
  const m = decl.exec(src);
  if (!m) return null;
  const i = src.indexOf("{", m.index);
  let depth = 0;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(i + 1, p); }
  }
  return null;
}

/* The object literal opening at an anchor. The store's dispatch is a bare
   `const map = {` inside `fetch()`, not a module-level declaration, so it is found
   by its anchor rather than by name. */
function bodyAt(src, anchor) {
  const i = src.indexOf(anchor);
  if (i < 0) return null;
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let p = open; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(open + 1, p); }
  }
  return null;
}

export const STORE_DISPATCH_ANCHOR = "const map = {";

export function readDispatch(planeDir = PLANE) {
  const indexSrc = readFileSync(join(planeDir, "src/index.mjs"), "utf8");
  const storeSrc = readFileSync(join(planeDir, "src/store.mjs"), "utf8");

  const opsBody = tableBody(indexSrc, "OPS");
  if (opsBody == null) throw new Error("OPS table not found in src/index.mjs");
  const opRows = [...opsBody.matchAll(/^\s{2}([a-z][a-z0-9]*)\s*:\s*\{([^}]*)\}/gm)];
  const ops = new Set(opRows.map((m) => m[1]));

  /* FW-14: THE `mutating` FLAG OFF THE SAME ROWS, added here rather than in a
     second reader. The rung ladder's op set is "every op the dispatch table
     declares mutating", and `scripts/coverage.mjs` already reads this flag with
     this exact predicate — but coverage.mjs runs top-level and exits, so it
     cannot be imported. Growing THIS reader by one field is CPDF-9's rule
     applied: one mechanism for one job. Every existing field of the returned
     table is untouched, because `test/op-claims.test.mjs` pins them. */
  const mutating = new Set(opRows.filter((m) => /mutating:\s*true/.test(m[2])).map((m) => m[1]));

  /* The public-name -> DO-path alias map. THE ONE PLACE that difference lives, and
     the reason existence alone is not a sufficient check. */
  const doPathBody = tableBody(indexSrc, "DO_PATH");
  const doPath = new Map();
  if (doPathBody != null)
    for (const m of doPathBody.matchAll(/([a-z][a-z0-9]*)\s*:\s*"([a-z][a-z0-9]*)"/g))
      doPath.set(m[1], m[2]);

  /* DO path -> the function the table names. The two that route through a viewer
     guard name the guard; that is correct, because the claim being checked is which
     function the TABLE names, not what that function goes on to do. */
  const mapBody = bodyAt(storeSrc, STORE_DISPATCH_ANCHOR);
  if (mapBody == null) throw new Error("store dispatch map not found in src/store.mjs");
  const routes = new Map();
  for (const m of mapBody.matchAll(/^\s{8}([a-z][a-z0-9]*)\s*:\s*\(\)\s*=>\s*(?:this\.)?(#?[A-Za-z0-9_]+)/gm))
    routes.set(m[1], m[2]);

  return { ops, mutating, doPath, routes };
}

/* Where an op actually goes: the alias first, then the store's own table. */
export function routeOf(op, table) {
  const path = table.doPath.get(op) ?? op;
  return { doPath: path, method: table.routes.get(path) ?? null };
}

/* Which OP reaches a given DO path — the answer a wrong-level mention needs. An
   alias WINS over the same-named op, because that is precisely what an alias does:
   the DO path `publishcase` is reached by `op=publish`, and sending that DO path
   name as the `op=` parameter is `unknown op` to every caller.

   THIS COMMENT IS WRITTEN AROUND ITS OWN RULE ON PURPOSE. The first draft said the
   forbidden thing in order to name it, and the sweep flagged this module in five
   places — a sweep arm failing by citing itself is a failure mode this project has
   already met, so the instrument obeys the rule it enforces and describes the wrong
   grammar instead of spelling it. */
export function opReaching(doPathName, table) {
  for (const [op, p] of table.doPath) if (p === doPathName) return op;
  if (table.ops.has(doPathName)) return doPathName;
  return null;
}

/* ------------------------------------------------------------------ the walk */

const TEXT_EXT = new Set([".mjs", ".js", ".md", ".html", ".json", ".jsonc", ".txt", ".sh"]);
const SKIP_DIR = new Set(["node_modules", "dist", "coverage"]);

/* ---- M0-18 · THIS WALK DOES NOT DESCEND INTO A DOT-DIRECTORY, AND THE RULING
 * IS RECORDED HERE BECAUSE THIS IS THE SITE THAT ENFORCES IT.
 *
 * WHAT WAS WRONG. `SKIP_DIR` was a HAND-KEPT LIST OF SPELLINGS — `.git`,
 * `.claude`, `.worktrees` — each added the day it bit somebody, which is D-113's
 * class and the shape WORKER.md means by *invert, do not lengthen a list*. The
 * three siblings that walk this same repository in this same battery
 * (`test/bounds.test.mjs`, `test/case-opened.test.mjs`) already skip EVERY
 * dot-directory with one line, so this walk admitted directories they would never
 * have run — M0-16's class in the opposite direction: not a walk that goes blind,
 * a walk that sees more than its siblings and reports a number nobody else can
 * reproduce.
 *
 * AND IT WAS MEASURED, NOT REASONED. D-257's negative-control harness kept its
 * per-arm PRISTINE COPIES under a dot-directory inside the worktree — the only
 * safe place, since `git stash` is forbidden here and the shared scratchpad is
 * not isolated between sessions. This walk descended into it, read the copies as
 * a third party's prose about the dispatch table, and turned the whole battery
 * RED with TEN findings. Every control this project runs makes pristine copies;
 * an instrument that reds because a MANDATORY negative control ran is an
 * instrument fighting the process it belongs to.
 *
 * WHAT IT COSTS, MEASURED ON THIS TREE 2026-08-09 rather than asserted: ZERO
 * files. The corpus contains 459 files; exactly ONE tracked dot-DIRECTORY exists
 * in this repository (`.claude/`, which the old list already skipped by name),
 * and every other tracked path beginning with a dot is a FILE at a non-dot path
 * (`.gitignore`, `.env.example`, `.dev.vars.example`) whose extension is not in
 * `TEXT_EXT` anyway. The rule below is therefore the same corpus with a
 * different reason — and, unlike the list, it also covers `.query-reach-cov/`,
 * every future control harness, and whatever the next tool writes.
 *
 * WHAT IT GIVES UP, said plainly rather than left for the next reader: a real
 * `op=` claim written inside a dot-directory is now invisible here. If a tracked
 * `.github/` or similar ever carries prose about the dispatch table, this rule is
 * the reason it goes unchecked, and the corpus floor in
 * `test/op-claims.test.mjs` is what makes a narrowing visible rather than silent.
 *
 * REJECTED ALTERNATIVE: deciding by `git check-ignore` instead of by the leading
 * dot. It would admit a tracked `.github/` correctly, but it would STILL admit an
 * untracked-and-unignored control directory — which is precisely the case that
 * bit — and it would make the corpus depend on git being answerable, a third
 * state this walk otherwise never needs. REVERSING THIS COSTS ONE LINE.
 *
 * THE RULE IS ON THE PATH SEGMENT, NOT ON DIRECTORIES ONLY, which is the same
 * spelling the two sibling walks use: a dot-FILE is excluded too. Measured, that
 * changes nothing either — no tracked dot-file in this repository carries an
 * extension in `TEXT_EXT`. What the walk skipped is RETURNED and printed, so the
 * narrowing is visible rather than a silence. */
const skipSegment = (name) => SKIP_DIR.has(name) || name.startsWith(".");

/* THE GENERATED EMBEDS ARE EXCLUDED STRUCTURALLY, by what stands at BYTE 0, never
   by filename — REC-58's predicate, reused verbatim rather than re-derived, because
   it is the one that was measured. Both halves of the trap it closes:

     - `release/bio-plane.bundled.mjs` is a SECOND embed of the whole plane beside
       the `newgroup/src/release.mjs` one, so a walk excluding only the
       warned-about file still reads the plane's own comments as a third party's
       claims about it. It carries NO banner at all: it is bundler output whose
       first line names the entry module.
     - THE GENERATOR IS KEPT IN. An exclusion testing whether a file CONTAINS the
       banner also drops `newgroup/scripts/embed-release.mjs`, which contains it
       because it WRITES it — the dangerous direction, hiding a real claim while
       still reading green. A generated artifact BEGINS with its banner; a file
       that merely mentions one does not, and the anchor is `^`.

   MY OWN FIRST DRAFT WAS THE LOOSE VERSION (the banner anywhere in the first 4kB)
   and it excluded 16 files while missing BOTH embeds. Recorded rather than
   smoothed: the instrument was wrong before the subject was. */
export function generatedReason(src) {
  if (/^\/\* GENERATED by scripts\/embed-release\.mjs/.test(src))
    return "embed-release banner, at byte 0";
  if (/^\/\/ src\/schema\.mjs\n/.test(src) && /var SCHEMA = `/.test(src))
    return "bundler output, first line names the entry module";
  /* ADDED 2026-09-13 (DS-4, cutting 0.57.0). THE OLD TEST WAS STALE AND HAD BEEN
     PASSING ON A MONTH-OLD ARTIFACT. It required the first line to be
     `// src/schema.mjs` — esbuild's comment naming the first emitted module —
     and the CURRENT plane bundle begins `var __defProp = Object.defineProperty;`
     because the graph now pulls esbuild's interop preamble in ahead of any
     module. The arm kept passing only because `release/` still held the 0.56.0
     asset cut 2026-08-05; the moment a freshly built plane was published there,
     the plane's own bundle stopped being recognised and was counted as a
     CONSUMER of its own code. Recognised structurally at byte 0, still never by
     name, and now by EITHER opening shape. The member bundles match the same
     way and are excluded for the same reason: they inline plane source, so
     counting them would make the plane its own consumer three more times. */
  if (/^var __defProp = Object\.defineProperty;/.test(src)) return "bundler output, esbuild preamble at byte 0";
  if (/^\/\/ [^\n]*\.mjs\n/.test(src) && /var SCHEMA = `/.test(src)) return "bundler output, first line names a module";
  /* ADDED 2026-08-10. `docs/DECIDED.md` is generated by `tools/decided.mjs` and QUOTES
     every ruling in the corpus, so each quoted `op=` claim arrives here a second time
     and gets attributed to the index rather than to the line that made it. Checking a
     derived view is counting one fact twice, and it is the "second place a fact is
     stated" class this repository already refuses everywhere else. The source line is
     still swept where it lives. */
  if (/^<!-- GENERATED by tools\/decided\.mjs/.test(src))
    return "decided.mjs index banner, at byte 0";
  return null;
}

/* D-265: the RAW walk, module-private.  `sweep()` below reads every byte of it and
   must keep working with bare values; the EXPORTED `corpus()` is the wrapper that
   puts the classification on the boundary, because the boundary is where a floor in
   another file can be written. */
function corpusRaw(root = REPO, roots = null) {
  const files = [];
  const skipped = [];
  const stateSkipped = [];
  const bases = roots ? roots.map((r) => join(root, r)) : [root];
  const walk = (d) => {
    let entries;
    try { entries = readdirSync(d); } catch { return; }
    for (const name of entries) {
      /* M0-18: one rule, not a list of spellings. The full ruling is above. */
      if (skipSegment(name)) { skipped.push(relative(root, join(d, name))); continue; }
      const p = join(d, name);
      /* M0-110: a state file is swept by the ledger checks on `coord`, never here (see the import). Before the
         cutover it is a file on `main`, after it a one-line pointer; skipped in both, so the battery's figures
         do not move at the cutover and a coord write cannot move them. */
      if (isMovedPath(relative(root, p).split("\\").join("/"))) { stateSkipped.push(relative(root, p)); continue; }
      let st;
      try { st = lstatSync(p); } catch { continue; }
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) walk(p);
      else if (TEXT_EXT.has(extname(name))) files.push(p);
    }
  };
  for (const b of bases) {
    let st;
    try { st = lstatSync(b); } catch { continue; }
    st.isDirectory() ? walk(b) : files.push(b);
  }
  files.sort();

  const out = [], excluded = [];
  let chars = 0;
  for (const f of files) {
    let body;
    try { body = readFileSync(f, "utf8"); } catch { continue; }
    const why = generatedReason(body);
    if (why) { excluded.push({ rel: relative(root, f), why, chars: body.length }); continue; }
    chars += body.length;
    out.push({ file: f, rel: relative(root, f), body });
  }

  /* ---- M0-18 · WHICH OF THESE FILES ANOTHER CHECKOUT REPRODUCES --------------
   * This walk reads the WORKING TREE and `test/op-claims.test.mjs` FLOORS on what
   * it finds (`files >= 300`, `chars >= 10,000,000`). `refs/stash` is
   * repository-wide across all sixty worktrees of this repository and `git stash
   * push -u` carries untracked files, so a phantom can arrive here from a tree
   * that never wrote it (D-238, measured), and an arrival can only push a floor
   * UP — a floor moved to the figure a contaminated run PRINTED is permanently
   * too high and gets switched off.
   *
   * THIS FUNCTION STILL RETURNS THE WHOLE WORKING TREE, and `sweep()` still reads
   * every byte of it. An `op=` claim written in a file nobody has committed yet
   * is still a false claim and must still be a FINDING — narrowing the sweep
   * would hide exactly the prose a worker is in the middle of writing. Only the
   * FLOOR narrows, and this is the classification that lets it.
   *
   * THIS WAS NOT VISIBLE TO `hygiene.test.mjs`'s class census and that is a
   * finding about the census rather than about this file: the census grades a
   * file by whether IT contains a `readdirSync(`, and here the WALK and the FLOOR
   * live in DIFFERENT FILES. `test/op-claims.test.mjs` performs no walk at all
   * and was never enumerated. */
  const prov = readGitProvenance(root);
  const inCommit = (rel) => prov.inHead === null ? true : prov.inHead.has(rel.split("\\").join("/"));
  const repro = out.filter((x) => inCommit(x.rel));
  const charsRepro = repro.reduce((a, x) => a + x.body.length, 0);
  return { files: out, chars, excluded, skipped, prov, repro, charsRepro };
}

/* D-265 · THE EXPORT BOUNDARY.  Everything above is unchanged; what changes is that
   a consumer in another file can no longer write `corpus().chars >= 10_000_000`
   without the line refusing itself.  The comment block above says in prose that the
   working tree is the unsafe population and `repro` is the safe one — this is that
   sentence made load-bearing instead of advisory, which is D-265's whole shape. */
export function corpus(root = REPO, roots = null) {
  const c = corpusRaw(root, roots);
  return walkResult({
    about: "op-claims corpus() — the whole repository working tree",
    workingTree: { files: c.files, chars: c.chars },
    reproducible: { repro: c.repro, charsRepro: c.charsRepro },
    safe: {
      excluded: [c.excluded, "callers PIN this exactly and name the three members; a phantom "
        + "arriving here makes that assertion RED, never quietly green (D-257's safe direction)"],
      skipped: [c.skipped, "reported and asserted non-empty by CONTENT (the dot-segment rule), "
        + "never floored on its size"],
    },
    data: { prov: c.prov },
  });
}

/* --------------------------------------------------------------- the mentions */

/* `op=<name>`, preceded by a non-identifier character so `stop=`, `crop=` and
   `noop=` cannot match, and NOT followed by a character meaning the token is code
   or a template rather than a name:
     `.` and `(`  — `const q = …, op = q.get("op")` is an ASSIGNMENT, not a mention.
                    That exact shape is live in three `civicos-ui` suites, and it is
                    the matcher false positive that would have made this check noise
                    on day one.
     `$`          — `op=version${act}` builds the name at runtime. It cannot be
                    resolved from source, so it is COUNTED as dynamic and reported
                    rather than guessed at.
   A trailing `-` or `_` is part of no op name anywhere in the table. */
const MENTION = /(^|[^A-Za-z0-9_-])op=([a-z][a-z0-9]*)/g;
const DYNAMIC_NEXT = /[.($]/;

/* THERE IS NO LANGUAGE READING IN THIS MODULE, AND THAT IS A MEASURED DECISION
 * RATHER THAN A SIMPLIFICATION. IT IS THE MOST IMPORTANT PARAGRAPH IN THIS FILE.
 *
 * Two earlier drafts classified a mention from the prose around it, on the reasoning
 * that a sentence saying an op does NOT exist is a different claim from one saying
 * it does — so the check should INVERT rather than switch off. It does not work.
 * Here is the measurement rather than the worry:
 *
 *   Draft 1 — a 220-character window each way, vocabulary including "absent from"
 *   and "does not carry" — classified **141** mentions of ops that DO exist as
 *   claims that they do not.
 *
 *   Draft 2 tightened the window to +110/-40 and cut the vocabulary to phrases read
 *   off real sites in this tree. It still produced **48**, and every one inspected
 *   was noise:
 *     - `publishedcase.test.mjs:10` — "gets NOTHING from op=list, op=search,
 *       op=projection or op=image. A hash that was NEVER EXISTED…" — the negation
 *       is about a HASH.
 *     - `gate-reads.test.mjs:798` — "must be ABSENT FROM their chain exactly as it
 *       is absent from op=list" — the RECORD is absent, not the op.
 *     - `bias.test.mjs:593` — "reached only inside op=ratify, so a caller gets
 *       UNKNOWN OP" — the negation is about a DIFFERENT op in the same clause.
 *     - `MEASUREMENTS.md:320` — `op=audit` on one table row, `unknown op: tasks` on
 *       the next: a rollout-skew measurement, not a claim about existence.
 *
 * **THE VOCABULARY OF NON-EXISTENCE IS THE VOCABULARY THIS REPOSITORY USES FOR
 * ABSENCE OF EVERY KIND**, and no window separates them, because the ambiguity is
 * semantic and not positional. A check built on it fires on correct prose, and a
 * check that cries wolf gets switched off — `VERIFICATION.md`'s own stated reason
 * for not making `--strict` the gate yet. So it was removed rather than tuned.
 *
 * WHAT REPLACES IT IS A LEDGER, and the trade is stated plainly: this instrument
 * cannot tell you WHY a document names a non-op, so a HUMAN says why, ONCE, per
 * (file, name), and the instrument then holds them to it EXACTLY.
 * `REGISTER_UNCLASSIFIED` in `coverage.mjs` is the precedent — pinned BY NAME
 * rather than by count, because a number nobody can falsify trains every session to
 * trust it (D-231/D-233).
 *
 * THE CONSEQUENCE, and it is the honest one: **this check does NOT verify that a
 * stated NON-existence is true.** A document asserting that some named op does not
 * exist is not re-measured on the day somebody builds it. That inversion was
 * attempted, measured at a 100% false-positive rate on this corpus, and abandoned.
 * The LEDGER recovers part of it — a `NEVER` entry fails the day its name appears
 * in OPS — but only for the (file, name) pairs a human has registered.
 */

/* Each ledger kind carries a MECHANICAL assertion, so an entry cannot quietly
   become wrong the way the prose it excuses did:
     DO-PATH   the name must BE a store dispatch key and must NOT be in OPS.
     NEVER     the name must be in NEITHER table.
   Both fail the day the name turns up in OPS. That is the entry's own expiry. */
export const LEDGER_KINDS = ["DO-PATH", "NEVER"];

/* PLANNED: designed, queued, NOT BUILT — registered by NAME rather than by site,
   because a deferred op is legitimately named wherever it is designed and those
   documents are not wrong. SELF-CLEANING: `plannedStale()` fails the day one of
   these turns up in OPS, so an entry cannot outlive the deferral it records. */
/* `airuns` EXPIRED AND WAS REMOVED 2026-08-09 by REC-69, and the removal is this
   mechanism WORKING rather than a chore. The row said *"QUEUE.md's own row says NO
   OP CAN ANSWER THAT QUESTION TODAY"*; `op=airuns` is now in OPS, so the sentence
   the row protected became FALSE and `plannedStale()` failed the build naming
   `airuns` — a registration outliving its deferral, caught in one run.
   THIS IS THE THIRD RATCHET THE PAIR FIRED and the only one nobody predicted: the
   2026-08-08 backout named two (`run-conditions` ARM W3 and `airuns` SWEEP), and
   this one fires only because M0-12 landed between the two attempts. Recorded here
   because "a cross-item ratchet nobody listed" is the finding, not the edit. */
export const PLANNED_OPS = [
  { op: "publishpreflight", why: "the publication pre-flight. DEC-33 DEFERRED it — publication runs through the operator for now — and QUEUE.md carries the deferred row. DEBT D-154/D-155 name its two refusals." },
  /* `content` STOOD HERE AND WAS REMOVED BY REC-83, IN THE SAME COMMIT THAT
     BUILT THE OP — which is the entry doing exactly what it was registered to
     do. The row said its own expiry ("the entry EXPIRES at REC-83's landing,
     when this arm would fail on a PLANNED op that got built"), and
     `plannedStale()` is asserted EMPTY, so leaving it would have turned the
     landing red rather than letting a stale registration sit. Kept as a comment
     rather than deleted silently, because the NEXT worker registering a planned
     op should see that one of them came back. */
  { op: "needs", why: "research/SB-CORE.md GAP-A3 PROPOSES it (or `whoami`) as the publisher of the NEEDS map. A proposal is not a claim that the op exists." },
];

/* THE LEDGER'S STATE HALF (M0-110, M0-116). The op-claims ledger is ONE ledger in TWO files, partitioned by the
   branch its sites live on — never copied. The entries below are the ones whose file is STATE (it lives on `coord`,
   TREE-SHARING.md §1); `tools/coord.mjs` LC-op-claims holds them against the state texts, and it reaches them here.
   Every other entry — the MAIN half, the corpus THIS module's walk sweeps on `main` — is in
   `./op-claims-ledger.mjs`, which ONLY `test/op-claims.test.mjs` imports (M0-116, BOB #27's fix): a ledger naming
   `docs/` files as strings made every importer of this module — 38 units, most of them through `tools/coord.mjs` —
   read as a reader of `MEASUREMENTS.md` to `tools/gates.mjs`, so a measurement landing re-ran them all. Which half an
   entry belongs to is a fact about `isMovedPath`, asserted in `test/op-claims.test.mjs` for both halves; the human
   reason and the EXACT count are the ledger's, stated at the head of `./op-claims-ledger.mjs`. */
export const LEDGER_STATE = [
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "publishcase", n: 3, kind: "DO-PATH",
    why: "REC-58's own released claim, quoting the sentence the item was raised on. Append-only history. DELEGATED to CONDUCT." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "inboxlist", n: 1, kind: "DO-PATH",
    why: "a released claim quoting a suite's op list. Append-only history. DELEGATED to CONDUCT." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "reusedparts", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "reuseverdicts", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "readingnameplan", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "recordsourceoutcome", n: 1, kind: "DO-PATH",
    why: "a CAPTURE delegation naming a DO path as an op. DELEGATED to CAPTURE." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "strength", n: 1, kind: "DO-PATH", why: "quotes UI-35's sentence. DELEGATED to UI." },
  { file: "docs/archive/ledgers/CLAIMS-2026-08.md", name: "basis", n: 1, kind: "DO-PATH", why: "quotes UI-35's sentence. DELEGATED to UI." },
  { file: "docs/archive/ledgers/QUEUE-2026-08.md", name: "publishcase", n: 6, kind: "DO-PATH",
    why: "M0-12's OWN scope and REC-58's landed row. QUEUE.md is CONDUCT's sole-writer file. DELEGATED to CONDUCT." },
  { file: "docs/archive/ledgers/QUEUE-2026-08.md", name: "recordsourceoutcome", n: 1, kind: "DO-PATH",
    why: "a CAPTURE queue row naming a DO path as an op. DELEGATED to CONDUCT/CAPTURE." },
  { file: "docs/archive/ledgers/DECISIONS-2026-08.md", name: "import", n: 1, kind: "NEVER",
    why: "DEC prose whose subject is that IMPORT DOES NOT EXIST. The name must stay absent."
       + " Entry followed its DEC into the 2026-08-10 ledger roll." },
];

/* Attribution: a mention that says WHERE the op goes — the load-bearing half of
 * M0-12, because a check that only verified a name existed would have passed
 * IC-22's sentence about routing.
 *
 * THE PARENTHESES ARE MANDATORY AND THAT IS THE WHOLE GRAMMAR. Without them the
 * first draft read a sentence of the form "the <op> call is routed to the Durable
 * Object" and recorded the claim *"<op> dispatches to the()"* — an attribution
 * nobody made, against a method nobody named, in three separate files. A method in
 * this
 * repository's prose is written `publishCase()` or `Store.publishCase()`; a noun
 * phrase is not. Requiring the call spelling is what separates them, and it is a
 * narrowing rather than a widening, so it carries a reach arm. */
const ATTRIBUTION =
  /\b(?:dispatch(?:es|ed)?\s+to|routes?\s+to|routed\s+to|is\s+dispatched\s+to)\s+`?(?:Store\.)?([A-Za-z_][A-Za-z0-9_]*)\(\)`?/i;
export const ATTRIBUTION_WINDOW = 160;

/* Every `op=<name>` in one file, with the line it sits on and any method it is
   claimed to route to. NO classification from prose — see the note above. */
export function mentionsIn(body) {
  const out = [];
  let m;
  MENTION.lastIndex = 0;
  while ((m = MENTION.exec(body))) {
    const name = m[2];
    const at = m.index + m[1].length;
    const next = body[at + 3 + name.length] ?? "";
    if (DYNAMIC_NEXT.test(next)) { out.push({ name, at, kind: "DYNAMIC" }); continue; }
    const line = body.slice(0, at).split("\n").length;
    const tail = body.slice(at, at + name.length + 3 + ATTRIBUTION_WINDOW);
    const a = ATTRIBUTION.exec(tail);
    out.push({ name, at, line, kind: "CLAIM", attributed: a ? a[1] : null });
  }
  return out;
}

/* ---------------------------------------------------------------- the verdict */

/* M0-116: `ledger` is the ledger this walk is HELD to, and it is PASSED — never defaulted to the main half, because
   defaulting to it means importing it, and every importer of this module then reads as a reader of every file the
   ledger names (see `./op-claims-ledger.mjs`). The whole-tree scan passes `LEDGER_MAIN` (`test/op-claims.test.mjs`);
   the coord check passes the state half. Omitted, it is EMPTY: nothing excused, so every ledgered site in the swept
   population is a FINDING — the loud direction, never a quiet green. The narrow sweeps that omit it (`hygiene`,
   `walkfigure`: `bio-plane/scripts`) hold no ledgered site. */
export function sweep({ root = REPO, roots = null, planeDir = PLANE,
                        ledger = [], planned = PLANNED_OPS, files: injected = null } = {}) {
  const table = readDispatch(planeDir);
  /* M0-18: `files` is the WHOLE working tree and every byte of it is swept —
     `repro`/`charsRepro` exist so the caller can FLOOR on what another checkout
     reproduces without narrowing what is checked. The two are deliberately
     different populations; see `corpus()`. */
  /* M0-110: `files` INJECTED ([{ rel, body }]) is the state texts the coord ledger check hands in — the same
     judgement over a population this walk no longer reaches, never a second copy of it. */
  const { files, chars, excluded, skipped, prov, repro, charsRepro } = injected
    ? { files: injected, chars: injected.reduce((n, f) => n + f.body.length, 0), excluded: [], skipped: [],
        prov: { inHead: null, headSha: null }, repro: injected, charsRepro: injected.reduce((n, f) => n + f.body.length, 0) }
    : corpusRaw(root, roots);

  const plannedNames = new Set(planned.map((p) => p.op));
  const ledgerIndex = new Map(ledger.map((e) => [`${e.file} ${e.name}`, e]));
  const seen = new Map();          // ledger key -> count actually found

  const findings = [];
  const attributions = [];
  let mentions = 0, dynamic = 0, offLedger = 0;
  const names = new Set();

  /* D-302 · ONE MECHANISM, TWO POPULATIONS. The attribution a mention STATES is
     resolved against the dispatch table here and nowhere else, because the whole
     working tree and the HEAD-reproducible subset are both about to ask the same
     question and a second copy of this rule is the thing that goes stale. The
     copy that already existed in this function — the `mentionsRepro` recount
     below — is the receipt: it was written as a second loop precisely so the
     sweep's control arms kept reading one population, and adding an attribution
     count to it by hand would have been the second copy. */
  const attributionOf = (site, mt) => {
    const actual = table.ops.has(mt.name) ? routeOf(mt.name, table).method
      : table.routes.get(mt.name) ?? null;
    const ok = actual != null && mt.attributed.toLowerCase() === actual.toLowerCase();
    return { site, name: mt.name, stated: mt.attributed, actual, ok };
  };

  for (const f of files) {
    for (const mt of mentionsIn(f.body)) {
      if (mt.kind === "DYNAMIC") { dynamic++; continue; }
      mentions++;
      names.add(mt.name);
      const site = `${f.rel}:${mt.line}`;

      /* --- the attribution half, checked for EVERY mention, ledgered or not.
             A registered non-op may still be attributed to the wrong method. */
      if (mt.attributed) {
        const a = attributionOf(site, mt);
        attributions.push(a);
        if (!a.ok) findings.push({ site, name: mt.name, class: "WRONG-METHOD",
          detail: `the prose says op=${mt.name} dispatches to ${mt.attributed}(); the dispatch table routes it to ${a.actual ?? "NOTHING"}()` });
      }

      if (table.ops.has(mt.name)) continue;
      if (plannedNames.has(mt.name)) continue;

      const key = `${f.rel} ${mt.name}`;
      if (ledgerIndex.has(key)) { seen.set(key, (seen.get(key) ?? 0) + 1); continue; }

      offLedger++;
      /* The wrong-level class, and it is IC-22's exactly: the name IS in the
         dispatch table, one level down, where no `op=` reaches it. */
      if (table.routes.has(mt.name)) {
        const reach = opReaching(mt.name, table);
        findings.push({ site, name: mt.name, class: "WRONG-LEVEL",
          detail: `op=${mt.name} names the store's DO path '${mt.name}' (routed to ${table.routes.get(mt.name)}()), not an op. `
                + (reach ? `The op that reaches it is op=${reach}.` : "NO op reaches it: it is DO-internal.") });
      } else {
        findings.push({ site, name: mt.name, class: "NO-SUCH-OP",
          detail: `op=${mt.name} is in neither the OPS whitelist nor the store's dispatch map` });
      }
    }
  }

  /* --- the ledger held to EXACTLY, in both directions --- */
  const ledgerDrift = [];
  for (const e of ledger) {
    const key = `${e.file} ${e.name}`;
    const got = seen.get(key) ?? 0;
    if (got !== e.n)
      ledgerDrift.push(`${e.file} · op=${e.name}: ledger says ${e.n}, corpus has ${got}`
        + (got === 0 ? " — the entry is STALE, remove it" : " — write the measured number"));
    if (!LEDGER_KINDS.includes(e.kind))
      ledgerDrift.push(`${e.file} · op=${e.name}: unknown kind '${e.kind}'`);
    /* Each kind's own mechanical assertion — the entry's expiry date. */
    if (table.ops.has(e.name))
      ledgerDrift.push(`${e.file} · op=${e.name}: the ledger excuses it as ${e.kind}, but OPS NOW DECLARES IT — the prose may have become true, or wrong; re-read it`);
    else if (e.kind === "DO-PATH" && !table.routes.has(e.name))
      ledgerDrift.push(`${e.file} · op=${e.name}: registered DO-PATH but the store's dispatch map has no such route`);
    else if (e.kind === "NEVER" && table.routes.has(e.name))
      ledgerDrift.push(`${e.file} · op=${e.name}: registered NEVER but it IS a store dispatch route — it is DO-PATH`);
  }

  const plannedBuilt = planned.filter((p) => table.ops.has(p.op)).map((p) => p.op);

  /* M0-18: `mentions` is over the whole tree; `mentionsRepro` is the same count
     restricted to files in the commit, because `test/op-claims.test.mjs` floors
     on it too. Computed here rather than in the loop so the sweep's own control
     arms keep reading one population. */
  /* D-302 · `attributionsRepro` IS COMPUTED HERE FOR THE SAME REASON THE THREE
     FIGURES BESIDE IT ARE, and the reason is the one D-238 paid for. The
     attribution half's non-vacuity floor in `test/op-claims.test.mjs` was the
     FIFTH walk-derived floor D-268 found, and it was the only one of the five
     still standing over the WORKING TREE: `refs/stash` is repository-wide across
     every worktree of this repository and `git stash push -u` carries untracked
     files, so a routing claim in a file nobody committed arrives here from a tree
     that never wrote it and can only push that floor UP. D-265 made the exposure
     VISIBLE — the site unwrapped through the chokepoint with the reason written
     beside it — but could not close it, because producing this figure changes
     what the walk COMPUTES and that was outside its claim. This is that change,
     and it is four lines.
     THE SWEEP IS STILL OVER THE WHOLE WORKING TREE AND STILL FINDS EVERY WRONG
     ATTRIBUTION IN IT. `attributions` is unchanged, `findings` is unchanged: a
     prose claim routing an op to the wrong method is a FINDING wherever the file
     came from, and narrowing that would hide exactly the sentence a worker is in
     the middle of writing. Only the FLOOR narrows. */
  const reproRels = new Set(repro.map((f) => f.rel));
  let mentionsRepro = 0;
  const namesRepro = new Set();
  const attributionsRepro = [];
  for (const f of files) {
    if (!reproRels.has(f.rel)) continue;
    for (const mt of mentionsIn(f.body)) {
      if (mt.kind === "DYNAMIC") continue;
      mentionsRepro++; namesRepro.add(mt.name);
      if (mt.attributed) attributionsRepro.push(attributionOf(`${f.rel}:${mt.line}`, mt));
    }
  }
  /* D-265 · THE EXPORT BOUNDARY.  Every KEY below is the one M0-12 and M0-18 named
     and nothing is renamed, removed or re-populated — `test/op-claims.test.mjs`
     pins them.  What changes is that the six WORKING-TREE figures now carry their
     classification, so a floor written on one in ANY other file refuses itself
     where it is written.  The `*Repro` figures stay bare on purpose: flooring
     on them is the CORRECT act, and making the right thing awkward is how a check
     gets switched off.
     D-302 ADDED THE FIFTH REPRODUCIBLE FIGURE, `attributionsRepro`, and it is the
     PAIR of `attributions` in exactly the way `filesRepro` is the pair of `files`.
     Five reproducible figures now, four working-tree ones that still have no pair
     (`dynamic`, `offLedger`, `mentions`' own names set is paired) — and that is not
     an omission: nothing floors on them, and a pair produced for a figure no floor
     reads is a mechanism believed on its existence. */
  return walkResult({
    about: "op-claims sweep() — the whole repository working tree",
    workingTree: { files: files.length, chars, mentions, dynamic, offLedger,
                   names: [...names].sort(), attributions },
    reproducible: { filesRepro: repro.length, charsRepro,
                    mentionsRepro, namesRepro: [...namesRepro].sort(),
                    attributionsRepro },
    safe: {
      excluded: [excluded, "PINNED exactly by its callers and named member by member; "
        + "a phantom makes that assertion RED rather than quietly green"],
      findings: [findings, "asserted EMPTY — a false op claim in an uncommitted file is "
        + "still a false claim and must still fail; narrowing this would hide it"],
      ledgerDrift: [ledgerDrift, "asserted EMPTY; drift arriving from anywhere at all is "
        + "the finding, so the unsafe direction is not available here"],
      plannedBuilt: [plannedBuilt, "asserted EMPTY; a planned op that has been built is a "
        + "finding wherever the file came from"],
      skipped: [skipped, "reported and asserted by CONTENT (the dot-segment rule), never "
        + "floored on its size"],
    },
    data: { table, prov },
  });
}
