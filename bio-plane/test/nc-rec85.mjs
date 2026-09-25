/* REC-85's NEGATIVE CONTROL HARNESS. Declared in
 * `test/content-extent-arms.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-rec85.mjs            # every arm, in order, baseline first
 *     node test/nc-rec85.mjs sheetcell  # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `owed-controls.control.mjs`
 * precedent).
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md — and it is
 * `nc-rec82.mjs`'s harness with this item's arms, deliberately, because a second
 * harness of one shape is the drift this repository keeps measuring:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     eight-arms-broken from eight-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED. A match count that is not exactly 1
 *     is a FINDING, never a retry.
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
const SAFE = controlPen("rec85");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // the file is hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE-backed
   buffer and not a pipe the suite can outlive — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-extent-arms.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
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

/** Two patches in one arm, both required. Used only by `overstrict`, whose
 *  direction needs every level of the container to read as zero rather than as
 *  absent — one predicate would leave the other two honest and the arm would be
 *  measuring a third of itself. */
function armAll(file, pairs) {
  if (ANCHOR_DRY) return (pairs.forEach(([find, replace]) => anchorPatch(file, find, replace)), { armed: true, matches: pairs.length });   /* M0-197 */
  const src = readFileSync(file, "utf8");
  let out = src, total = 0;
  for (const [find, replace] of pairs) {
    const n = out.split(find).length - 1;
    if (n !== 1) return { armed: false, matches: n };
    out = out.replace(find, replace); total++;
  }
  writeFileSync(file, out);
  return { armed: true, matches: total };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes eight-arms-broken from eight-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  sheetcell: {
    files: [CHECKS],
    why: "neuter `coversSheetCell`, so a cell outside the workbook the record holds is accepted",
    mustFail: ["a sheet the workbook does not have is REFUSED BY NAME",
               "a row past the sheet's last is REFUSED BY NAME",
               "a column past the sheet's last is REFUSED BY NAME",
               "a sheet list with NO dimensions refuses an unknown SHEET"],
    mustPass: "the doc-para and slide-shape container refusals — three separate predicates, and an arm that took all three down would not have shown that",
    patch: () => arm(CHECKS,
      "function coversSheetCell(e, container) {",
      "function coversSheetCell(e, container) {\n  if (true) return null;"),
  },
  docpara: {
    files: [CHECKS],
    why: "neuter `coversDocPara`, so a paragraph past the count the record holds is accepted",
    mustFail: ["a paragraph past the count is REFUSED BY NAME",
               "a container holding ONLY a paragraph count bounds the paragraph arm"],
    mustPass: "the sheet-cell and slide-shape container refusals",
    patch: () => arm(CHECKS,
      "function coversDocPara(e, container) {",
      "function coversDocPara(e, container) {\n  if (true) return null;"),
  },
  slideshape: {
    files: [CHECKS],
    why: "neuter `coversSlideShape`, so a slide past the deck and a shape past the slide are accepted",
    mustFail: ["a slide past the deck is REFUSED BY NAME",
               "a shape not in the slide's list is REFUSED BY NAME"],
    mustPass: "the sheet-cell and doc-para container refusals",
    patch: () => arm(CHECKS,
      "function coversSlideShape(e, container) {",
      "function coversSlideShape(e, container) {\n  if (true) return null;"),
  },
  a1: {
    files: [CHECKS],
    why: "neuter the BIJECTIVE base-26 accumulator to ordinary base 26, which puts AA at 26 instead of 27 — the arm that shows the boundary sweep is measuring the accumulator rather than decorating the suite",
    mustFail: ["every swept cell accumulates bijectively"],
    mustPass: "every refusal above — a wrong column number still refuses out-of-range cells, just the wrong ones, which is exactly why the sweep and not a refusal is what catches this",
    patch: () => arm(CHECKS,
      "  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);",
      "  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 65);"),
  },
  onebased: {
    files: [CHECKS],
    why: "admit `slide: 0`, so IC-1's 1-BASED slide numbering becomes two numberings and two spellings of slide 1 both mint",
    mustFail: ["SLIDE 0 IS REFUSED"],
    mustPass: "every other shape refusal, and every container refusal",
    patch: () => arm(CHECKS,
      "    if (!Number.isInteger(e.slide) || e.slide < 1)",
      "    if (!Number.isInteger(e.slide) || e.slide < 0)"),
  },
  canon: {
    files: [CHECKS],
    why: "THE ARM'S OWN ARM — drop the three new canonical branches so every arm falls through to the `{kind, fields}` catch-all, which `legExtent` no longer fills: every address of one kind then collapses to ONE id",
    mustFail: ["a DIFFERENT cell is a DIFFERENT row",
               "and the SHEET is part of the address",
               "two different paragraphs are two rows",
               "a RUN narrows the address",
               "two different shapes on one slide are two rows",
               "a WHOLE SLIDE is its own address",
               "the canonical form of each arm is over its OWN fixed fields"],
    mustPass: "nothing in particular — this arm exists to show the dedup assertions CAN fail, because a dedup true for every input is true for no reason (REC-82's `address` arm, applied to this item's arms)",
    /* CORRECTED AFTER ITS FIRST RUN, AND THE FIRST RUN IS THE FINDING. As first
       written this arm patched ONLY the `sheet-cell` branch while DECLARING that
       all three arms would collapse, and it came back `3/7 declared failure(s)
       present, 6 total failing` — the paragraph and shape assertions stayed
       green because their branches were untouched, which is correct behaviour
       for the patch that actually ran and a wrong result for the arm that was
       declared. THE DECLARATION WAS THE DEFECT, not the subject, and the fix is
       to make the arm do what it says rather than to soften what it says. It is
       recorded here rather than smoothed because a mis-declared arm reads
       exactly like a partially-working subject. */
    patch: () => armAll(CHECKS, [
      ["  if (e.kind === 'sheet-cell')\n    return canonicalJson({ kind: 'sheet-cell',",
       "  if (false)\n    return canonicalJson({ kind: 'sheet-cell',"],
      ["  if (e.kind === 'slide-shape')\n    return canonicalJson({ kind: 'slide-shape',",
       "  if (false)\n    return canonicalJson({ kind: 'slide-shape',"],
      ["  if (e.kind === 'doc-para')\n    return canonicalJson({ kind: 'doc-para',",
       "  if (false)\n    return canonicalJson({ kind: 'doc-para',"],
    ]),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION — make the container predicates refuse where the record holds NO container extent (a null level read as zero), so every legal in-range citation on a document nobody measured is refused. A fence tighter than its rule is not a safer fence, and this direction is precisely what pushes a member into citing the WHOLE DOCUMENT, which claims MORE",
    /* THE SECOND THING THAT CAME BACK WRONG ON THE FIRST RUN, AND IT IS THE
       SHAPE REC-82 AND REC-83 EACH RECORDED ONE ITEM APART. Declared as four
       named assertion failures, this arm returned `-1 pass, -1 fail` — the
       harness's own signal that the suite DID NOT REACH ITS OWN FOOT. It did
       not, and the reason is the arm working perfectly: the very first in-range
       citation in the suite is a FIXTURE, `mustPromote` THROWS on a refused
       promote, and the module ends before any assertion is evaluated. A THROW
       GOES THROUGH NO ASSERTION AT ALL.
       So the declaration is re-cut to what the arm can actually demonstrate,
       which is STRONGER and not weaker: under this arm the suite cannot even
       BUILD its ground, and the error it dies on names C-45.1 on the first
       legal cell citation. `mustThrow` is checked against the captured output
       below, so this arm is verified rather than excused — an arm whose verdict
       is "it crashed" and nothing more would be indistinguishable from an arm
       that broke the harness. */
    /* RE-CUT AT THE REC-84 MERGE, 2026-09-14, AND THE RE-CUT IS A FINDING RATHER
       THAN A FIX. The third marker was `C-45.1` and came back MISSING — 2/3 —
       on the merged tree, and the reason is worth more than the arm. Pre-merge,
       a container refusal could only ever arrive at the STORE's gate, so it
       carried the content family's own C-number. REC-84 added a CATALOGUE gate
       that runs the same checker with `CONTENT_EXTENT_DOCUMENT_ONLY`, and this
       arm — which makes an ABSENT container read as zero — therefore fires at
       that gate too, where the leg grammar RELAYS the finding at C-2.8 while
       carrying the content family's CODE through unchanged. Measured, not
       reasoned: the crash reads `"check":"C-2.8" … "code":
       "CONTENT_EXTENT_OUT_OF_RANGE"`.
       So the C-NUMBER IS THE GATE and the CODE IS THE FACT, which is precisely
       the distinction REC-84 paid four red assertions to establish, and it is
       the CODE that "refused BY NAME" has always meant. Both are now asserted —
       the code because it is the stable half, the C-number because pinning
       which gate answered is worth having — and the finding is recorded here
       rather than smoothed into a passing arm. */
    mustFail: [],
    mustThrow: ["Error: promote INQ-2026-8500-cell", "CONTENT_EXTENT_OUT_OF_RANGE", "C-2.8"],
    mustPass: "every refusal arm above — the arm must break CORRECT WORK and nothing else, and here it breaks it so early the suite cannot reach its own foot",
    /* RE-ANCHORED after the three predicates were changed to answer a SENTENCE
       rather than a refusal — the code literal moved back inside the
       `is-content-extent` region so all four C-45.1 sites sit in the one span
       the row's `where` names. The arm patches what the predicates now return,
       and its match count is what says it still arms: an arm that did not arm is
       a finding, and a stale anchor is how one stops arming silently (the shape
       `nc-rec82.mjs`'s `stale` arm recorded when a set-based rewrite moved its
       anchor to zero matches). */
    patch: () => armAll(CHECKS, [
      ["  const sheets = container && Array.isArray(container.sheets) ? container.sheets : null;\n  if (!sheets || !sheets.length) return null;",
       "  const sheets = container && Array.isArray(container.sheets) ? container.sheets : [];\n  if (!sheets.length) return `no sheets held`;"],
      ["  const n = container ? container.paragraphs : null;\n  if (!(Number.isInteger(n) && n > 0)) return null;",
       "  const n = container ? container.paragraphs : null;\n  if (!(Number.isInteger(n) && n > 0)) return `no paragraph count held`;"],
      ["  const slides = container && Array.isArray(container.slides) ? container.slides : null;\n  if (!slides || !slides.length) return null;",
       "  const slides = container && Array.isArray(container.slides) ? container.slides : [];\n  if (!slides.length) return `no slide list held`;"],
    ]),
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
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ")
    : (a.mustThrow ? `(no assertion runs — the suite must DIE on: ${a.mustThrow.join(" | ")})` : "(nothing — baseline)")}`);
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
  } else if (a.mustThrow) {
    /* AN ARM THAT BREAKS THE FIXTURE ITSELF, verified on what the crash SAYS.
       `pass === -1` is the harness's "did not reach its own foot" signal and is
       required here rather than tolerated: an arm that reported a tally would
       mean the suite got further than this arm should allow it to. */
    const hit = a.mustThrow.filter((m) => r.out.includes(m));
    const ok = r.exit !== 0 && r.pass === -1 && hit.length === a.mustThrow.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — the suite did not reach its own foot `
      + `(${r.pass === -1 ? "as declared" : `pass=${r.pass}, which it should not have reached`}) and `
      + `${hit.length}/${a.mustThrow.length} declared marker(s) are in the crash`);
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
