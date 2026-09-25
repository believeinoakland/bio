/* D-158 — THE NEGATIVE CONTROL FOR `signer-enrolment.test.mjs`, RE-RUNNABLE IN ONE STEP.
 *
 *   node test/signer-enrolment.control.mjs                  # every arm, in order
 *   node test/signer-enrolment.control.mjs roster-blind     # one arm
 *
 * Run from `bio-plane/`. DELIBERATELY NOT A `.test.mjs`: it EDITS `src/store.mjs`
 * while it runs and the battery must never discover it. The harness shape is
 * D-136's (`adminvote.control.mjs`), kept rather than re-invented — the per-arm
 * uniquely-named pristine copy, the sha256 AND byte-comparison restore (never
 * `git checkout --`, which restores HEAD and discards the work), and the refusal
 * to run an arm whose anchor does not match EXACTLY ONCE, because an arm that did
 * not arm is a finding and never a green.
 *
 * **THIS ROW HAS TWO HALVES AND ONE OF THEM CANNOT BE DRIVEN FROM THE SUITE AT
 * ALL, WHICH IS WHY ARM (b) EARNS ITS KEEP TWICE.** The WRITE half refuses a key
 * for a member who cannot attest; the READ half makes the roster say so about a
 * row that already exists. Once the write guard stands, NO OP can create such a
 * row and this plane exposes no SQL surface — so the only place the read half
 * meets a real LEGACY row is inside `write-guard-dropped`, where the write arms
 * fail by name and EVERY ROSTER ARM MUST STAY GREEN over the row the missing
 * guard just let through.
 *
 * DECLARED BEFORE ARMING — which assertions MUST fail, by label prefix; every
 * other one MUST pass. An arm whose failures differ from its declaration in
 * EITHER direction is reported NOT AS DECLARED and the harness exits 1.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src", "store.mjs");
const SUITE = join(HERE, "signer-enrolment.test.mjs");
/* A restore below this is not a restore. The file is far larger; the floor exists
   so a truncated write cannot be reported as byte-identical to itself. */
const MIN_BYTES = { [STORE]: 2_000_000 };
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* The four sites exactly as they stand in the source. */
const ADD_BAR = `    const barAdd = this.#signerMemberBar(memberId);\n    if (barAdd) return barAdd;`;
const SET_BAR = `      const barSet = this.#signerMemberBar(row.member_id);\n      if (barSet) return barSet;`;
const ATTESTS = `              CASE WHEN \${Store.SIGNER_ATTESTS} THEN 1 ELSE 0 END AS attests`;
const ORDER   = `        ORDER BY s.added\`)`;
const PREDICATE_TEXT = `s.status='active' AND m.status='active'`;

const L = {
  /* THE WRITE arms. */
  addRefused:  "op=signeradd for a member who has not enrolled is refused BY NAME",
  addSentence: "and the refusal carries the plane's own canned sentence",
  addStored:   "and it reports the member's STORED status",
  addNothing:  "and NOTHING was written: the roster is still empty",
  /* THE SECOND DOOR. */
  setRefused:  "op=signerset cannot put a revoked member's key back to",
  setStored:   "and it names the stored facts: enrolled, membership revoked",
  setNothing:  "and the key is still revoked, so nothing landed",
  /* THE ROSTER. */
  present:     "ANTI-BLINDING FLOOR: every key this suite registered is STILL ON the roster",
  nonEmpty:    "ANTI-BLINDING FLOOR: and the roster is not empty",
  attesting:   "a genuinely active key STILL reads as attesting",
  revokedWhy:  "and the revoked member's key reads",
  whyFloor:    "at least one key on this roster carries a reason at all",
  whyStored:   "and every `attests_why` names a STORED fact",
  cascade:     "jonah's membership is revoked, and the cascade takes his key with it",
  /* THE INVARIANT and its floor. */
  bothSides:   "FLOOR: neither side of the comparison is empty",
  invariant:   "THE INVARIANT: op=signerlist says a key attests EXACTLY when op=ratify accepts",
  /* THE STRUCTURAL PIN. */
  structure:   "the predicate has EXACTLY three readers",
};

const ARMS = {
  baseline: { edits: [], mustFail: [] },

  /* (b) THE ROW'S OWN CONTROL, AND THE ONLY PLACE THE LEGACY ROW EXISTS.
     `signerAdd`'s bar is removed and `signerSet`'s is LEFT STANDING, so the two
     doors are measured apart. The suite then registers kestrel's key while she is
     still `invited` — precisely the row D-158 was raised about — and every ROSTER
     arm must stay GREEN over it, which is the READ half of this item and is not
     drivable any other way. */
  "write-guard-dropped": {
    /* NARROWED AFTER THE FIRST RUN, WITH THE REASON, and it is the *break only the
       thing* rule catching this harness rather than the subject. The first draft
       replaced the whole bar with `null`, which deleted `NO_SUCH_MEMBER` TOO — the
       arm moved two variables and an extra assertion failed. The bar is now
       replaced by EXACTLY the existence check `signerAdd` carried before this
       item, so the only thing missing is the enrolment refusal. */
    edits: [[ADD_BAR, `    const barAdd = this.#one(\`SELECT member_id FROM members WHERE member_id=?\`, memberId)\n`
      + `      ? null : { ok: false, reason: "NO_SUCH_MEMBER" }; /* ARMED */\n    if (barAdd) return barAdd;`]],
    mustFail: [L.addRefused, L.addSentence, L.addStored, L.addNothing],
  },

  /* (c) THE SECOND DOOR ALONE. `signerSet`'s bar removed, `signerAdd`'s left
     standing: an administrator can then undo `memberSet`'s cascade one call
     later. Every `signeradd` arm stays green, which is what shows the two doors
     are two and not one written twice. */
  "set-guard-dropped": {
    /* WIDENED AFTER THE FIRST RUN, WITH THE REASON. `L.revokedWhy` ADDED: with this
       door open the suite's own `op=signerset` SUCCEEDS, so jonah's key is `active`
       under a `revoked` member and the roster reports `member_revoked` rather than
       `key_revoked`. A fixture cascade — and a measurement worth keeping, because
       it is the READ half answering correctly over the very row this arm let
       through, with the INVARIANT arm staying green beside it. */
    edits: [[SET_BAR, `      const barSet = null; /* ARMED */`]],
    mustFail: [L.setRefused, L.setStored, L.setNothing, L.revokedWhy],
  },

  /* (d) THE ROSTER STOPS ASKING. `attests` hard-wired to 1, so every key reads as
     attesting exactly as the roster did before this item. The INVARIANT fails
     (jonah's revoked key now reads attesting while the gate refuses it) and so
     does the `attests_why` arm; the structural pin fails too, because this edit
     deletes the reader it counts — that is the pin working, not a perturbation. */
  "roster-honesty-dropped": {
    edits: [[ATTESTS, `              1 AS attests /* ARMED */`]],
    /* CORRECTED AFTER THE FIRST RUN. `L.whyStored` was DECLARED TO FAIL AND DID NOT,
       and the arm was right while the SUITE was wrong: with every key reading as
       attesting, every `attests_why` is null, the vocabulary check filtered to an
       EMPTY set and `.every()` passed over nothing. That is the empty-corpus
       failure this project has measured three times, arriving in a new suite. The
       suite now floors the set first, and it is that FLOOR (`L.whyFloor`) which
       fails here. */
    mustFail: [L.revokedWhy, L.whyFloor, L.invariant, L.structure],
  },

  /* (e) THE LIAR THIS ROW NAMES, and the arm the suite is written around. The
     roster HIDES every key it cannot confirm, which makes the two views agree
     perfectly — over a record that now says LESS than it can support. **THE
     INVARIANT ARM STAYS GREEN.** Nothing but the anti-blinding arms can tell this
     cheat from a fix, and this is the measurement that says so. */
  "roster-blind": {
    /* WIDENED AFTER THE FIRST RUN, WITH THE REASON, and the FIRST RUN OF THIS ARM
       CAME BACK `-1 (the suite did not reach its foot)` — a finding about the
       INSTRUMENT, recorded rather than smoothed. Three row lookups read
       `.find(…).status` on a roster that no longer holds the row, threw a
       TypeError, and ended the module; the suite is corrected to be null-tolerant
       so a blinded roster FAILS AT NAMED ASSERTIONS instead of dying silently.
       Every label below is a read-back of a row this arm hides, so each is a
       cascade of the blinding and not a second defect: the cascade read-back, the
       nothing-landed read-back, the non-empty floor, the `attests_why` read and
       the presence floor. TWO MORE were ADDED after the SECOND run, with their
       reasons: `L.whyFloor`, because a roster showing only attesting keys carries
       no reason at all, so the floor that catches an empty vocabulary set catches
       this too; and `L.structure`, because hiding rows is done by ADDING a WHERE
       clause that reads the shared constant, taking the reader count to four —
       the pin seeing its own subject being edited, which is the pin working.
       **AND THE INVARIANT ARM STAYS GREEN**, which is this arm's whole point. */
    edits: [[ORDER, `        WHERE \${Store.SIGNER_ATTESTS} ORDER BY s.added\`)   /* ARMED */`]],
    mustFail: [L.present, L.revokedWhy, L.nonEmpty, L.cascade, L.setNothing, L.whyFloor, L.structure],
  },

  /* (f) A FAITHFUL INLINE COPY, in the identical spelling. Behaviour does not
     move by one assertion and ONLY the structural pin sees it — D-280's rule
     (`#refEdgeSevered`) arriving at a SQL fragment. A control without this arm
     could not tell one predicate from three that happen to agree today. */
  "roster-inlined": {
    edits: [[ATTESTS, `              CASE WHEN ${PREDICATE_TEXT} THEN 1 ELSE 0 END AS attests /* ARMED */`]],
    mustFail: [L.structure],
  },

  /* (g) OVER-STRICTNESS, REQUIRED. `attests` hard-wired to 0: the roster now
     claims LESS than the gate grants, which is the opposite defect and the one a
     headline "the two agree" reading would miss. Every WRITE arm stays green —
     the two halves are independent — and the floor on the comparison's own
     non-emptiness is what catches it, which is why that floor is asserted before
     the equality rather than after. The structural pin fails for (d)'s reason. */
  "read-overstrict": {
    edits: [[ATTESTS, `              0 AS attests /* ARMED */`]],
    /* WIDENED AFTER THE FIRST RUN, WITH THE REASON. `L.whyStored` ADDED, and it is
       the `undetermined` literal doing exactly the job it was kept for: with
       `attests` forced to 0, iris's key reads not-attesting while both stored
       facts say `active`, and the plane says `undetermined` rather than inventing
       a reason. The arm proves that branch is REACHABLE and that the suite can
       see it. */
    mustFail: [L.attesting, L.bothSides, L.invariant, L.structure, L.whyStored],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.edits.map(([find, put]) => ({ arm, file: STORE, find, put }))));

const count = (hay, needle) => hay.split(needle).length - 1;
const work = mkdtempSync(join(tmpdir(), "d158-control-"));
const asked = process.argv[2];
const order = asked ? [asked] : Object.keys(ARMS);
if (asked && !ARMS[asked]) { console.log(`unknown arm '${asked}': ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let bad = 0;
const results = [];
for (const name of order) {
  const arm = ARMS[name];
  const original = readFileSync(STORE);
  const pristine = join(work, `store.mjs.pristine-${name}-${process.pid}`);
  copyFileSync(STORE, pristine);
  let src = original.toString("utf8"), armed = true;
  for (const [from, to] of arm.edits) {
    const n = count(src, from);
    if (n !== 1) { console.log(`  ARM ${name} DID NOT ARM: its anchor matched ${n} times (must be exactly 1)`); armed = false; break; }
    src = src.replace(from, to);
  }
  let out = "", failed = [], tally = null;
  try {
    if (armed) {
      if (arm.edits.length) writeFileSync(STORE, src);
      const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 << 20 });
      out = (r.stdout || "") + (r.stderr || "");
      failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
      const m = out.match(/signer-enrolment: (\d+) pass, (\d+) fail/);
      tally = m ? `${m[1]}/${m[2]}` : "-1 (the suite did not reach its foot)";
    }
  } finally {
    copyFileSync(pristine, STORE);
    const back = readFileSync(STORE);
    const same = back.length === original.length && back.equals(original) && sha(back) === sha(original);
    console.log(`  restore ${name} (store.mjs): ${back.length} B, sha256 ${sha(back).slice(0, 12)}…, `
      + `byte-identical ${same ? "YES" : "NO"}`);
    if (!same || back.length < MIN_BYTES[STORE]) {
      console.log(`  RESTORE FAILED for ${name} — stop and repair by hand from ${pristine}`); process.exit(3);
    }
  }
  if (!armed) { bad++; results.push(`${name}: DID NOT ARM`); continue; }
  const missing = arm.mustFail.filter((l) => !failed.some((f) => f.startsWith(l)));
  const extra = failed.filter((f) => !arm.mustFail.some((l) => f.startsWith(l)));
  const asDeclared = missing.length === 0 && extra.length === 0 && tally && !tally.startsWith("-1");
  if (!asDeclared) bad++;
  results.push(`${name}: ${tally} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  console.log(`\n=== arm ${name}: ${tally} (pass/fail) — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`     failed: ${f.slice(0, 140)}`);
  for (const m of missing) console.log(`     DECLARED TO FAIL AND DID NOT: ${m}`);
  for (const e of extra) console.log(`     FAILED AND WAS NOT DECLARED: ${e.slice(0, 140)}`);
}
rmSync(work, { recursive: true, force: true });
console.log(`\nRESULTS: ${results.join(" · ")}`);
process.exit(bad ? 1 : 0);
