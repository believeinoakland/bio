/* m0187-surfacing-fixture.control.mjs — the NEGATIVE CONTROL for `test/m0187-surfacing-fixture.test.mjs` (M0-187).
 *
 * Deliberately NOT a `.test.mjs`: it runs the suite against ARMED COPIES of `test/surfacing-run.mjs` and of `src/`,
 * and the battery must not discover it. Run from `bio-plane/`: `node test/m0187-surfacing-fixture.control.mjs [arm]`.
 * The shape is `rec171-surface-token.control.mjs`'s: every arm patches a COPY in a fresh temporary tree, asserting
 * its anchor occurs EXACTLY ONCE (or the arm reports that it did not arm), runs the real suite against the copy, and
 * compares the failing arms — and, where the whole point is WHICH CAUSE REACHED THE READER, the text of the run —
 * with what was DECLARED before arming. The real sources are hashed before and after; nothing real is ever edited.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "m0187-surfacing-fixture.test.mjs");
const FIXTURE = "bio-plane/test/surfacing-run.mjs";
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["test/surfacing-run.mjs", "src/index.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE SUBJECT, both halves of it. */
const TITLE = "      meta: { object_type: \"project\", title: `REC-171 fixture project ${nth} (${store || \"bio\"})`,";
const SHARED_TITLE = "      meta: { object_type: \"project\", title: `REC-171 fixture project`,";
const UUID_TITLE = "      meta: { object_type: \"project\", title: `REC-171 fixture project ${crypto.randomUUID()}`,";
const NO_SWALLOW = "    if (!runs.has(key)) runs.set(key, openRun(token, store, group));";
const SWALLOW = "    if (!runs.has(key)) runs.set(key, openRun(token, store, group).catch(() => null));";
const TOLERATED = "const NO_SURFACING_MACHINERY = new Set([\"UNKNOWN_OP\", \"unknown op\", \"AI_RUN_BOUND_UNKNOWN\"]);";
const TOLERATE_NOTHING = "const NO_SURFACING_MACHINERY = new Set([]);";
/* THE PLANE WITHOUT THE MACHINERY: the `surfaces` bound gone from the run's bound table, which is what a suite built
   from sources older than REC-171 has. `op=airunopen` then refuses AI_RUN_BOUND_UNKNOWN. */
/* ASCII ONLY, and for a reason: the tree is patched BYTE-WISE (`latin1`), so an anchor carrying `§` or an em dash
   matches nothing — measured, the first spelling of this anchor occurred ZERO times and the arm would have reported
   itself unarmed. The key is RENAMED rather than the row deleted, which is the smaller edit and leaves the text. */
const SURFACES_BOUND = "\n  surfaces:    \"questions an assistant opened inside this run (";
const SURFACES_GONE  = "\n  surfacesGONE: \"questions an assistant opened inside this run (";

const A2 = "ARM 2 (SECOND TOKEN", A4 = "ARM 4 (THE STORE", A5 = "ARM 5:", A6 = "ARM 6:";
const A1 = "ARM 1 (FIRST TOKEN", A3 = "ARM 3 (THIRD TOKEN", A8 = "ARM 8:";
const A2B = "ARM 2: and it is NOT", A7 = "ARM 7a";
const AIRUN = "bio-plane/src/airun.mjs";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: the fixture project's title back to the constant it was. The SECOND token in a store can no
     longer create its own, and — this is the item — the cause REACHES THE READER: the arm's own FAIL line says
     NAME_TAKEN, where before it said SURFACE_NO_RUN. */
  "shared-title": { patches: [[FIXTURE, TITLE, SHARED_TITLE]],
                    mustFail: [A2, A4, A5], mustContain: ["THREW NAME_TAKEN"] },

  /* THE OTHER HALF ALONE: the swallow restored, titles still unique. Nothing about the row's two-token arms moves —
     only the naming does, so ARM 6 alone falls. */
  swallow: { patches: [[FIXTURE, NO_SWALLOW, SWALLOW]], mustFail: [A6] },

  /* THE TREE AS IT STOOD (both halves restored) — not a control arm but the REPRODUCTION of the shipped defect:
     the second token's question is refused SURFACE_NO_RUN and NOTHING names NAME_TAKEN anywhere in the run. */
  "as-it-stood": { patches: [[FIXTURE, TITLE, SHARED_TITLE], [FIXTURE, NO_SWALLOW, SWALLOW]],
                   mustFail: [A2, A4, A5, A6], mustContain: ["SURFACE_NO_RUN"], mustNotContain: ["NAME_TAKEN"] },

  /* OVER-STRICTNESS: the same uniqueness in a spelling this item did not write. Nothing may fail. */
  "unique-by-uuid": { patches: [[FIXTURE, TITLE, UUID_TITLE]], mustFail: [] },

  /* THE ONE TOLERATED CONDITION, DRIVEN: a plane with no `surfaces` bound is a plane without the machinery, so the
     creation goes through BYTE-UNCHANGED and the plane's own SURFACE_NO_RUN stands. The landings fall; ARM 6 does
     NOT — the tolerance must not disarm the by-name raise — and nothing THREW. */
  "no-machinery": { patches: [[AIRUN, SURFACES_BOUND, SURFACES_GONE]],
                    mustFail: [A1, A2, A2B, A3, A4, A5, A7, A8],
                    mustContain: ["SURFACE_NO_RUN"], mustNotContain: ["THREW"] },

  /* AND THE TOLERANCE IS LOAD-BEARING: the same plane with the tolerated set emptied. The same arms fall, but now by
     a THROW — which is how the pass-through is shown to be the tolerance's doing and not an accident. */
  "no-machinery-strict": { patches: [[AIRUN, SURFACES_BOUND, SURFACES_GONE], [FIXTURE, TOLERATED, TOLERATE_NOTHING]],
                           mustFail: [A1, A2, A2B, A3, A4, A5, A7, A8],
                           mustContain: ["THREW AI_RUN_BOUND_UNKNOWN"] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `m0187-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(PLANE, "test", "surfacing-run.mjs"), join(tree, FIXTURE));
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], {
      env: { ...process.env, M0187_SRC: join(tree, "bio-plane", "src"), M0187_FIXTURE: join(tree, FIXTURE) },
      encoding: "utf8", maxBuffer: 64 << 20 });
    const out = (r.stdout || "") + (r.stderr || "");
    const tally = /m0187-surfacing-fixture: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    /* WHAT THE CAUSE-NAMING IS READ FROM: every line that is NOT a PASS/FAIL label — the `want`/`got` pairs, the
       section headings and any SUITE ERROR. The labels are excluded because THEY QUOTE THE NAMES BEING LOOKED FOR
       (ARM 2's own text says NAME_TAKEN), and a check that matches its own wording cannot fail. */
    const said = out.split("\n").filter((l) => !/^\s+(PASS|FAIL)\s/.test(l)).join("\n");
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    const absent = (arm.mustContain || []).filter((m) => !said.includes(m));
    const present = (arm.mustNotContain || []).filter((m) => said.includes(m));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             absent, present,
             asDeclared: !!tally && !missing.length && !unexpected.length && !absent.length && !present.length };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : "")
    + (r.absent.length ? `\n      declared to be NAMED in the failures and was not: ${JSON.stringify(r.absent)}` : "")
    + (r.present.length ? `\n      declared ABSENT from the failures and was there: ${JSON.stringify(r.present)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
