/* CPDF-16 NEGATIVE-CONTROL DRIVER for the floor instrument's two additive
 * regions (D-305's fifth expression, D-314's control gate) in
 * `ocr-measure-probe.mjs`. A DRIVER, deliberately NOT named `*.test.mjs`, so
 * the battery's discovery rule (readdir + endsWith(".test.mjs")) never picks
 * it up — it mutates a committed file in place (NC3) and needs a quiet tree.
 *
 * It drives the floor's OWN code, grabbed out of the floor's file at run time
 * by the same technique the CPDF-14/CPDF-15 comparability guards use — never
 * a copy, so what is exercised is what is committed.
 *
 * >>> D-322 (2026-09-12): THAT NON-DISCOVERY WAS THE HOLE, AND IT IS CLOSED
 * BESIDE THIS FILE RATHER THAN BY MOVING IT. D-318's class sweep walked all 288
 * modules in this directory and named this driver the one clear instance of its
 * class — a defence whose only witness is an instrument nothing runs
 * automatically. Because the `nc2-*` arms below were the only thing anywhere
 * that drove D-314's blank/noise gate, NEUTERING THAT GATE left every automatic
 * gate green, and the gate is what stands between the record and an agreement
 * figure scored against noise. `test/d322-floor-gate-witness.test.mjs` is now
 * the battery-discovered witness: the same subject, driven over a PER-ARM
 * TEMP-DIR COPY the way both probes' `--controls` already do, so it is safe to
 * run inside a battery. It widens the arms in one direction this file does not
 * reach — the gate's WIRING, read as text: a `controlGate()` that is perfect and
 * no longer CALLED, a noise page filled white, a second control read pointed
 * back at the blank page. Those pass every behavioural arm here.
 *
 * THE TWO ARE NOT DUPLICATES AND NEITHER REPLACES THE OTHER. The discovered
 * suite proves the gate refuses over a MUTATED COPY, on every run,
 * automatically. THIS driver proves the two landed guards refuse the REAL
 * COMMITTED FLOOR when it is mutated (`nc3-*`) — the path a careless edit
 * actually takes, and the one a copy cannot stand in for — which is exactly why
 * it must stay out of the battery: a suite that edits a committed file races
 * every other suite in the run and leaves the tree dirty if it dies mid-arm. Run
 * this one by hand on a quiet tree; the battery runs the other one for you. The
 * cost of keeping both, stated rather than discovered later: the gate's arms are
 * now written in two files and two statements of one thing can drift, which
 * these two paragraphs are the mitigation for and not a guarantee against.
 *
 * ARMS, each armed ALONE, declared before arming:
 *   baseline        identical text scores all-zero and a passing gate yields a
 *                   NUMBER — the row that distinguishes six-arms-broken from
 *                   six-arms-working.
 *   nc1-subst       (the arm D-305 exists for) a substitution-only corruption
 *                   ($50,000 -> $10,000) MUST move the NEW column (disagree=1)
 *                   and MUST NOT move the minted column (minted=0). BOTH
 *                   asserted.
 *   nc1-overstrict  a letter-for-letter error (no digits involved) MUST leave
 *                   the new column at 0 — the fifth expression fires on the
 *                   digit-substitution class only, not on every char error.
 *   nc2-noise       (the arm D-314 exists for) an agreement over a gate built
 *                   from a noise-failing control read MUST answer the string
 *                   `undetermined` naming the noise gate — never a number.
 *   nc2-overstrict  the same path over CLEAN controls MUST answer a number —
 *                   the gate refuses noise-failing references, not everything.
 *   nc3-expr        alter ONE of the four pinned expressions in the REAL file:
 *                   BOTH landed probes' guards MUST exit 4 naming it. Restore
 *                   verified by sha256 AND cmp against a per-arm pristine copy.
 *   nc3-gt          alter ONE DIGIT of the ground truth in the REAL file: BOTH
 *                   guards MUST exit 4 NAMING THE DIGEST. Same restore rule.
 *   post-restore    both guards exit 0 against the restored file.
 *
 * Run:  node test/cpdf16-floor-controls.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, mkdtempSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FLOOR = join(HERE, "ocr-measure-probe.mjs");
const GUARDS = [
  ["cpdf14", join(HERE, "ocr-composed-probe.mjs")],
  ["cpdf15", join(HERE, "cpdf15-tesseract-runtime.probe.mjs")],
];
const sha = (b) => createHash("sha256").update(b).digest("hex");
const shaFile = (p) => sha(readFileSync(p));

/* -- grab the floor's OWN code (the guards' technique, never a copy) -------- */
const SRC = readFileSync(FLOOR, "utf8");
const grab = (re, what) => {
  const m = re.exec(SRC);
  if (!m) { console.error(`GRAB FAILED: ${what} not found in the floor — the driver is stale, not the floor`); process.exit(2); }
  return m[1];
};
const GT_PAGE2 = grab(/const GT_PAGE2 = `([\s\S]*?)`;/, "GT_PAGE2");
const NORM_SRC = grab(/(const norm = \(s\) =>[\s\S]*?;\n)/, "norm()");
const LEV_SRC = grab(/(function levenshteinPairs\(a, b\) \{[\s\S]*?\n\})/, "levenshteinPairs()");
const SCORE_SRC = grab(/(function score\(label, gtRaw, ocrRaw\) \{[\s\S]*?\n\})/, "score()");
const GATE_SRC = grab(/(function controlGate\(blankText, noiseText\) \{[\s\S]*?\n\})/, "controlGate()");
const AGREE_SRC = grab(/(function floorAgreement\(gate, floorText, otherText\) \{[\s\S]*?\n\})/, "floorAgreement()");
const { score, controlGate, floorAgreement } = await import(
  "data:text/javascript," + encodeURIComponent(
    `${NORM_SRC}\n${LEV_SRC}\n${SCORE_SRC}\n${GATE_SRC}\n${AGREE_SRC}\nexport { score, controlGate, floorAgreement };`));

/* The corpus this driver runs against, printed and floored (an assertion that
 * passed over an empty corpus is the receipt this rule exists for). */
if (GT_PAGE2.length < 2000) { console.error(`CORPUS EMPTY-ISH: GT_PAGE2 is ${GT_PAGE2.length} chars, floor is 2000`); process.exit(2); }
console.log(`corpus: GT_PAGE2 ${GT_PAGE2.length} raw chars, grabbed from the committed floor; ` +
  `score/controlGate/floorAgreement grabbed from the same bytes (never copied)`);
/* What this driver CANNOT see, stated: it drives the floor's scoring and gate
 * code on constructed inputs; only the floor's own full run (engine installed,
 * exhibit fetched) drives the ENGINE against the noise page. */

let armsRun = 0, bad = 0;
const arm = (id, what, declared, fn) => {
  armsRun++;
  console.log(`\n[${id}] ${what}`);
  console.log(`  DECLARED: ${declared}`);
  let got, ok;
  try { ({ got, ok } = fn()); }
  catch (e) { got = `THREW: ${e.message}`; ok = false; }
  if (!ok) bad++;
  console.log(`  ACTUAL:   ${got}  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
};

/* -- baseline --------------------------------------------------------------- */
arm("baseline", "identical text; clean gate", "score(GT,GT) all-zero; agreement over a clean gate is a NUMBER (100)", () => {
  const s = score("baseline GT vs GT", GT_PAGE2, GT_PAGE2);
  const g = controlGate("", "");
  const a = floorAgreement(g, GT_PAGE2, GT_PAGE2);
  const ok = s.dist === 0 && s.digErr === 0 && s.minted === 0 && s.disagree === 0 &&
    g.passed === true && typeof a.agreement === "number" && Math.abs(a.agreement - 100) < 1e-9;
  return { got: `dist=${s.dist} digErr=${s.digErr} minted=${s.minted} disagree=${s.disagree} gate=${g.passed} agreement=${a.agreement}`, ok };
});

/* -- NC1: the arm D-305 exists for ------------------------------------------ */
arm("nc1-subst", "substitution-only corruption: $50,000 -> $10,000 on the ground-truth page",
  "the NEW column moves (disagree=1) and the minted column does NOT (minted=0) — both asserted", () => {
    const s = score("nc1 GT vs GT[$50,000->$10,000]", GT_PAGE2, GT_PAGE2.replace("$50,000", "$10,000"));
    return { got: `disagree=${s.disagree} minted=${s.minted} digErr=${s.digErr}`, ok: s.disagree === 1 && s.minted === 0 };
  });
arm("nc1-overstrict", "letter-for-letter error, no digit involved (transaction -> transactiom)",
  "disagree=0 and minted=0 — the fifth column fires on the digit-substitution class ONLY", () => {
    const s = score("nc1-over GT vs GT[n->m]", GT_PAGE2, GT_PAGE2.replace("transaction", "transactiom"));
    return { got: `disagree=${s.disagree} minted=${s.minted} dist=${s.dist}`, ok: s.disagree === 0 && s.minted === 0 && s.dist === 1 };
  });

/* -- NC2: the arm D-314 exists for ------------------------------------------ */
arm("nc2-noise", "agreement over a floor run whose noise control read text (D-314's measured class)",
  "answers the STRING `undetermined`, reason naming the noise gate — never a number", () => {
    const noisy = "ee — TPS oe oo . co a 8 oo ee Coes S ce a oe oe ree! ".repeat(4); // D-314's exhibit shape
    const g = controlGate("", noisy);
    const a = floorAgreement(g, noisy, GT_PAGE2);
    const ok = g.passed === false && a.agreement === "undetermined" &&
      typeof a.agreement !== "number" && /noise gate/.test(a.reason) && /uniform noise/.test(a.reason);
    return { got: `gate.passed=${g.passed} agreement=${JSON.stringify(a.agreement)} reason=${JSON.stringify(a.reason)}`, ok };
  });
arm("nc2-overstrict", "the same path over CLEAN controls",
  "answers a NUMBER — the gate refuses noise-failing references, not everything", () => {
    const a = floorAgreement(controlGate("", ""), GT_PAGE2, GT_PAGE2.replace("$50,000", "$10,000"));
    return { got: `agreement=${typeof a.agreement === "number" ? a.agreement.toFixed(4) + "%" : JSON.stringify(a.agreement)}`, ok: typeof a.agreement === "number" && a.agreement < 100 && a.agreement > 99 };
  });

/* -- NC3: comparability — mutate the REAL file, both landed guards must refuse.
 * Per-arm pristine copy, uniquely named; restore verified by sha256 AND cmp,
 * byte count printed and floored. ------------------------------------------- */
const PRISTINE_DIR = mkdtempSync(join(tmpdir(), "cpdf16-nc3-pristine-"));
const runGuards = () => GUARDS.map(([id, p]) => {
  const r = spawnSync(process.execPath, [p, "--guard-only"], { encoding: "utf8" });
  const stopLine = (r.stderr || "").split("\n").find((l) => l.startsWith("STOP:")) || "";
  return { id, status: r.status, stopLine };
});
const mutateArm = (id, what, from, to, mustName) => {
  arm(id, what, `BOTH guards exit 4, refusal naming ${mustName}; restore byte-identical (sha256 AND cmp)`, () => {
    const pristine = join(PRISTINE_DIR, `${id}.pristine.mjs`);
    copyFileSync(FLOOR, pristine);
    const preSha = shaFile(FLOOR), preBytes = statSync(FLOOR).size;
    if (preBytes < 10000) throw new Error(`pristine copy suspiciously small: ${preBytes} B (floor 10000)`);
    console.log(`  pristine: ${pristine} (${preBytes} B, sha256 ${preSha.slice(0, 16)}…)`);
    const s = readFileSync(FLOOR, "utf8");
    if (!s.includes(from)) throw new Error(`ARM NEVER ARMED: mutation anchor not in the floor`);
    let results;
    try {
      writeFileSync(FLOOR, s.replace(from, to));
      results = runGuards();
    } finally {
      copyFileSync(pristine, FLOOR);
    }
    /* restore, verified two ways */
    const postSha = shaFile(FLOOR), postBytes = statSync(FLOOR).size;
    execFileSync("cmp", [pristine, FLOOR]); // throws on any byte difference
    if (postSha !== preSha) throw new Error(`RESTORE FAILED: sha ${postSha} != ${preSha}`);
    console.log(`  restored: ${postBytes} B, sha256 matches, cmp clean`);
    for (const g of results) console.log(`  guard ${g.id}: exit ${g.status}  ${JSON.stringify(g.stopLine.slice(0, 120))}`);
    const ok = results.every((g) => g.status === 4 && g.stopLine.length > 0) &&
      results.every((g) => g.stopLine.toLowerCase().includes(mustName === "the digest" ? "moved" : "expression"));
    return { got: results.map((g) => `${g.id}=${g.status}`).join(" "), ok };
  });
};
/* FINDING, kept at the site (first run of this arm, 2026-09-11): mutating the
 * expression to a SUPERSTRING — `* 100` -> `* 100.0` — left BOTH guards at
 * exit 0, because their pin is a substring-presence check and a superstring
 * still contains the pinned literal. The same shape hides a REAL semantic
 * change (`* 100.5`, or `.length - 1` after any of the digit expressions).
 * The arm below therefore mutates the denominator, which REMOVES the pinned
 * substring — the same mutation the landed probes' own NC2 arms use. The
 * guards' narrowness is reported in CPDF-16's report, not patched here: their
 * files are their areas' ground. */
mutateArm("nc3-expr", "ONE pinned expression altered in the real file (char-accuracy denominator)",
  "(1 - dist / gt.length) * 100", "(1 - dist / Math.max(1, gt.length)) * 100", "the expression");
mutateArm("nc3-gt", "ONE DIGIT of the ground truth altered in the real file ($21,180,436.10 -> .19)",
  "$21,180,436.10", "$21,180,436.19", "the digest");

arm("post-restore", "both guards against the restored committed file",
  "both exit 0 — the additive edit itself moved nothing the guards pin", () => {
    const results = runGuards();
    for (const g of results) console.log(`  guard ${g.id}: exit ${g.status}`);
    return { got: results.map((g) => `${g.id}=${g.status}`).join(" "), ok: results.every((g) => g.status === 0) };
  });

console.log(`\nFOOT REACHED — ${armsRun} arms, ${bad} not as declared`);
process.exit(bad ? 1 : 0);
