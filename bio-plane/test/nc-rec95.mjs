/* REC-95's NEGATIVE CONTROL HARNESS. Declared in `test/observation-meaning.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec95.mjs             # every arm, in order, baseline first
 *     node test/nc-rec95.mjs empty       # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `nc-rec85.mjs` / `nc-rec93.mjs` /
 * `nc-rec94.mjs` precedent).
 *
 * IT IS `nc-rec94.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and without
 * improvement: a second harness of one shape is the drift this repository keeps
 * measuring, and the arms are the part that is this item's. The rules it obeys,
 * each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     six-arms-broken from six-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED. A match count that is not exactly 1
 *     is a FINDING, never a retry.
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * THE ARM THAT MATTERS MOST HERE IS `empty`, AND IT IS THE OVER-STRICTNESS ONE.
 * Every other arm below removes a writer, and a removed writer is loud. `empty`
 * leaves all three writers in place and drops only the rows where the look found
 * NOTHING — which is invisible to every arm about a look that found something,
 * and which restores exactly the silence this item was written to end. It is the
 * queue row's own second clause: *a run that derived nothing is recorded as
 * run-and-empty, not as absent.*
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered: every one
 * is a source-level mutation inside this plane. Nothing here exercises a second
 * instance, a real network fetch, a real doctype reader, or the doctype REGISTRY
 * — so §4.3's third reader-run outcome (*no reader is registered for this type*)
 * is outside every arm below, because it has no producer on this tree. Nor can
 * any of them see a defect in the pure functions' INPUT: every reading and every
 * match list these arms drive is one the suite composed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions and has had a
   harness overwritten mid-turn by a concurrent worker. */
const SAFE = join(REPO, ".rec95-control-pristine");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const AIRUN = join(PLANE, "src/airun.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* store.mjs is over two megabytes and airun.mjs tens of KB;
                              a restore over a stub must fail loudly rather than quietly. */

/* The subject: this item's own suite, run alone. Captured to a FILE-backed
   buffer and not a pipe the suite can outlive — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/observation-meaning.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* `-?\d+` AND NOT `\d+`. The suite prints `-1 pass` when its own foot guard did
     not fire, which is WORKER.md's rule that a missing tally is reported as -1
     and never as 0. An unsigned pattern matches the `1` inside `-1`, so a driver
     using one reads a suite that DIED EARLY as a suite that passed one assertion
     — `nc-rec94.mjs` paid for that on its first run and this harness inherits
     the fix rather than re-paying for it. */
  const m = /(-?\d+) pass, (-?\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
           /* THE THROW IS CARRIED OUT WITH THE FAILURES, because an arm whose
              suite DIED tells a completely different story from one whose
              assertions went red, and a driver that prints only `FAIL` lines
              makes the two look alike. */
           failing: out.split("\n").filter((l) => l.includes("FAIL  ") || l.includes("THREW"))
                       .map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes five-arms-broken from five-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* THE QUEUE ROW'S OWN NEGATIVE CONTROL, first half, in its own words: *one
     writer removed → the level reads never-run for a run that happened.* This is
     the reader-run writer, and removing it means every document the reader has
     read reads as a document nothing has read — which on any existing instance
     is an invitation to spend a reading budget on work already done, and, worse,
     makes *we have never read any of these for who they mention* the answer for
     a corpus that was read. */
  reader: {
    files: [STORE],
    why: "remove the promote-time reader-run writer, so a reader run that really happened leaves "
       + "no row and every capture reads as never-read at the meaning level",
    mustFail: ["C1: promoting a document whose reading found entities writes ONE meaning-level",
               "C2: A READER THAT RAN AND FOUND NOBODY LEAVES A ROW SAYING SO",
               "C4: THE TWO ROWS ARE DIFFERENT ROWS FROM REC-94",
               "C5: the actor is DERIVED THROUGH THE RECORD'S EXISTING PREDICATE"],
    /* THE OVER-STRICTNESS PAIR IN THE ORTHOGONAL DIRECTION, and it is the
       one-append-site claim under test: this arm removes THIS level's reader-run
       writer and must leave REC-94's content-level writer and REC-93's
       document-level writers untouched. If either went red here the three
       writers would be entangled and the claim would be false. `C3` must also
       stay green, because "a capture nothing read leaves no row" is still true
       when there is no writer at all — a row that goes red either way proves
       nothing about which. */
    mustPass: "sections A and B (pure — they do not touch the store), `C3` (a capture nothing "
            + "read still leaves no row), sections D and E (the other two acts, which this arm "
            + "does not touch), and every arm in `observation-content.test.mjs` and "
            + "`observation-log.test.mjs`",
    patch: () => arm(STORE,
      "      this.#observeReaderRun(bundleId, sha, reading, { author });",
      "      /* ARMED */"),
  },

  /* THE SECOND ACT. Removing this writer restores the exact state the op has
     been in since it was written: the unresolved attempt is computed, returned
     to the caller, and persisted nowhere — so *we tried this name against the
     registry and it holds no such subject* dies with the request again. */
  resolution: {
    files: [STORE],
    why: "remove the resolution-attempt writer, so every name the recogniser tried — and every "
       + "name it matched NOTHING for — leaves no trace that anything looked",
    mustFail: ["D1: EVERY reference the recogniser tried now has a meaning-level row",
               "D2: THE UNRESOLVED ATTEMPT IS LOOKED_ABSENT WITH NO REFERENT",
               "D3: the MATCHED attempt is PRESENT and points at the ENTITY",
               "D4: THE AUTHORITY IS THE CAPTURE THAT CARRIED THE NAME",
               "F3: THE THREE ACTS ARE THREE PARTITIONS OF ONE TABLE",
               "G1: THE ACCEPTS-WHEN"],
    mustPass: "sections C and E — the other two acts. If either moves, the three writers are not "
            + "three, and one of them is doing another's work",
    patch: () => arm(STORE,
      "        this.#observeResolutionAttempt(rr.capture_sha, rr.bundle_id, rr, matches,",
      "        false && this.#observeResolutionAttempt(rr.capture_sha, rr.bundle_id, rr, matches,"),
  },

  /* THE THIRD ACT, AND THE DESIGN'S §9 ROW FOR THIS ITEM. A derivation that
     produced nothing and a derivation nobody ran become one answer again. */
  derivation: {
    files: [STORE],
    why: "remove the connection-derivation writer, so a derivation that RAN over a subject leaves "
       + "the same evidence as one that never ran — an empty set",
    /* CORRECTED AFTER THE FIRST RUN. THE ARM WAS RIGHT AND THE DECLARATION WAS
       WRONG, which is the direction this repository keeps finding and is recorded
       rather than tidied away.
       `G1` WAS DECLARED MUST-FAIL AND CAME BACK GREEN, correctly: G1 asserts that
       SOME subject was looked at and produced nothing, and with only the
       derivation writer removed the reader run and the resolution attempt still
       supply `ran_and_found_nothing` rows for a capture and a reference. G1 is an
       assertion about the LEVEL and not about any one act, so no single-writer arm
       can take it — which is a fact about the suite worth knowing and is why it is
       written down instead of being forced.
       `F5b` FAILED AND WAS NOT DECLARED, also correctly: its first half asks
       whether any entity-subject row survives an unplaceable viewer, and with this
       writer removed there are no entity rows at all. Added. */
    mustFail: ["E1: A DERIVATION THAT RAN AND WROTE NO CONNECTION LEAVES A ROW SAYING SO",
               "E1b: and it says WHY",
               "E2: and a derivation over the SAME entity that now DOES form a pair",
               "E3: THE EARLIER ROW WAS NOT REWRITTEN",
               "F3: THE THREE ACTS ARE THREE PARTITIONS OF ONE TABLE",
               "F5b: and the ENTITY partition is NOT withheld"],
    mustPass: "sections C and D (the other two acts), `G1` (an assertion about the LEVEL, which "
            + "the other two writers still satisfy — no single-writer arm can take it), and `G4` "
            + "— an entity nothing has derived over is a subject with no row whether or not this "
            + "writer exists, so an arm that moved either way would prove nothing about which",
    patch: () => arm(STORE,
      "    this.#observeConnectionDerivation(entityId, {",
      "    false && this.#observeConnectionDerivation(entityId, {"),
  },

  /* **THE ARM THIS ITEM IS ABOUT, AND THE ONLY ONE HERE THAT IS INVISIBLE TO
     EVERY ARM ABOUT A SUCCESSFUL LOOK.** The queue row's over-strictness clause:
     *a run that derived nothing is recorded as run-and-empty, not as absent.*
     All three writers stay in place; only the rows where the look found NOTHING
     are dropped. The plane still logs every reader run that found somebody,
     every name that matched, every derivation that wrote a pair — and a reader
     inspecting the log would see a healthy, growing coverage record. What it
     would have lost is the entire reason the level was built.
     IT IS ARMED AT THE APPEND SITE'S DOOR RATHER THAN IN EACH WRITER, because
     the defect it models is one condition and not three, and because arming
     three places at once is three arms wearing one name. */
  empty: {
    files: [STORE],
    why: "make a meaning-level look that found NOTHING write no row at all — so `we looked and "
       + "there is nothing` collapses back into `nobody has looked`, which is the silence this "
       + "whole item was written to end",
    mustFail: ["C2: A READER THAT RAN AND FOUND NOBODY LEAVES A ROW SAYING SO",
               "D1: EVERY reference the recogniser tried now has a meaning-level row",
               "D2: THE UNRESOLVED ATTEMPT IS LOOKED_ABSENT WITH NO REFERENT",
               "E1: A DERIVATION THAT RAN AND WROTE NO CONNECTION LEAVES A ROW SAYING SO",
               "E1b: and it says WHY",
               "E3: THE EARLIER ROW WAS NOT REWRITTEN",
               "F4: the tally counts the rows this item wrote",
               "G1: THE ACCEPTS-WHEN"],
    mustPass: "every arm about a look that FOUND something — `C1`, `D3`, `E2` — and that is "
            + "exactly the point: this defect is invisible to all of them, which is why it needs "
            + "an arm of its own rather than trusting the successful path to reveal it",
    patch: () => arm(STORE,
      "    const bad = checkObservation(entry, QUEUE_CONDITION_KINDS, this.#observationReferent(entry));",
      "    if (entry.level === \"meaning\" && entry.state === \"LOOKED_ABSENT\") return null;\n"
      + "    const bad = checkObservation(entry, QUEUE_CONDITION_KINDS, this.#observationReferent(entry));"),
  },

  /* §5.1's ORDER AT THIS LEVEL. REC-94 shipped exactly this collapse at the
     content level and caught itself mid-run; the arm exists here because the
     defect is a missing QUESTION rather than a wrong answer, and nothing about
     the code looks wrong with it applied. At the meaning level the consequence
     is worse than at the content one, because the evidence here is ONE-SIDED:
     collapsing the causes would report as never-looked every reference and every
     entity whose pre-log look found nothing — a set the record genuinely cannot
     distinguish, presented as a positive finding. */
  cause: {
    files: [STORE],
    why: "let a missing meaning-level row read as nobody-looked whatever its cause — collapsing "
       + "design section 5.1's three causes into the one that makes a claim",
    /* CORRECTED AFTER THE FIRST RUN, AND THIS ARM EARNED ITS KEEP BEFORE IT EVER
       CAUGHT A DEFECT IN THE SUBJECT: it caught one in the SUITE.
       ON ITS FIRST RUN it came back 0/2 declared — `G2` and `G2b` both stayed
       GREEN under a fully collapsed cause rule. The arm was right. `G2`'s fixture
       was a capture with no reading, which is genuinely cause (3), so it read
       `never_looked` with the rule intact AND with it collapsed; `G2b` only
       asserted that the two arrays and the vocabulary exist, which the collapse
       does not touch. **A suite that only asks about subjects whose answer is the
       same under the defect is not testing the rule.** `G2` was rebuilt around a
       PRE-LOG fixture (a reference carrying a `resolutions` row from
       `op=resolvetestify` and no observation) which the collapse must move from
       `pre_log` to `never_looked`, and `G2a` was added as its converse so the arm
       can go red in both directions.
       `G5` FAILED AND WAS NOT DECLARED, correctly — it is the STRUCTURAL pin on
       the weakest-default line this arm rewrites, and it is the only instrument
       that could have seen the collapse while `G2` was blind. Declared now. */
    mustFail: ["G2: §5.1's ORDER",
               "G5: AND AN UNRECOGNISED SUBJECT KIND TAKES THE WEAKEST CAUSE"],
    mustPass: "every arm about a subject that HAS an observation — this arm can only change what "
            + "an ABSENCE is read as, and if a present row moves then the arm took something "
            + "else. `G2a` must also stay green: a subject that really is nobody-looked reads "
            + "nobody-looked under the collapse too, which is precisely why it cannot be the "
            + "fixture the rule is tested on",
    patch: () => arm(STORE,
      "    if (!probe) return \"purged\";",
      "    if (!probe) return \"never_looked\";\n    return \"never_looked\";"),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const before = saved.map((s) => s.sha);
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  /* AND THE BYTES REALLY CHANGED — a patch that matched once and wrote the same
     text back is an arm that did not arm while reporting that it did. */
  saved.forEach((s, i) => {
    const now = sha(s.f);
    if (name !== "baseline" && now === before[i]) {
      console.log(`  FINDING    ${s.f.replace(REPO + "/", "")} is byte-identical AFTER the patch — the arm changed nothing`);
      finding++;
    }
  });
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
