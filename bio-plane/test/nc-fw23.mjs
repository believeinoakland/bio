/* FW-23's NEGATIVE CONTROL HARNESS — the `csv` format entry. Declared on the
 * suite it drives (`formats-csv.test.mjs`'s NEGATIVE CONTROL line), run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-fw23.mjs                  # every arm, baseline first
 *     node test/nc-fw23.mjs guessdelimiter   # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery and `coverage.mjs`'s fleet walk must not find it — the
 * `nc-coff12.mjs` / `nc-coff13.mjs` precedent, whose runner loop this file
 * carries. The rules and their receipts are in those files' headers and in
 * `WORKER.md`: one arm at a time with every other defence held OPEN; a BASELINE
 * row, because a harness whose first run reported null for every arm was
 * distinguishable from six-arms-working only by its baseline; each arm declares
 * BEFORE it runs what MUST fail AND what MUST NOT, and BOTH halves are checked;
 * an arm that did not match EXACTLY ONCE is a FINDING, not a skip; every restore
 * is verified against a uniquely-named per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded (never
 * `git checkout --`, which restores HEAD and discards the work).
 *
 * THE PRISTINE COPIES GO TO THE SESSION SCRATCHPAD AND NEVER INTO THE WORKTREE
 * — BOB #32, 2026-09-24, superseding the dot-directory the two earlier harnesses
 * use: a file in the worktree is walked by repository-walking suites, trips
 * `gates.mjs` §2e, and makes the tree dirty so D-293 refuses to record a green
 * verdict. Set `FW23_PEN` to override; the default is this machine's scratchpad.
 *
 * THE ARMS, each the item's own doctrine inverted:
 *  - `guessdelimiter` — THE ROW'S OWN DECLARED ARM (QUEUE FW-23's accepts-when:
 *    "guess a delimiter where none is determined and the undetermined arm fails
 *    by name"). When the signature determines nothing, fall back to a comma.
 *  - `guessencoding`  — emit the cells of an UNDETERMINED-ENCODING body anyway,
 *    which is the reader deciding what a byte means. The corpus paid for this
 *    one: 0x96 is an en dash in windows-1252 and n-tilde in Mac Roman.
 *  - `sniffbytes`     — let detect() answer `csv` from the delimiter signature
 *    over BYTES. This is the shape this item MEASURED to be dishonest: 5 of 8
 *    planted non-CSV text shapes fire it, hard-wrapped prose among them.
 *  - `headerrow`      — consume record 1 as a header, so row 1 is not row 1.
 *  - OVER-STRICTNESS   — the sibling entries must be UNMOVED by every arm. An
 *    arm inside `csv.mjs` that moves another entry's output moved two variables
 *    and refutes nothing.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const PEN = process.env.FW23_PEN
  || "/tmp/claude-0/-home-user-bio/ab5589a3-734d-55b0-a53d-b85456578d6c/scratchpad/fw23/nc-pristine";
if (!ANCHOR_DRY) mkdirSync(PEN, { recursive: true });   /* M0-197: the pen is the arms' business; the dry read never arms */

const CSV = join(PLANE, "src/csv.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
/* A restore over a stub must fail loudly: csv.mjs is ~25 KB of source and comment. */
const MIN_BYTES = 18000;

const SUITES = {
  csv: "test/formats-csv.test.mjs",
  xlsx: "test/formats-xlsx.test.mjs",
  odf: "test/formats-odf.test.mjs",
  docx: "test/formats-docx.test.mjs",
  pptx: "test/formats-pptx.test.mjs",
  ooxml: "test/ooxml.test.mjs",
  registry: "test/formats.test.mjs",
};
const SIBLINGS = ["xlsx", "odf", "docx", "pptx", "ooxml", "registry"];

/* Captured to a BUFFER, never a pipe the shell owns (D-282); a missing tally is
   -1, never 0 — that suite did not reach its own FOOT. */
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* TWO TALLY SPELLINGS, and reading only one is how a green suite reports -1:
     most suites print "N pass, M fail" and `ooxml.test.mjs` prints
     "N passed, M failed". Caught by this harness's own baseline row on its
     first run — the baseline earning its place. */
  const m = /(\d+) passe?d?, (\d+) faile?d?/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}

/** Apply exactly one textual patch, reporting the match count. */
function armPatch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The sites this item landed, quoted VERBATIM so an arm that stops matching is
   a loud finding rather than a silent no-op. */
const SITE_WALK = `    records = walkRecords(text, delim.delimiter);`;
const SITE_CELL = `      if (encodingUndetermined && !asciiClean(field)) {`;
const SITE_DETECT = `    if (bytes) return null;`;
const SITE_ROWS = `  parts.records.forEach((record, r0) => {`;

const ARMS = {
  guessdelimiter: {
    why: "an undetermined delimiter falls back to a comma",
    patch: [SITE_WALK, `    records = walkRecords(text, delim.delimiter ?? ",");`],
    mustFail: [
      "inconsistent counts: ONE column a row, with the delimiter undetermined BY NAME",
      "and each cell is the WHOLE line — a fallback comma would have split them",
    ],
    mustNotFail: SIBLINGS,
  },
  guessencoding: {
    why: "a cell whose encoding is undetermined is emitted anyway, as some 8-bit decoding",
    patch: [SITE_CELL, `      if (false && encodingUndetermined && !asciiClean(field)) {`],
    mustFail: [
      "and ONLY the affected CELL is undetermined, named with its own address",
      "the cell's text is ABSENT from the stream, never mojibake",
      "its neighbours are read exactly as published",
      "and the reading SAYS SO in its counts and its dialect",
    ],
    mustNotFail: SIBLINGS,
  },
  sniffbytes: {
    why: "detect() answers csv from the delimiter signature over BYTES",
    patch: [SITE_DETECT,
      `    if (bytes) {
      const probe = delimiterSignature(BYTE_TRANSPORT.decode(bytes.subarray(0, SIGNATURE_WINDOW_BYTES)));
      return probe.delimiter
        ? { format: "csv", confidence: "likely", signals: ["ARMED: a delimiter signature over bytes"] }
        : null;
    }`],
    mustFail: [
      "bytes alone: the entry declines, over a real corpus shape",
      "and the REGISTRY's pass 1 therefore answers undetermined for those bytes",
      "every planted non-CSV text shape is DECLINED by bytes — the whole reason detect ignores them",
    ],
    mustNotFail: SIBLINGS,
  },
  headerrow: {
    why: "record 1 is consumed as a header, so row 1 is not row 1",
    patch: [SITE_ROWS, `  parts.records.slice(1).forEach((record, r0) => {`],
    mustFail: [
      "ROW 1 IS ROW 1: the header-looking record is a ROW, not a consumed header",
      "three records, three columns — the used extent, measured from the cells",
      "the sheet is a sheet-range unit (IC-124), 1-based and A1-spelled",
      "cells counted, and an empty cell is not one",
      "the entry accepts raw bytes at the registry seam as the office entries do",
    ],
    mustNotFail: SIBLINGS,
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).map(([arm, a]) => ({ arm, file: CSV, find: a.patch[0], put: a.patch[1] })));

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no arm "${only}"; have: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

console.log("=== FW-23 NEGATIVE CONTROL — the csv format entry ===\n");
console.log(`subject  ${CSV}`);
console.log(`pristine ${PEN}  (session scratchpad, NOT the worktree — BOB #32)\n`);

/* THE BASELINE ROW. Without it, six-arms-broken and six-arms-working print the
   same table (WORKER.md's measured receipt). */
const baseline = {};
for (const k of ["csv", ...SIBLINGS]) baseline[k] = runSuite(k);
console.log("BASELINE  " + Object.values(baseline)
  .map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · "));
let bad = Object.values(baseline).filter((r) => r.fail !== 0 || r.exit !== 0);
if (bad.length) {
  console.error(`\nBASELINE IS NOT GREEN (${bad.map((r) => r.key).join(", ")}) — every arm below would be unreadable. Stopping.`);
  process.exit(1);
}

let findings = 0;
for (const name of names) {
  const arm = ARMS[name];
  const pristine = join(PEN, `csv.mjs.${name}.pristine`);
  copyFileSync(CSV, pristine);
  const before = sha(CSV), beforeBytes = statSync(CSV).size;
  console.log(`\n--- ARM ${name}: ${arm.why}`);
  console.log(`    DECLARED must fail (${arm.mustFail.length}): ${arm.mustFail.map((s) => `"${s.slice(0, 48)}…"`).join(", ")}`);
  console.log(`    DECLARED must NOT move: ${arm.mustNotFail.join(", ")}`);

  const got = armPatch(CSV, arm.patch[0], arm.patch[1]);
  if (!got.armed) {
    console.log(`    *** THE ARM DID NOT ARM: the site matched ${got.matches} time(s), not once. THIS IS A FINDING.`);
    findings++;
    copyFileSync(pristine, CSV);
    continue;
  }

  const armed = runSuite("csv");
  const hit = arm.mustFail.filter((lbl) => armed.failing.some((f) => f.includes(lbl.slice(0, 48))));
  const missed = arm.mustFail.filter((lbl) => !hit.includes(lbl));
  const unexpected = armed.failing.filter((f) => !arm.mustFail.some((lbl) => f.includes(lbl.slice(0, 48))));
  const sib = arm.mustNotFail.map((k) => runSuite(k));
  const moved = sib.filter((r) => r.fail !== baseline[r.key].fail || r.pass !== baseline[r.key].pass);

  console.log(`    ARMED    csv ${armed.pass}/${armed.fail} (baseline ${baseline.csv.pass}/${baseline.csv.fail}) · ${hit.length}/${arm.mustFail.length} declared failures fired`);
  if (missed.length) { console.log(`    *** DECLARED BUT DID NOT FIRE (a finding about the ARM): ${missed.map((s) => `"${s.slice(0, 56)}…"`).join(", ")}`); findings++; }
  if (unexpected.length) console.log(`    also failing (not declared, recorded rather than smoothed): ${unexpected.length} — ${unexpected.slice(0, 4).map((s) => s.slice(6, 62)).join(" | ")}`);
  console.log(`    SIBLINGS ${sib.map((r) => `${r.key} ${r.pass}/${r.fail}`).join(" · ")}`);
  if (moved.length) { console.log(`    *** OVER-STRICTNESS BREACH: ${moved.map((r) => r.key).join(", ")} moved. THIS IS A FINDING.`); findings++; }

  /* Restore, and VERIFY it — by sha256 AND by content, with the byte count
     printed and a minimum guarded. */
  copyFileSync(pristine, CSV);
  const after = sha(CSV), afterBytes = statSync(CSV).size;
  const identical = readFileSync(CSV).equals(readFileSync(pristine));
  const ok = after === before && identical && afterBytes === beforeBytes && afterBytes >= MIN_BYTES;
  console.log(`    RESTORED ${afterBytes} B sha256 ${after.slice(0, 12)}…  ${ok ? "verified (sha256 + cmp + floor)" : "*** RESTORE NOT VERIFIED"}`);
  if (!ok) { findings++; process.exit(1); }
}

console.log(`\n=== ${names.length} arm(s) run · ${findings} finding(s) ===`);
process.exit(findings ? 1 : 0);
