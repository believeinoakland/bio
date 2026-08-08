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
 * BASELINE, whole probe, measured before any arm: 38 pass, 0 fail.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const PROBE = fileURLToPath(new URL("./d216-sharing.probe.mjs", import.meta.url));
const ORIGINAL = readFileSync(STORE, "utf8");
const ORIGINAL_SHA = createHash("sha256").update(ORIGINAL).digest("hex");

const runProbe = () => {
  let out = "";
  try { out = execFileSync(process.execPath, [PROBE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { out = String(e.stdout ?? "") + String(e.stderr ?? ""); }
  const tally = out.match(/d216-sharing\.probe: (\d+) pass, (\d+) fail/);
  const failed = out.split("\n").filter((l) => l.trim().startsWith("FAIL"))
    .map((l) => l.trim().slice(5).trim().slice(0, 96));
  return { pass: tally ? Number(tally[1]) : null, fail: tally ? Number(tally[2]) : null, failed };
};

const restore = (arm) => {
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

/* --------------------------------------------------------------- POLARITY */
console.log("\nPOLARITY — the tree is back and the probe is green again.");
const back = runProbe();
console.log(`  ${back.fail === 0 ? "GREEN" : "RED"}: ${back.pass} pass, ${back.fail} fail`);
if (back.fail !== 0) armsBad++;

console.log(`\nd216-sharing.control: ${armsOk} arms as declared, ${armsBad} not`);
process.exit(armsBad ? 1 : 0);
