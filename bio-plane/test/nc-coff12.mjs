/* COFF-12's NEGATIVE CONTROL HARNESS. Declared in the suite it drives, run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-coff12.mjs                  # every arm, baseline first
 *     node test/nc-coff12.mjs slidesbyposition # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS A REAL SOURCE
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it — the `nc-cap9.mjs` / `nc-rec85.mjs` / `nc-cap12.mjs` /
 * `nc-coff11.mjs` precedent, named the same way to the same effect.
 *
 * THE RULES, each with its receipt in WORKER.md: one arm at a time with every
 * other defence held OPEN; a BASELINE row that arms nothing; every arm declares
 * BEFORE it runs what MUST fail and what MUST NOT; every arm reports whether it
 * ARMED (a match count that is not exactly 1 is a FINDING, not a retry); every
 * restore is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256
 * AND by content with a byte count printed and a minimum guarded (never
 * `git checkout --`, which restores to HEAD and has twice discarded a session's
 * own uncommitted work); and a surprising result is a finding about the ARM,
 * printed rather than smoothed.
 *
 * ONE THING THIS HARNESS DOES THAT `nc-coff11.mjs` DID NOT, and it is here
 * because REC-83's own run found an arm that broke its declared held-open half
 * and nothing but a human read caught it: `mustNotFail` IS CHECKED, not merely
 * described. Every arm names assertions that must survive it, and a held-open
 * assertion going down is reported as NOT AS DECLARED exactly like a declared
 * failure that never fired. An arm that takes the whole suite down proves
 * nothing about its own subject.
 *
 * WHY THE ARMS ARE SHAPED THIS WAY. Two of them (`dropcellbound`,
 * `dropslideshapes`) are the row's own declared arm, ARMED PER FIGURE RATHER
 * THAN ONCE: take the passthrough back out of ONE of the two figures and that
 * arm's inner bound cannot fire while the other keeps firing. An arm that took
 * both out would have shown the wire works and NOT that the two figures are
 * independent — and they reach this one object from two different producers.
 *
 * ONE OF THEM ARMS A DEFECT NO BEHAVIOURAL ASSERTION IN THIS REPOSITORY COULD
 * SEE BEFORE THIS ITEM. `slidesbyposition` restores the positional slide map —
 * the shape this wire carried from CAP-12 until today — while leaving the
 * passthrough itself intact, so it isolates the KEYING and nothing else. It is
 * the arm that proves the keying matters rather than reads as a tidier spelling.
 *
 * AND TWO OF THEM ARM THE DECISION THAT TRAVELS WITH THE CONTRACT, which is the
 * half of this item that is not a patch. `borrowgrid` gives an OpenDocument
 * workbook OOXML's grid at the WIRE — inventing a maximum the format never
 * fixes, one seam further along than COFF-11's `odsborrowsgrid`, which could not
 * see this file. `usedasbound` makes the stored bound the USED range, so a cell
 * that EXISTS and was EMPTY at capture is refused. Both break correct work,
 * which is the only thing they may break: a decision nothing can break is a
 * decision nothing is enforcing, and a fence tighter than its rule is not a
 * safer fence.
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
const SAFE = controlPen("coff12");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 400000;   // index.mjs is ~546 KB; a restore over a stub must fail loudly.

const SUITES = { e2e: "test/capture-container-extent.test.mjs" };
/* Captured to a BUFFER and not a pipe the shell owns — D-282: a suite that calls
   process.exit() discards unflushed pipe writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through NO assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is -1, never 0:
     the suite did not reach its own FOOT. */
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The three sites this item landed, quoted verbatim so an arm that stops
   matching is a LOUD finding rather than a silent no-op. */
const SHEET_PASSTHROUGH = `                      rows: int(s && s.rows), cols: int(s && s.cols),`;
const SLIDE_PASSTHROUGH = `                      out[u.slide - 1] = { shapes: int(u.shapes) };`;
const SLIDE_KEYING = `                    slides: sl ? slideExtents(sl) : null,`;

const ARMS = {
  baseline: {
    files: [], suites: ["e2e"],
    why: "nothing armed — the row that distinguishes five-arms-broken from five-arms-working. "
       + "A harness whose first run reported the same thing for every arm INCLUDING the baseline "
       + "has happened here; only the baseline row tells the two apart",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },

  dropcellbound: {
    files: [INDEX], suites: ["e2e"],
    why: "THE ROW'S OWN DECLARED ARM for the SHEET figure — put `rows`/`cols` back to the LITERAL "
       + "NULL this wire wrote until today, so the cell arm's inner bound has nothing to read "
       + "again. Armed PER FIGURE: the slide figure is left carrying, because the two reach this "
       + "one object from two different producers and an arm taking both would not have shown it",
    mustFail: [
      "and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE",
      "and the grid it carries is the MEASURED OOXML grid",
      "cell A1048577 — one row PAST the measured grid",
      "and the refusal carries THE FIGURE it was checked against",
    ],
    mustNotFail: [
      "shape 9,999 of a slide the deck HAS is now REFUSED",
      "the RECORD keys the shape counts on the SLIDE NUMBER",
      "a slide past the deck is REFUSED BY NAME",
      "the refusal names the sheet list it was checked against",
    ],
    patch: () => arm(INDEX, SHEET_PASSTHROUGH,
      `                      rows: null, cols: null,`),
  },

  dropslideshapes: {
    files: [INDEX], suites: ["e2e"],
    why: "the same arm on the OTHER figure — put the slide's `shapes` back to the literal NULL. "
       + "The keying is left intact so this arm measures the PASSTHROUGH and not the map",
    mustFail: [
      "and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE",
      "shape 9,999 of a slide the deck HAS is now REFUSED",
      "and the refusal carries THE SLIDE'S OWN SHAPE COUNT",
      "the RECORD keys the shape counts on the SLIDE NUMBER",
      "(3) one shape PAST it is REFUSED C-45.1 BY NAME",
    ],
    mustNotFail: [
      "cell A1048577 — one row PAST the measured grid",
      "and the grid it carries is the MEASURED OOXML grid",
      "a slide past the deck is REFUSED BY NAME",
      "(1) the LAST declared slide MINTS",
    ],
    patch: () => arm(INDEX, SLIDE_PASSTHROUGH,
      `                      out[u.slide - 1] = { shapes: null };`),
  },

  slidesbyposition: {
    files: [INDEX], suites: ["e2e"],
    why: "THE ARM THAT PROVES THE KEYING MATTERS, and nothing in this repository could see the "
       + "defect it plants before this item existed. Restore the POSITIONAL slide map — the exact "
       + "shape this wire carried from CAP-12 until today — while leaving the passthrough itself "
       + "carrying the figure, so what is measured is the KEYING alone. On a deck whose slide 2 "
       + "cannot be read, the stored array becomes slide 3's count at slide 2's index: the record "
       + "then bounds a slide it could not read by ANOTHER slide's figure, and refuses a TRUE "
       + "citation of the last slide as past a deck it is inside",
    mustFail: [
      "the RECORD keys the shape counts on the SLIDE NUMBER",
      "(1) the LAST declared slide MINTS",
      "(2) its LAST shape",
      "(3) one shape PAST it is REFUSED C-45.1 BY NAME",
      "(4) a shape on the UNREADABLE slide 2 MINTS",
    ],
    mustNotFail: [
      "cell A1048577 — one row PAST the measured grid",
      "shape 9,999 of a slide the deck HAS is now REFUSED",
      "a slide past the deck is REFUSED BY NAME",
      "the deck's reading carries one entry per SLIDE the fixture was BUILT with",
      "an HTML capture's whole reading is BYTE-IDENTICAL",
    ],
    patch: () => arm(INDEX, SLIDE_KEYING,
      `                    slides: sl ? sl.map((u) => ({ shapes: int(u && u.shapes) })) : null,`),
  },

  borrowgrid: {
    files: [INDEX], suites: ["e2e"],
    why: "THE DECISION'S FAILURE MODE, ONE SEAM FURTHER ALONG THAN COFF-11 COULD REACH. Make the "
       + "wire supply OOXML's grid whenever the producer answered NULL — inventing a maximum "
       + "OpenDocument never fixes, at the one seam where the producer suites cannot see it. "
       + "`coversSheetCell` refuses against whatever is stored, so this would refuse real "
       + "citations on every OpenDocument workbook the plane ever reads. The record asserting a "
       + "fact nobody established is the defect this project weighs heaviest and it must not pass "
       + "silently",
    mustFail: [
      "its grid bound is NULL — PRESENT and null, not absent",
      "so the very address an XLSX REFUSES still MINTS here",
    ],
    mustNotFail: [
      "cell A1048577 — one row PAST the measured grid",
      "and the grid it carries is the MEASURED OOXML grid",
      "shape 9,999 of a slide the deck HAS is now REFUSED",
      "while an unknown SHEET on the same workbook is still REFUSED",
    ],
    patch: () => arm(INDEX, SHEET_PASSTHROUGH,
      `                      rows: Number.isInteger(s && s.rows) ? s.rows : 1048576,
                      cols: Number.isInteger(s && s.cols) ? s.cols : 16384,`),
  },

  usedasbound: {
    files: [INDEX], suites: ["e2e"],
    why: "THE OTHER WAY TO GET THE DECISION WRONG, and the arm the accepts-when asks for by name: "
       + "store the USED RANGE as the bound, so a cell that EXISTS in the grid and was EMPTY at "
       + "capture is refused. In this product an empty cell is routinely the finding, and the "
       + "refusal would not even stop the citation — it would push the member up to the WHOLE "
       + "DOCUMENT, which claims MORE. This is the half COFF-11 already drove at the producer and "
       + "that must not regress at the wire",
    mustFail: [
      "cell ZZ999999 of a sheet the workbook HAS mints",
      "and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE",
      "and the grid it carries is the MEASURED OOXML grid",
      "the USED range is carried BESIDE the bound",
    ],
    mustNotFail: [
      "shape 9,999 of a slide the deck HAS is now REFUSED",
      "the RECORD keys the shape counts on the SLIDE NUMBER",
      "a slide past the deck is REFUSED BY NAME",
      "the refusal names the sheet list it was checked against",
    ],
    patch: () => arm(INDEX, SHEET_PASSTHROUGH,
      `                      rows: int(s && s.usedRows), cols: int(s && s.usedCols),`),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) {
  console.error(`no such arm: ${only}. Arms: ${Object.keys(ARMS).join(", ")}`);
  process.exit(2);
}

let notAsDeclared = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY          ${a.why}`);
  console.log(`  MUST FAIL    ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST NOT     ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing — baseline)"}`);

  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);   // UNIQUELY NAMED PER ARM
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE     ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }

  const armed = a.patch();
  console.log(`  ARMED        ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);

  const results = a.suites.map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT       ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`               ${l}`);

  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED     ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT        a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }

  if (!armed.armed) { console.log("  VERDICT      ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  /* THE HELD-OPEN HALF, CHECKED AND NOT DESCRIBED. An arm that takes the whole
     suite down proves nothing about its own subject. */
  const broke = a.mustNotFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length && broke.length === 0;
  console.log(`  VERDICT      ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
    + `${broke.length}/${a.mustNotFail.length} held-open assertion(s) ALSO broken, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`               DECLARED BUT NOT SEEN: ${m}`);
    for (const m of broke) console.log(`               HELD OPEN BUT BROKEN: ${m}`);
    notAsDeclared++;
  }
}

console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
process.exit(0);
