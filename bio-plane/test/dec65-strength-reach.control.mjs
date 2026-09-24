/* PL-20 — THE NEGATIVE CONTROL FOR `dec65-strength-reach.test.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, and
 * `scripts/battery.mjs` discovers suites by filename. A concurrent battery
 * against a patched `store.mjs` is how one worker's arm became another
 * worker's baseline, so this file is run BY HAND and never by the runner.
 *
 * THE DISCIPLINE, and every clause of it is a receipt this repository paid for:
 *   - EVERY ARM IS ARMED ALONE, with every other defence held OPEN. Two arms at
 *     once cannot tell which one a failure belongs to.
 *   - A BASELINE ARM RUNS FIRST. A harness whose every arm reports the same
 *     thing is indistinguishable from six broken arms without one.
 *   - AN OVER-STRICTNESS ARM RUNS LAST and MUST PASS: correct work in a
 *     spelling nobody anticipated must not be refused.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, against a
 *     UNIQUELY-NAMED per-arm pristine copy, with the byte count PRINTED and
 *     FLOORED and the empty-string digest refused outright — two harnesses once
 *     reported a restore byte-identical OVER AN EMPTY MANIFEST.
 *   - AN ARM THAT DID NOT ARM IS A FINDING. Every patch asserts it matched, and
 *     asserts it matched EXACTLY ONCE.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, not smoothed.
 *
 * ============================ MEASURED RESULTS ============================
 * RUN 2026-08-09 · pl20-dec65-step-three · worktree agent-a04afa9454cdf0bc2 ·
 * `main` at 1081a6a (PL-17 merged; PL-19 committed on
 * worktree-agent-a875e2afd837947d7 and NOT merged).
 * store.mjs 24468 lines / sha256 recorded per arm below; bio-checks.mjs
 * untouched by every arm.
 *
 * TWO OF THE SEVEN DECLARATIONS WERE WRONG ON THEIR FIRST RUN. Both are
 * recorded as findings and the DECLARATIONS were corrected — never the guards
 * that caught them. Neither was the instrument being wrong about the subject;
 * both were this file being wrong about its own arm, which is the thing a
 * declaration exists to expose.
 *
 *   (0) BASELINE, nothing patched ............... 27 pass, 0 fail   AS DECLARED
 *   (1) the arithmetic READS the field .......... 22 pass, 5 fail   DECLARED 2
 *       — `#strengthWalk`'s `site` carries `asserted_by`. It changes NO
 *       behaviour: every letter, every weakest leg and both differentials are
 *       unmoved, which is the arm's whole point — the pin sees a READ that a
 *       behavioural suite cannot. THE THREE EXTRA FAILURES ARE THE SUITE'S OWN
 *       GUARDS FIRING, and they are the reason this arm is worth more than its
 *       declaration was: the suite's in-memory sensitivity mutation is anchored
 *       on THE SAME LINE this arm patches, so it could not apply — and the suite
 *       said so out loud through its `an arm that never armed is a finding`
 *       assertion instead of passing quietly over a mutation that did nothing.
 *   (2) the field named in a COMMENT only ....... 27 pass, 0 fail   AS DECLARED
 *       — a sweep that cited its own prose would have reported a reader here.
 *   (3) the scanner's regex arm removed ......... 25 pass, 2 fail   DECLARED 3
 *       ** SUPERSEDED 2026-09-13 (D-330): 22 pass, 5 fail. The figure below was
 *          right about the 25,862-line `store.mjs` it measured and is wrong
 *          about this one; `63a329d` is the commit that moved it, bisected over
 *          all 36 revisions since. The full attribution is at the arm. **
 *       — the desync self-check fires and the call-site roster goes with it:
 *       `suggestVersion` and thirteen other methods are swallowed into a
 *       neighbour's span, which is the instrument defect this file's own first
 *       build shipped with. THE CLOSURE AND THE PROPERTY VOCABULARY SURVIVE A
 *       DESYNCED SCANNER INTACT — so those two assertions are the ONLY things
 *       standing between a broken scanner and a result that reads perfectly
 *       clean, and that is a fact about this instrument worth knowing.
 *   (4) the partition collapsed to one part ..... 23 pass, 4 fail   AS DECLARED
 *       ** SUPERSEDED 2026-09-13 (D-330): 24 pass, 3 fail. The fourth was `the
 *          harm`, and `fc55b62` — this item's OWN integration commit — moved it
 *          off the arithmetic and onto a write that no longer lands. Full
 *          attribution at the arm. **
 *       — `#axisResult` buckets every leg into the implicit part. The two
 *       ATTRIBUTION EQUALITIES STAY GREEN over an arithmetic that has stopped
 *       composing at all, which is the receipt that an equality costing nothing
 *       is not evidence and that §3's sensitivity arm is load-bearing.
 *   (5) THE REAL STEP TWO, unpatched suite against PL-19's own sources, run in a
 *       scratch `git worktree` at 4b3f7a7 ..... 25 pass, 2 fail   AS DECLARED
 *       ** RETIRED 2026-09-13 (D-330). PL-19 is MERGED, so the arm is subsumed
 *          by the battery exactly as its own fallback text said it would be —
 *          and it had separately stopped running at all (`a3a2116`/D-282). The
 *          reasoning, the staling commits and the LOSS are at the arm. **
 *       — and the two are EXACTLY §4's defect pins, which is what "written to
 *       fail when step two lands" is supposed to mean. Everything else is
 *       byte-identical, INCLUDING the closure (8), the property vocabulary (47)
 *       and both differentials: the reach answer is a property of
 *       `#strengthWalk`, and PL-19 did not touch it. This arm is not a patch —
 *       it is the other tree, which is stronger than any hand-written stand-in.
 *   (6) OVER-STRICTNESS: the ground rows attributed in spellings nobody
 *       anticipated ................................ 27 pass, 0 fail   AS DECLARED
 *       — unicode, an apostrophe, an email shape, a parenthetical role, and a
 *       member whose NAME CONTAINS the minted no-claim literal. Every one is a
 *       genuine member's claim, every one is accepted at the write, and the
 *       pair is unmoved.
 *
 * ZERO RESTORE PROBLEMS: every arm's post-restore sha256 equalled its pristine
 * copy's AND `cmp` reported no difference; every byte count printed above the
 * floor; no digest equalled e3b0c442….
 * ==========================================================================
 *
 * ====================== RE-RUN 2026-09-13 · D-330 =========================
 * `main` at a2a0718, battery 183/183 · 11,188 green, `store.mjs` 29,390 lines /
 * 1,869,260 bytes, sha256 514bb504…. M0-25's arm-liveness census found this
 * driver red; re-measured here whole before a byte was changed.
 *
 * THE SHAPE AS FOUND: 3 PROBLEMS, not the 2 D-330's row records.
 *   (0) BASELINE ......... 27 pass, 0 fail   AS DECLARED — and it MATTERS that
 *       the baseline was green: it is what makes the three below attributable to
 *       their arms instead of to the tree.
 *   (1) .................. 22 pass, 5 fail   AS DECLARED
 *   (2) .................. 27 pass, 0 fail   AS DECLARED
 *   (3) .................. 22 pass, 5 fail   *** declared 25/2 ***
 *   (4) .................. 24 pass, 3 fail   *** declared 23/4 ***
 *   (5) .................. -1 pass, -1 fail  *** declared 25/2 *** — THE ONE THE
 *       ROW DOES NOT NAME. Not a count that moved: a suite that never reached
 *       its own foot, reported as -1 and never as 0.
 *   (6) .................. 27 pass, 0 fail   AS DECLARED
 * Every restore VERIFIED by sha256 AND `cmp` on every arm, both files, both runs.
 *
 * ALL THREE ARE SUBJECTS THAT LEGITIMATELY MOVED. Not one is a plane defect, not
 * one is a stale ANCHOR — all six anchors were counted against the committed
 * blobs before the run and every one occurs EXACTLY ONCE, which is precisely why
 * this driver's decay is worth recording separately from M0-25's: **an
 * instrument's ANCHORS can be perfectly live while its EXPECTATIONS have gone
 * false, and no static check can see the difference.** The declarations are
 * corrected at their own sites, with what moved and when; none is exempted, and
 * the one whose subject became the mainline is RETIRED with its loss stated
 * rather than quietly deleted.
 * ==========================================================================
 *
 * HOW TO RUN:  cd bio-plane && node test/dec65-strength-reach.control.mjs
 *
 * NEGATIVE CONTROL for the D-330 corrections themselves, RUN 2026-09-13, each
 * arm ALONE, restores verified by sha256 AND `cmp`, recorded here so the next
 * session re-runs it in one step instead of re-deriving how to break it:
 *   (1a) RE-STALE arm (4)'s declaration — put `{ pass: WHOLE - 3, fail: 3 }`
 *        back to `{ pass: WHOLE - 4, fail: 4 }`. MUST: this driver exits 1 and
 *        prints `*** NOT AS DECLARED *** (declared 23/4)` at arm (4). MUST NOT:
 *        any of arms (0) (1) (2) (3) (6) move by one assertion. MEASURED: exactly
 *        that; the five untouched arms byte-for-byte their unarmed tallies.
 *   (2)  OVER-STRICTNESS: the untouched file leaves this driver at exit 0 with
 *        every tally identical. MEASURED: identical, and the file byte-identical.
 * THE HARNESS'S OWN ARM FAILED FIRST AND IS WORTH MORE THAN THE PASS. Its first
 * draft indexed this driver's `RESULT` lines POSITIONALLY, and retiring arm (5)
 * removed a line, so arm (4) moved from index 3 to index 4 and the check excluded
 * the wrong row — reporting `other arms unchanged: false` over a driver that was
 * behaving perfectly. A positional index into an instrument's output is the same
 * staleness class this entire item is about, met inside the item's own control.
 * Keyed by the driver's own `(n)` headers since.
 */
/* `mkdtempSync`, `rmSync` and `tmpdir` were dropped on 2026-09-13 with arm (5),
   the only thing that used them. See that arm's retirement note below. */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(ROOT, "test", "dec65-strength-reach.test.mjs");
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const FLOOR_BYTES = { [STORE]: 500000, [SUITE]: 20000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => readFileSync(p).length;

let problems = 0;
const say = (s) => console.log(s);

function pristine(arm, file) {
  const copy = `${file}.pristine-${arm}`;
  if (existsSync(copy)) throw new Error(`a pristine copy for arm ${arm} already exists: ${copy}`);
  copyFileSync(file, copy);
  const d = sha(copy), n = bytes(copy);
  if (d === EMPTY || n === 0) throw new Error(`arm ${arm}: pristine copy of ${file} is EMPTY (${d})`);
  if (n < FLOOR_BYTES[file]) throw new Error(`arm ${arm}: pristine ${file} is ${n} bytes, below the floor ${FLOOR_BYTES[file]}`);
  say(`    pristine ${file.split("/").slice(-2).join("/")}  ${n} bytes  sha256 ${d.slice(0, 16)}…`);
  return { copy, d, n };
}
function restore(arm, file, p) {
  copyFileSync(p.copy, file);
  const d = sha(file), n = bytes(file);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", file, p.copy]); } catch { cmpOk = false; }
  const ok = d === p.d && n === p.n && cmpOk;
  say(`    restore  ${ok ? "VERIFIED" : "*** FAILED ***"}  ${n} bytes  sha256 ${d.slice(0, 16)}…  cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (!ok) problems++;
  unlinkSync(p.copy);
}
/* AN ARM THAT DID NOT ARM IS A FINDING, so a patch asserts it matched and
   asserts it matched EXACTLY ONCE — an anchor occurring twice has silently
   armed two places, which is a different experiment from the one declared. */
function patch(file, from, to) {
  const src = readFileSync(file, "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor matched ${n} times in ${file}\n  ${from.slice(0, 120)}`);
  writeFileSync(file, src.split(from).join(to));
}
function runSuite(dir = ROOT, file = "test/dec65-strength-reach.test.mjs") {
  let out = "";
  try {
    out = execFileSync(process.execPath, [file], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout ?? ""}${e.stderr ?? ""}`; }
  const m = /dec65-strength-reach: (\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0: a suite that died before
     its foot has not passed nothing, it has told us nothing. */
  const tally = m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
  const failed = out.split("\n").filter((l) => l.trim().startsWith("FAIL")).map((l) => l.trim().slice(0, 110));
  return { tally, failed, out };
}
const report = (arm, want, got, note = "") => {
  const ok = got.tally.pass === want.pass && got.tally.fail === want.fail;
  say(`    RESULT   ${got.tally.pass} pass, ${got.tally.fail} fail  —  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED *** (declared "
      + `${want.pass}/${want.fail})`}${note ? "  " + note : ""}`);
  for (const f of got.failed) say(`      ${f}`);
  if (!ok) problems++;
};

say("PL-20 · dec65-strength-reach · NEGATIVE CONTROL");
say(`node ${process.version} · ${new Date().toISOString()}`);

/* ---------------------------------------------------------------- ARM 0 */
say("\n(0) BASELINE — nothing patched. MUST be all green; a harness whose baseline is red");
say("    cannot tell six broken arms from six working ones.");
const BASE = runSuite();
say(`    RESULT   ${BASE.tally.pass} pass, ${BASE.tally.fail} fail`);
if (BASE.tally.fail !== 0) { say("    *** BASELINE IS RED — every arm below is uninterpretable ***"); problems++; }
const WHOLE = BASE.tally.pass;

/* ---------------------------------------------------------------- ARM 1 */
say("\n(1) THE ARITHMETIC READS THE FIELD — `#strengthWalk`'s `site` carries `asserted_by`.");
say("    MUST FAIL: the reach assertion, the property vocabulary, the comment-only check, the");
say("    licence statement, AND the suite's own arm-did-not-arm guard. MUST NOT FAIL: anything");
say("    behavioural — the patch changes no letter, which is exactly why a driven suite could");
say("    not see it and this pin must.");
say("    DECLARED 2, MEASURED 5 ON THE FIRST RUN, AND THE CORRECTION IS THE FINDING: the");
say("    suite's in-memory sensitivity mutation is anchored on THE SAME LINE this arm patches,");
say("    so under this arm it cannot apply — and the suite SAID SO through its own");
say("    `an arm that never armed is a finding` assertion rather than passing quietly. The");
say("    comment-only check falls with it for the same reason (the real source now reads the");
say("    field, so the comment copy does too). Both are the guards working, not the arm");
say("    misfiring, so the declaration is corrected here rather than the guards loosened.");
{
  const p = pristine("a1", STORE);
  patch(STORE, `                     ground: leg.ground ?? null };`,
               `                     ground: leg.ground ?? null, asserted_by: leg.asserted_by ?? null };`);
  report("1", { pass: WHOLE - 5, fail: 5 }, runSuite());
  restore("a1", STORE, p);
}

/* ---------------------------------------------------------------- ARM 2 */
say("\n(2) THE FIELD NAMED IN A COMMENT INSIDE THE ARITHMETIC AND NOWHERE ELSE.");
say("    MUST NOT FAIL. A sweep that cites its own prose reports a reader that is not there,");
say("    and this repository has already had a sweep arm fail by citing itself.");
{
  const p = pristine("a2", STORE);
  patch(STORE, `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`,
               `  /* control arm 2: the words asserted_by, in a comment and nowhere else */\n`
             + `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`);
  report("2", { pass: WHOLE, fail: 0 }, runSuite());
  restore("a2", STORE, p);
}

/* ---------------------------------------------------------------- ARM 3 */
say("\n(3) THE SCANNER'S REGEX ARM REMOVED — the instrument's own defect, re-armed.");
say("    MUST FAIL: the desync self-check, the call-site roster, the arithmetic CLOSURE floor,");
say("    the PROPERTY VOCABULARY floor, and the sensitivity RE-RUN. This is the arm that says the");
say("    self-check is doing work rather than decorating a scanner that happens to be right.");
say("    DECLARED 2, CORRECTED TO 5 ON 2026-09-13 (D-330) — THE SUBJECT MOVED AND THE STALING");
say("    COMMIT IS `63a329d` (record: D-266, 2026-08-10). THE MECHANISM, BISECTED RATHER THAN");
say("    INFERRED, over all 36 revisions of `src/store.mjs` since this driver was written, with");
say("    the recogniser held fixed at the suite's own current bytes: with the regex arm removed");
say("    the scanner treats every `/` as division, and a runaway begins at the SAME construct in");
say("    every tree measured — `#reevalRaisedBy`, ~line 2966. What changed is HOW FAR IT RUNS.");
say("    At `0110ffe` it swallowed 14 method marks and NONE of them was in the arithmetic, so the");
say("    closure and the property vocabulary really did survive intact and the declaration was");
say("    RIGHT ABOUT THE TREE IT MEASURED. At `63a329d` the runaway reaches 128 marks and takes");
say("    `#strengthWalk`, `#axisResult`, `#groundResult` and `#weakestOf` with it — the whole");
say("    arithmetic — so the closure collapses to 1 (the root, which is seeded and not found) and");
say("    the property vocabulary to 0. Every step is recorded: 403 methods / closure 8 / props 47");
say("    at `0110ffe`, 289 / 1 / 0 at `63a329d`, with the boundary clean and no revision between.");
say("    THE INSTRUMENT IS STRONGER THAN ITS OLD DECLARATION SAID, WHICH IS WHY THIS IS A");
say("    CORRECTION AND NOT A LOOSENING: the header used to record that the desync check and the");
say("    roster were the ONLY two things standing between a broken scanner and a result reading");
say("    perfectly clean. Three more guards now fire, and the two floors that were vacuous under");
say("    a desync are the ones that fire hardest — a floor catching an EMPTY corpus, doing");
say("    exactly the job floors are floored for.");
{
  const p = pristine("a3", SUITE);
  patch(SUITE, `      if (c === "/" && (REGEX_OK_AFTER.has(lastSig) || KEYWORD_BEFORE.test(code.slice(-24)))) {`,
               `      if (false) {`);
  report("3", { pass: WHOLE - 5, fail: 5 }, runSuite());
  restore("a3", SUITE, p);
}

/* ---------------------------------------------------------------- ARM 4 */
say("\n(4) THE PARTITION COLLAPSED — `#axisResult` buckets every leg into one implicit part.");
say("    MUST FAIL: both non-degeneracy assertions and the SENSITIVITY assertion.");
say("    MUST NOT FAIL: the two attribution EQUALITIES — and that is the finding, not an");
say("    accident: they stay green over an arithmetic that has stopped composing at all.");
say("    DECLARED 4, CORRECTED TO 3 ON 2026-09-13 (D-330). THE FOURTH WAS `the harm`, AND THE");
say("    STALING COMMIT IS `fc55b62` — CONDUCT's own integration of this item, 2026-08-09, which");
say("    corrected §4's two PINNED DEFECT assertions exactly as PL-20 asked. When this arm was");
say("    declared, §4's harm assertion READ A COMPOSED PAIR straight out of the arithmetic");
say("    (`[VU.pair.connection.grade, VU.pair.connection.weakest.target_id, ...]` -> `[\"A\", V_A2,");
say("    \"C\"]`), so collapsing the partition moved it and it fell. `fc55b62` replaced it with a");
say("    statement about a write that NEVER LANDS — `[VU.ok, VU.pair, VC.ok, VC.pair]` ->");
say("    `[false, null, false, null]` — because PL-19 (`7c94b43`) put `C-25.6` on `main` and the");
say("    two-part unclaimed reading is now REFUSED at the write. `#axisResult` is not on the write");
say("    path, so this arm cannot reach that assertion any more and must not claim to.");
say("    THE LOSS IS REAL AND IS NAMED RATHER THAN ABSORBED: nothing in this driver now witnesses");
say("    the HARM itself. That is not a gap this arm can close — the composition whose harm it");
say("    measured can no longer be written, which is the fix working. What survives is the");
say("    counterfactual pair (`CLAIMED_ONLY` beside `TWO_PART_UNCLAIMED`), which still fails if");
say("    the refusal ever starts swallowing legitimate versions, and that is the direction a");
say("    refusal is actually likely to go wrong in.");
{
  const p = pristine("a4", STORE);
  patch(STORE, `    for (const m of members) at(m.ground ?? null).members.push(m);`,
               `    for (const m of members) at(null).members.push(m);`);
  report("4", { pass: WHOLE - 3, fail: 3 }, runSuite());
  restore("a4", STORE, p);
}

/* ---------------------------------------------------------------- ARM 5 */
/* ===========================================================================
 * (5) IS RETIRED, 2026-09-13, UNDER D-330 — AND IT IS RETIRED BECAUSE ITS
 * SUBJECT BECAME THE MAINLINE, NOT BECAUSE IT WAS INCONVENIENT. This is a
 * supersession with its reason on the record, never an exemption.
 *
 * WHAT IT DID. It ran the UNPATCHED suite against PL-19's own sources in a
 * scratch `git worktree` at `4b3f7a7` — not a hand-written stand-in for the
 * other tree but THE OTHER TREE, which is stronger than any patch. It declared
 * `WHOLE - 2 / 2`: exactly §4's two defect pins, because PL-19's `C-25.6`
 * refuses the write, with the reach, the supply and both differentials green
 * because the answer is a property of `#strengthWalk`, which PL-19 did not
 * touch.
 *
 * WHY IT IS RETIRED — TWO REASONS, EACH SUFFICIENT ON ITS OWN, AND THE FIRST IS
 * THE ONE THIS ARM'S OWN AUTHOR ANTICIPATED IN WRITING:
 *
 *   1. PL-19 IS MERGED. `4b3f7a7` is an ancestor of `main` (checked with
 *      `git merge-base --is-ancestor`, not assumed from a commit message), so
 *      what this arm reached out of process to measure is now what the battery
 *      measures on every run. The arm's own fallback text said it: *"if CONDUCT
 *      has since integrated it, this arm is subsumed by the battery and can be
 *      struck."* The staling commit is `7c94b43`, the PL-19 merge.
 *
 *   2. IT CAN NO LONGER RUN AT ALL, AND IT DID NOT SAY SO OUT LOUD. Measured
 *      2026-09-13 on a green `main`: the arm's worktree add SUCCEEDS, so its own
 *      COULD-NOT-ARM path never fires — and then the suite dies before its first
 *      assertion with `ERR_MODULE_NOT_FOUND: test/stdio.mjs`. `a3a2116` (D-282,
 *      2026-08-10) made every `.test.mjs` import `./stdio.mjs` for its side
 *      effect, and `4b3f7a7` predates that module, so copying today's suite into
 *      that tree copies a dependency the tree has not got. THE ONLY THING THAT
 *      REPORTED THIS WAS THE MISSING-TALLY SENTINEL: the arm came back `-1 pass,
 *      -1 fail` and `report()` called it NOT AS DECLARED. **A suite that died
 *      before its foot has not passed nothing — it has told us nothing**, and
 *      the `-1`-never-`0` rule is the whole reason this was legible instead of
 *      reading as a catastrophic 27-to-0 regression.
 *
 * M0-25's CENSUS DID NOT RECORD THIS ONE. `DEBT.md`'s D-330 row names arms (3)
 * and (4) as the two that came back not-as-declared; the run here found THREE,
 * and (5) is the third. Recorded rather than smoothed, because a brief's figure
 * being incomplete is exactly what re-measuring is for.
 *
 * WHAT IS LOST, AND IT IS NOT NOTHING. This was the only arm in this driver that
 * measured against a REAL OTHER TREE rather than a patch, and that property has
 * no replacement here. It is also, now, the only thing that would have noticed
 * `C-25.6` being reverted on the PL-19 side specifically — though §4's two
 * corrected assertions, which the battery runs, fail if the refusal disappears,
 * so the BEHAVIOUR is covered even though the differential is not.
 *
 * WHAT WOULD BRING IT BACK, stated so the next reader does not re-derive it:
 * an arm comparing two trees needs the suite to be self-contained in each, which
 * since D-282 it is not. Copying `stdio.mjs` alongside the suite would make it
 * run again and would also make it measure a tree nobody ever shipped. Left
 * undone deliberately rather than guessed at.
 * ======================================================================== */
say("\n(5) RETIRED 2026-09-13 (D-330) — PL-19 is MERGED (`4b3f7a7` is an ancestor of `main`),");
say("    so this arm's subject is now the mainline and the battery measures it on every run.");
say("    It had ALSO stopped being runnable: `a3a2116` (D-282) made every suite import");
say("    `test/stdio.mjs`, which `4b3f7a7` has not got, so the copied suite died before its");
say("    first assertion and only the missing-tally sentinel (-1, never 0) made that legible.");
say("    THE LOSS, NAMED: this was the only arm here measuring against a real OTHER TREE.");

/* ---------------------------------------------------------------- ARM 6 */
say("\n(6) OVER-STRICTNESS — the ground rows attributed in spellings nobody anticipated.");
say("    MUST NOT FAIL. A gate tighter than its rule is not a safer gate, and an instrument");
say("    that only recognises the names its author happened to type is not measuring the rule.");
{
  const p = pristine("a6", SUITE);
  patch(SUITE, `      \`    asserted_by: \${r.by ?? "carol"}\`, \`    at: "\${r.at ?? AT1}"\`,`,
               `      \`    asserted_by: \${r.by ?? "Ruth O’Brien-Kaur (acting chair)"}\`, \`    at: "\${r.at ?? AT1}"\`,`);
  patch(SUITE, `...scalarLine("asserted_by", g.by ?? "ruth"),`,
               `...scalarLine("asserted_by", g.by ?? "none-of-the-above ruth@believeinoakland.org"),`);
  report("6", { pass: WHOLE, fail: 0 }, runSuite());
  restore("a6", SUITE, p);
}

say(`\n${problems ? `*** ${problems} PROBLEM(S) — read every line above ***` : "every arm as declared; every restore verified by sha256 AND by cmp"}`);
process.exit(problems ? 1 : 0);
