/* PL-15 / D-213 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, taken
 * up by PL-4's `capturerequests.control.mjs` and PL-14's `strengthpair`.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07
 * a worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY RESTORE IS VERIFIED BY HASH **AND BY CONTENT**, and additionally by
 * `cmp` against a pristine copy taken before any arm ran — three readers rather
 * than one, because this project has met an NC harness that reported a
 * byte-identical restore over a file it never restored, and a sha256 comparison
 * answers "the bytes are the same" only if the reader that produced both
 * digests was the same reader.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and every
 * arm DECLARES BEFORE IT RUNS what must fail and what must NOT. One defence
 * down proves teeth and says nothing about harm. Arm (2c) is the exception and
 * says so in its own title: it takes TWO down deliberately, because naming the
 * harm of a half fence requires the half fence to be in place while the thing
 * it fails to catch goes past.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT
 * THE ARM, recorded rather than smoothed. Two arms in this file did exactly
 * that on their first run and both notes are kept at their arms.
 *
 * Run it:  node test/leadslug.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  queuestate: ROOT + "src/queuestate.mjs",
  checks: ROOT + "checks/bio-checks.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE THIRD READER. A pristine copy on disk, taken before anything is armed,
   so `cmp` can answer the restore question without going through this process's
   own string handling at all. */
const PRISTINE = mkdtempSync(join(tmpdir(), "pl15-pristine-"));
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PRISTINE, k));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* BOTH REPORT SPELLINGS. Suites in this tree end on `N pass, M fail` or on
     `<name>: N passed, M failed`, and a matcher that knew only one read a
     healthy suite as UNREADABLE — which this harness then reports as a broken
     tree and refuses to run over. Measured on this file's first run against
     `queue-conditions.test.mjs`. */
  const m = /(\d+) pass(?:ed)?, (\d+) fail(?:ed)?/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 140));
  /* A suite that THREW reports its own line, and it is kept: a thrown suite and
     a suite with N failures are different claims (D-93's lesson). */
  return m ? { pass: +m[1], fail: +m[2], named, out } : { pass: null, fail: null, named, out };
}

function runGuard() {
  try {
    execFileSync(process.execPath, [ROOT + "../civicos-ui/test/run.mjs"], { encoding: "utf8", timeout: 900000 });
    return { ok: true };
  } catch (e) { return { ok: false, out: String(e.stdout || "") + String(e.stderr || "") }; }
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
    /* AND BY A READER THAT IS NOT THIS PROCESS. */
    execFileSync("cmp", ["-s", p, join(PRISTINE, k)]);
  }
}

function arm(title, edits, mustFail, mustNotFail = [], suite = "leadslug.test.mjs") {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED (${suite}): ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (!r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256, by content, AND by cmp against a pristine copy");
  }
}

console.log("PL-15 / D-213 — negative controls. Whole-tree baselines first, so every arm is a DELTA.");
const base = runSuite("leadslug.test.mjs");
console.log(`  BASELINE leadslug.test.mjs: ${base.pass} pass, ${base.fail} fail`);
const baseHyg = runSuite("hygiene.test.mjs");
console.log(`  BASELINE hygiene.test.mjs: ${baseHyg.pass} pass, ${baseHyg.fail} fail`);
const baseQC = runSuite("queue-conditions.test.mjs");
console.log(`  BASELINE queue-conditions.test.mjs: ${baseQC.pass} pass, ${baseQC.fail} fail`);
if (base.fail !== 0 || baseHyg.fail !== 0 || baseQC.fail !== 0) {
  console.log("  ** the tree is not whole; arms below would measure the wrong thing");
  rmSync(PRISTINE, { recursive: true, force: true });
  process.exit(1);
}

/* ============================ (1) THE SPINE ============================== */

arm("(1) THE SPINE — THE LEAD IS FILED UNDER THE QUESTION IT BEARS ON. File it under the question "
  + "the RUN WAS WORKING instead, which is the one-line change that turns this item back into the "
  + "hole D-213 was raised about. The lead still exists, still names both questions in its basis, "
  + "still reports the capture and the absent basis entry — it is simply routed to the wrong people, "
  + "which is precisely why an arm has to be pointed at it. "
  + "DECLARED: the case-set arms MUST fail; every arm about capture, basis absence, options and the "
  + "door MUST stay green.",
  [["store", `        case: this.#queueAncestors([r.lead_inquiry], viewer),`,
             `        case: this.#queueAncestors([r.target], viewer),`]],
  ["its homes are inquiry B's project",
   "inquiry A's project appears NOWHERE in the item"],
  ["the basis entry is ABSENT",
   "options[] is REAL",
   "a lead pointing back at the question the run is working is refused by name"]);

/* ================= (2) THE PLAN ROW'S OWN NAMED CONTROL ================== */

arm("(2) THE PLAN ROW'S NAMED CONTROL, HALF ONE — AN `N-<n>` ID AT THE MINT. D-213's close condition "
  + "was CORRECTED on 2026-08-07 because the code does not use N-ids: the live vocabulary is SLUGS, "
  + "and NOTIFICATIONS.md's own numbering is a design document's. Mint the lead under `N-31` and the "
  + "store must refuse the whole feed rather than publish an item no surface has words for. "
  + "DECLARED: every arm that reads a feed MUST fail; the door arms and the schema arms MUST NOT.",
  [["store", `        kind: "out-of-inquiry-lead",`, `        kind: "N-31",`]],
  ["op=queue ANSWERS — the mint admitted every item it was handed",
   "op=queue carries exactly one out-of-inquiry lead"],
  ["a lead pointing back at the question the run is working is refused by name",
   "the column is declared and is NULLABLE"]);

arm("(2b) THE PLAN ROW'S NAMED CONTROL, HALF TWO — AN UNCATALOGUED SLUG. The same refusal reached by "
  + "the likelier route: a slug that LOOKS right and is not in the catalogue, which is what a rename "
  + "or a second producer typed from memory produces. "
  + "DECLARED: identical to (2). If this arm and (2) disagreed, the fence would be matching a shape "
  + "rather than asking the catalogue.",
  [["store", `        kind: "out-of-inquiry-lead",`, `        kind: "out-of-inquiry-lead-v2",`]],
  ["op=queue ANSWERS — the mint admitted every item it was handed",
   "op=queue carries exactly one out-of-inquiry lead"],
  ["a lead pointing back at the question the run is working is refused by name"]);

arm("(2c) THE MISFILING HALF, WHICH (2) AND (2b) CANNOT REACH. Mint the real, catalogued kind under "
  + "the WRONG CLASS. This is the dangerous one and it is why the mint has two codes rather than one: "
  + "the kind is known, so NO_SUCH_KIND would never fire, and a FINDING minted as a CONDITION becomes "
  + "personally MUTEABLE — one member silencing a lead the team must see, which is exactly the "
  + "doctrine D-125/DEC-16 protects. "
  + "DECLARED: the feed arms MUST fail (the mint refuses whole); the FINDING-class arm in block 1 "
  + "MUST stay green, because the VOCABULARY still says FINDING — only the producer lied.",
  [["store", `        class: "FINDING",\n        kind: "out-of-inquiry-lead",`,
             `        class: "CONDITION",\n        kind: "out-of-inquiry-lead",`]],
  ["op=queue ANSWERS — the mint admitted every item it was handed",
   "op=queue carries exactly one out-of-inquiry lead"],
  ["the slug exists and classOfKind answers FINDING",
   "a member CANNOT mute it"]);

/* ============ (3) THE SWEEP — TWO DEFENCES DOWN, DELIBERATELY ============ */

arm("(3) THE SWEEP, AND THIS ARM TAKES TWO DEFENCES DOWN ON PURPOSE — stated rather than discovered, "
  + "because one defence down proves teeth and says nothing about harm. Restore the mint to REC-32's "
  + "CONDITION-ONLY shape (both `classOfKind` clauses replaced by the single class-guarded one) AND "
  + "leave the producer minting an `N-31` kind. Under the old fence the item is a FINDING, so the "
  + "CONDITION-only guard never looks at it, and `N-31` REACHES A MEMBER'S FEED. That is the class "
  + "PL-15 closed, demonstrated rather than asserted. "
  + "DECLARED: block 7's catalogue arm MUST fail (a live item's kind is classed by nothing) while "
  + "the FEED KEEPS ANSWERING — the opposite signature from arms (2)/(2b), and the difference between "
  + "the two signatures IS the finding.",
  [["store",
    `      if (classOfKind(it.kind) === null)`,
    `      if (false && classOfKind(it.kind) === null)`],
   ["store",
    `      if (classOfKind(it.kind) !== it.class)`,
    `      if (it.class === "CONDITION" && classOfKind(it.kind) !== "CONDITION")`],
   ["store", `        kind: "out-of-inquiry-lead",`, `        kind: "N-31",`]],
  ["every kind every producer emits is one the catalogue names",
   "op=queue carries exactly one out-of-inquiry lead"],
  /* THE SIGNATURE THAT SEPARATES THIS ARM FROM (2). Under the swept fence the
     feed REFUSES and `q.ok` is false; under REC-32's half fence the feed
     ANSWERS and carries an item nothing can render. Same producer defect, two
     completely different member experiences, and this clause is what proves the
     sweep changed which one happens. */
  ["op=queue ANSWERS — the mint admitted every item it was handed"]);

/* ================ (4) THE ABSENCE IS MEASURED, NOT PRINTED =============== */

arm("(4) THE BASIS ABSENCE IS A MEASUREMENT AND NOT A CONSTANT. Bind the two COUNT reads to a "
  + "target nothing answers to. Both counts then read zero for every document, so the field prints "
  + "`absent` unconditionally — which is the shape of an instrument walking an empty corpus and "
  + "reporting its verdict triumphantly. "
  + "DECLARED: the `present` arm MUST fail; the `absent` and `undetermined` arms MUST stay green, "
  + "because they are the answers a blind instrument gives by accident and only the third one "
  + "discriminates.",
  [["store", `SELECT COUNT(*) AS n FROM inquiry_basis WHERE target_id=?\`, reg.bundle_id).n`,
             `SELECT COUNT(*) AS n FROM inquiry_basis WHERE target_id=?\`, "--none--").n`],
   ["store", `SELECT COUNT(*) AS n FROM inquiry_basis_version_legs WHERE target_id=?\`, reg.bundle_id).n`,
             `SELECT COUNT(*) AS n FROM inquiry_basis_version_legs WHERE target_id=?\`, "--none--").n`]],
  ["the SAME field now reads `present`"],
  ["the basis entry is ABSENT",
   "they report DIFFERENT basis states from the same field"]);

/* ============ (5) THE PURGE, AND THE HALF hygiene CANNOT SEE ============= */

arm("(5) THE PURGE, BY CONSEQUENCE (D-113). Delete the per-bundle arm's `lead_inquiry` clear. This "
  + "is the D-113 class arriving through a COLUMN rather than through a table, so `hygiene.test.mjs` "
  + "— which compares TABLE lists — is structurally unable to see it and is run alongside to prove "
  + "that. A member-facing FINDING then keeps standing whose home is a question nobody can read. "
  + "DECLARED: this suite's purge arm MUST fail; hygiene MUST STAY GREEN, and hygiene staying green "
  + "is the POINT of the arm rather than a side effect.",
  [["store", `        this.sql.exec(\`UPDATE capture_requests SET lead_inquiry=NULL WHERE lead_inquiry=?\`, bundleId);`,
             `        /* armed by leadslug.control.mjs arm 5 */`]],
  /* CORRECTED AFTER THIS ARM'S FIRST RUN, AND THE CORRECTION IS THE FINDING.
     It was declared as "the member's feed still carries the lead", and it came
     back GREEN: `#bundleGate` compiles an EXISTS over `bundles` for an
     identified member, so a lead pointing at a purged question is filtered out
     of a MEMBER's feed whether or not purge cleared the column. The
     member-facing arm alone would have passed over a missing purge clause.
     What the clause actually buys is visible to the OPERATOR view, whose gate
     is `1=1` by design (D-15: no person behind an instance token whose
     participation could be checked), and at the ROW. Both are declared now. */
  ["gone from the OPERATOR view too",
   "no surviving request still names the purged question"],
  ["every lead filed under it is gone from a MEMBER's feed"]);

/* ============== (6) THE DOOR'S TWO CODES, ONE AT A TIME ================== */

arm("(6) THE DOOR — A LEAD MUST NAME A QUESTION (C-28.14), the other refusal HELD OPEN. With it "
  + "gone a lead may name a document or a bundle id nothing answers to, and the notification is "
  + "filed under a home that cannot hold it. "
  + "DECLARED: the two C-28.14 arms MUST fail; C-28.15's arm MUST stay green.",
  [["store", `      if (!lb || normalizeType(lb.object_type) !== "inquiry")`,
             `      if (false)`]],
  ["a lead naming a DOCUMENT is refused by name (C-28.14)",
   "both door codes were DRIVEN by this suite"],
  ["a lead pointing back at the question the run is working is refused by name (C-28.15)"]);

arm("(6b) THE DOOR — A LEAD IS NEVER THE TARGET (C-28.15), the other refusal HELD OPEN. With it gone "
  + "a run can file a lead on the question it is already working, and the member is told that "
  + "evidence for a different question was found — about this one. "
  + "DECLARED: C-28.15's arm MUST fail; C-28.14's arms MUST stay green.",
  [["store", `      if (lead === target)`, `      if (false)`]],
  ["a lead pointing back at the question the run is working is refused by name (C-28.15)"],
  ["a lead naming a DOCUMENT is refused by name (C-28.14)"]);

/* ================== (7) THE VOCABULARY IS THE AUTHORITY ================== */

arm("(7) THE CLASS IS DOCTRINE AND NOT A LABEL. Move the slug from QUEUE_FINDING_KINDS into "
  + "QUEUE_CONDITION_KINDS in queuestate.mjs — the change somebody makes when they want the lead to "
  + "be dismissable from one member's list without an authored act. The producer still mints FINDING, "
  + "so the mint's KIND_MISCLASSED fires; and if it did not, op=queuemute would start ACCEPTING a "
  + "mute on a real lead. "
  + "DECLARED: block 1's class arms and the feed arms MUST fail; the door arms MUST stay green.",
  [["queuestate", `  "out-of-inquiry-lead":        "evidence for ANOTHER question`,
                  `  "out-of-inquiry-lead-moved":  "evidence for ANOTHER question`],
   ["queuestate", `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",`,
                  `  "runtime-ceiling-reached":      "a CPU or subrequest ceiling was reached (D-54, D-56)",\n  "out-of-inquiry-lead":         "moved by leadslug.control.mjs arm 7",`]],
  ["the slug exists and classOfKind answers FINDING",
   /* THE HARM, NAMED. If the class moves and nothing else changes, op=queuemute
      starts ACCEPTING a mute on a real lead — one member silencing what a team
      must see, with nothing in the record about who did it or why. */
   "a member CANNOT mute it",
   /* AND THE MINT CATCHES IT ANYWAY, which is the second half of the arm: the
      producer still mints FINDING, so KIND_MISCLASSED fires and the feed
      refuses rather than publishing an item whose class and catalogue disagree. */
   "op=queue ANSWERS — the mint admitted every item it was handed"],
  ["a lead naming a DOCUMENT is refused by name (C-28.14)"]);

/* ===================== (8) THE OVER-STRICTNESS ARM ======================= */

console.log(`\n=== (8) OVER-STRICTNESS — NOTHING IS ARMED, AND EVERYTHING MUST PASS.`);
console.log(`  A fence that refuses correct work is a defect in the fence, so this arm asserts the`);
console.log(`  ABSENCE of over-strictness on a WHOLE tree rather than a broken one. The suite's own`);
console.log(`  block 9 carries the four cases and they are listed here so the claim is legible:`);
console.log(`    - a request naming NO lead is accepted and mints NO item (the common case);`);
console.log(`    - \`lead\` is accepted as well as \`lead_inquiry\` (a spelling this item did not pick);`);
console.log(`    - a LEGACY \`focus\`-typed question is a legal lead (REC-10's MAP RULE);`);
console.log(`    - PL-4's sibling CONDITION over the same table still fires beside the new FINDING.`);
{
  armsRun++;
  const r = runSuite("leadslug.test.mjs");
  const g = runGuard();
  console.log(`  MEASURED: leadslug.test.mjs ${r.pass} pass, ${r.fail} fail; civicos-ui harness ${g.ok ? "green" : "RED"}`);
  if (r.fail !== 0 || !g.ok) { console.log("  ** WRONG: correct work is being refused somewhere."); armsWrong++; }
}

rmSync(PRISTINE, { recursive: true, force: true });
console.log(`\n${armsRun} arms run, ${armsWrong} behaved differently from their declaration.`);
if (armsWrong) process.exit(1);
