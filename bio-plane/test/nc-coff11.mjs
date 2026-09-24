/* COFF-11's NEGATIVE CONTROL HARNESS. Declared in the four suites it drives,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-coff11.mjs                 # every arm, baseline first
 *     node test/nc-coff11.mjs usedrangeasbound  # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it — the `nc-cap9.mjs` / `nc-rec85.mjs` / `nc-cap12.mjs`
 * precedent, named the same way to the same effect.
 *
 * THE RULES, each with its receipt in WORKER.md: one arm at a time with every
 * other defence held OPEN; a BASELINE row that arms nothing; every arm declares
 * BEFORE it runs what MUST fail and what MUST NOT; every arm reports whether it
 * ARMED (a match count that is not exactly 1 is a FINDING, not a retry); every
 * restore is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256
 * AND by content with a byte count printed and a minimum guarded; and a
 * surprising result is a finding about the ARM, printed rather than smoothed.
 *
 * WHY THE ARMS ARE SHAPED THIS WAY. Three of them (`dropxlsxbound`,
 * `dropslideshapes`, `dropodpshapes`) are the row's own declared arm — take the
 * figure back out of ONE producer and the inner bound it feeds cannot fire and
 * the suite says so BY NAME. They are separate because three entries emit into
 * one shape and an arm that took all three down would not have shown that the
 * three are independent.
 *
 * AND TWO OF THEM ARM THE DECISION ITSELF, which is the half of this item that
 * is not a patch. `usedrangeasbound` makes the sheet's BOUND its USED RANGE —
 * the alternative this item considered and rejected — and the suite must fail,
 * because otherwise the decision is a comment rather than a behaviour.
 * `odsborrowsgrid` gives `.ods` OOXML's grid, which is the OTHER way to get the
 * decision wrong: inventing a bound the format never fixed. A decision nothing
 * can break is a decision nothing is enforcing.
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
const SAFE = controlPen("coff11");
mkdirSync(SAFE, { recursive: true });

const XLSX = join(PLANE, "src/formats-xlsx.mjs");
const PPTX = join(PLANE, "src/pptx.mjs");
const ODF = join(PLANE, "src/odf.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   // all three are tens of KB; a restore over a stub must fail loudly.

/* The subjects. Captured to a BUFFER and not a pipe the shell owns — D-282:
   a suite that calls process.exit() discards unflushed pipe writes, and a
   control whose tally reads -1 because of it reports the wrong arm as wrong. */
const SUITES = {
  xlsx: "test/formats-xlsx.test.mjs",
  pptx: "test/formats-pptx.test.mjs",
  odf: "test/formats-odf.test.mjs",
  e2e: "test/capture-container-extent.test.mjs",
};
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
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const XLSX_EMIT = `      rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS,
      usedRows: walked.usedRows, usedCols: walked.usedCols,`;
const PPTX_EMIT = `        shapes: walked.shapes, text: walked.text });`;
const ODP_EMIT = `      hidden: page.hidden, shapes: walked.count, text });`;
const ODS_EMIT = `      rows: null, cols: null, usedRows, usedCols,`;

const ARMS = {
  baseline: {
    files: [], suites: ["xlsx", "pptx", "odf", "e2e"],
    why: "nothing armed — the row that distinguishes seven-arms-broken from seven-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  dropxlsxbound: {
    files: [XLSX], suites: ["xlsx", "e2e"],
    why: "THE ROW'S OWN DECLARED ARM for the SHEET level — take the bound back out of `xlsxText`, "
       + "which is exactly what the entry emitted before this item, so the cell arm's inner bound "
       + "has nothing to read again",
    /* CORRECTED 2026-09-15, MID-ITEM, and both corrections are findings the arm
       produced rather than tidying. (1) "its BOUND stands" is the UNREAD-SHEET
       assertion, and this patch reaches only the READ-sheet emit site — the two
       sites are independent, which `dropxlsxboundunread` below now arms on its
       own rather than leaving the second site covered by nobody. (2) the
       DISAGREE assertion was declared and did NOT fire, because its first
       spelling (`rows === usedRows` expected false) is satisfied by a NULL bound
       too; the assertion was STRENGTHENED in the suite to require both figures
       be integers, and it fires now. An arm that finds an assertion too weak has
       done its job better than one that goes red. */
    mustFail: ["the BOUND is the measured XLSX grid",
               "and the two figures are both REAL and DISAGREE",
               "D500 is inside the emitted BOUND",
               "the PRODUCERS now emit the inner bounds"],
    mustPass: "every slide and .odp assertion — three producers emit into one shape and each is "
            + "independent — AND the UNREAD-sheet bound, which is a different emit site this patch "
            + "does not reach",
    patch: () => arm(XLSX, XLSX_EMIT,
      `      rows: null, cols: null,
      usedRows: walked.usedRows, usedCols: walked.usedCols,`),
  },

  dropslideshapes: {
    files: [PPTX], suites: ["pptx", "e2e"],
    why: "the same arm one container along — take the shape count back out of `pptxText`",
    mustFail: ["every slide unit carries a shape count — read by KEY PRESENCE",
               "and the figure is the walker's, per slide, not a recount",
               "slide 3's three shapes reach the unit",
               "slide units carry slide-shape refs",
               "the PRODUCERS now emit the inner bounds"],
    mustPass: "every sheet assertion and every .odp assertion",
    patch: () => arm(PPTX, PPTX_EMIT, `        shapes: null, text: walked.text });`),
  },

  dropodpshapes: {
    files: [ODF], suites: ["odf"],
    why: "and the third producer — take the shape count back out of `odpText`. Armed separately "
       + "because `.odp` reaches the same I2 shape through a DIFFERENT walker (`walkPage`), and an "
       + "arm that assumed one implementation would not have shown that",
    mustFail: ["every slide unit carries a shape count",
               "and the figures are the deck's own"],
    mustPass: "every .ods assertion and both cross-format assertions",
    patch: () => arm(ODF, ODP_EMIT, `      hidden: page.hidden, shapes: null, text });`),
  },

  dropxlsxboundunread: {
    files: [XLSX], suites: ["xlsx"],
    why: "THE SECOND EMIT SITE, armed on its own because `dropxlsxbound` measurably could not "
       + "reach it. `xlsxText` emits the sheet object at TWO places — the walked sheet and the "
       + "sheet whose part could not be read — and a bound that held at one and not the other "
       + "would be invisible to an arm that only knew about the first",
    mustFail: ["its BOUND stands"],
    mustPass: "every READ-sheet assertion, which is the half the sibling arm covers",
    patch: () => arm(XLSX,
      `        rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS, usedRows: null, usedCols: null,`,
      `        rows: null, cols: null, usedRows: null, usedCols: null,`),
  },

  usedrangeasbound: {
    files: [XLSX], suites: ["xlsx", "e2e"],
    why: "THE DECISION, ARMED. Make the sheet's BOUND its USED RANGE — the alternative this item "
       + "considered and rejected — so a cell that EXISTS and was EMPTY at capture is refused. If "
       + "the suite stays green the decision is a comment rather than a behaviour, and a fence "
       + "tighter than its rule is not a safer fence",
    /* CORRECTED 2026-09-15: "its BOUND stands" is the UNREAD-SHEET site, which this
       patch does not reach (see `dropxlsxboundunread`). AND A SECOND FINDING, kept
       because it is the more useful one: under this arm the END-TO-END suite stayed
       GREEN at 31/0. That is not the arm failing — it is the measurement that the
       e2e suite CANNOT SEE the bound at all today, because the acquire wire drops
       the producer's figure before the store ever reads it (D-359's residue,
       DELEGATED). The decision is enforced by the producer suites alone until that
       three-line wire edit lands, and saying so is the point of running this. */
    mustFail: ["the BOUND is the measured XLSX grid",
               "and the two figures are both REAL and DISAGREE",
               "D500 is inside the emitted BOUND",
               "and the BOUND is unmoved by any of it"],
    mustPass: "every slide and .odp assertion, and every REFUSAL arm — this arm breaks correct work, "
            + "which is the only thing it may break",
    patch: () => arm(XLSX, XLSX_EMIT,
      `      rows: walked.usedRows, cols: walked.usedCols,
      usedRows: walked.usedRows, usedCols: walked.usedCols,`),
  },

  odsborrowsgrid: {
    files: [ODF], suites: ["odf"],
    why: "THE DECISION'S OTHER FAILURE MODE. Give `.ods` OOXML's grid as its bound — inventing a "
       + "maximum OpenDocument never fixes. The record asserting a fact nobody established is the "
       + "defect this project weighs heaviest, and it must not pass silently",
    mustFail: ["the BOUND is NULL on every sheet",
               "a null bound is NOT a null used range",
               "and the ONLY divergence is the bound"],
    mustPass: "every .odp assertion and every used-range assertion",
    patch: () => arm(ODF, ODS_EMIT, `      rows: 1048576, cols: 16384, usedRows, usedCols,`),
  },
};

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
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);

  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);   // UNIQUELY NAMED PER ARM
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES) { console.log(`  ABORT      pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE   ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }

  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);

  const results = a.suites.map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT     ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`             ${l}`);

  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT      a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }

  if (!armed.armed) { console.log("  VERDICT    ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length;
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`             DECLARED BUT NOT SEEN: ${m}`);
    notAsDeclared++;
  }
}

console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
process.exit(0);
