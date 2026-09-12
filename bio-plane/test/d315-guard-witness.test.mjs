/* D-318 — THE WITNESS D-315's FIX DID NOT HAVE, AND THE WHOLE POINT IS THAT THE
 * BATTERY RUNS IT.
 *
 * WHY THIS FILE EXISTS, and it is a measured gap rather than a tidy-up. D-315
 * moved the two comparability guards — `ocr-composed-probe.mjs` (CPDF-14) and
 * `cpdf15-tesseract-runtime.probe.mjs` (CPDF-15) — off `FLOOR_SRC.includes(expr)`
 * SUBSTRING PRESENCE and onto a sha256 of the statement LINE, because a
 * superstring contains its own substring and `* 100` mutated to `* 100.0` left
 * BOTH landed guards at exit 0 over a genuinely moved expression. The fix is
 * right and it was reproduced before it was made. What it did NOT have was a
 * witness anything runs automatically:
 *
 *   - both probes' own `--controls` arm tables were FROZEN by D-315's brief, and
 *     neither of them arms a superstring — each `metric` arm mutates the
 *     char-accuracy DENOMINATOR, which REMOVES the pinned substring, so it
 *     exercised the OLD detection and exercises the NEW one identically. Both
 *     tables passed the same before the fix and after it (measured 2026-09-12);
 *   - and the probes are not `*.test.mjs`, so the battery discovers neither of
 *     them in the first place. CPDF-15's `--controls` additionally npm-installs
 *     an engine and fetches a model over the network.
 *   - the one instrument that CAN tell the two detections apart,
 *     `d315-guard-controls.mjs`, is deliberately NOT a `*.test.mjs` either: it
 *     mutates the committed floor IN PLACE and needs a quiet tree.
 *
 * So a revert of the digest pins to `.includes` left every automatic gate green
 * and only a hand-run driver noticing. That is D-318, and this file closes it.
 *
 * WHICH OF D-318's TWO CLOSURES THIS IS, AND WHAT THE OTHER ONE COSTS. The row
 * offered (a) a `superstring` arm added beside each probe's existing `metric`
 * arm, or (b) a discovered `*.test.mjs` driving both probes with `--guard-only`
 * over a temp-dir copy. THIS IS (b), and the deciding measurement is not taste:
 * **(a) does not put the witness anywhere the battery runs.** Neither probe is
 * discovered, so widening their frozen tables would move the detection's witness
 * from one hand-run instrument into two other hand-run instruments — and one of
 * those two, CPDF-15's, cannot run at all without a network fetch and an npm
 * install of `tesseract-wasm`, which is not a thing a battery can own. (a)'s real
 * cost, stated rather than silently declined: it is four lines per probe and no
 * interface change, it would make each probe's own control table self-sufficient
 * (a reader running `--controls` by hand would see the superstring case without
 * knowing this file exists), and it is the only one of the two that exercises the
 * guard through the probe's own arm harness rather than through a sibling. Those
 * are real and they are not what D-318 asked for: the row's own words are that
 * (b) "is the one that puts the check in the loop the reader actually runs, which
 * is this project's standing rule." Taking (a) INSTEAD would have closed the row
 * with the cost — a silent D-315 regression invisible to every automatic gate —
 * completely unpaid.
 *
 * WHY A TEMP-DIR COPY AND NOT THE COMMITTED FILE. `d315-guard-controls.mjs`
 * mutates the REAL floor with a restore verified two ways, which is the stronger
 * instrument and is exactly why it must NOT be discovered: a battery suite that
 * edits a committed file races every other suite in the run and leaves the tree
 * dirty if it dies mid-arm. Copying is what both probes' own `--controls` already
 * do, and here every arm gets its OWN fresh copy, so no arm can be disarmed by a
 * previous arm's failure to restore — a stronger property than restoring, not a
 * weaker one. The foot still asserts that all four committed files are
 * byte-identical to their pre-run sha256 AND `cmp`-clean, because "this suite
 * touches nothing" is a claim and claims get measured.
 *
 * THE TWO INSTRUMENTS ARE NOT DUPLICATES, and each sees something the other
 * cannot: this suite runs on every battery and proves the guards refuse a
 * mutated floor; `d315-guard-controls.mjs` proves they refuse the REAL committed
 * floor when it is mutated, which is the path a careless edit actually takes and
 * which no copy can stand in for.
 *
 * WHAT THIS SUITE CANNOT SEE, stated because a matcher's reach is the thing the
 * next reader cannot re-derive: it drives the guards through `--guard-only`, so
 * it says nothing about the measurement, upload or account code after the
 * comparability block — deliberate, because those paths cost money and reach the
 * network. It runs CPDF-15 WITHOUT `--engine`, so the engine pins (exit 5) are
 * not exercised here; CPDF-15's own `--controls` owns that arm. It cannot see a
 * floor edit that leaves every pinned byte in place — the pins' own reach is
 * documented at their site in both probes. And because it mutates a COPY, it
 * cannot see a guard that reads the floor by an absolute path instead of `HERE`;
 * the baseline arm below would still pass and the mutation arms would fail, which
 * is the safe direction but is not the same as detecting it.
 *
 * NEGATIVE CONTROL: run 2026-09-12, each arm ALONE against the REAL tree with
 * every other defence held open, restores verified by sha256 AND `cmp` against
 * uniquely-named per-arm pristine copies with the byte count printed and floored
 * — (1) THE ARM THIS SUITE EXISTS FOR: revert ONE guard's statement-digest pin to
 * the pre-D-315 `.includes` substring form (`if (m.found !== m.pin)` ->
 * `if (!FLOOR_SRC.includes(m.expr))`) in `ocr-composed-probe.mjs` alone -> this
 * suite FAILS, naming `cpdf14` on all four superstring arms while `cpdf15` still
 * passes them, which is the whole regression; (2) the same revert in
 * `cpdf15-tesseract-runtime.probe.mjs` alone -> this suite FAILS naming `cpdf15`,
 * so neither guard is witnessed only through the other; (3) OVER-STRICTNESS, the
 * arm without which the first two prove nothing — the untouched guards leave this
 * suite and the whole battery green byte-for-byte, so the suite witnesses the
 * regression rather than fighting the fix; (4) neuter the mutation itself (make
 * `edit` return the source unchanged) -> the ARM-NEVER-ARMED guard fires rather
 * than the arm quietly passing, because an arm that did not arm is a finding;
 * (5) REACH — blank the copied floor to nothing -> the corpus floor fires naming
 * the byte count, since an assertion that passed over an empty fixture is the
 * receipt this project keeps re-earning. The driver for arms 1-4 is
 * `node test/d315-guard-controls.mjs` plus the one-line pin reverts named above.
 */
import "./sandbox.mjs";
import "./stdio.mjs";
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const shaFile = (p) => sha(readFileSync(p));

/* The four files an arm needs in its sandbox: the floor both guards read, the
   moondream probe they read the ladder recipe out of, and the two guards. */
const FLOOR_NAME = "ocr-measure-probe.mjs";
const FILES = [FLOOR_NAME, "ocr-moondream-probe.mjs", "ocr-composed-probe.mjs", "cpdf15-tesseract-runtime.probe.mjs"];
const GUARDS = [["cpdf14", "ocr-composed-probe.mjs"], ["cpdf15", "cpdf15-tesseract-runtime.probe.mjs"]];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

/* THE CORPUS, PRINTED AND FLOORED. Three headline totality assertions in this
   repository have PASSED OVER AN EMPTY CORPUS, so the subject is measured before
   a single arm runs and a suspiciously small file stops the suite rather than
   letting every arm below succeed against nothing. */
console.log("\n--- D-318: the D-315 statement-digest pins, witnessed by something the battery runs ---");
const ORIGIN = Object.fromEntries(FILES.map((f) => {
  const p = join(HERE, f);
  return [f, { path: p, sha: shaFile(p), bytes: statSync(p).size }];
}));
for (const f of FILES) console.log(`  subject: ${f.padEnd(34)} ${String(ORIGIN[f].bytes).padStart(7)} B  sha256 ${ORIGIN[f].sha.slice(0, 16)}…`);
t(`the floor is a real file, not an empty one (${ORIGIN[FLOOR_NAME].bytes} B, floor 10000)`,
  ORIGIN[FLOOR_NAME].bytes >= 10000, true);
t(`both guards are real files (${GUARDS.map(([id, f]) => `${id} ${ORIGIN[f].bytes} B`).join(", ")}, floor 10000 each)`,
  GUARDS.every(([, f]) => ORIGIN[f].bytes >= 10000), true);

/** A fresh sandbox holding pristine copies of all four files. Per ARM, so no arm
 *  can be disarmed by a previous arm — the copy-per-arm shape both probes'
 *  `--controls` already use. */
function sandbox(id) {
  const d = mkdtempSync(join(tmpdir(), `d318-${id}-`));
  for (const f of FILES) {
    copyFileSync(join(HERE, f), join(d, f));
    /* The copy is the fixture; if it is not byte-identical the arm is measuring
       something else entirely. Cheap, and it is how a fixture stops being taken
       on trust. */
    if (shaFile(join(d, f)) !== ORIGIN[f].sha) throw new Error(`COPY IS NOT THE SUBJECT: ${f} differs from the committed file`);
  }
  return d;
}

/** Run both guards inside a sandbox and report each one's exit code and refusal. */
const runGuards = (d, args = []) => GUARDS.map(([id, f]) => {
  const r = spawnSync(process.execPath, [join(d, f), "--guard-only", ...args], { encoding: "utf8" });
  return { id, status: r.status, stop: ((r.stderr || "").split("\n").find((l) => l.startsWith("STOP:")) || "").trim() };
});

/** One mutation arm: fresh copies, mutate the COPIED floor, drive both guards.
 *  `mustSay` is a predicate over the refusal line, so an arm asserts WHAT the
 *  guard named and not merely that it exited non-zero — a guard refusing for
 *  the wrong reason is not the guard this suite is about. */
function mutationArm(id, what, edit, mustSay) {
  console.log(`\n  [${id}] ${what}`);
  console.log("    DECLARED: BOTH guards exit 4 and the refusal names it");
  let results;
  try {
    const d = sandbox(id);
    const p = join(d, FLOOR_NAME);
    const before = readFileSync(p, "utf8");
    const after = edit(before);
    /* An arm that did not arm is a finding, never a pass. Both halves: the edit
       must change the string, and the string must reach the disk. */
    if (after === before) throw new Error("ARM NEVER ARMED: the edit produced byte-identical source");
    writeFileSync(p, after);
    if (shaFile(p) === ORIGIN[FLOOR_NAME].sha) throw new Error("ARM NEVER ARMED: the copied floor on disk is unchanged after the write");
    results = runGuards(d);
  } catch (e) {
    for (const [gid] of GUARDS) t(`${id} · ${gid} refuses the mutated floor`, `THREW: ${e.message}`, "exit 4, named");
    return;
  }
  for (const g of results) {
    console.log(`    guard ${g.id}: exit ${g.status}  ${JSON.stringify(g.stop.slice(0, 170))}`);
    t(`${id} · ${g.id} refuses the mutated floor and NAMES it`,
      { exit: g.status, named: mustSay(g.stop) }, { exit: 4, named: true });
  }
}

/* -- the baseline, which is also the over-strictness arm ---------------------
 * Without this row, every arm below would pass against guards that simply always
 * refused, and the suite would be indistinguishable from a broken one. It is the
 * one row that separates all-arms-working from all-arms-broken. */
{
  console.log("\n  [baseline] pristine copies, nothing mutated — the over-strictness arm");
  console.log("    DECLARED: BOTH guards exit 0 against the committed state, byte for byte");
  const results = runGuards(sandbox("baseline"));
  for (const g of results) {
    console.log(`    guard ${g.id}: exit ${g.status}`);
    t(`baseline · ${g.id} passes an untouched floor (a guard that refuses correct work is not a safer guard)`,
      g.status, 0);
  }
}

/* -- NC1: THE ARMS THIS ITEM EXISTS FOR — a SUPERSTRING of each pinned
 * expression. In every one of the four the pinned literal is STILL PRESENT, so
 * the pre-D-315 `.includes` check finds it and returns 0. Only the statement
 * digest can see these. `characc` is byte-for-byte the mutation CPDF-16 measured
 * walking through BOTH landed guards. -------------------------------------- */
const namesMoved = (l) => /STATEMENT has moved/.test(l) && /still\s+PRESENT/.test(l) && /D-315/.test(l);
const SUPERSTRINGS = [
  ["characc", "char accuracy — THE EXACT MUTATION CPDF-16 MEASURED PASSING (`* 100` -> `* 100.0`)",
    "(1 - dist / gt.length) * 100", "(1 - dist / gt.length) * 100.0"],
  ["digtotal", "GT digit total — `.length` extended to `.length - 0`",
    "pairs.filter(([g]) => g && /[0-9]/.test(g)).length;", "pairs.filter(([g]) => g && /[0-9]/.test(g)).length - 0;"],
  ["digerr", "digit errors — `.length` extended to `.length - 0`",
    "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;", "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length - 0;"],
  ["minted", "digits MINTED — `.length` extended to `.length - 0`",
    "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;", "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length - 0;"],
];
for (const [id, what, from, to] of SUPERSTRINGS) {
  mutationArm(`super-${id}`, `SUPERSTRING, pinned literal still present: ${what}`, (s) => {
    if (!s.includes(from)) throw new Error(`ARM NEVER ARMED: ${JSON.stringify(from.slice(0, 60))} is not in the floor`);
    if (s.split(from).length - 1 !== 1) throw new Error(`ARM NEVER ARMED: ${JSON.stringify(from.slice(0, 60))} occurs more than once`);
    return s.replace(from, to);
  }, namesMoved);
}

/* -- the OLD detection, kept rather than traded away for the new one --------- */
mutationArm("removing", "substring-REMOVING mutation of the char-accuracy denominator — the pre-D-315 detection",
  (s) => {
    const from = "(1 - dist / gt.length) * 100";
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the char-accuracy expression is not in the floor");
    return s.replace(from, "(1 - dist / Math.max(1, gt.length)) * 100");
  },
  (l) => /scoring expression/.test(l) && /is gone from ocr-measure-probe\.mjs/.test(l));

/* -- the exactly-once assertion, which is the only thing that can see this ---
 * Every pinned statement's own bytes are untouched here, so all four digests
 * still match; a duplicate silently disarms every `String.replace`-based
 * mutation arm in the estate, which is why it is a refusal and not a warning. */
mutationArm("duplicate", "a SECOND verbatim occurrence of a pinned expression, on an additive line of its own",
  (s) => {
    const anchor = "  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;\n";
    if (!s.includes(anchor)) throw new Error("ARM NEVER ARMED: the digTotal statement is not where it should be");
    return s.replace(anchor, anchor + "  const digTotalAgain = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;\n");
  },
  (l) => /occurs 2 times in ocr-measure-probe\.mjs/.test(l) && /EXACTLY ONE occurrence is the pin/.test(l));

/* -- D-315's class sweep: the two regions both probes IMPORT AND RUN ---------- */
mutationArm("lev", "levenshteinPairs() cost term 1 -> 2 — every distance and every digit column moves",
  (s) => {
    const from = "dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));";
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the Levenshtein cost term is not where it should be");
    return s.replace(from, "dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 2 : 0));");
  },
  (l) => /levenshteinPairs\(\) has moved/.test(l));

mutationArm("norm", "norm() extended with a replace the GROUND TRUTH digest cannot see (it holds no NUL)",
  (s) => {
    const from = '.replace(/\\s+/g, " ").trim();';
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: norm()'s whitespace collapse is not where it should be");
    return s.replace(from, '.replace(/\\s+/g, " ").replace(/\\u0000/g, "").trim();');
  },
  (l) => /norm\(\) NORMALISER has moved/.test(l));

/* -- the foot: this suite touches nothing committed, MEASURED not asserted ----
 * `git checkout --` losing a session's own work twice in two days is why a
 * restore claim in this repository is only believed when it is measured, and the
 * same standard applies to a claim that nothing needed restoring. */
console.log("\n  [foot] the committed files this suite READ are byte-identical to their pre-run state");
for (const f of FILES) {
  const now = shaFile(ORIGIN[f].path), bytes = statSync(ORIGIN[f].path).size;
  t(`${f} unchanged (${bytes} B, sha256 ${now.slice(0, 16)}…)`,
    { sha: now, bytes }, { sha: ORIGIN[f].sha, bytes: ORIGIN[f].bytes });
}
/* And by CONTENT as well as by digest — two harnesses here once reported a
   restore byte-identical over an EMPTY manifest, caught only because a digest
   read e3b0c442…, the sha256 of the empty string. `cmp` against a copy taken
   now cannot make that mistake. */
{
  const d = mkdtempSync(join(tmpdir(), "d318-foot-"));
  let clean = true, why = "";
  try {
    for (const f of FILES) {
      copyFileSync(ORIGIN[f].path, join(d, f));
      execFileSync("cmp", [join(d, f), ORIGIN[f].path]);   // throws on any byte difference
    }
  } catch (e) { clean = false; why = e.message; }
  t(`all ${FILES.length} committed files cmp-clean against a copy taken now${clean ? "" : ` (${why})`}`, clean, true);
}

console.log(`\nd315-guard-witness: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
