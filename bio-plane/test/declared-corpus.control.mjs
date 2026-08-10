#!/usr/bin/env node
/* THE NEGATIVE CONTROL FOR D-277, DRIVEN THROUGH THE REAL GATE.
 *
 * Run from `bio-plane/`:   node test/declared-corpus.control.mjs [all|0|A|B|C|D|E|F]
 *
 * WHY IT DRIVES `scripts/coverage.mjs --strict` AND NOT THE MODULE. The subject of
 * this item is not "does a scanner blank comments" — a fixture would agree with
 * that for free, and `test/declared-corpus.test.mjs` asks it there. The subject is
 * **a GATE that failed honest runs and passed dishonest ones**, so every arm here
 * edits a REAL file in the tree, runs the REAL script, and reads its REAL exit
 * status with nothing piped after it.
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open, and each is
 * restored from a UNIQUELY NAMED per-arm pristine copy verified by sha256 AND by
 * a full byte comparison, with the byte count printed and floored. There is a
 * BASELINE ROW (arm 0): without one, "every arm red" and "every arm green" are
 * the same picture, and a harness whose first run reported null for every arm
 * including the baseline is on this project's record.
 *
 * DECLARED BEFORE RUNNING — what MUST happen, and what MUST NOT:
 *
 *   (0) BASELINE. Nothing armed.                     MUST exit 0.
 *   (A) THE DEFECT ITSELF, and it must now PASS. An ordinary explanatory comment
 *       in the catalogue naming an unallocated numeral — the exact thing D-271
 *       wrote and the reason this item exists.       MUST exit 0, and the catalog
 *       count MUST NOT move. (Before this item: exit 1, catalog +1.)
 *   (B) A GENUINELY UNCATALOGUED CHECK MUST STILL FAIL. A real `check:` row for
 *       an id no assertion names.                    MUST exit 1, naming that id.
 *   (C) OVER-STRICTNESS. A REAL declaration in a spelling nobody anticipated — an
 *       id in a bare ARRAY LITERAL, which is none of the three shapes the
 *       catalogue uses today — must STILL be catalogued.  MUST exit 1, naming it.
 *       (Exit 1 is the PROOF: if the odd spelling were missed, the run would be
 *       green and the check would have vanished from the contract in silence.)
 *   (D) CREDIT MUST COME FROM CODE. Turn a real check's only code-level assertion
 *       into PROSE, leaving the id in comments alone. MUST exit 1, naming it.
 *   (E) THE WORD BOUNDARY. Declare an id and let a suite name only a SIBLING that
 *       extends it.                                  MUST exit 1, naming the
 *       declared id — not credited by its neighbour.
 *   (F) OVER-STRICTNESS, FOREIGN NAMESPACE. A comment naming a DECISION id whose
 *       dotted tail has the same shape as a check id. MUST exit 0, and the id
 *       MUST NOT appear in the catalog or in the prose-only line.
 *
 * MUST NOT MOVE, in every arm: the fleet figures, the owed-controls ledger and
 * the register floor. An arm that moved one of those would be an arm testing
 * something other than what it declares.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const SCRATCH = join(PLANE, ".d277-control");

const CATALOG = join(PLANE, "checks", "bio-checks.mjs");
const FIRING = join(PLANE, "test", "check-firing.test.mjs");
const SUITE = join(PLANE, "test", "declared-corpus.test.mjs");

/* A byte floor per file, so a restore "verified" over a truncated or empty file
   cannot read as clean. Two harnesses in this repository once reported a restore
   byte-identical over an EMPTY manifest, caught only because a digest read the
   sha256 of the empty string. */
const FLOOR = { [CATALOG]: 400_000, [FIRING]: 30_000, [SUITE]: 3_000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => statSync(p).size;

/* The ids these arms use. EVERY ONE IS OUTSIDE ANY FAMILY THIS CATALOGUE
   ALLOCATES, and that is asserted below rather than assumed — an arm that plants
   a REAL id would be crediting or discrediting a live check and measuring
   something other than what it says. They are also built from parts rather than
   written whole, because this file is itself readable by the very matchers it is
   about and a harness that plants a declaration in the corpus it measures is a
   failure this project has recorded more than once. */
const ID = (fam, mem) => "C" + "-" + fam + "." + mem;
const ARM_A_ID = ID(901, 3);      // named in prose only
const ARM_B_ID = ID(902, 4);      // a real row, nothing names it
const ARM_C_ID = ID(903, 5);      // a real declaration in an odd spelling
const ARM_E_ID = ID(904, 1);      // declared; only its sibling is named
const ARM_E_SIB = ID(904, 12);    // the sibling
const ARM_F_ID = "DEC" + "-" + "905.6";   // a foreign namespace, same dotted tail
const ARM_D_ID = ID(1, 2);        // a REAL check — arm D is about crediting it

const OPEN = "/" + "*", CLOSE = "*" + "/";

function run() {
  const r = spawnSync(process.execPath, ["scripts/coverage.mjs", "--strict"],
    { cwd: PLANE, encoding: "utf8", timeout: 300_000 });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

const catalogCount = (out) => {
  const m = /CHECKS\s+(\d+) in the catalog/.exec(out);
  return m ? Number(m[1]) : null;   // null, never 0 — a missing tally is not a zero
};
const proseLine = (out) => {
  const m = /prose only: ([^\n]*)/.exec(out);
  return m ? m[1].trim() : "";
};

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        want ${JSON.stringify(want)}\n        got  ${JSON.stringify(got)}`}`);
};

/* --------------------------------------------------------------- arm plumbing */

mkdirSync(SCRATCH, { recursive: true });

function withFiles(arm, edits, body) {
  const files = Object.keys(edits);
  const pristine = {};
  for (const f of files) {
    const p = join(SCRATCH, `pristine-${arm}-${f.split("/").pop()}`);
    copyFileSync(f, p);
    pristine[f] = { path: p, sha: sha(f), bytes: bytes(f) };
    if (pristine[f].bytes < FLOOR[f])
      throw new Error(`arm ${arm}: ${f} is ${pristine[f].bytes} bytes, below its floor ${FLOOR[f]} — refusing to arm over a file that is already wrong`);
  }
  let armed = 0;
  try {
    for (const f of files) {
      const before = readFileSync(f, "utf8");
      const after = edits[f](before);
      if (after === before) throw new Error(`arm ${arm}: the edit to ${f} MATCHED ZERO TIMES — an arm that did not arm is a finding, not a pass`);
      writeFileSync(f, after);
      armed++;
    }
    return body();
  } finally {
    for (const f of files) {
      copyFileSync(pristine[f].path, f);
      const okSha = sha(f) === pristine[f].sha;
      const cmp = spawnSync("cmp", [pristine[f].path, f], { encoding: "utf8" });
      const okBytes = bytes(f) === pristine[f].bytes && bytes(f) >= FLOOR[f];
      console.log(`  restore ${f.split("/").pop()}: sha256 ${okSha ? "MATCH" : "*** MISMATCH ***"} · cmp ${cmp.status === 0 ? "IDENTICAL" : "*** DIFFERS ***"} · ${bytes(f)} bytes (floor ${FLOOR[f]}) ${okBytes ? "" : "*** BELOW FLOOR ***"}`);
      if (!okSha || cmp.status !== 0 || !okBytes) { fail++; }
    }
    if (armed !== files.length) console.log(`  NOTE: arm ${arm} armed ${armed} of ${files.length} file(s)`);
  }
}

/* ------------------------------------------------------------------ the arms */

const append = (text) => (src) => src + text;

const ARMS = {
  "0": () => {
    console.log("\n--- (0) BASELINE: nothing armed. MUST exit 0. ---");
    const r = run();
    t("baseline --strict exits 0", r.code, 0);
    t("baseline catalog count is a number, not a missing tally", typeof catalogCount(r.out), "number");
    console.log(`  baseline catalog: ${catalogCount(r.out)} declared · prose only: ${proseLine(r.out) || "(none)"}`);
    return catalogCount(r.out);
  },

  A: (base) => {
    console.log(`\n--- (A) THE DEFECT: an ordinary explanatory comment naming an unallocated numeral. MUST exit 0. ---`);
    withFiles("A", { [CATALOG]: append(
      `\n${OPEN} D-277 ARM A. A note of the kind this catalogue writes all the time: the\n`
      + `   numeral ${ARM_A_ID} was skipped when its family was allocated, and the reason is\n`
      + `   recorded here so the next allocator does not read it as a family somebody lost. ${CLOSE}\n`) },
      () => {
        const r = run();
        t("a comment naming an unallocated numeral does NOT fail --strict", r.code, 0);
        t("and the catalog count does not move", catalogCount(r.out), base);
        t("the numeral is NOT catalogued", r.out.includes(`in the catalog`) && catalogCount(r.out) === base, true);
        t("it IS named on the prose-only line, never dropped in silence", proseLine(r.out).split(/\s+/).includes(ARM_A_ID), true);
      });
  },

  B: () => {
    console.log(`\n--- (B) A REAL ROW NOTHING NAMES. MUST exit 1. ---`);
    withFiles("B", { [CATALOG]: append(
      `\nconst D277_ARM_B_ROW = { check: '${ARM_B_ID}', where: 'nowhere', translation: 'arm B' };\n`
      + `export const D277_ARM_B = D277_ARM_B_ROW;\n`) },
      () => {
        const r = run();
        t("an uncatalogued check still fails --strict", r.code, 1);
        t("and the run NAMES it", r.out.includes(ARM_B_ID), true);
      });
  },

  C: () => {
    console.log(`\n--- (C) OVER-STRICTNESS: a REAL declaration in a spelling nobody anticipated. MUST exit 1. ---`);
    withFiles("C", { [CATALOG]: append(
      `\nexport const D277_ARM_C = ['${ARM_C_ID}'];\n`) },
      () => {
        const r = run();
        t("an id declared in a bare array literal IS catalogued (so the run fails)", r.code, 1);
        t("and the run NAMES it — the odd spelling did not vanish", r.out.includes(ARM_C_ID), true);
        t("it is NOT written off as prose", proseLine(r.out).split(/\s+/).includes(ARM_C_ID), false);
      });
  },

  D: () => {
    console.log(`\n--- (D) CREDIT MUST COME FROM CODE, not from a sentence. MUST exit 1. ---`);
    withFiles("D", { [FIRING]: (src) => {
      const start = src.indexOf(`await proves("${ARM_D_ID}"`);
      if (start === -1) return src;
      const end = src.indexOf("\n", src.indexOf(`Bad_Slug")]]));`, start));
      if (end === -1) return src;
      return src.slice(0, start)
        + `${OPEN} ARM D: the identity-grammar proof for ${ARM_D_ID} is now PROSE. The id still\n`
        + `   appears in this battery's comments, here and elsewhere, and that must not\n`
        + `   be enough to call it covered. ${CLOSE}`
        + src.slice(end);
    } }, () => {
      const r = run();
      t("a check named only in prose fails --strict", r.code, 1);
      t("and the run names it as never named", /never named/.test(r.out) && r.out.includes(ARM_D_ID), true);
    });
  },

  E: () => {
    console.log(`\n--- (E) THE WORD BOUNDARY: a sibling must not credit its neighbour. MUST exit 1. ---`);
    withFiles("E", {
      [CATALOG]: append(`\nconst D277_ARM_E_ROW = { check: '${ARM_E_ID}', where: 'nowhere', translation: 'arm E' };\nexport const D277_ARM_E = D277_ARM_E_ROW;\n`),
      [SUITE]: append(`\nconst D277_ARM_E_SIBLING = "${ARM_E_SIB}";\nvoid D277_ARM_E_SIBLING;\n`),
    }, () => {
      const r = run();
      t("naming only the sibling does NOT credit the declared id", r.code, 1);
      t("and the run names the DECLARED id", r.out.includes(ARM_E_ID), true);
    });
  },

  F: (base) => {
    console.log(`\n--- (F) OVER-STRICTNESS: a foreign namespace with the same dotted tail. MUST exit 0. ---`);
    withFiles("F", { [CATALOG]: append(
      `\n${OPEN} D-277 ARM F. A comment naming a DECISION, ${ARM_F_ID}, whose tail has the\n`
      + `   same shape a check id has. It is not a check and must not be counted as one. ${CLOSE}\n`) },
      () => {
        const r = run();
        t("a foreign-namespace id does not fail --strict", r.code, 0);
        t("and the catalog count does not move", catalogCount(r.out), base);
        t("its tail is not reported as a prose-only CHECK either", proseLine(r.out).includes("905.6"), false);
      });
  },
};

/* --------------------------------------------------------------------- main */

const which = (process.argv[2] || "all").toUpperCase();
console.log(`D-277 negative control — arms: ${which}`);
const base = ARMS["0"]();
if (base == null) {
  console.log("\nBASELINE DID NOT PRODUCE A CATALOG COUNT. Every arm below would be measuring nothing; refusing to run them.");
  fail++;
} else {
  const order = ["A", "B", "C", "D", "E", "F"];
  for (const a of order) if (which === "ALL" || which === a) ARMS[a](base);
}

rmSync(SCRATCH, { recursive: true, force: true });
console.log(`\ndeclared-corpus.control: ${pass} pass, ${fail} fail`);
console.log("FOOT REACHED");
process.exit(fail ? 1 : 0);
