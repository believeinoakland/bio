/* NEGATIVE CONTROLS for `test/d216-sharing.probe.mjs` — D-216's model check.
 *
 * DELIBERATELY NOT A `.test.mjs`, and for the reason `versionstate.control.mjs`
 * and `check-refusal-codes.mjs` are not: IT EDITS A REAL SOURCE WHILE IT RUNS.
 * The battery must not discover it, and a run that dies between ARM and RESTORE
 * leaves `src/store.mjs` modified — which is why every restore is verified by
 * sha256 AND by content, and why the original bytes are held in memory from the
 * first read rather than re-read from disk.
 *
 *     node bio-plane/test/d216-sharing.control.mjs
 *
 * WHY THESE THREE ARMS AND NOT OTHERS. The probe makes claims of three
 * different KINDS and each kind can fail in a different way:
 *
 *   ARM 1 — THE EDGE IS LOAD-BEARING. The probe says the project-to-inquiry
 *     `cites` edge is what creates the relationship. Break the gate that reads
 *     it and the probe must lose exactly the two arms that assert it, and NO
 *     others: an arm that fails everywhere proves nothing about any one thing.
 *
 *   ARM 2 — THE STANCE IS PER-PROJECT. This is D-216's literal question, so the
 *     control is D-216's literal ALTERNATIVE: make the read answer ONE stance
 *     that every referencing project shares. If the probe stays green under
 *     that, the probe never measured the difference and the whole item is void.
 *
 *   ARM 3 — THE VACUITY GUARD IS WHAT CARRIES ARM B, and this is the sharpest
 *     of the three because it is the failure THIS ITEM WAS WARNED ABOUT:
 *     *"two projects both see the inquiry is trivially true if neither can see
 *     anything."* Empty the version list and the "both projects see the
 *     IDENTICAL set" arm MUST STILL PASS — two empty lists agree at zero cost —
 *     while the guard arms fail. That is the demonstration that the guard, and
 *     not the equality, is doing the work.
 *
 * BASELINE, whole probe, measured before any arm: 40 pass, 0 fail.
 *
 * ========================================================================
 * THE BASELINE WAS CORRECTED FROM 38 TO 40 ON 2026-09-13 UNDER D-330, AND THE
 * REASON IS NOT THE ONE THE FIGURE LOOKS LIKE. This driver was found RED by
 * M0-25's arm-liveness census and re-measured here on an unmodified tree before
 * anything was touched: `36 pass, 4 fail`, so it printed *"baseline is not
 * green; every arm below would be uninterpretable"* and stopped — the driver
 * behaving exactly correctly, and the reason all three arms below had gone
 * unmeasured for however long the drift had stood. TWO INDEPENDENT DRIFTS were
 * summed inside that one figure and only measuring them apart separated them:
 *
 *   +2 THE PROBE GREW. `82ea2b7` (REC-72, 2026-08-08) added two assertions to
 *      `d216-sharing.probe.mjs` — the curated act it caused, driven, plus its
 *      over-strictness arm — and did not move this number. The probe's whole
 *      tally went 38 -> 40 and nothing failed for it.
 *   -4 FOUR DECLARATIONS IN THE PROBE WENT STALE against subjects that
 *      LEGITIMATELY MOVED, and they are corrected AT THEIR OWN SITES with what
 *      moved and when: `ce2fe34` (CASE-2, DEC-72/IC-65) removed the cross-citer
 *      bar composition and `#requiredStrengthFor` with it (three arms), and
 *      `7ab3117` (PL-13/IS-3) minted the two notification slugs the probe had
 *      deliberately pinned ABSENT (one arm). NONE IS A PLANE DEFECT.
 *
 * A FIGURE THAT MOVED FOR TWO REASONS AT ONCE IS WHY THIS DRIVER'S BASELINE GATE
 * IS WORTH ITS COST: a driver that had simply re-declared 36/4 to make itself run
 * would have buried a correct +2 and four wrong declarations under one number
 * nobody could take apart afterwards.
 *
 * WHAT THIS DRIVER'S `declare()` CAN AND CANNOT SEE, stated because the run that
 * followed the correction exercised it: `mustFail` is a SUBSET test and
 * `mustNotFail` a disjointness test, so an arm may bring down MORE assertions
 * than it names and still read AS DECLARED. Arm 2 does exactly that — it declares
 * four and fells five, the fifth being the third-project over-strictness arm,
 * which is genuinely downstream of the same read. That is a deliberate looseness
 * rather than a miss: these arms are about WHICH assertions are load-bearing, and
 * pinning an exact count would turn every legitimate new assertion in the probe
 * into a false failure here — the drift this driver has just been repaired from.
 * The exact tallies are PRINTED on every run, so a reader sees the counts this
 * prose does not pin.
 *
 * FIRST RUN WITH A GREEN BASELINE, 2026-09-13: ALL THREE ARMS AS DECLARED,
 * polarity green at 40/0, every restore verified by sha256 AND by full content
 * comparison. No arm needed re-anchoring — all three anchors still occur EXACTLY
 * ONCE in `src/store.mjs`, counted against the committed blob before the run.
 *
 * NEGATIVE CONTROL for the D-330 corrections themselves, RUN 2026-09-13, armed
 * ALONE, restore verified by sha256 AND `cmp`, recorded so the next session
 * re-runs it in one step rather than re-deriving how to break it:
 *   (1b) RE-STALE ONE corrected declaration in the PROBE — put arm E(5)'s
 *        notification-slug expectation back from `[true, true]` to
 *        `[false, false]`. MUST: the probe goes 39/1 failing that assertion AND
 *        NOTHING ELSE, and THIS DRIVER stops at its baseline gate with
 *        `baseline is not green`, exit 1, having armed nothing. MEASURED:
 *        exactly that — one failure by name, the gate holding, zero arms fired.
 *        That second half is the point: a probe one assertion wrong disarms all
 *        three controls here, which is how four stale declarations bought
 *        themselves an unmeasured driver in the first place.
 *   (2)  OVER-STRICTNESS: the untouched tree leaves this driver at exit 0, three
 *        arms as declared, the probe at 40/0, and all three files byte-identical.
 *        MEASURED: identical on every count.
 * ======================================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const PROBE = fileURLToPath(new URL("./d216-sharing.probe.mjs", import.meta.url));
const ORIGINAL = readFileSync(STORE, "utf8");
const ORIGINAL_SHA = createHash("sha256").update(ORIGINAL).digest("hex");

const runProbe = () => {
  if (ANCHOR_DRY) return { pass: 0, fail: 0, failed: [] };   /* M0-197: no probe under the dry read */
  let out = "";
  try { out = execFileSync(process.execPath, [PROBE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { out = String(e.stdout ?? "") + String(e.stderr ?? ""); }
  const tally = out.match(/d216-sharing\.probe: (\d+) pass, (\d+) fail/);
  const failed = out.split("\n").filter((l) => l.trim().startsWith("FAIL"))
    .map((l) => l.trim().slice(5).trim().slice(0, 96));
  return { pass: tally ? Number(tally[1]) : null, fail: tally ? Number(tally[2]) : null, failed };
};

const restore = (arm) => {
  if (ANCHOR_DRY) return;   /* M0-197: nothing was armed */
  writeFileSync(STORE, ORIGINAL);
  const back = readFileSync(STORE, "utf8");
  const sha = createHash("sha256").update(back).digest("hex");
  if (sha !== ORIGINAL_SHA || back !== ORIGINAL)
    throw new Error(`RESTORE FAILED after ${arm}: sha ${sha} vs ${ORIGINAL_SHA}, content-equal ${back === ORIGINAL}`);
  console.log(`  restored after ${arm} — verified by sha256 AND by content`);
};

/* An armed edit REFUSES TO ARM BLIND: the target text must occur EXACTLY once,
   or the harness would silently arm a site nobody chose (PL-10's finding, and it
   is why that item's harness stopped). */
const arm = (name, find, replace) => {
  if (ANCHOR_DRY) return void anchorRows([{ arm: name, file: STORE, find, put: replace }]);   /* M0-197: read, never armed */
  const n = ORIGINAL.split(find).length - 1;
  if (n !== 1) throw new Error(`ARM ${name}: target text occurs ${n} times, expected exactly 1 — refusing to arm blind`);
  writeFileSync(STORE, ORIGINAL.replace(find, replace));
};

console.log("=== D-216 probe · negative controls ===\n");

const base = runProbe();
console.log(`BASELINE (unmodified tree): ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  baseline is not green; every arm below would be uninterpretable."); process.exit(1); }

let armsOk = 0, armsBad = 0;
const declare = (name, got, mustFail, mustNotFail) => {
  const hit = mustFail.filter((s) => got.failed.some((f) => f.includes(s)));
  const wrong = mustNotFail.filter((s) => got.failed.some((f) => f.includes(s)));
  const ok = hit.length === mustFail.length && wrong.length === 0;
  console.log(`  ${ok ? "AS DECLARED" : "NOT AS DECLARED"}  ${name}: ${got.pass} pass, ${got.fail} fail`);
  if (!ok) {
    console.log(`     expected-to-fail NOT seen: ${JSON.stringify(mustFail.filter((s) => !hit.includes(s)))}`);
    console.log(`     must-NOT-fail seen failing: ${JSON.stringify(wrong)}`);
  }
  console.log(`     failing arms: ${JSON.stringify(got.failed, null, 0).slice(0, 900)}`);
  ok ? armsOk++ : armsBad++;
};

/* ---------------------------------------------------------------- ARM 1 */
console.log("\nARM 1 — THE EDGE STOPS BEING LOAD-BEARING.");
console.log("  In `#moveVersionState`'s make-current pre-write check, let any project stand on any question:");
console.log("  the `draws` predicate that reads the project's own `references[]` becomes `true`.");
arm("1",
  `      const draws = refs.some((r) => r && typeof r === "object" && r.rel === "cites"
                                  && r.status !== "severed" && String(r.target ?? "").trim() === target);`,
  `      const draws = true; void refs;`);
declare("ARM 1",
  runProbe(),
  ["SEVERING THE EDGE REMOVES THE STANDING", "a project that never drew on the question is refused"],
  ["THE ANSWER", "BOTH PROJECTS SEE THE IDENTICAL VERSION SET", "THE POINTER IS A ROW ON THE PROJECT"]);
restore("ARM 1");

/* ---------------------------------------------------------------- ARM 2 */
console.log("\nARM 2 — D-216's LITERAL ALTERNATIVE: ONE STANCE EVERY REFERENCING PROJECT SHARES.");
console.log("  `#currentVersionOf` stops reading the NAMED project and reads the first project citing");
console.log("  the question instead — the shape §7 would be wrong about, and the shape cloning answers.");
arm("2",
  `    const pid = String(projectId ?? "").trim();
    if (!pid) return null;`,
  `    const shared = this.#one('SELECT b.bundle_id FROM bundles b JOIN refs r ON r.bundle_id=b.bundle_id '
      + "WHERE r.target_id=? AND b.object_type='project' ORDER BY b.bundle_id", inquiryId);
    const pid = (shared && shared.bundle_id) || String(projectId ?? "").trim();
    if (!pid) return null;`);
/* DECLARATION CORRECTED AFTER ITS FIRST RUN, and the correction is a finding
   rather than a tidy-up. The first version predicted that "the SAME field on
   project B carries B's own different row" would fail too. IT DID NOT, AND IT
   WAS RIGHT NOT TO: that arm reads B's `bundle.md` through `op=image` and never
   through `#currentVersionOf`, so breaking the READER cannot touch it. That is
   the property worth having — the per-project fact lives in the PROJECT'S OWN
   BYTES and survives a reader that stops honouring it, which is precisely why
   §7 puts the pointer in authored frontmatter instead of in a settings row.
   The control was right and the declaration was wrong. */
declare("ARM 2",
  runProbe(),
  ["THE ANSWER", "they genuinely DIFFER", "VACUITY GUARDED both ways",
   "B's act MOVED NOBODY ELSE"],
  ["BOTH PROJECTS SEE THE IDENTICAL VERSION SET", "a project that never drew on the question is refused",
   "the SAME field on project B"]);
restore("ARM 2");

/* ---------------------------------------------------------------- ARM 3 */
console.log("\nARM 3 — THE VACUITY ARM, AND IT IS THE ONE THAT MATTERS.");
console.log("  `op=basisversions` answers an EMPTY version list. The 'both projects see the IDENTICAL");
console.log("  set' arm MUST STILL PASS — two empty lists agree at zero cost — while the guards fail.");
/* THE ANCHOR IS THE THREE LINES ABOVE IT, not the line itself: `versions, count:
   versions.length, total,` occurs TWICE in `store.mjs` (op=basisversions and its
   sibling read), and the harness REFUSED TO ARM on the bare line — which is the
   guard doing its job and is recorded rather than smoothed away. */
arm("3",
  `      ...(present ? { inquiry_present: true } : {}),
      versions, count: versions.length, total,`,
  `      ...(present ? { inquiry_present: true } : {}),
      versions: [], count: 0, total,`);
{
  const got = runProbe();
  declare("ARM 3", got,
    ["VACUITY GUARDED: the shared question really holds two readings",
     "and each reading really carries legs"],
    ["BOTH PROJECTS SEE THE IDENTICAL VERSION SET"]);
  const equalityHeld = !got.failed.some((f) => f.includes("BOTH PROJECTS SEE THE IDENTICAL VERSION SET"));
  console.log(`  *** THE DEMONSTRATION: with NOTHING to see, "both projects see the identical set" ${equalityHeld ? "STILL PASSED" : "FAILED"} ***`);
  console.log(`      ${equalityHeld
    ? "So the equality was never the evidence — the NON-EMPTY guard is. That is why it is there."
    : "UNEXPECTED: re-read the arm before trusting arm B at all."}`);
}
restore("ARM 3");

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */

/* --------------------------------------------------------------- POLARITY */
console.log("\nPOLARITY — the tree is back and the probe is green again.");
const back = runProbe();
console.log(`  ${back.fail === 0 ? "GREEN" : "RED"}: ${back.pass} pass, ${back.fail} fail`);
if (back.fail !== 0) armsBad++;

console.log(`\nd216-sharing.control: ${armsOk} arms as declared, ${armsBad} not`);
process.exit(armsBad ? 1 : 0);
