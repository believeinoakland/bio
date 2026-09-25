/* REC-94's NEGATIVE CONTROL HARNESS. Declared in `test/observation-content.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec94.mjs             # every arm, in order, baseline first
 *     node test/nc-rec94.mjs shortfall   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `nc-rec85.mjs` / `nc-rec93.mjs`
 * precedent).
 *
 * IT IS `nc-rec93.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and without
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
 * THIS DRIVER SPELLS NO MEMBER OF THE CONTENT-AXIS VOCABULARY EITHER. The
 * `spelling` arm has to PRODUCE a divergent spelling, and it takes the word from
 * the imported constant to do it — so even the harness that attacks the
 * mechanism obeys it, and the arm cannot go stale against a renamed member.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered: every
 * one is a source-level mutation inside this plane. Nothing here exercises a
 * second instance, a real network fetch, a real OCR engine, the per-unit text
 * index (REC-91's `capture_text`, which does not exist), or D-319's read-time
 * seam (CPDF-19's, which has no call site on this tree). Nor can any of them see
 * a defect in `contentObservationsFor`'s INPUT: every reading these arms drive
 * is one this suite composed, so a reading the acquire wire emits in a shape
 * nobody anticipated is outside every arm below.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONTENT_AXIS_STATES } from "../src/airun.mjs";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec94");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const AIRUN = join(PLANE, "src/airun.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* store.mjs is over a megabyte and airun.mjs tens of KB;
                              a restore over a stub must fail loudly rather than quietly. */

/* The subject: this item's own suite, run alone. Captured to a FILE-backed
   buffer and not a pipe the suite can outlive — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/observation-content.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* `-?\d+` AND NOT `\d+`, AND THE DIFFERENCE IS A FINDING THIS HARNESS PAID FOR
     ON ITS FIRST RUN. The suite prints `-1 pass` when its own foot guard did not
     fire, which is WORKER.md's rule that a missing tally is reported as -1 and
     never as 0. An unsigned pattern matches the `1` inside `-1` — so the driver
     read a suite that had DIED EARLY as a suite that passed one assertion, and
     the `writer` arm's verdict read `3/4 declared` when the true answer was
     `the suite never reached the arms that would have answered`. The sentinel
     existed and the reader could not see it, which is the shape of every
     mechanism this repository has found believed rather than driven. */
  const m = /(-?\d+) pass, (-?\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. The suite also
     prints `-1 pass` itself when its own foot guard did not fire, so the two
     agree on the one number that means "this run proved nothing". */
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
    files: [], why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* THE QUEUE ROW'S OWN NEGATIVE CONTROL, in its own words: *the promote writer
     removed → a freshly promoted capture reads as never-extracted and the arm
     fails by name*. It is the same shape as REC-93's `writer` arm one level
     down, and it is the arm that matters most here: a document the record read
     reading as one nobody has read is an invitation to spend an extraction
     budget on work already done, and — worse — it makes "we have never read any
     of these" the answer for a corpus that was read. */
  writer: {
    files: [STORE],
    why: "remove the promote-time content-level writer, so an extraction that really happened "
       + "leaves no row and every capture reads as never-extracted",
    mustFail: ["C1: promoting a document with a reading writes a content-level observation",
               "C2: the `tier3_candidate` document is `partial` IN THE STORE",
               "C3: the unreadable document is LOOKED_INDETERMINATE",
               "D1: a capture whose text WAS extracted answers UNDETERMINED"],
    /* THE OVER-STRICTNESS PAIR, IN THE ORTHOGONAL DIRECTION, and it is the
       queue row's own clause: *a document-level observation from REC-93 is
       untouched*. This arm removes THIS item's writer and must leave REC-93's
       alone — if the document level went red here, the two writers would be
       entangled and the one-append-site claim would be false. `C4` must also
       stay green, because "a promote with no reading writes no row" is still
       true when there is no writer at all — a row that goes red either way
       proves nothing about which. */
    mustPass: "section A and section B (pure — they do not touch the store), `C4` (no reading "
            + "still writes no row), `E1` (the level is still BUILT), and every document-level "
            + "arm in `observation-log.test.mjs`, which this arm does not touch",
    patch: () => arm(STORE,
      "      this.#observeExtraction(bundleId, sha, reading, { author });",
      "      /* ARMED */"),
  },

  /* THE FALSE-COVERAGE DIRECTION, AND IT IS THE DANGEROUS ONE. A reading whose
     `tier3_candidate` flag says there are pages no engine here could read is
     `partial`; making it PRESENT says WE HAVE THIS DOCUMENT about a document we
     have half of. Every other arm here fails toward saying less than we have;
     this one fails toward saying more, which is the direction CLAUDE.md names as
     worse than a missing feature. */
  shortfall: {
    files: [AIRUN],
    why: "make a reading with unread pages report PRESENT rather than partial — a document we got "
       + "half of reading as a document we got",
    mustFail: ["B6: THE FALSE-COVERAGE DIRECTION",
               "C2: the `tier3_candidate` document is `partial` IN THE STORE",
               "E2: the tally counts the rows this item wrote",
               "E4: the candidate list names the document we got HALF of",
               "F1: the re-extraction's LATEST row is PRESENT"],
    mustPass: "every arm about a document that really was read whole, and every refusal — this "
            + "arm makes the record claim MORE, and nothing it touches makes it claim less",
    patch: () => arm(AIRUN,
      "  const shortfall = reading.tier3_candidate === true;",
      "  const shortfall = false;"),
  },

  /* THE COVERAGE CLAIM OFF A PAGE SET NOBODY COUNTED. A scoped chain covering
     pages 0,1,2 is the whole document only if the document has three pages, and
     CAP-9 / D-345 is what persists the count. Guessing YES in its absence is the
     same overclaim as `shortfall` arriving through arithmetic instead of a flag,
     and it is a separate arm because a single fix for one would not have caught
     the other. */
  pagecount: {
    files: [AIRUN],
    why: "let a SCOPED chain claim the whole document when this record holds no page count — a "
       + "coverage claim off a page set nobody counted",
    mustFail: ["B11: and with NO page count it stays `partial` and SAYS WHY"],
    mustPass: "`B9` (a KNOWN page set the chain really covers still reads PRESENT) and `B10` (a "
            + "known LARGER page set still reads partial) — this arm must touch only the "
            + "undetermined case, and if either of those moves it is a different arm than declared",
    patch: () => arm(AIRUN,
      "  if (!Number.isInteger(n) || n <= 0) return false;",
      "  if (!Number.isInteger(n) || n <= 0) return true;"),
  },

  /* THE MECHANISM ARM. CONDUCT ruled on 2026-09-14 that the content axis is ONE
     EXPORTED CONSTANT and that a divergent spelling must be A BUILD ERROR rather
     than a review finding — because three items spelling one vocabulary across
     three weeks is the id-collision shape one level up, and the vigilance fix
     for that is already known to fail. This arm IS that ruling's test: it writes
     one member as a literal into a file that must never hold one, and the suite
     must fail BY NAME with the file named. THE WORD COMES FROM THE CONSTANT, so
     the arm cannot go stale against a rename and the driver holds no copy of the
     vocabulary it is attacking. */
  spelling: {
    files: [STORE],
    why: "write one content-axis state as a LITERAL into `store.mjs` — the fourth-spelling defect "
       + "the ruling exists to make impossible",
    mustFail: ["A2: THE MECHANISM"],
    mustPass: "everything else, including `A2b`'s reach row — this arm changes no behaviour at "
            + "all, which is exactly the point: the defect it plants is one no behavioural arm "
            + "anywhere could see, and that is why the mechanism has to be structural",
    patch: () => arm(STORE,
      "  contentAxis({ captureSha = null, viewer = null } = {}) {",
      `  /* ARMED: ${Object.keys(CONTENT_AXIS_STATES)[1]} */\n`
      + "  contentAxis({ captureSha = null, viewer = null } = {}) {"),
  },

  /* BOB'S RULING OF 2026-09-15, AND THE ONLY ARM HERE THAT EXISTS BECAUSE THIS
     ITEM SHIPPED THE DEFECT ONCE. Design §5.1: *a subject with no row has three
     possible causes and they are different facts*, and only the one that
     excludes the other two licenses the positive statement. This arm collapses
     the three, which is exactly what the first draft of `contentAxisFor` did —
     and on any existing instance the result is a list of documents the record
     HAD read, offered as documents nobody has touched.
     IT IS A ONE-CONDITION PATCH because the rule is one condition. That is the
     uncomfortable part and it is why the arm is here rather than trusted to
     review: the defect is a missing QUESTION rather than a wrong answer, and
     nothing about the code looks wrong with it applied. */
  cause: {
    files: [AIRUN],
    why: "let a missing content-level row read as never-extracted whatever its cause — collapsing "
       + "design section 5.1's three causes into the one that makes a claim",
    mustFail: ["B12: §5.1's ORDER",
               "B12b: AND AN ABSENT OR UNRECOGNISED CAUSE IS TREATED AS THE WEAKEST"],
    mustPass: "every arm about a capture that HAS an observation — this arm can only change what "
            + "an ABSENCE is read as, and if a present row moves then the arm took something else",
    patch: () => arm(AIRUN,
      '    if (cause === "never_looked")',
      '    if (cause !== "__never__")'),
  },

  /* THE FENCE. §6: *a subject discloses a project's interest, so REC-36's
     withholding applies row-whole across the fence.* This arm removes the
     viewer gate on the per-capture read.
     IT IS IN THIS SET BECAUSE IT ALREADY CAUGHT A REAL DEFECT IN THIS ITEM'S OWN
     CODE. `D5b` — the byte-identity row — went red on its first run against
     UNARMED code: the read gated the register lookup but then fell through to
     the full answer whenever an observation existed, publishing the extraction
     state, the actor and the PROJECT BUNDLE ID to a viewer who could not see the
     project. `capture_held` was already false on that answer, so an arm testing
     only the flag would have passed. Fixed in the same turn by returning before
     the log is read at all. */
  fence: {
    files: [STORE],
    why: "neuter the viewer gate on the per-capture read, so a capture inside a project the "
       + "caller was never invited to answers about itself",
    mustFail: ["D5: THE FENCE",
               "D5b: and it answers BYTE-IDENTICALLY",
               "D5c: the gate FAILS CLOSED on an absent stamp"],
    mustPass: "every other arm, so this arm takes the fence and nothing else — a control that "
            + "moves two things cannot say which one the suite saw",
    patch: () => arm(STORE,
      "    const held = owner && this.#bundleRedactor(viewer)(owner.bundle_id) !== null ? owner : null;",
      "    const held = owner;"),
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
