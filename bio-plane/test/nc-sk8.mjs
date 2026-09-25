/* SK-8's NEGATIVE CONTROL HARNESS. Declared in `test/extractrun.test.mjs`, run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-sk8.mjs              # every arm, in order, baseline first
 *     node test/nc-sk8.mjs strengthen   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-sk7.mjs`'s shape, and this file is a deliberate COPY of
 * that harness rather than an import — a control harness that shares machinery
 * with another item's harness shares that harness's defects, and REC-82's,
 * REC-83's and SK-7's runs each found an arm of their own wrong on the first
 * pass.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     all-arms-broken from all-arms-working.
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
const SAFE = controlPen("sk8");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const EXTRACT = join(PLANE, "src/extractrun.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
/* `extractrun.mjs` is the smallest file this harness arms, so the floor is set
   under IT rather than under `store.mjs`: a minimum that only a megabyte-sized
   file could clear would never fire for the small one, which is a guard that
   guards one of its two subjects. Measured at the landing: ~15 KB. */
const MIN_BYTES = 8000;

/* The subject: this item's own suite, run alone. Captured to a FILE-sized buffer
   and not a pipe the child can outrun — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
const PLANE_SUITE = { cwd: PLANE, script: "test/extractrun.test.mjs" };

const runSuite = (subject = PLANE_SUITE) => {
  const r = spawnSync(process.execPath, [subject.script],
    { cwd: subject.cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
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
    files: [], why: "nothing armed — the row that distinguishes all-arms-broken from all-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* ARM (b). THE ROW'S OWN DECLARED CONTROL, and the sharpest one here. The
     hazard of this whole capability is OUTPUT THAT LOOKS BETTER THAN ITS INPUT,
     and the single thing standing between a proposed reading and that hazard is
     that `proposalChain` goes through `appendStep` rather than building the
     array itself. Concatenating is exactly the "simplification" a producer
     reaches for, it is one line, and it silently removes rule 2 from this whole
     construct while every other assertion in the suite stays green. */
  strengthen: {
    files: [EXTRACT],
    why: "make `proposalChain` CONCATENATE the ai step instead of routing it through "
       + "`appendStep` — the one-line simplification that removes rule 2 from this producer while "
       + "leaving every shape refusal in place, so the module still looks like it is checking",
    mustFail: ["A STEP CLAIMING A CAP STRONGER THAN ITS INPUT IS REFUSED BY NAME",
               "and the refusal says WHY in the sentence the rule was written with"],
    mustPass: "every other assertion — the step is still emitted, still named, still versioned, "
            + "still labelled, still bounded, still graded, and a capture with no chain is still "
            + "refused; which is the point of the arm, because a defect that broke the producer "
            + "outright would be noticed by anybody",
    patch: () => arm(EXTRACT,
      `  const out = appendStep(captureChain, { step: "ai", engine: fn, version: String(version).trim(),\n                                         cap: cap == null ? null : cap });`,
      `  const out = [...captureChain, { step: "ai", engine: fn, version: String(version).trim(),\n                                  cap: cap == null ? null : cap }];`),
  },

  /* ARM (c). THE LABEL, DROPPED FROM ONE SURFACE ONLY — the WRITE's answer,
     while the READ's rows stay labelled. That asymmetry is the whole design of
     the arm: what must fail is the TOTALITY walk, and it must fail NAMING the
     surface rather than reporting a count, because a location is actionable and
     a count is not. */
  label: {
    files: [STORE],
    why: "delete the `mint:` line from `extractPropose`'s answer, dropping the label from the "
       + "WRITE while `extractproposals`'s rows stay labelled — the row's own declared control, a "
       + "label dropped from ONE surface",
    mustFail: ["EVERY proposed-reading row on EVERY surface carries the plane's own machine-work label",
               "the label is the plane's own PREDICATE and not a literal a surface matches on"],
    mustPass: "the two READ surfaces stay labelled, so the totality arm names ONE surface and not "
            + "three — which is what makes the failure a location; the minted CONTENT row stays "
            + "labelled by SK-7's own helper, because this arm does not touch that call site; and "
            + "every bound, grade, coverage and run assertion stays green",
    patch: () => arm(STORE,
      `             mint: Store.#mintLabel(proposedBy.trim()),\n             proposed: out, minted,`,
      `             proposed: out, minted,`),
  },

  /* ARM (d). §7.3 (5)'s BOUND, removed in the way it would actually be removed
     — not by deleting a refusal, which looks like vandalism, but by giving the
     absent case a DEFAULT ALLOWANCE. That is the shape a builder reaches for to
     avoid a refusal, and it is precisely the invented number the ruling forbids:
     a measurement with no measurement behind it. The run with no declared bound
     then produces freely, and NOTHING WOULD EVER END IT, because `finishedBound`
     fires only on a row with `allowed > 0`. */
  bound: {
    files: [STORE],
    why: "make `#mintsBound` answer a DEFAULT ALLOWANCE instead of null for a run that declared "
       + "none — the invented number §7.3 (5) rules out, and the shape a builder reaches for to "
       + "avoid writing a refusal",
    mustFail: ["A RUN THAT DECLARES NO `mints` BOUND MAY NOT PRODUCE"],
    mustPass: "every arm about the run that DID declare a bound — its consumption, its publication "
            + "in `op=airun`'s budget, the whole-batch refusal at the ceiling, the exhaustion "
            + "refusal and the run ENDING on the bound — all stay green, because `#mintsBound` "
            + "still finds the real row. This arm moves ONE property and the failure is therefore "
            + "attributable to it",
    patch: () => arm(STORE,
      `      \`SELECT allowed, consumed FROM ai_run_bounds WHERE run = ? AND bound = 'mints'\`, run) || null;`,
      `      \`SELECT allowed, consumed FROM ai_run_bounds WHERE run = ? AND bound = 'mints'\`, run)\n      || { allowed: 1000, consumed: 0 };`),
  },

  /* ARM (e). "WHY KEEP TWO TABLES?" — the change that makes a machine's
     proposal count as extraction coverage. It is the most plausible edit in this
     whole item, because writing the proposal into `reading_refs` looks like
     joining it up rather than like weakening anything, and the effect is
     invisible from the proposal's own surface: it shows up only when a reverse
     index every earned tier reads starts answering the machine's reference. */
  coverage: {
    files: [STORE],
    why: "make `extractPropose` ALSO write its refs into `reading_refs` — the plausible "
       + "why-keep-two-tables edit, which makes an uncited machine proposal count as extraction "
       + "coverage the moment any earned tier reads the reverse index",
    mustFail: ["and `op=readingref` — the reverse index every earned tier reads — does not answer the "],
    mustPass: "the registered reader's own `readings` row is still byte-for-byte what it was (this "
            + "arm writes the index, not the reading, which is why an arm judged only on the "
            + "reading would MISS it); the recogniser's resolutions are unchanged; and every "
            + "grade, bound and label assertion is untouched",
    patch: () => arm(STORE,
      "          contentId, proposedBy.trim(), when);\n        out.push({ ref: x.ref,",
      "          contentId, proposedBy.trim(), when);\n"
      + "        this.sql.exec(\n"
      + "          `INSERT OR REPLACE INTO reading_refs (capture_sha,bundle_id,ref,ref_kind,ref_key,label)\n"
      + "           VALUES (?,?,?,?,?,?)`,\n"
      + "          sha, bundleId, x.ref, x.refKind, x.refKey, x.label);\n"
      + "        out.push({ ref: x.ref,"),
  },

  /* ARM (f). THE OVER-STRICTNESS DIRECTION, and the promotion is chosen at C→B
     rather than at B→A ON PURPOSE. A B→A arm trips `PROPOSAL_ABOVE_CEILING` and
     the whole batch is refused, which cascades into arms about the bound, the
     label and the ratio and stops any failure being attributable to the grade.
     C→B is the same defect one letter down and it is the realistic one: a
     grader quietly strengthening what a reference supports, with nothing
     refusing it, which is the record claiming more than it can support.

     ITS HELD-OPEN HALF IS THE POINT: every MEMBER-side assertion must stay
     green. This item adds no grade to anything a member wrote, and an arm that
     moved the member's own A would be measuring something else. */
  overstrict: {
    files: [EXTRACT],
    why: "promote a NAME-only proposal from C to B in `proposedReadingGrade` — the ordinary way a "
       + "new grader silently strengthens what the record claims, in the one direction CLAUDE.md "
       + "ranks worst",
    mustFail: ["the proposal naming only a NAME earns C",
               "and each row SAYS what it earned AND the letter it earned",
               "no proposal may reach A"],
    mustPass: "EVERY member-side assertion — the registered reader's reading byte-for-byte, its "
            + "single resolution at A, `op=readingref` answering the reader's reference and not "
            + "the machine's, and the member's own leg landing on the machine's row — plus every "
            + "bound, label and run arm. A grader that answered B for everything would pass those, "
            + "which is why this arm's verdict is the three failures AND that green half together",
    /* THE ANCHOR MOVED ONCE, AND THAT IS PART OF THIS ARM'S RECORD. Its first
       cut matched two independent literals — a `grade:` key and a sentence — and
       the run produced a SURPRISING GREEN on the sentence assertion, because
       promoting the letter left the reason saying *names only a NAME*. The
       SUBJECT was corrected rather than the assertion (`proposedReadingGrade`
       now interpolates the letter into its own sentence, so a B cannot be
       explained by a C's reason), and the anchor follows the corrected shape.
       The arm then fails all three as declared. */
    patch: () => arm(EXTRACT,
      `  if (isNonEmptyString(e.label)) {\n    const grade = "C";`,
      `  if (isNonEmptyString(e.label)) {\n    const grade = "B";`),
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
  const r = runSuite(a.subject || PLANE_SUITE);
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
