/* CAP-12's NEGATIVE CONTROL HARNESS. Declared in
 * `test/capture-container-extent.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-cap12.mjs              # every arm, in order, baseline first
 *     node test/nc-cap12.mjs dropsheets   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it — the `nc-cap9.mjs` / `nc-rec85.mjs` precedent, and it is
 * named the same way to the same effect.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     eight-arms-broken from eight-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count; a count that
 *     is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * WHY THERE ARE THREE `drop*` ARMS RATHER THAN ONE, and it is REC-85's own
 * reason for writing three container predicates: the sheet list, the paragraph
 * count and the slide list are THREE INDEPENDENT LEVELS, and a single arm that
 * took all three down would not have shown that. Each one alone must fail its
 * own container's three assertions and leave the other two containers green.
 *
 * AND WHY THE WRITER AND THE READER ARE ARMED SEPARATELY: `drop*` breaks the
 * WRITER (the figure never reaches the reading) and `reader` breaks the READER
 * (the figure is there and the store ignores it). A single arm would have
 * collapsed two different failures into one. `zero` and `notion` arm the two
 * ways this item could have written a FALSE fact rather than an absent one, and
 * `overstrict` arms the direction that refuses CORRECT work.
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
const SAFE = join(REPO, ".cap12-control-pristine");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/capture-container-extent.test.mjs"],
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
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes eight-arms-broken from eight-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  dropsheets: {
    files: [INDEX],
    why: "THE ARM THAT PROVES THE GAP WAS REAL for the SHEET level — drop the sheet list from the persisted extent, which is exactly what the record held before this item. C-45.1 then cannot fire on a freshly acquired workbook",
    mustFail: ["the workbook's reading carries the SHEET NAMES the fixture was BUILT with, in order",
               "and each carries its container extent THROUGH THE OP",
               "a cell on a sheet the workbook does NOT have is REFUSED BY NAME",
               "and the refusal names the sheet list it was checked against",
               /* CORRECTED 2026-09-15 by COFF-11: this label was SPLIT in the suite when the
                  producers began emitting the inner figures, so the old spelling matched
                  nothing and the arm read NOT AS DECLARED while the subject was behaving
                  exactly right — the mis-declared-arm failure this harness's own header
                  warns about, met a second time. Corrected, never exempted.
                  CORRECTED AGAIN 2026-09-15 by COFF-12: the same label moved a
                  SECOND time when the acquire wire landed and the assertion
                  stopped saying "still holds NULL" and started saying the record
                  holds the producer's own figure. Twice in one day on one label
                  is itself the finding — an arm that names an assertion by its
                  PROSE is coupled to that prose, and this is what the coupling
                  costs. */
               "and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE"],
    mustPass: "every paragraph and slide assertion — three independent levels, and an arm that took all three down would not have shown that",
    /* ANCHOR CORRECTED 2026-09-15 by COFF-12, AND THE ARM READ `ARMED NO,
       patch matched 0x` UNTIL IT WAS — which is the whole reason a harness
       reports its match count rather than trusting a patch to land. This arm
       quoted the three lines that wrote `rows: null, cols: null` as LITERALS,
       and COFF-12 replaced them with the passthrough that reads the producer's
       figure. The arm's SUBJECT is unchanged — drop the sheet LEVEL and the
       sheet arm cannot fire — so the anchor is re-quoted and the arm corrected
       rather than exempted. A control whose anchor has drifted is a control
       nobody is running, and it fails SILENTLY in the direction that looks like
       success: green suite, green battery, nothing tested. */
    patch: () => arm(INDEX,
      `                    sheets: sh ? sh.map((s) => ({
                      name: s && typeof s.name === "string" ? s.name : null,
                      rows: int(s && s.rows), cols: int(s && s.cols),
                      usedRows: int(s && s.usedRows), usedCols: int(s && s.usedCols) })) : null,`,
      `                    sheets: null,`),
  },
  droppara: {
    files: [INDEX],
    why: "the same arm one level along — drop the PARAGRAPH count, so a paragraph past the end of a freshly acquired document mints again",
    mustFail: ["the document's reading carries the PARAGRAPH COUNT the fixture was BUILT with",
               "and each carries its container extent THROUGH THE OP",
               "a paragraph past the count is REFUSED BY NAME, 0-based bound stated"],
    mustPass: "every sheet and slide assertion",
    patch: () => arm(INDEX,
      "                    paragraphs: pa ? pa.length : null,",
      "                    paragraphs: null,"),
  },
  dropslides: {
    files: [INDEX],
    why: "the same arm one level along again — drop the SLIDE list, so a slide past the deck mints again",
    mustFail: ["the deck's reading carries one entry per SLIDE the fixture was BUILT with",
               "and each carries its container extent THROUGH THE OP",
               "a slide past the deck is REFUSED BY NAME, 1-based bound stated",
               /* CORRECTED 2026-09-15 by COFF-11: this label was SPLIT in the suite when the
                  producers began emitting the inner figures, so the old spelling matched
                  nothing and the arm read NOT AS DECLARED while the subject was behaving
                  exactly right — the mis-declared-arm failure this harness's own header
                  warns about, met a second time. Corrected, never exempted.
                  CORRECTED AGAIN 2026-09-15 by COFF-12, for the same reason the
                  sibling arm was — and its ANCHOR with it: this patch quoted
                  `sl.map(() => ({ shapes: null }))`, the POSITIONAL map COFF-12
                  replaced with one keyed on the unit's own `slide`. It read
                  `ARMED NO, patch matched 0x`. */
               "and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE"],
    mustPass: "every sheet and paragraph assertion",
    patch: () => arm(INDEX,
      "                    slides: sl ? slideExtents(sl) : null,",
      "                    slides: null,"),
  },
  zero: {
    files: [INDEX],
    why: "WRITE A ZERO WHERE THE RECORD HAS AN ABSENCE — treat an entry's EMPTY list (the over-the-size-bound branch's own shape) as a held figure rather than as NULL. A workbook too large to read would then be recorded as holding NO sheets, and C-45.1 would refuse every cell citation on it: the record asserting a fact nobody established",
    mustFail: ["a workbook whose entry itemised NO sheets records NULL and never 0"],
    mustPass: "every arm over a container the entry DID itemise — the arm must break only the empty case",
    patch: () => arm(INDEX,
      `                const held = (k) => (has(k) && i2text[k].length ? i2text[k] : null);`,
      `                const held = (k) => (has(k) ? i2text[k] : null);`),
  },
  notion: {
    files: [INDEX],
    why: "INVENT AN ABSENCE — declare every container as itemising all three levels, so a workbook is recorded as one whose paragraph count and slide list the record is MISSING rather than one that has no such notion. The store then reports a gap that does not exist",
    mustFail: ["each container declares the level it itemises AT ALL, and only that one",
               "a workbook whose entry itemised NO sheets records NULL and never 0"],
    mustPass: "every refusal and every mint — `levels` is a statement about what is absent and bounds nothing, so breaking it must not move a single gate. That is itself the finding this arm records",
    /* ANCHOR CORRECTED BY FW-19, NOT EXEMPTED: FW-19 split the `levels` line so
       the two new levels (`tables`, `images`) are named by KEY presence beside
       the three named by array presence, and the old anchor then matched 0x —
       the arm read `ARMED NO`, the dead-control failure this file's header
       records twice already. The patch still does exactly what the arm is
       for: the three original levels declared regardless of what the entry
       itemised. */
    patch: () => arm(INDEX,
      `                    levels: [...["sheets", "paragraphs", "slides"].filter(has),`,
      `                    levels: [...["sheets", "paragraphs", "slides"],`),
  },
  reader: {
    files: [STORE],
    why: "break the READER rather than the writer — the extent is on the reading and `#containerExtentForCapture` ignores it, answering NULL for all three exactly as it did before this item",
    mustFail: ["a cell on a sheet the workbook does NOT have is REFUSED BY NAME",
               "and the refusal names the sheet list it was checked against",
               "a paragraph past the count is REFUSED BY NAME, 0-based bound stated",
               "a slide past the deck is REFUSED BY NAME, 1-based bound stated"],
    mustPass: "every acquire and persist arm — the figures still reach the reading, which is what separates this failure from `drop*`'s",
    patch: () => arm(STORE,
      `    const held = reading && typeof reading === "object" && reading.container_extent
      && typeof reading.container_extent === "object" ? reading.container_extent : null;`,
      `    const held = null;`),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION on the SHEET arm's inner bound — invent five rows and five columns per sheet, so a cell inside a KNOWN sheet is refused against a bound nobody measured. A fence tighter than its rule is not a safer fence, and refusing here pushes a member toward citing the whole document, which claims MORE",
    /* THE DECLARATION WAS THE DEFECT ON THE FIRST RUN, recorded rather than
       smoothed: it named BOTH D-359 arms while the patch touches only
       `coversSheetCell`'s figure, so the arm read `1/2 declared, 1 failing` —
       NOT AS DECLARED for a subject that was behaving exactly right. That is
       REC-85's `canon` finding reproduced one item later, and it is why the
       slide half is `overstrict2` and not a second clause here: a mis-declared
       arm reads exactly like a partially-working subject. */
    /* CORRECTED 2026-09-15 by COFF-11: inventing a five-row bound refuses BOTH the
       empty-but-existing cell AND the genuinely impossible one, so the declaration names
       two. The old declaration named one and the arm read "1/1 declared, 2 failing" —
       under-declaring reads as a subject doing more than asked, which is the same defect
       as over-declaring and just as invisible. */
    /* CORRECTED AGAIN 2026-09-15 by COFF-12, and the correction is a REAL CHANGE
       IN WHAT THIS ARM BREAKS rather than a relabelling. Before the acquire wire
       landed, `A1048577` MINTED and inventing a five-row bound made it refuse —
       so the arm's second declared failure was that whole assertion flipping.
       The wire now refuses `A1048577` correctly against the MEASURED grid, so
       the arm no longer flips that assertion at all: it changes the FIGURE in
       the refusal from 1,048,576 to 5, and what fails is the sub-assertion that
       reads the figure. That sub-assertion exists because a refusal whose detail
       does not carry the bound is one a member cannot act on — and it turns out
       to be the only thing standing between "refused" and "refused against a
       number nobody measured". The third declared failure is new and is the
       clearest statement of this arm's harm: the `.ods` workbook, whose grid is
       honestly NULL, gets a five-row bound invented for it and a TRUE citation
       on it is refused. */
    mustFail: ["cell ZZ999999 of a sheet the workbook HAS mints",
               "and the refusal carries THE FIGURE it was checked against",
               "so the very address an XLSX REFUSES still MINTS here"],
    mustPass: "every refusal arm above and every in-range mint — the arm must break correct work and nothing else",
    patch: () => arm(STORE,
      `    const sheets = held && Array.isArray(held.sheets) && held.sheets.length ? held.sheets : null;`,
      `    const sheets = held && Array.isArray(held.sheets) && held.sheets.length
      ? held.sheets.map((s) => ({ ...s, rows: 5, cols: 5 })) : null;`),
  },
  overstrict2: {
    files: [STORE],
    why: "the over-strictness direction on the SLIDE arm's inner bound, armed separately because `coversSlideShape` is its own predicate reading its own shape",
    /* CORRECTED 2026-09-15 by COFF-11: the suite's label gained "still" when the reason
       changed from "no entry emits it" to "the wire drops it".
       CORRECTED AGAIN 2026-09-15 by COFF-12, and again the arm's HARM MOVED and
       not only its label. Shape 9,999 is now refused correctly against the
       slide's own measured count, so inventing five shapes no longer flips that
       assertion — it corrupts the FIGURE in the refusal, and the sub-assertion
       that reads the figure is what catches it. The second declared failure is
       the gapped deck: a five-shape bound invented for every slide refuses a
       TRUE citation of slide 3's fourth shape, which is exactly the harm this
       direction exists to catch and which no assertion in this file could see
       before COFF-12's fixture existed. */
    mustFail: ["and the refusal carries THE SLIDE'S OWN SHAPE COUNT",
               "(3) one shape PAST it is REFUSED C-45.1 BY NAME"],
    mustPass: "the sheet arm's D-359 mint, and every refusal",
    patch: () => arm(STORE,
      `    const slides = held && Array.isArray(held.slides) && held.slides.length ? held.slides : null;`,
      `    const slides = held && Array.isArray(held.slides) && held.slides.length
      ? held.slides.map((s) => ({ ...s, shapes: 5 })) : null;`),
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
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
