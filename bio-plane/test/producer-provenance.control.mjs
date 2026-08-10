/* D-251's NEGATIVE CONTROL HARNESS. Declared in
 * `test/producer-provenance.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/producer-provenance.control.mjs
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `owed-controls.control.mjs` precedent, copied rather
 * than reinvented).
 *
 * THE RULES IT OBEYS: one arm at a time with every other defence held OPEN; a
 * BASELINE row that arms nothing, so "three arms broken" and "three arms
 * working" cannot read the same; every arm DECLARES what must fail and what
 * must not BEFORE it runs; every arm reports whether it ARMED (the patch's
 * match count) and every restore is verified against a uniquely-named per-arm
 * pristine copy by sha256 AND by content (`cmp`), with the byte count printed
 * and a floor guarded.
 *
 * =====================================================================
 * RUN 2026-08-10, worktree `agent-a9a385fb87482fe28`. BASELINE: both suites
 * green — producer-provenance 58 pass / 0 fail, pdfstructure 94 pass / 0 fail.
 *
 *   ARM 1 (the /Info read removed — `infoDict()` never consulted):
 *     producer-provenance 58 -> 37 pass / 21 FAIL · pdfstructure 94 -> 87 / 7 FAIL.
 *     Every named-engine assertion collapsed: the chain fell back to ["layer"]
 *     for all three OCR-named documents, no product was named anywhere, the
 *     basis stopped carrying the engine, and both trailer shapes went blind at
 *     the parser. MUST NOT HELD: nothing read as "authored" — not one of the
 *     never-authored arms moved — and the encrypted arm still NAMED encryption.
 *     Removing a read must WEAKEN the record, not strengthen it, and it did.
 *
 *   ARM 2 — THE ARM THIS ITEM EXISTS FOR (the classification made able to
 *   STRENGTHEN: metadata present, no marker -> "authored"):
 *     producer-provenance 58 -> 52 pass / 6 FAIL · pdfstructure 94 -> 93 / 1 FAIL.
 *     The failures NAME IT: `AUTHORING SOFTWARE IN /Info IS NOT EVIDENCE OF
 *     AUTHORSHIP: Microsoft Word reads 'undetermined', NEVER "authored"` (want
 *     "undetermined", got "authored"), the `word` and `unanticipated` I2-field
 *     arms, the parser-level `a re-save that dropped the marker reads
 *     undetermined, never authored`, and — STRUCTURALLY, without the word being
 *     written into that assertion at all — `the detector answers ONLY inside the
 *     vocabulary`, because "authored" is not in `PRODUCER_DETERMINATIONS` and
 *     cannot be added to a frozen array. MUST NOT HELD: the ABBYY, Tesseract and
 *     UTF-16 arms all STAYED GREEN, which is what makes this a measurement of
 *     STRENGTHENING rather than of general breakage.
 *
 *   ARM 3 (over-strictness: one over-broad marker row added, firing on
 *   `scan|recognition|document`):
 *     producer-provenance 58 -> 50 pass / 8 FAIL · pdfstructure 94 pass / 0 fail.
 *     The unanticipated-spelling document was GUESSED into `ocr` — exactly the
 *     defect the arm exists to catch — and the no-false-positive corpus arm
 *     failed with it, as did the two arms that hold the marker table to one
 *     exercised sample per row. MUST NOT HELD: nothing crashed — every fixture
 *     still answered `ok:true`, which is the other half of "rather than crash or
 *     guess", and the parser suite stayed fully green.
 * =====================================================================
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE THIS WORKTREE and never in a shared
   scratchpad — a harness silently replaced between ARM and RESTORE reports a
   restore it never performed. A dot-directory, so no walk enrols what it holds. */
const SAFE = join(REPO, ".d251-control-pristine");
mkdirSync(SAFE, { recursive: true });

const P = (rel) => join(REPO, rel);
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 2000;

const SUITES = [
  ["producer-provenance", "test/producer-provenance.test.mjs", /producer-provenance: (\d+) pass, (\d+) fail/],
  ["pdfstructure", "test/pdfstructure.test.mjs", /pdfstructure: (\d+) passed, (\d+) failed/],
];

function run() {
  const out = {};
  for (const [name, rel, re] of SUITES) {
    const r = spawnSync(process.execPath, [rel], { cwd: PLANE, encoding: "utf8", timeout: 600_000 });
    const text = `${r.stdout || ""}${r.stderr || ""}`;
    const m = re.exec(text);
    out[name] = {
      code: r.status,
      pass: m ? +m[1] : -1,
      fail: m ? +m[2] : -1,
      failures: text.split("\n").filter((l) => /^\s*FAIL\s/.test(l)).map((l) => l.trim().replace(/^FAIL\s+/, "")),
      text,
    };
  }
  return out;
}

const line = (r) => SUITES.map(([n]) => `${n} ${r[n].pass}/${r[n].pass + r[n].fail} (${r[n].fail} FAIL)`).join(" · ");

function arm({ id, what, mustFail, mustNot, file, patch }) {
  const abs = P(file);
  const pristine = join(SAFE, `${id}-${basename(file)}`);
  copyFileSync(abs, pristine);
  const before = sha(pristine);
  const bytes = readFileSync(pristine).length;
  console.log(`\n=== ARM ${id} — ${what}`);
  console.log(`    MUST FAIL: ${mustFail}`);
  console.log(`    MUST NOT:  ${mustNot}`);
  console.log(`    pristine ${file}: ${bytes} bytes · sha256 ${before.slice(0, 12)}…`);
  if (bytes < MIN_BYTES) { console.log(`    ABORT: pristine is ${bytes} bytes, under the ${MIN_BYTES}-byte guard`); process.exit(2); }

  const [next, n] = patch(readFileSync(abs, "utf8"));
  writeFileSync(abs, next);
  console.log(`    ARMED: patch matched ${n} time(s)${n === 0 ? "  <-- AN ARM THAT DID NOT ARM IS A FINDING" : ""}`);

  const r = run();
  console.log(`    RESULT: ${line(r)}`);
  for (const [name] of SUITES)
    for (const f of r[name].failures) console.log(`      FAILED  [${name}] ${f}`);

  copyFileSync(pristine, abs);
  const after = sha(abs);
  const same = spawnSync("cmp", [pristine, abs]).status === 0;
  console.log(`    RESTORE: sha256 ${before === after ? "EQUAL" : "MISMATCH"} · cmp ${same ? "IDENTICAL" : "DIFFERS"} · ${readFileSync(abs).length} bytes`);
  if (before !== after || !same) { console.log("    ABORT: restore not verified"); process.exit(2); }
  return r;
}

/* ---- BASELINE. Arms nothing. Three arms broken and three arms working must
   not read the same, and only this row can tell them apart. ---------------- */
{
  const r = run();
  console.log(`=== BASELINE (nothing armed) — ${line(r)}`);
  if (SUITES.some(([n]) => r[n].fail !== 0)) {
    console.log("    ABORT: the tree is not green before arming anything");
    process.exit(2);
  }
}

/* (1) REMOVE THE `/Info` READ. The classification is untouched; only the read
      that feeds it is cut, which is the narrowest way to ask "is the metadata
      read what carries the named engine". */
arm({
  id: "1", file: "bio-plane/src/pdfstructure.mjs",
  what: "the /Info read is removed — readProducer never consults infoDict()",
  mustFail: "every named-engine assertion: no chain reaches ['layer','ocr'], no product is named, "
          + "and the basis stops carrying the engine",
  mustNot: "nothing may read as 'authored', and the encrypted case must still NAME encryption — "
         + "removing a read must WEAKEN the record, never strengthen it",
  patch: (src) => {
    const from = "    const info = doc.infoDict();";
    const to = "    const info = null; void doc.infoDict;";
    return [src.replace(from, to), (src.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length];
  },
});

/* (2) THE ARM THIS ITEM EXISTS FOR. Let the classification STRENGTHEN: a
      document that carries producer metadata with no OCR marker reads
      "authored". This is the exact defect D-251 was raised to prevent, and it
      must fail an assertion that NAMES it. */
arm({
  id: "2", file: "bio-plane/src/pdfstructure.mjs",
  what: "THE CLASSIFICATION IS MADE ABLE TO STRENGTHEN — an absent marker reads as 'authored'",
  mustFail: "an assertion NAMING it: the Microsoft Word document must not read 'authored', the "
          + "re-saved document must not either, and — structurally — the detector must answer "
          + "only inside a vocabulary that has no 'authored' member",
  mustNot: "the ABBYY and Tesseract arms must stay GREEN, or this measures general breakage "
         + "rather than strengthening",
  patch: (src) => {
    const from = `  return Object.freeze({ producer: p, creator: c, determination: "undetermined", ocr: null,
    why: (p || c) ? "no_ocr_marker_in_producer_metadata" : "no_producer_metadata" });`;
    const to = `  return Object.freeze({ producer: p, creator: c,
    determination: (p || c) ? "authored" : "undetermined", ocr: null,
    why: (p || c) ? "no_ocr_marker_in_producer_metadata" : "no_producer_metadata" });`;
    return [src.replace(from, to), src.includes(from) ? 1 : 0];
  },
});

/* (3) OVER-STRICTNESS. A detector that GUESSES is the opposite defect and is
      just as much an overclaim: it would file authoring software as OCR. One
      over-broad marker row, and the unanticipated-spelling document must stop
      reading `undetermined`. */
arm({
  id: "3", file: "bio-plane/src/pdfstructure.mjs",
  what: "the detector is made to GUESS — one over-broad marker row (scan|recognition|document)",
  mustFail: "the unanticipated-spelling document is guessed into `ocr`, and the no-false-positive "
          + "corpus arm fails with it",
  mustNot: "nothing may CRASH — every fixture must still answer ok:true, which is the other half "
         + "of 'rather than crash or guess'",
  patch: (src) => {
    const from = `  Object.freeze({ marker: "abbyy", re: /\\babbyy\\b/i }),`;
    const to = from + `\n  Object.freeze({ marker: "over-broad", re: /\\b(scan|recognition|document)\\b/i }),`;
    return [src.replace(from, to), src.includes(from) ? 1 : 0];
  },
});

/* The pen is removed ONLY on a clean run — every restore above was verified by
   sha256 AND by `cmp` before we got here, so there is nothing left in it that
   anyone needs. A run INTERRUPTED mid-arm leaves it behind on purpose, which is
   why `.gitignore` also carries it: an untracked scratch directory left in a
   worktree has already been swept into another item's walk. */
rmSync(SAFE, { recursive: true, force: true });

console.log("\nALL THREE ARMS RAN AND WERE RESTORED. Read the per-arm rows above against each arm's "
  + "declared MUST FAIL / MUST NOT — a surprising green is a finding about the arm, not a pass.");
