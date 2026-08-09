#!/usr/bin/env node
/* version-predecessor.control.mjs — UI-50's NEGATIVE CONTROL DRIVER.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, and
 * `civicos-ui/test/run.mjs` discovers `*.test.mjs`; a driver the harness picked
 * up would mutate `app.html` underneath every other suite. PL-3/PL-4/FL-2/CPDF-9
 * set the precedent and this follows it.
 *
 *     node civicos-ui/test/version-predecessor.control.mjs
 *
 * WHAT IT DOES, and every one of these is a receipt this project has paid for:
 *
 *   - EACH ARM IS ARMED ALONE, with every other defence held open. Six arms
 *     failing together tells you nothing about which one is load-bearing.
 *   - THERE IS A BASELINE ARM (arm 7) that patches NOTHING and must come back
 *     GREEN. Without it, "every arm failed" is indistinguishable from "the
 *     harness is broken" — a driver here once reported `null pass, null fail`
 *     for every arm INCLUDING the baseline, and only the baseline row made that
 *     visible.
 *   - EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS: must-fail or
 *     must-not-fail, and (where it matters) the text the failure must contain.
 *     An arm that comes back GREEN when it was declared RED is a FINDING about
 *     the arm and is printed as one rather than smoothed away.
 *   - EVERY PATCH IS ASSERTED TO HAVE ARMED. The anchor's occurrence count is
 *     checked before the edit and the bytes are compared after it; a patch that
 *     matched zero times FAILS the driver instead of quietly testing nothing.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`), against a
 *     PRISTINE PRE-ARM COPY whose filename carries THE ARM ID as well as the
 *     path. A harness in this estate once took two snapshots of one file, named
 *     both from the PATH ALONE, and the second overwrote the first — so its
 *     outer check compared a correctly-restored original against patched bytes.
 *     `cmp` caught what sha256 could not, so both are run.
 *   - THE HARNESS DIRECTORY IS INSIDE THIS WORKTREE (`.ui50-harness/`), never a
 *     shared scratchpad two sessions can collide in.
 *
 * ------------------------------------------------------------ RESULTS, RUN
 *
 * RUN 2026-08-08 in worktree `agent-a773e28c7c7d0fb8b`. Eight arms, each armed
 * alone, all restores verified by sha256 AND `cmp`. FINAL: 8 arms, 8 as
 * declared, 0 not — but TWO of them were NOT as declared on their first run and
 * both are recorded below rather than smoothed away, because in this estate the
 * controls have found the instrument wrong more often than the subject.
 *
 *   (1) RESTORE THE FTS ROUTE — the chain's answer discarded and the pre-UI-50
 *       compare-and-return loop put back on the search rows. DECLARED: RED,
 *       naming the predecessor it should have picked AND the one it took.
 *       ACTUAL: RED — "at 2 version(s) it should have named INFO-2026-0901-agenda
 *       and it named INFO-2026-0900-agenda (the oldest at this address is
 *       INFO-2026-0900-agenda)". That is PL-10's measured defect reproduced end
 *       to end through the real `addGo`: the OLDEST version at the address.
 *   (2) THE WRONG END — `chainSeek(head.total - 1)` becomes `chainSeek(0)`.
 *       DECLARED: RED, naming both ids. ACTUAL: RED, same sentence — which is
 *       the point: one token at the seek and the record starts naming the first
 *       version instead of the last.
 *   (3) THE ABSENCE MADE A FAILURE. **FIRST RUN: NOT AS DECLARED — GREEN where
 *       RED was declared, and the arm was the thing that was wrong.** Its first
 *       form loosened the seek guard (`head.total > 0` -> `>= 0`) on the theory
 *       that a zero-version address would then seek and stumble. It does seek —
 *       and an empty page reads as an unestablished chain, the backstop finds no
 *       rows, and the whole thing still degrades to `null`, which is the honest
 *       absence the pin is about. **THE ARM COULD NEVER HAVE BEEN HONOURED**,
 *       which is a receipt this project has collected before. Replaced by an arm
 *       that makes the empty case ASSERT something — `return { bounded:true }`
 *       when the chain holds nothing. ACTUAL: RED — "and it is not a failure
 *       either — nothing says the check could not be completed".
 *   (4) OVER-STRICTNESS — an equivalent spelling of the pick
 *       (`tail.versions[tail.versions.length - 1]`, identical when the page
 *       holds one row). DECLARED: GREEN. ACTUAL: GREEN, 41 assertions.
 *   (5) NEUTER THE SWEEP'S ROSTER — `RANKED_OPS` emptied. DECLARED: RED on the
 *       corpus guard, with the corpus printed as zero. ACTUAL: RED — "SWEEP
 *       GUARD: the walk reaches a real corpus … 0 sites".
 *   (6) VACUITY ON THE FIXTURE — the shuffle removed, so the versions are stored
 *       in the answer's own order. DECLARED: RED on the instrument pin.
 *       ACTUAL: RED — "the fixture holds 60 versions … its storage order is
 *       neither chronological nor reversed".
 *   (7) BASELINE — no patch. DECLARED: GREEN. ACTUAL: GREEN, 41 assertions.
 *   (8) THE MATCHER GOES BLIND — the sweep's name closure cut back to the names
 *       the call is assigned to. DECLARED: RED on the REACH DELTA, because the
 *       walk then cannot see `heldMatch` at all. **ACTUAL: RED, but on a
 *       DIFFERENT PIN — the LICENCE FLOOR, "THE LICENCE TABLE IS EXACTLY EARNED
 *       — 0 positional pick(s) found, 1 licensed".** Recorded rather than
 *       re-declared quietly, because the surprise is the finding: the floor
 *       fires BEFORE the delta, since a walk that cannot see `heldMatch` also
 *       stops earning the only licence in the table, and the delta then reads
 *       0 -> 0 behind it. That is REC-70's lesson arriving on the floor side and
 *       it is what a floor is for. The declaration was corrected to the pin that
 *       actually catches it. **This arm is also what earned the name closure its
 *       existence**: the sweep's first draft had no closure, read `heldMatch` as
 *       SET-RENDERED, and reported a clean tree while being unable to see the
 *       one site this whole item is about.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const APP = path.join(UI, "app.html");
const SUITE = path.join(HERE, "version-predecessor.test.mjs");
const PEN = path.join(UI, ".ui50-harness");
fs.mkdirSync(PEN, { recursive: true });

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const same = (a, b) => {
  try { execFileSync("cmp", ["-s", a, b]); return true; } catch (_) { return false; }
};

/* THE PRISTINE-OF-RECORD, taken ONCE before any arm and never overwritten. Every
   restore is checked against this as well as against its own arm's copy. */
const RECORD = {};
for (const [k, p] of Object.entries({ app: APP, suite: SUITE })) {
  RECORD[k] = path.join(PEN, `record.${path.basename(p)}`);
  fs.copyFileSync(p, RECORD[k]);
}

const ARMS = [
  { id: "1-restore-fts-route", file: APP, mustFail: true,
    says: "should have named",
    what: "RESTORE THE FTS ROUTE — the chain discarded and the pre-UI-50 compare-and-return loop put back",
    patch: (t) => {
      const a1 = "  if(predecessor){";
      const a2 = "    if(heldSha === sha256) return { bundle: o, identical: true, changed: false, artifacts: [] };";
      if (t.split(a1).length - 1 !== 1 || t.split(a2).length - 1 !== 1) return null;
      return t.replace(a1, "  if(false && predecessor){")
              .replace(a2, a2 + `
    const held2 = await fetchCapture(heldSha), fresh2 = await fetchCapture(sha256);
    if(!held2.ok || held2.sha !== heldSha || !fresh2.ok) continue;
    const text2 = new TextDecoder("utf-8", { fatal:false }).decode(fresh2.bytes);
    const id2 = identify({ text: text2, locator, headers: {}, sha256: digestOf });
    const v2 = await compare(held2.bytes, fresh2.bytes, id2.handler,
      { text: text2, locator, headers: {}, sha256: digestOf, confidence: id2.confidence });
    if(v2.evidentiary_change === false)
      return { bundle: o, identical: false, changed: false, verdict: v2.verdict, artifacts: v2.artifacts };
    return { bundle: o, identical: false, changed: true, verdict: v2.verdict, artifacts: v2.artifacts, proceed: true };`);
    } },
  { id: "2-the-wrong-end", file: APP, mustFail: true,
    says: "should have named",
    what: "THE WRONG END — the predecessor sought at offset 0 instead of total-1",
    patch: (t) => {
      const a = "await chainSeek(head.total - 1)";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "await chainSeek(0)");
    } },
  /* CORRECTED AFTER ITS FIRST RUN, AND THE FIRST FORM IS KEPT IN THE HEADER
     RATHER THAN DELETED. It read `if(head.total > 0){` -> `if(head.total >= 0){`
     and came back GREEN: with no versions at all the seek returns an empty page,
     the chain reads as unestablished, the backstop finds no rows and the whole
     thing still degrades to `null` — an honest absence. THE ARM COULD NEVER HAVE
     BEEN HONOURED. What it must do instead is make the empty case ASSERT
     something, which is the property the pin is actually about. */
  { id: "3-absence-made-a-failure", file: APP, mustFail: true,
    says: "it is not a failure either",
    what: "THE ABSENCE MADE A FAILURE — an address with no earlier version answering `bounded` instead of nothing",
    patch: (t) => {
      const a = "      if(head.total > 0){";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "      if(head.total === 0) return { bounded:true, examined:0, total:0 };\n" + a);
    } },
  { id: "4-over-strictness", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — an equivalent spelling of the pick, which must stay GREEN",
    patch: (t) => {
      const a = "predecessor = tail.versions[0];";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "predecessor = tail.versions[tail.versions.length - 1];");
    } },
  { id: "5-neuter-the-roster", file: SUITE, mustFail: true,
    says: "SWEEP GUARD",
    what: "NEUTER THE SWEEP'S ROSTER — a walk over nothing must not report its verdict triumphantly",
    patch: (t) => {
      const a = "const RANKED_OPS = [...RANKED.keys()];";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "const RANKED_OPS = [];");
    } },
  { id: "6-vacuity-on-the-fixture", file: SUITE, mustFail: true,
    says: "storage order",
    what: "VACUITY — the shuffle removed, so the fixture is stored in the answer's own order",
    patch: (t) => {
      const a = "const VERSIONS = [...BUILT].sort((a, b) => (a.capture_sha < b.capture_sha ? -1 : 1));";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "const VERSIONS = [...BUILT];");
    } },
  { id: "7-baseline", file: APP, mustFail: false,
    what: "BASELINE — no patch at all. Without this row, six arms failing for the wrong reason looks like six arms working",
    patch: (t) => t },
  /* THE DECLARED PIN WAS THE REACH DELTA AND THE RUN FAILED ON THE LICENCE
     FLOOR INSTEAD — kept, and corrected, because which pin catches a blind walk
     first is exactly what a floor is for (REC-70). The floor fires before the
     delta because a walk that cannot see `heldMatch` also stops earning the one
     licence in the table; the delta then reads 0 -> 0 behind it. */
  { id: "8-matcher-goes-blind", file: SUITE, mustFail: true,
    says: "THE LICENCE TABLE IS EXACTLY EARNED",
    what: "THE MATCHER GOES BLIND — the sweep's name closure cut back to the assigned names only",
    patch: (t) => {
      const a = "  const names = new Set(seed);";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  const names = new Set(seed); return [...names];");
    } },
];

const run = () => {
  try {
    const out = execFileSync("node", [SUITE], { encoding: "utf8", stdio: "pipe" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? -1 : e.status,
             out: String(e.stdout || "") + String(e.stderr || "") };
  }
};

const results = [];
let broken = 0;
for (const arm of ARMS) {
  const key = path.basename(arm.file);
  const pristine = path.join(PEN, `${arm.id}.${key}.pristine`);   // UNIQUE per arm, never path alone
  fs.copyFileSync(arm.file, pristine);
  const before = fs.readFileSync(arm.file, "utf8");
  const after = arm.patch(before);
  const armed = after !== null && (arm.id === "7-baseline" || after !== before);
  if (after === null) {
    console.error(`ARM ${arm.id}: THE PATCH NEVER ARMED — its anchor did not appear exactly once. This is a FINDING about the arm.`);
    broken++;
    fs.copyFileSync(pristine, arm.file);
    results.push({ arm, armed: false, r: { code: null, out: "" } });
    continue;
  }
  fs.writeFileSync(arm.file, after);
  const r = run();
  /* RESTORE, THEN VERIFY TWICE AND AGAINST TWO COPIES. */
  fs.copyFileSync(pristine, arm.file);
  const okSha = sha(arm.file) === sha(pristine) && sha(arm.file) === sha(RECORD[arm.file === APP ? "app" : "suite"]);
  const okCmp = same(arm.file, pristine) && same(arm.file, RECORD[arm.file === APP ? "app" : "suite"]);
  if (!okSha || !okCmp) {
    console.error(`ARM ${arm.id}: RESTORE FAILED (sha256 ${okSha}, cmp ${okCmp}) — STOPPING`);
    process.exit(1);
  }
  const failed = r.code !== 0;
  const asDeclared = failed === arm.mustFail
    && (!arm.says || !arm.mustFail || r.out.includes(arm.says));
  if (!asDeclared) broken++;
  results.push({ arm, armed, r, failed, asDeclared });
  const head = (r.out.split("\n").find(l => /^FAIL /.test(l)) || "").slice(0, 200);
  console.log(`ARM ${arm.id.padEnd(26)} armed=${armed} declared=${arm.mustFail ? "RED" : "GREEN"} `
    + `actual=${failed ? "RED" : "GREEN"} ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
  if (head) console.log(`    ${head}`);
  if (!failed) console.log(`    ${(r.out.split("\n").find(l => /^version-predecessor: /.test(l)) || "").slice(0, 120)}`);
}

console.log(`\n${results.length} arms run, ${results.filter(x => x.asDeclared).length} as declared, `
  + `${broken} NOT as declared. Every restore verified by sha256 AND cmp against a per-arm pristine copy `
  + `AND against a pristine-of-record taken before any arm ran.`);
process.exit(broken ? 1 : 0);
