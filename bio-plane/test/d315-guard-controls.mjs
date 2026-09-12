/* D-315 NEGATIVE-CONTROL DRIVER for the two landed comparability guards —
 * `ocr-composed-probe.mjs` (CPDF-14) and `cpdf15-tesseract-runtime.probe.mjs`
 * (CPDF-15) — after their expression pins moved from SUBSTRING PRESENCE onto
 * DIGEST DISCIPLINE.
 *
 * A DRIVER, deliberately NOT named `*.test.mjs`, so the battery's discovery rule
 * (`scripts/battery.mjs`: readdir + `endsWith(".test.mjs")`) never picks it up —
 * it mutates a COMMITTED file in place and needs a quiet tree.
 *
 * WHY IT EXISTS. CPDF-16's `nc3-expr` arm mutated the floor's char-accuracy
 * expression to a SUPERSTRING (`* 100` -> `* 100.0`) in the real file and BOTH
 * landed guards exited 0 over a genuinely moved expression, because
 * `FLOOR_SRC.includes(expr)` finds a pinned literal inside its own extension.
 * That arm had to be corrected to a substring-REMOVING mutation to arm at all,
 * and the finding was filed rather than smoothed. This driver is the arm that
 * came back wrong, re-run against the fixed guards — plus the class around it.
 *
 * EVERY ARM MUTATES THE REAL, COMMITTED FLOOR, ALONE, others held open, and
 * restores from a UNIQUELY-NAMED PER-ARM pristine copy verified BOTH ways
 * (sha256 AND `cmp`), with the byte count printed and floored. The foot re-checks
 * the floor against the digest taken before the first arm armed, so a driver that
 * died mid-arm cannot be mistaken for one that finished.
 *
 * ARMS, declared before arming:
 *   baseline          the committed floor, untouched: BOTH guards exit 0. Also
 *                     D-315's over-strictness arm — a guard that refuses correct
 *                     work is not a safer guard. The row that distinguishes
 *                     every-arm-broken from every-arm-working.
 *   nc1-super-*       (the four arms this item exists for) a SUPERSTRING mutation
 *                     of each pinned expression in turn — the pinned literal is
 *                     still PRESENT in every one — MUST make BOTH guards exit 4
 *                     naming the expression that moved. `nc1-super-characc` is
 *                     byte-for-byte the mutation CPDF-16 measured PASSING.
 *   nc2-removing      a substring-REMOVING mutation (the char-accuracy
 *                     denominator, CPDF-16's corrected arm and the probes' own
 *                     `metric` arm) MUST still fail, and MUST still be named as
 *                     GONE — the old detection kept, not traded for the new one.
 *   nc4-duplicate     mechanising CPDF-16's one un-mechanised measurement: a
 *                     SECOND verbatim occurrence of a pinned expression, added on
 *                     its own new line so no pinned statement's bytes move, MUST
 *                     make BOTH guards exit 4 naming the duplicate. Only the
 *                     exactly-once assertion can see this one — the statement
 *                     digests are all still correct — which is what makes it the
 *                     arm that proves that assertion is load-bearing.
 *   nc5-lev           the class sweep, and a hole no expression pin ever covered:
 *                     `levenshteinPairs()` is IMPORTED AND RUN by both probes and
 *                     was pinned by nothing. A one-character change to its cost
 *                     term MUST now make BOTH guards exit 4.
 *   nc6-norm          the same class, harder: a `norm()` mutation chosen so that
 *                     `norm(GT_PAGE2)` is UNCHANGED (the ground truth contains no
 *                     NUL), so PIN_GT cannot catch it. MUST now exit 4 on both.
 *   post-restore      both guards against the restored committed file: exit 0.
 *
 * WHAT THIS DRIVER CANNOT SEE, stated: it drives the guards through
 * `--guard-only`, which is the whole comparability block and nothing after it, so
 * it says nothing about the measurement, upload or account code that follows —
 * and that is deliberate, because those paths cost money and reach the network.
 * It also cannot see a floor edit that leaves every pinned byte in place; the
 * pins' own reach is documented at their site in both probes.
 *
 * Run:  node test/d315-guard-controls.mjs
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

/* The corpus this driver runs against, printed and floored — an assertion that
 * passed over an empty corpus is the receipt this rule exists for. */
const ORIGIN_SHA = shaFile(FLOOR);
const ORIGIN_BYTES = statSync(FLOOR).size;
if (ORIGIN_BYTES < 10000) { console.error(`FLOOR SUSPICIOUSLY SMALL: ${ORIGIN_BYTES} B, floor is 10000`); process.exit(2); }
console.log(`subject: ${FLOOR}`);
console.log(`         ${ORIGIN_BYTES} B, sha256 ${ORIGIN_SHA} — the committed floor, before any arm armed`);
console.log(`guards:  ${GUARDS.map(([id]) => id).join(", ")} — both driven with --guard-only, which exits before any upload`);

let armsRun = 0, bad = 0;
const PRISTINE_DIR = mkdtempSync(join(tmpdir(), "d315-nc-pristine-"));

const runGuards = () => GUARDS.map(([id, p]) => {
  const r = spawnSync(process.execPath, [p, "--guard-only"], { encoding: "utf8" });
  const stopLine = (r.stderr || "").split("\n").find((l) => l.startsWith("STOP:")) || "";
  return { id, status: r.status, stopLine };
});

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

/** Mutate the REAL floor with `edit`, run both guards, restore, verify two ways.
 *  `mustSay` is a predicate over the refusal line, so an arm asserts WHAT the
 *  guard named and not merely that it exited non-zero. */
const mutateArm = (id, what, declared, edit, mustSay) => {
  arm(id, what, declared, () => {
    const pristine = join(PRISTINE_DIR, `${id}.pristine.mjs`);
    copyFileSync(FLOOR, pristine);
    const preSha = shaFile(FLOOR), preBytes = statSync(FLOOR).size;
    if (preBytes < 10000) throw new Error(`pristine copy suspiciously small: ${preBytes} B (floor 10000)`);
    if (preSha !== ORIGIN_SHA) throw new Error(`ARM STARTED DIRTY: floor is ${preSha.slice(0, 16)}…, not the pre-run ${ORIGIN_SHA.slice(0, 16)}… — a previous arm did not restore`);
    console.log(`  pristine: ${pristine} (${preBytes} B, sha256 ${preSha.slice(0, 16)}…)`);
    const before = readFileSync(FLOOR, "utf8");
    const after = edit(before);
    if (after === before) throw new Error("ARM NEVER ARMED: the edit produced byte-identical source");
    let results;
    try {
      writeFileSync(FLOOR, after);
      if (shaFile(FLOOR) === preSha) throw new Error("ARM NEVER ARMED: the floor on disk is unchanged after the write");
      results = runGuards();
    } finally {
      copyFileSync(pristine, FLOOR);
    }
    const postSha = shaFile(FLOOR), postBytes = statSync(FLOOR).size;
    execFileSync("cmp", [pristine, FLOOR]);           // throws on any byte difference
    if (postSha !== preSha) throw new Error(`RESTORE FAILED: sha ${postSha} != ${preSha}`);
    console.log(`  restored: ${postBytes} B, sha256 matches, cmp clean`);
    for (const g of results) console.log(`  guard ${g.id}: exit ${g.status}  ${JSON.stringify(g.stopLine.slice(0, 190))}`);
    const ok = results.every((g) => g.status === 4 && mustSay(g.stopLine));
    return { got: results.map((g) => `${g.id}=${g.status}`).join(" "), ok };
  });
};

/* -- baseline, which is also D-315's over-strictness arm --------------------- */
arm("baseline", "the committed floor, untouched — no arm armed",
  "BOTH guards exit 0 against the committed state, byte for byte", () => {
    const results = runGuards();
    for (const g of results) console.log(`  guard ${g.id}: exit ${g.status}`);
    const stillSame = shaFile(FLOOR) === ORIGIN_SHA;
    return { got: `${results.map((g) => `${g.id}=${g.status}`).join(" ")} floor-unchanged=${stillSame}`,
      ok: results.every((g) => g.status === 0) && stillSame };
  });

/* -- NC1: THE ARM THIS ITEM EXISTS FOR, on all four pinned expressions -------
 * Each mutation EXTENDS the pinned literal, so `.includes(expr)` — the old
 * detection — still finds it. The first of the four is byte-for-byte the
 * mutation CPDF-16 measured walking through both guards. ------------------- */
const namesMoved = (l) => /STATEMENT has moved/.test(l) && /still\s+PRESENT/.test(l) && /D-315/.test(l);
const SUPERSTRINGS = [
  ["characc", "char accuracy — THE EXACT MUTATION CPDF-16 MEASURED PASSING (`* 100` -> `* 100.0`)",
    "(1 - dist / gt.length) * 100", "(1 - dist / gt.length) * 100.0"],
  ["digtotal", "GT digit total — `.length` extended to `.length - 0`",
    "pairs.filter(([g]) => g && /[0-9]/.test(g)).length;", "pairs.filter(([g]) => g && /[0-9]/.test(g)).length - 0;"],
  ["digerr", "digit errors — `.length` extended to `.length - 0`",
    "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;", "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length - 0;"],
  ["minted", "digits MINTED — `.length` extended to `.length - 0`",
    "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;", "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length - 0;"],
];
for (const [id, what, from, to] of SUPERSTRINGS) {
  mutateArm(`nc1-super-${id}`, `SUPERSTRING mutation, pinned literal still present: ${what}`,
    "BOTH guards exit 4, the refusal saying the STATEMENT moved while the expression is still PRESENT",
    (s) => {
      if (!s.includes(from)) throw new Error(`ARM NEVER ARMED: ${JSON.stringify(from)} is not in the floor`);
      if (s.split(from).length - 1 !== 1) throw new Error(`ARM NEVER ARMED: ${JSON.stringify(from)} occurs more than once`);
      return s.replace(from, to);
    }, namesMoved);
}

/* -- NC2: the OLD detection, kept rather than traded away -------------------- */
mutateArm("nc2-removing", "substring-REMOVING mutation (char-accuracy denominator) — CPDF-16's corrected arm",
  "BOTH guards exit 4 and still name the expression as GONE — the old detection survives the new one",
  (s) => {
    const from = "(1 - dist / gt.length) * 100";
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the char-accuracy expression is not in the floor");
    return s.replace(from, "(1 - dist / Math.max(1, gt.length)) * 100");
  },
  (l) => /scoring expression/.test(l) && /is gone from ocr-measure-probe\.mjs/.test(l));

/* -- NC4: CPDF-16's un-mechanised measurement, mechanised -------------------- */
mutateArm("nc4-duplicate", "a SECOND verbatim occurrence of a pinned expression, on a new line of its own",
  "BOTH guards exit 4 naming the DUPLICATE — every pinned statement's own bytes are untouched, so only " +
  "the exactly-once assertion can see this",
  (s) => {
    const anchor = "  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;\n";
    if (!s.includes(anchor)) throw new Error("ARM NEVER ARMED: the digTotal statement is not where it should be");
    /* An ADDITIVE line — the legal edit class — that happens to re-spell a pinned
       expression verbatim. It is the shape a well-meaning sixth column would take. */
    return s.replace(anchor, anchor + "  const digTotalAgain = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;\n");
  },
  (l) => /occurs 2 times in ocr-measure-probe\.mjs/.test(l) && /EXACTLY ONE occurrence is the pin/.test(l));

/* -- NC5 / NC6: the class sweep — the two regions both probes IMPORT AND RUN -- */
mutateArm("nc5-lev", "levenshteinPairs() cost term changed (1 -> 2): every distance and digit column moves",
  "BOTH guards exit 4 naming levenshteinPairs() — it is imported and RUN, and was pinned by nothing",
  (s) => {
    const from = "dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));";
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the Levenshtein cost term is not where it should be");
    return s.replace(from, "dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 2 : 0));");
  },
  (l) => /levenshteinPairs\(\) has moved/.test(l));

mutateArm("nc6-norm", "norm() extended with a replace PIN_GT cannot see (the ground truth holds no NUL)",
  "BOTH guards exit 4 naming norm() — the GROUND TRUTH digest is unmoved by this mutation, which is the point",
  (s) => {
    const from = '.replace(/\\s+/g, " ").trim();';
    if (!s.includes(from)) throw new Error("ARM NEVER ARMED: norm()'s whitespace collapse is not where it should be");
    return s.replace(from, '.replace(/\\s+/g, " ").replace(/\\u0000/g, "").trim();');
  },
  (l) => /norm\(\) NORMALISER has moved/.test(l));

/* -- the foot: the file, and both guards, back where they started ------------ */
arm("post-restore", "both guards against the restored committed file",
  "both exit 0, and the floor's sha256 is the one measured before the first arm armed", () => {
    const results = runGuards();
    const finalSha = shaFile(FLOOR), finalBytes = statSync(FLOOR).size;
    for (const g of results) console.log(`  guard ${g.id}: exit ${g.status}`);
    console.log(`  floor: ${finalBytes} B, sha256 ${finalSha}`);
    return { got: `${results.map((g) => `${g.id}=${g.status}`).join(" ")} sha-matches-pre-run=${finalSha === ORIGIN_SHA}`,
      ok: results.every((g) => g.status === 0) && finalSha === ORIGIN_SHA && finalBytes === ORIGIN_BYTES };
  });

console.log(`\nFOOT REACHED — ${armsRun} arms, ${bad} not as declared`);
process.exit(bad ? 1 : 0);
