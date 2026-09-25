/* FW-17's NEGATIVE CONTROL HARNESS. Declared in `test/reading-position.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-fw17.mjs             # every arm, in order, baseline first
 *     node test/nc-fw17.mjs forge       # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `owed-controls.control.mjs`
 * precedent), and it is named to match.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing — the only row that distinguishes
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
 * TWO OF THESE ARMS DECLARE A MUST-STAY-GREEN AND NOT A MUST-FAIL, which is the
 * shape this item needs and the plain harness cannot express. `nopair` and
 * `nullhonest` each break one HALF of a nullable: the half that must keep
 * working is the honest-absence half, and an arm that only checked for new
 * failures would score a broken UNDETERMINED path as a success. So the verdict
 * below takes `mustStay` as well as `mustFail`, and an arm is AS DECLARED only
 * when both hold.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
const SAFE = controlPen("fw17");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const CHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are large; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE-backed
   buffer and not a pipe — D-282: a suite that calls process.exit() discards
   unflushed PIPE writes, and a control whose tally reads -1 because of it
   reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/reading-position.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           passing: out.split("\n").filter((l) => l.includes("PASS  ")).map((l) => l.trim()) };
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
    mustFail: [], mustStay: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* (b) THE PAIR IS NOT WRITTEN AT ALL. The point of this arm is NOT that things
     break — it is that the UNDETERMINED path is REACHED rather than skipped.
     With no pair on any row, every portion citation must fall to the
     no-pair branch and say so, and the honest-absence assertions must stay
     green while the grade assertion fails. A "closing" that only ever ran
     because a pair happened to be present is not a closing. */
  nopair: {
    files: [STORE],
    why: "stop writing the determining pair, so every connection row is pair-less — the UNDETERMINED path must then be REACHED, not skipped",
    mustFail: ["THE ITEM: a citation of page 2",
               "the A-B connection records the determining reference on BOTH ends"],
    mustStay: ["OVER-STRICTNESS: the whole-document citation earns from every connection its document has",
               "the UNPOSITIONED reading persisted its reference all the same"],
    mustPass: "the document-grain answers and the honest-absence answers — a pair-less record still answers the whole-document question exactly as before",
    /* CORRECTED 2026-09-14, and the correction is a FINDING recorded rather than
       smoothed. The first draft nulled only `a_ref`, and the arm came back 1/2:
       the page-2 grade assertion STILL PASSED. The reason is real and worth
       keeping — the connection view treats a pair as present when EITHER end
       records a reference (`r.a_ref || r.b_ref`), and the pair order is
       canonical by capture sha, so which end the cited document lands on is
       decided by a hash. A half-nulled pair therefore left the cited end's
       position intact and the grade computed from it. The arm was measuring a
       coin flip. Both ends are nulled now, which is what "stop writing the pair"
       was always supposed to mean. */
    patch: () => {
      const a = arm(STORE,
        "            a_ref: A.ref, a_pos_kind: A.pos ? A.pos.kind : null,",
        "            a_ref: null, a_pos_kind: A.pos ? A.pos.kind : null,");
      const b = arm(STORE,
        "            b_ref: B.ref, b_pos_kind: B.pos ? B.pos.kind : null,",
        "            b_ref: null, b_pos_kind: B.pos ? B.pos.kind : null,");
      return { armed: a.armed && b.armed, matches: Math.min(a.matches, b.matches) };
    },
  },

  /* (c) THE FORGED PAIR. A covering test that answers true for every input is
     true for no reason, and this is the arm that proves the page-9 result is a
     measurement rather than a coincidence of the fixture. */
  forge: {
    files: [CHAIN],
    why: "neuter the containment test so ANY pair covers ANY extent — a pair read three hundred pages away would then grade a one-page citation",
    mustFail: ["NEGATIVE CONTROL (2), driven: a citation of page 9",
               "a RECT-grained extent does not contain a page-grained reading",
               "same page: inside. different page: outside.",
               "cross-container never contains",
               "an unparseable position, an unknown extent kind and a missing extent all answer FALSE",
               "the checker: a placed, covering pair is PERMITTED (null) and nothing else is"],
    mustStay: ["THE ITEM: a citation of page 2"],
    mustPass: "the page-2 citation, which is correct work and must not be broken by a looser checker",
    patch: () => arm(CHAIN,
      "export function readingPositionInExtent(position, extentKind, extent) {\n  const p = readingSource(position);",
      "export function readingPositionInExtent(position, extentKind, extent) {\n  if (true) return true;\n  const p = readingSource(position);"),
  },

  /* (d) THE NULLABLE, SPLIT. Dropping the position columns from the projection
     must NOT stop the row being written — that is the honest-absence half and it
     is the half a member depends on. Every positioned answer must go. */
  nullhonest: {
    files: [STORE],
    why: "drop the position columns from the reading_refs projection — the reading must still WRITE (the nullable is honest) while nothing can be placed",
    /* CORRECTED 2026-09-14, and the correction is a FINDING about the SUBJECT
       that the arm surfaced. The first draft declared "the positioned reading
       persisted its reference AND where it was read" as a must-fail and it
       stayed GREEN — correctly, because that assertion reads `op=reading`, which
       returns the reading BLOB the promotion stored, and the blob is a different
       store from the `reading_refs` projection this arm breaks. Two stores of
       one fact, and a suite that asserted only the blob would have scored a
       completely dead projection as a pass. So the arm is re-declared against
       the PROJECTION read, and the suite grew the assertions that read it
       (`op=readingref`'s `position`) rather than the declaration being quietly
       relaxed to fit. */
    mustFail: ["the PROJECTION carries the position too, reachable through op=readingref",
               "THE ITEM: a citation of page 2",
               "the A-B connection records the determining reference on BOTH ends"],
    mustStay: ["the reading BLOB carries the position the reader emitted",
               "the UNPOSITIONED reading persisted its reference all the same",
               "the reverse index answers for all three documents, placed and unplaced alike",
               "OVER-STRICTNESS: the whole-document citation earns from every connection its document has"],
    mustPass: "the reading blob, and the row itself — a reading without position is a reading, not a gap",
    patch: () => arm(STORE,
      "          pos ? pos.kind : null, pos ? readingSourceJson(pos) : null, pos ? pos.ref : null);",
      "          null, null, null);"),
  },

  /* (e) THE OVER-STRICTNESS DIRECTION. Making a whole-document citation pass the
     position test is a fence tighter than its rule: Bob's 5.3 is that a citation
     naming no part means the whole document, so its portion IS the document and
     there is nothing to place. Every portion answer must survive. */
  /* (e) THE OVER-STRICTNESS DIRECTION, AND IT TAKES TWO PATCHES BECAUSE THE
     DEFENCE IS HELD TWICE — which the arm's first draft discovered by failing to
     bite at all. Disabling only `connectionGradeForContent`'s `document`
     short-circuit changed NOTHING (60 pass, 0 fail, armed 1×), because
     `readingPositionInExtent` ALSO answers true for a `document` extent, on its
     own and for its own reason. That is a finding about the SUBJECT and a good
     one — the doctrine is enforced independently in the checker and at the call
     site, so neither alone is load-bearing — and it is recorded here rather than
     smoothed, because an arm that cannot bite reads exactly like a subject that
     cannot break. Both are armed now, which is what it takes to actually put a
     whole-document citation through a position test. */
  overstrict: {
    files: [STORE, CHAIN],
    why: "THE OVER-STRICTNESS DIRECTION — make a whole-document citation pass the position test it has no business taking, which needs BOTH the store's short-circuit and the checker's own document arm removed",
    mustFail: ["OVER-STRICTNESS: the whole-document citation earns from every connection its document has",
               "a document extent contains every position"],
    mustStay: ["THE ITEM: a citation of page 2",
               "NEGATIVE CONTROL (2), driven: a citation of page 9",
               "NEGATIVE CONTROL (1), driven: a pair the reading cannot place"],
    mustPass: "every portion answer — the arm must break correct work and nothing else",
    patch: () => {
      const a = arm(STORE,
        `      if (whole) { reaching.push({ ...entry, why: "this citation is of the whole document, so every "`,
        `      if (false) { reaching.push({ ...entry, why: "this citation is of the whole document, so every "`);
      const b = arm(CHAIN,
        `  if (extentKind === "document") return true;`,
        `  if (false) return true;`);
      return { armed: a.armed && b.armed, matches: Math.min(a.matches, b.matches) };
    },
  },

  /* (f) THE ARM'S OWN ARM. Disable the pair WRITER only, leaving the containment
     checker intact. If the grade assertion still passed, it would be measuring
     the checker rather than the writer — and the whole item is the writer. */
  armsarm: {
    files: [STORE],
    why: "THE ARM'S OWN ARM — disable only the POSITION half of the pair writer, leaving the checker intact. The grade assertion must fail BY NAME, which is what proves it measures the writer",
    mustFail: ["THE ITEM: a citation of page 2",
               "the A-B connection records the determining reference on BOTH ends",
               "the A-C connection records both references and only ONE position"],
    mustStay: ["OVER-STRICTNESS: the whole-document citation earns from every connection its document has",
               "same page: inside. different page: outside."],
    mustPass: "the containment checker's own assertions, which do not depend on the writer at all",
    patch: () => arm(STORE,
      "      if (rr) e.pos = readingSourceFromColumns(rr.pos_kind, rr.pos, rr.pos_ref);",
      "      if (rr) e.pos = null;"),
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
  console.log(`  MUST STAY  ${a.mustStay.length ? a.mustStay.join(" | ") : "(nothing declared)"}`);
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
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
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
  /* The declared verdict, checked — BOTH directions. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    /* A must-stay assertion is satisfied by being PRESENT AND PASSING. Checking
       only "not in the failing list" would score a suite that never reached the
       assertion as a success, which is the missing-tally hazard one level up. */
    const stayed = a.mustStay.filter((m) => r.passing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length && stayed.length === a.mustStay.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${stayed.length}/${a.mustStay.length} must-stay still passing, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
