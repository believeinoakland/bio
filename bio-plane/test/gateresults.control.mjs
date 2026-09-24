#!/usr/bin/env node
/* M0-126's NEGATIVE CONTROL DRIVER — fifteen arms plus a baseline — over `tools/gates.mjs`, `tools/gateresults.mjs`, the
 * `gate-results` arm of `tools/pushguard.mjs` and the gate step of `.github/workflows/gates.yml`, each driven through
 * `bio-plane/test/gateresults.test.mjs`.
 *
 *   node bio-plane/test/gateresults.control.mjs          (from the repo root; one arm: add its id, e.g. R1)
 *
 * Every arm is armed ALONE against pristine copies kept in `.m0126-harness/` (gitignored), and every restore is verified
 * by sha256 AND `cmp` AND a floored byte count — never `git checkout --`. No arm touches a ref, a remote or this
 * repository's tree beyond the four subject files: the suite builds its own repositories under the battery's temp
 * ground. An exit hook restores an armed file on EVERY exit before it removes the pristine copies by name.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *   R1  ONE FILE DROPPED from a unit's input set      -> "...and it names NO under-inclusion" FAILS (condition 2 names
 *       (§3a's own negative control: every `data/`       the unit and the file) and machine A reads RED. MUST NOT: the
 *       path leaves every key)                           liar arm's backstop.
 *   R2  the lookup's PASS ignored (nothing reused)    -> "...and it REUSED every cacheable unit" FAILS. MUST NOT:
 *                                                        machine A GREEN.
 *   R3  the key IGNORES the inputs (the liar: a key   -> "a data file ONE suite reads: only that suite" FAILS. MUST
 *       that never moves reuses everything)              NOT: machine B's reuse (identical inputs reuse either way).
 *   R4  the never-cache marker ignored               -> "a never-cached unit runs EVERY time" FAILS. MUST NOT: the
 *                                                        one-input-change arm's REUSED set.
 *   R5  a revocation ignored by the reader           -> "...and the next ordinary gate RUNS beta (REVOKED" FAILS. MUST
 *                                                        NOT: the backstop.
 *   R6  `--no-reuse` ignored (the backstop reuses)    -> "THE BACKSTOP catches it" FAILS. MUST NOT: the lie succeeding.
 *   R7  the guard's append-only arm lets a MODIFY by  -> "a record MODIFIED on gate-results is REFUSED" FAILS. MUST NOT:
 *                                                        the deletion refusal.
 *   R8  the trace comparison disabled (condition 2)   -> "...and the failure NAMES the unit and the file" FAILS. MUST
 *                                                        NOT: machine A GREEN.
 *   R9  the FULL runtime set dropped from a plane     -> "a plane RUNTIME file: every plane and fleet unit runs" FAILS
 *       key (the read no trace can see: workerd)         — the trace cannot catch it, which is why §3a requires the
 *                                                        set. MUST NOT: the data-file arm.
 *   R10 a DECLARED read ignored (`GATE: reads`)       -> "OVER-STRICTNESS: the read DECLARED" FAILS. MUST NOT: the
 *                                                        undeclared read still FAILS by name.
 *   R11 the GitHub run back on the DERIVED class      -> "the run on `main` gates EVERY unit" FAILS. MUST NOT: the
 *                                                        record-off line.
 *   R12 a run that REUSED units written as a          -> "machine B's FULL runs … NEVER a backstop" FAILS. MUST NOT:
 *       backstop (BOB #30's liar)                        machine A's no-reuse run is still one.
 *   R13 the backstop reader trusts the words and      -> "...the same record with its class and flag EDITED … NOT a
 *       never reads the steps                            backstop" FAILS. MUST NOT: the honest one-reused record.
 *   R14 a git-HISTORY read ignored (BOB #30)         -> "a suite that runs `git log` … FAILS by name" FAILS. MUST NOT:
 *                                                        no under-inclusion.
 *   R15 the tree-keyed GREEN shortcut taken again    -> "...a PLAIN gate on that same GREEN tree still RUNS the
 *                                                        never-cached unit" FAILS. MUST NOT: never-cached runs every time.
 *   R16 M0-179's own: the reuse arm's refusal of a    -> "the next gate REUSES NOTHING" FAILS, and with it the three
 *       non-descending tip REMOVED                      assertions reuse CARRIES (teeth, the write, does-not-heal).
 *                                                       MUST NOT: the over-strictness arm, the guard's arms, descentOf.
 *   R17 the JUDGEMENT disarmed — every tip reads as   -> "descentOf names FOUR outcomes" FAILS, and with it the reuse
 *       descending                                      refusal, the write refusal and the does-not-heal arm. MUST NOT:
 *                                                       the over-strictness arm.
 *   R18 OVER-STRICTNESS — the fence tightened to      -> "OVER-STRICTNESS: another machine's ordinary APPEND" FAILS: an
 *       demand EQUALITY of tip and record               honest append refused is a fence tighter than its rule. MUST
 *                                                       NOT: the refusal of the planted tip, which is still right.
 * Every arm asserts its DOWNSTREAM failure, never merely its patch count.
 */
import { readFileSync, writeFileSync, mkdtempSync, statSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
/* THE PEN IS OUTSIDE THE WORKTREE — moved there 2026-09-24 by M0-179, under BOB #32's ruling of the same day: a
   scratch file in the worktree is not inert even when gitignored (`.m0126-harness/` was), because repository-walking
   suites walk it, it trips `gates.mjs` §2e's under-inclusion check, and it makes the tree DIRTY, so D-293 refuses to
   record a GREEN verdict. `mkdtemp` also names the copies for THIS run, which a fixed directory did not: the ruling's
   other half is that the scratch ground is not isolated between sessions. */
const PEN = mkdtempSync(join(tmpdir(), "m0126-harness-"));
const GATES = join(REPO, "tools/gates.mjs");
const RESULTS = join(REPO, "tools/gateresults.mjs");
const GUARD = join(REPO, "tools/pushguard.mjs");
const SUITE = join(REPO, "bio-plane/test/gateresults.test.mjs");
const ONLY = process.argv.slice(2).filter((a) => /^R\d+$/.test(a));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const WORKFLOW = join(REPO, ".github/workflows/gates.yml");
const SUBJECTS = [GATES, RESULTS, GUARD, WORKFLOW].map((file) => {
  const copy = join(PEN, `pristine.${file.split("/").pop()}`);
  writeFileSync(copy, readFileSync(file));
  return { file, copy, sha: sha(file), bytes: statSync(file).size };
});
const MIN_BYTES = 4000;
for (const s of SUBJECTS) console.log(`  pristine ${s.file.slice(REPO.length + 1)}: ${s.bytes} bytes, sha256 ${s.sha.slice(0, 8)}…`);
function restoreAll() {
  let ok = true;
  for (const s of SUBJECTS) {
    if (existsSync(s.copy)) writeFileSync(s.file, readFileSync(s.copy));
    const got = sha(s.file), size = statSync(s.file).size;
    const cmp = existsSync(s.copy) && spawnSync("cmp", ["-s", s.file, s.copy]).status === 0;
    const same = got === s.sha && cmp && size === s.bytes && size >= MIN_BYTES;
    if (!same) ok = false;
    console.log(`  restored ${s.file.slice(REPO.length + 1)}: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
      + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${same ? "YES" : "NO"}`);
  }
  return ok;
}
let armed = false;
let penRemoved = false;
function onExit() {
  if (armed) { console.log("  EXIT HOOK: an arm was live — restoring before exit"); restoreAll(); armed = false; }
  if (penRemoved) return;
  penRemoved = true;
  if (SUBJECTS.every((s) => sha(s.file) === s.sha)) for (const s of SUBJECTS) { try { unlinkSync(s.copy); } catch { /* gone */ } }
}
process.on("exit", onExit);
for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]]) process.on(sig, () => { onExit(); process.exit(code); });

function armPatches(patches) {
  const hits = [];
  armed = true;
  for (const { file, from, to } of patches) {
    const before = readFileSync(file, "utf8");
    const n = before.split(from).length - 1;
    hits.push(n);
    if (n === 1) writeFileSync(file, before.replace(from, () => to));
  }
  return hits;
}
const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: join(REPO, "bio-plane"), encoding: "utf8", maxBuffer: 1 << 26 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/^gateresults: (\d+) pass, (\d+) fail$/m);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, reachedFoot: /PASS {2}FOOT/.test(out),
           status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
const collateral = (s) => broke(s, "the fixture carries the REAL");

const ARMS = [
  { id: "R1", title: "ONE FILE DROPPED from a unit's input set (§3a's negative control)",
    patches: [{ file: GATES, from: "    else if (U.set.has(d)) out.add(d);\n  }\n  return out;",
      to: "    else if (U.set.has(d)) out.add(d);\n  }\n  for (const p of [...out]) if (p.startsWith(\"data/\")) out.delete(p);\n  return out;" }],
    mustBreak: "...and it names NO under-inclusion", alsoBreak: ["machine A's FULL gate is GREEN"],
    mustNotBreak: ["THE BACKSTOP catches it"] },
  { id: "R2", title: "the lookup's PASS ignored — nothing is reused",
    patches: [{ file: GATES, from: "if (f.state === \"PASS\") REUSED.set(id,", to: "if (false && f.state === \"PASS\") REUSED.set(id," }],
    mustBreak: "...and it REUSED every cacheable unit", mustNotBreak: ["machine A's FULL gate is GREEN"] },
  { id: "R3", title: "the key IGNORES the inputs — the liar: a key that never moves",
    patches: [{ file: RESULTS, from: "  for (const p of [...inputs].sort()) lines.push(`${blobs.get(p) || \"MISSING\"} ${p}`);\n", to: "" }],
    mustBreak: "a data file ONE suite reads: only that suite", mustNotBreak: ["...and it REUSED every cacheable unit"] },
  { id: "R4", title: "the never-cache marker ignored",
    patches: [{ file: GATES, from: "const m = NEVER_RE.exec(textOf(t) || \"\"); if (m) return m[1];", to: "const m = null; if (m) return m[1];" }],
    /* CORRECTED after its first run, never exempted: this arm declared "...and the rest are REUSED" must NOT fail, and
       it did fail — with the marker ignored the clock suite earns a PASS and is REUSED too, so the reused set grows by
       one. The declaration was wrong about the arm, not the arm about the subject. */
    mustBreak: "a never-cached unit runs EVERY time", alsoBreak: ["...and the rest are REUSED"],
    mustNotBreak: ["machine A's FULL gate is GREEN"] },
  { id: "R5", title: "a revocation ignored by the reader",
    patches: [{ file: RESULTS, from: "if (have.has(vp)) {", to: "if (false && have.has(vp)) {" }],
    mustBreak: "...and the next ordinary gate RUNS beta (REVOKED", mustNotBreak: ["THE BACKSTOP catches it"] },
  { id: "R6", title: "`--no-reuse` ignored — the backstop reuses",
    patches: [{ file: GATES, from: "const NO_REUSE = ARGV.includes(\"--no-reuse\");", to: "const NO_REUSE = false;" }],
    mustBreak: "THE BACKSTOP catches it", mustNotBreak: ["THE LIE SUCCEEDS where it sits"] },
  { id: "R7", title: "the guard's append-only arm lets a record be MODIFIED",
    patches: [{ file: GUARD, from: "if (st !== \"A\") bad.push(", to: "if (false) bad.push(" }],
    mustBreak: "a record MODIFIED on gate-results is REFUSED", mustNotBreak: ["a DELETION of gate-results is REFUSED"] },
  { id: "R8", title: "the trace comparison disabled — condition 2 off",
    patches: [{ file: GATES, from: "const miss = [...t].filter((p) => U.set.has(p) && !KEYS.get(id).inputs.has(p)).sort();", to: "const miss = [];" }],
    mustBreak: "...and the failure NAMES the unit and the file its key does not cover", mustNotBreak: ["machine A's FULL gate is GREEN"] },
  { id: "R9", title: "the FULL runtime set dropped from a plane key — the read no trace can see",
    patches: [{ file: GATES, from: "if (unit.kind === \"plane\" || unit.kind === \"fleet\") for (const p of runtimeSet()) out.add(p);", to: "" }],
    mustBreak: "a plane RUNTIME file: every plane and fleet unit runs", mustNotBreak: ["a data file ONE suite reads: only that suite"] },
  { id: "R10", title: "a DECLARED read ignored (`GATE: reads`)",
    patches: [{ file: GATES, from: "  for (const d of declaredReads(unit)) {", to: "  for (const d of []) {" }],
    mustBreak: "OVER-STRICTNESS: the read DECLARED", mustNotBreak: ["...and the failure NAMES the unit and the file its key does not cover"] },
  { id: "R11", title: "the GitHub run back on the DERIVED class (DOCS on main: the backstop that ran nothing)",
    patches: [{ file: WORKFLOW, from: "          GATE_FULL: --full\n",
      to: "          GATE_FULL: ${{ github.event_name == 'workflow_dispatch' && '--full' || '' }}\n" }],
    mustBreak: "the run on `main` gates EVERY unit", mustNotBreak: ["...and it neither reuses nor writes a per-unit record"] },
  { id: "R12", title: "a run that REUSED units written as a backstop (BOB #30's liar)",
    patches: [{ file: GATES, from: "backstop: cls === \"FULL\" && REUSED.size === 0 && SINCE === null,", to: "backstop: cls === \"FULL\" || cls === \"FULLREUSE\"," }],
    mustBreak: "machine B's FULL runs, which reused units, are FULLREUSE and NEVER a backstop",
    mustNotBreak: ["machine A's FULL run, which REUSED NOTHING, is recorded FULL with backstop:true"] },
  { id: "R13", title: "the backstop reader trusts the record's words and never reads its steps",
    patches: [{ file: GUARD, from: "    && Array.isArray(run.steps) && !run.steps.some((s) => s && s.reused);", to: ";" }],
    mustBreak: "...and the same record with its class and flag EDITED to FULL/true still reads NOT a backstop",
    mustNotBreak: ["...and a FULL run that reused ONE unit is FULLREUSE, backstop:false"] },
  { id: "R14", title: "a git-HISTORY read ignored (BOB #30, condition 1)",
    patches: [{ file: GATES, from: "if (h.length) { historyRead.set(id, h);", to: "if (false) { historyRead.set(id, h);" }],
    mustBreak: "a suite that runs `git log` over this checkout FAILS by name", mustNotBreak: ["...and it names NO under-inclusion"] },
  { id: "R15", title: "the tree-keyed GREEN shortcut taken again with the per-unit record on (a record answering for a never-cached unit)",
    patches: [{ file: GATES, from: "if (covering && eff.verdict === \"GREEN\" && !PER_UNIT_ON) {", to: "if (covering && eff.verdict === \"GREEN\") {" }],
    mustBreak: "...and a PLAIN gate on that same GREEN tree still RUNS the never-cached unit", mustNotBreak: ["a never-cached unit runs EVERY time"] },
  /* M0-179's three arms. The row's own control is R16 — "plant a non-descending tip in a fixture and the reuse arm
     refuses it by name" — and the suite plants the tip; R16 takes the refusal away and watches the assertion fail.
     R17 disarms the JUDGEMENT rather than the refusal, which is the deeper half. R18 is the over-strictness arm the
     other two cannot supply: a fence made TIGHTER than its rule is not a safer fence, so an ordinary append that the
     check refuses must FAIL a named assertion too. */
  { id: "R16", title: "M0-179 · the reuse arm reuses from a tip the record does not descend from (the refusal removed)",
    patches: [{ file: GATES, from: "else if (!GR.descentHolds(grFetch)) RESULT_NOTES.push(",
      to: "else if (false && !GR.descentHolds(grFetch)) RESULT_NOTES.push(" }],
    /* THE FRAGMENTS ARE THE LABELS' STABLE MIDDLES, not their full text. Found by this arm's second run: the labels
       were reworded when the arm itself was corrected, and a stale fragment makes `mustBreak` fail loudly — but makes
       `mustNotBreak` PASS SILENTLY, because a fragment matching no label can never be found among the failures. R18's
       read as isolated on exactly that. A check that cannot fail is worse than none (`VERIFICATION.md`).
       ALSO DECLARED after the corrected arm's run, and not smoothed: taking the reuse refusal away breaks three more
       assertions, each a CONSEQUENCE of the reuse it restores — the planted tip's PASSes are reused, so the units do
       not RUN (the teeth arm), the gate has no new pass to write so the writer never reaches its own refusal (the
       write arm), and the next gate reuses too (the does-not-heal arm). */
    mustBreak: "the next gate REUSES NOTHING",
    alsoBreak: ["...and the refusal has TEETH", "...and NOTHING is written onto that tip either",
      "...and the refusal DOES NOT HEAL ITSELF"],
    mustNotBreak: ["OVER-STRICTNESS: another machine's ordinary APPEND", "the guard refuses a STALE BASE",
      "descentOf names FOUR outcomes"] },
  { id: "R17", title: "M0-179 · the JUDGEMENT disarmed — every tip reads as descending",
    patches: [{ file: RESULTS, from: "  if (!prior) return { descent: \"first\" };",
      to: "  if (true) return { descent: \"ok\" };\n  if (!prior) return { descent: \"first\" };" }],
    mustBreak: "descentOf names FOUR outcomes",
    alsoBreak: ["the next gate REUSES NOTHING", "...and the refusal has TEETH",
      "...and NOTHING is written onto that tip either", "...and the refusal DOES NOT HEAL ITSELF"],
    mustNotBreak: ["OVER-STRICTNESS: another machine's ordinary APPEND"] },
  { id: "R18", title: "M0-179 · OVER-STRICTNESS: the fence tightened to demand EQUALITY, so an honest append is refused",
    patches: [{ file: RESULTS, from: "  const anc = git(repo, [\"merge-base\", \"--is-ancestor\", prior, tip]);",
      to: "  const anc = { status: 1, stderr: \"\" };" }],
    mustBreak: "OVER-STRICTNESS: another machine's ordinary APPEND",
    alsoBreak: ["descentOf names FOUR outcomes"],
    mustNotBreak: ["the next gate REUSES NOTHING"] },
];

const RUN = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
preflight("gateresults.control.mjs",
  ARMS.map((a) => ({ id: a.id, anchors: a.patches.map((p) => ({ file: p.file, needle: p.from })) })),
  { fatalFor: RUN.map((a) => a.id) });

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 30, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}
for (const a of RUN) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatches(a.patches);
  t(`${a.id} · the arm ARMED (every patch matched exactly once)`, hits.every((n) => n === 1), true);
  const s = suiteRun();
  console.log(`  armed suite: ${s.pass} pass, ${s.fail} fail — failed: ${s.failed.map((f) => f.slice(0, 70)).join(" | ") || "(none)"}`);
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 56)}…"`, broke(s, a.mustBreak), true);
  for (const also of a.alsoBreak || []) t(`${a.id} · ...and, as declared, at "${also.slice(0, 50)}…"`, broke(s, also), true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the failure is not collateral`, collateral(s), false);
  for (const nb of a.mustNotBreak || []) t(`${a.id} · ...and "${nb.slice(0, 48)}…" does NOT fail, so this arm is isolated`, broke(s, nb), false);
  armed = false;
  t(`${a.id} · RESTORED byte-identically`, restoreAll(), true);
}
console.log("\n--- CLOSING · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}
console.log(`\ngateresults.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
