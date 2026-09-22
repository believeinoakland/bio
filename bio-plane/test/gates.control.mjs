#!/usr/bin/env node
/* D-293/M0-98's NEGATIVE CONTROL DRIVER — 12 arms plus a baseline — over `tools/gates.mjs` and
 * `tools/pushguard.mjs`, each driven through `bio-plane/test/gates.test.mjs`.
 *
 *   node bio-plane/test/gates.control.mjs          (from the repo root; one arm: add its id, e.g. G1)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break the
 * subject. Every arm is armed ALONE against pristine copies kept in `.d293-harness/` (gitignored),
 * and every restore is verified by sha256 AND `cmp` AND a floored byte count — never
 * `git checkout --`, which restores HEAD and discards uncommitted work. **No arm touches a ref, a
 * worktree, a remote or this repository's working tree beyond the two subject files**: the suite
 * builds its own repositories under the battery's temp ground. An exit hook restores an armed file
 * on EVERY exit — 0, 1, a throw or a signal — before it removes the pristine copies by name.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *
 *   G1  the guard's LOOKUP dropped (BOB #22's      -> "a RED gate then a push of that tree is
 *       control, re-armed exactly)                    REFUSED" FAILS. MUST NOT: an unrecorded, a
 *                                                     GREEN and a changed tree each still push.
 *   G2  the record KEYED ON THE COMMIT, in the     -> "AN AMEND OF THE MESSAGE ALONE does not clear
 *       writer and the reader alike (the liar the     the refusal" FAILS, and the suite's own
 *       row names)                                    tree-key reading FAILS. MUST NOT: the plain
 *                                                     RED-then-push refusal (same commit) — which
 *                                                     is exactly why a commit key looks correct.
 *   G3  `bio-plane/src/` dropped from FULL          -> "a src/ edit BESIDE a tools edit reads FULL"
 *       (M0-98's control)                             FAILS. MUST NOT: tools-only TARGETED, and
 *                                                     every other FULL category.
 *   G4  selection by IMPORT ALONE (the liar the    -> "SELECTION IS BY MENTION" FAILS. MUST NOT:
 *       row names)                                    the IMPORTER is still selected.
 *   G5  the CLEAN-AT-START check removed           -> "...and the gate says why" FAILS. MUST NOT:
 *                                                     "a DIRTY tree is NOT recorded" — the
 *                                                     end-of-run check backs it, and that
 *                                                     redundancy is real and is KEPT.
 *   G6  the END-OF-RUN check removed               -> "a tree that CHANGES while the gate runs is
 *                                                     NOT recorded" FAILS. MUST NOT: the dirty-
 *                                                     at-start arm (the start check holds it).
 *   G7  `--since` ignores the RECORD               -> "--since over an UNRECORDED tree falls back"
 *                                                     FAILS. MUST NOT: the disjoint-docs arm.
 *   G8  BOTH SIDES read as the SAME FILE changed   -> "a unit reading BOTH sides re-runs" FAILS.
 *       on both (the liar for `--since`)              MUST NOT: the disjoint-docs arm.
 *   G9  the register gate dropped (no coverage     -> "selects the register gate" FAILS. MUST NOT:
 *       when a test file changed)                     tools-only TARGETED.
 *   G10 the LAST run's verdict wins                -> "a NARROWER GREEN does not clear a WIDER RED"
 *                                                     FAILS. MUST NOT: a GREEN re-run of what
 *                                                     failed still clears; a lone RED still refuses.
 *   G11 a change made AFTER the gate read as the   -> "a commit made AFTER the gate is re-checked"
 *       other side's (the unsound `--since`)          FAILS. MUST NOT: the disjoint-docs and the
 *                                                     both-sides arms.
 *   G12 an imported helper read WITH its comments  -> "a path named only in the COMMENT of a
 *                                                     helper … does NOT select that suite" FAILS.
 *                                                     MUST NOT: the helper naming the tool in CODE
 *                                                     is still selected.
 *
 * Every arm asserts its DOWNSTREAM failure, never merely its patch count: `hits === 1` proves a
 * patch applied, and only the named assertion proves it had an effect (M-60 Q9).
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".d293-harness");
const GATES = join(REPO, "tools/gates.mjs");
const GUARD = join(REPO, "tools/pushguard.mjs");
const SUITE = join(REPO, "bio-plane/test/gates.test.mjs");
const ONLY = process.argv.slice(2).filter((a) => /^G\d+$/.test(a));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* ---------------------------------------------------------------- pristine copies, and the exit hook */
mkdirSync(PEN, { recursive: true });
const SUBJECTS = [GATES, GUARD].map((file) => {
  const copy = join(PEN, `pristine.${file.split("/").pop()}`);
  writeFileSync(copy, readFileSync(file));
  return { file, copy, sha: sha(file), bytes: statSync(file).size };
});
const MIN_BYTES = 20000;
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
  /* Only the copies this driver wrote, by name, and only after the subjects verify. */
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
  const r = spawnSync(process.execPath, [SUITE], { cwd: join(REPO, "bio-plane"), encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/^(\d+) pass, (\d+) fail$/m);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, reachedFoot: /PASS {2}FOOT/.test(out),
           status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* The arm that must survive every arm: the fixture itself. An arm that takes it down has moved a
   second variable, and its refutation is worth nothing. */
const collateral = (s) => broke(s, "the fixture carries the REAL");

const ARMS = [
  { id: "G1", title: "the guard's LOOKUP dropped — BOB #22's control, re-armed exactly",
    patches: [{ file: GUARD,
      from: "    const got = readRuns({ repo, tree, dir });\n    unreadable.push(...got.unreadable);",
      to: "    const got = { runs: [], unreadable: [] };\n    unreadable.push(...got.unreadable);" }],
    mustBreak: "a RED gate then a push of that tree is REFUSED",
    alsoBreak: ["AN AMEND OF THE MESSAGE ALONE does not clear the refusal", "a NARROWER GREEN does not clear a WIDER RED"],
    mustNotBreak: ["an UNRECORDED tree pushes", "a GREEN tree pushes", "a CHANGED tree after a RED pushes",
                   "a GREEN re-run of what failed, on the same tree, CLEARS it"] },

  { id: "G2", title: "the record KEYED ON THE COMMIT, writer and reader alike — the liar the row names",
    patches: [
      { file: GUARD,
        from: "  return git([\"rev-parse\", \"--verify\", \"--quiet\", `${rev}^{tree}`], repo) || null;",
        to: "  return git([\"rev-parse\", \"--verify\", \"--quiet\", `${rev}^{commit}`], repo) || null;" },
      { file: GATES,
        from: "const treeNow = () => tryGit([\"rev-parse\", \"--verify\", \"--quiet\", \"HEAD^{tree}\"]);",
        to: "const treeNow = () => tryGit([\"rev-parse\", \"--verify\", \"--quiet\", \"HEAD^{commit}\"]);" }],
    mustBreak: "AN AMEND OF THE MESSAGE ALONE does not clear the refusal",
    alsoBreak: ["a CLEAN run is RECORDED, keyed by HEAD's tree"],
    mustNotBreak: ["a RED gate then a push of that tree is REFUSED"] },

  { id: "G3", title: "`bio-plane/src/` dropped from FULL — M0-98's own control",
    patches: [{ file: GATES,
      from: "  if (PLANE_ROOTS.some((r) => p.startsWith(r))) return \"the plane\";",
      to: "  if (false) return \"the plane\";" }],
    mustBreak: "a src/ edit BESIDE a tools edit reads FULL",
    alsoBreak: ["a plane change gated FULL, rebased over docs"],
    mustNotBreak: ["a tools-only diff reads TARGETED", "every FULL category still reads FULL"] },

  { id: "G4", title: "selection by IMPORT ALONE — the liar the row names",
    patches: [{ file: GATES,
      from: "  const s = own ? textOf(abs) : codeOf(abs);\n  if (!s) return null;\n  const pr = probesFor(p);",
      to: "  const s = own ? textOf(abs) : codeOf(abs);\n  if (!s || true) return null;\n  const pr = probesFor(p);" }],
    mustBreak: "SELECTION IS BY MENTION",
    alsoBreak: ["...and the suite that WALKS tools/"],
    mustNotBreak: ["...and selects its IMPORTER", "a tree that CHANGES while the gate runs is NOT recorded"] },

  { id: "G5", title: "the CLEAN-AT-START check removed",
    patches: [{ file: GATES,
      from: "const CLEAN_AT_START = START.status === \"\" && !!START.tree;",
      to: "const CLEAN_AT_START = !!START.tree;" }],
    mustBreak: "...and the gate says why",
    mustNotBreak: ["a DIRTY tree is NOT recorded"] },

  { id: "G6", title: "the END-OF-RUN check removed — a run across a change, recorded",
    patches: [{ file: GATES,
      from: "  } else if (endStatus !== \"\" || endTree !== START.tree) {",
      to: "  } else if (false) {" }],
    mustBreak: "a tree that CHANGES while the gate runs is NOT recorded",
    mustNotBreak: ["a DIRTY tree is NOT recorded"] },

  { id: "G7", title: "`--since` ignores the RECORD",
    patches: [{ file: GATES,
      from: "    if (eff.verdict !== \"GREEN\")",
      to: "    if (false)" }],
    mustBreak: "--since over an UNRECORDED tree falls back",
    mustNotBreak: ["a rebase over DISJOINT docs commits re-runs ONLY plancheck"] },

  { id: "G8", title: "BOTH SIDES read as the SAME FILE changed on both — the liar for `--since`",
    patches: [{ file: GATES,
      from: "            const upReaders = readersOf(upstream, [...mineReaders.values()].map((v) => v.unit), exact);",
      to: "            const upReaders = readersOf(mine.filter((p) => upstream.includes(p)), [...mineReaders.values()].map((v) => v.unit), exact);" }],
    mustBreak: "a unit reading BOTH sides re-runs",
    mustNotBreak: ["a rebase over DISJOINT docs commits re-runs ONLY plancheck"] },

  { id: "G11", title: "a change made AFTER the gate read as the other side's — the unsound `--since`",
    patches: [{ file: GATES,
      from: "        const fresh = differ.filter((p) => !explained.has(p));",
      to: "        const fresh = [];" }],
    mustBreak: "a commit made AFTER the gate is re-checked as TARGETED would",
    mustNotBreak: ["a rebase over DISJOINT docs commits re-runs ONLY plancheck", "a unit reading BOTH sides re-runs"] },

  { id: "G12", title: "an imported helper read WITH its comments — prose read as a read",
    patches: [{ file: GATES,
      from: "  if (!stripComments) return textOf(abs);",
      to: "  if (true) return textOf(abs);" }],
    mustBreak: "a path named only in the COMMENT of a helper a suite imports does NOT select that suite",
    mustNotBreak: ["...and a suite whose imported HELPER names the tool in CODE is selected", "a tools-only diff reads TARGETED"] },

  { id: "G9", title: "the register gate dropped — no coverage when a test file changed",
    patches: [{ file: GATES,
      from: "  if (testChange && cov && !sel.has(\"coverage\"))",
      to: "  if (false)" }],
    mustBreak: "selects the register gate",
    mustNotBreak: ["a tools-only diff reads TARGETED"] },

  { id: "G10", title: "the LAST run's verdict wins — a narrower GREEN clears a wider RED",
    patches: [{ file: GUARD,
      from: "  return { verdict: open.size ? \"RED\" : \"GREEN\", open: [...open.keys()],",
      to: "  return { verdict: runs[runs.length - 1].verdict, open: [...open.keys()]," }],
    mustBreak: "a NARROWER GREEN does not clear a WIDER RED",
    alsoBreak: ["the guard's own in-process control passes"],
    mustNotBreak: ["a GREEN re-run of what failed, on the same tree, CLEARS it", "a RED gate then a push of that tree is REFUSED"] },
];

/* ---------------------------------------------------------------- D-331: every anchor, before anything arms */
const RUN = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
/* Throws, after printing the whole table, if an anchor of an arm this invocation runs is not live. */
preflight("gates.control.mjs",
  ARMS.map((a) => ({ id: a.id, anchors: a.patches.map((p) => ({ file: p.file, needle: p.from })) })),
  { fatalFor: RUN.map((a) => a.id) });

/* ---------------------------------------------------------------- BASELINE */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 40, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

for (const a of RUN) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatches(a.patches);
  t(`${a.id} · the arm ARMED (every patch matched exactly once)`, hits.every((n) => n === 1), true);
  const s = suiteRun();
  console.log(`  armed suite: ${s.pass} pass, ${s.fail} fail — failed: ${s.failed.map((f) => f.slice(0, 70)).join(" | ") || "(none)"}`);
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 56)}…"`, broke(s, a.mustBreak), true);
  for (const also of a.alsoBreak || [])
    t(`${a.id} · ...and, as declared, at "${also.slice(0, 50)}…"`, broke(s, also), true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the failure is not collateral`, collateral(s), false);
  for (const nb of a.mustNotBreak || [])
    t(`${a.id} · ...and "${nb.slice(0, 48)}…" does NOT fail, so this arm is isolated`, broke(s, nb), false);
  armed = false;
  t(`${a.id} · RESTORED byte-identically`, restoreAll(), true);
}

/* ---------------------------------------------------------------- closing: nothing leaked */
console.log("\n--- CLOSING · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

console.log(`\ngates.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
