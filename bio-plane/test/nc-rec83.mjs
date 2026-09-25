/* REC-83's NEGATIVE CONTROL HARNESS. Declared in `test/content-reads.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec83.mjs             # every arm, in order, baseline first
 *     node test/nc-rec83.mjs portion     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec82.mjs`'s shape exactly, and this file is a
 * deliberate copy of that harness rather than an import — a control harness
 * that shares machinery with another item's harness shares that harness's
 * defects, and REC-82's own run found two of its arms wrong on the first pass.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     six-arms-broken from six-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count, and a count
 *     that is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec83");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // store.mjs is over a megabyte; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-reads.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
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
  docattest: {
    files: [STORE],
    why: "make a `document` row present itself to the coverage rule as PAGE 1, so the page-1 "
       + "attestation would cover the whole document. IC-83: a page attestation does not cover a "
       + "document-extent row",
    mustFail: ["AND THE `document` ROW IS NOT",
               "and the document row's covering set names ONLY the document attestor",
               "the `document` row's covering set holds the DOCUMENT attestation and NOT the page one"],
    /* THE HELD-OPEN HALF, CORRECTED AFTER THIS ARM'S FIRST RUN. It used to name
       the assertion that pinned `by` as `["rosa"]`, which this arm ALSO breaks
       (the page attestation starts covering the document row, so `by` gains
       "hollis") — so the arm's own "other direction" was not independent of the
       arm and could not hold it open. The direction claim is now the RAISING
       itself, which this arm genuinely leaves intact, and the `by` membership
       is a declared failure above. Recorded rather than smoothed: the arm found
       the instrument, which is what these arms find most often. */
    mustPass: "NOW the `document` row is raised to B — the OTHER direction, and it must survive this "
            + "arm, because a `#contentTarget` that covered NOTHING would also pass the first "
            + "assertion and the pair is what distinguishes the two",
    patch: () => arm(STORE,
      `    if (kind === "document") return {};`,
      `    if (kind === "document") return { page: 1 };`),
  },
  fixedkey: {
    files: [STORE],
    why: "neuter the unknown-parameter refusal, so op=content silently ACCEPTS a predicate or a page "
       + "— D-222 puts the content-grain query arm in stage C and a read that quietly ignored a "
       + "filter would be a query surface nobody capped",
    mustFail: ["a PREDICATE is refused by name",
               "PAGING is refused the same way",
               "a parameter this op has never heard of is refused too",
               "and the refusal says WHY it refuses rather than ignoring the parameter"],
    mustPass: "every plain fixed-key read — the arm must break the REFUSAL and not the read",
    patch: () => arm(STORE,
      `      .filter((k) => !Store.CONTENT_READ_PARAMS.has(k)))].sort();`,
      `      .filter(() => false))].sort();`),
  },
  portion: {
    files: [STORE],
    why: "THE ITEM'S OWN ARM — answer a PORTION row's connection axis from the whole document, which "
       + "is exactly the provisional Bob WITHDREW on 2026-09-14 (study 5.1). The UNDETERMINED "
       + "statement is the assertion, so an arm that left these green would mean the suite is "
       + "testing something else",
    mustFail: ["THE PORTION ROW IS UNDETERMINED",
               "and the LEVEL THAT IS EMPTY is named",
               "the portion's own sentence says it refers only to its portion",
               "STRUCTURAL: not one non-`document` row in the whole answer carries a connection grade"],
    mustPass: "every ceiling arm, every fixed-key arm, and the over-strictness pin",
    patch: () => arm(STORE,
      `    const connection = r.extent_kind === "document"`,
      `    const connection = true`),
  },
  unwired: {
    files: [STORE],
    why: "delete the `ensureLegContent` call, returning the plane to exactly the state REC-82 landed "
       + "and DECLARED — the function present, correct, and called by nobody. A mechanism believed "
       + "on its EXISTENCE rather than its behaviour is the defect this project meets most",
    mustFail: ["THE FIRST READ MINTS THE ROW",
               "at exactly the id the hash answers for it",
               "and the read answers for it at content grain in the same breath",
               "and op=content resolves the row the backfill minted",
               "(1) an INQUIRY target: no capture and no part to point at",
               "(2) a document this record holds NO BYTES of: nothing to address"],
    mustPass: "every assertion about rows that already exist — the ceilings, the connection axis, "
            + "the fixed-key refusals and the over-strictness pin",
    patch: () => arm(STORE,
      `    const backfill = this.#backfillLegContent(id, legs);`,
      `    const backfill = { ran: 0, truncated: false };`),
  },
  pin: {
    files: [STORE],
    why: "THE OVER-STRICTNESS PIN'S OWN ARM — make `#contentEarned` MUTATE the `earned.connection` "
       + "entry it was handed instead of copying it, which is the ordinary way a new reader silently "
       + "changes what an old one answers. The pin exists to catch exactly this and must be shown "
       + "able to fail; a pin that cannot fail is a pin that is measuring nothing",
    mustFail: ["the CONNECTION entry a document leg earns is unchanged, field for field",
               "and byte-for-byte against the digest the PROBE printed on the pristine tree"],
    mustPass: "every content-grain assertion — the `document` row still earns A and the portion row "
            + "is still undetermined, which is what makes this arm about the PIN and not about the "
            + "feature",
    patch: () => arm(STORE,
      `      ? (doc ? { determined: true, grain: "document", ...doc }`,
      `      ? (doc ? Object.assign(doc, { determined: true, grain: "document" })`),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

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
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) {
      finding++;
      for (const m of a.mustFail.filter((x) => !r.failing.some((l) => l.includes(x))))
        console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    }
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
