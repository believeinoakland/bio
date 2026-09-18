/* REC-119 / D-411 · THE NEGATIVE-CONTROL DRIVER — FIVE ARMS PLUS A BASELINE, EACH ARMED ALONE.
 *
 * ONE COMMAND EACH, from `bio-plane/`:  node test/nc-rec119.mjs <none|a|b|c|d|e>
 *
 * The driver holds every patch, its DECLARATION, and the declared-vs-actual check, so the next
 * session re-runs an arm in ONE step instead of re-deriving how to break the subject.
 *
 * EVERY ANCHOR IS CHECKED FOR UNIQUENESS AND THE ARM REFUSES TO RUN IF IT IS NOT — REC-118's
 * finding, and it is not a formality here either: the registry line and the `bounded` predicate in
 * this item's resolver are BYTE-IDENTICAL to REC-114's `#legEarnedCapture` and REC-118's
 * `#reevalLegsEarned`, because the reuse is what makes the four readers one rule. A blind
 * `String.replace` patches only the FIRST occurrence, so an ambiguous anchor would have damaged
 * ANOTHER item's resolver, run a suite that never touches it, and reported a clean pass.
 *
 * EVERY ARM IS RESTORED FROM ITS OWN UNIQUELY-NAMED PRISTINE COPY AND THE RESTORE IS VERIFIED BY
 * sha256 AND BY SIZE AGAINST A FLOOR — never `git checkout --`, which restores to HEAD and would
 * silently discard this session's own uncommitted work in the same file (the traps section's
 * entry, measured twice in two days).
 *
 * READ THE EXIT STATUS UNPIPED. `node test/nc-rec119.mjs a | tail` reports TAIL's status.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync, rmSync, mkdtempSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARM = (process.argv[2] || "").trim();
const ARMS = ["none", "a", "b", "c", "d", "e"];
if (!ARMS.includes(ARM)) {
  console.log(`usage: node test/nc-rec119.mjs <${ARMS.join("|")}>`);
  process.exit(2);
}
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec119-version-legs-earned.test.mjs", import.meta.url));
const PHASE = fileURLToPath(new URL("./nc-rec119-freeze-phase.mjs", import.meta.url));
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SNAP = `${STORE}.nc-rec119-${ARM}.pristine`;
const FLOOR = 500 * 1024;   /* a restore that lands a file smaller than this is not a restore */

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const PRISTINE_SHA = sha(STORE), PRISTINE_SIZE = statSync(STORE).size;
if (PRISTINE_SIZE < FLOOR) { console.log(`refusing: store.mjs is ${PRISTINE_SIZE} bytes, under the floor`); process.exit(3); }
copyFileSync(STORE, SNAP);

const restore = () => {
  copyFileSync(SNAP, STORE);
  const okSha = sha(STORE) === PRISTINE_SHA, okSize = statSync(STORE).size === PRISTINE_SIZE;
  console.log(`  restored byte-identically: ${okSha && okSize ? "YES" : "NO"} ` +
              `(sha ${okSha ? "match" : "MISMATCH"}, size ${statSync(STORE).size}/${PRISTINE_SIZE})`);
  if (existsSync(SNAP)) unlinkSync(SNAP);
  return okSha && okSize;
};

/* ---- THE PATCHES, EACH WITH WHAT IT IS DECLARED TO DO ----------------------
 *
 * EVERY READ-SIDE ARM ANCHORS ON THE WHOLE METHOD, SIGNATURE INCLUDED, AND THAT IS NOT TIDINESS —
 * IT IS THIS DRIVER'S OWN FIRST FINDING. The arms were written first as body-only anchors, the
 * obvious spelling, and arm (a) REFUSED TO RUN: `anchor occurs 2 time(s)`. The body of this
 * item's resolver is BYTE-IDENTICAL to REC-114's `#legEarnedCapture`, which is precisely what
 * makes the four readers one rule — so the reuse that is this lineage's whole doctrine is also
 * what makes a body-only anchor ambiguous. `String.replace` with a string patches only the FIRST
 * occurrence, so that arm would have broken REC-114's listing resolver instead of this item's,
 * run a suite that never touches it, and reported a clean pass as evidence that the subject
 * cannot be broken. REC-118 hit this and recorded it; this item hit it again in the same place,
 * which is what a trap looks like when the instrument for it already exists.
 */
const PRISTINE_METHOD = `  #versionLegsEarned(rows) {
    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const cap = targets.size
      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})
      : {};
    return rows.map((r) => {
      const res = bounded(r) ? Store.#capturedAt(r.grade, cap[r.target_id], r.target_id) : null;
      return { ...r,
               grade: res ? res.grade : (r ? r.grade : null),
               grade_authored: r ? r.grade : null,
               grade_why: res ? res.why : null };
    });
  }`;
const method = (body) => `  #versionLegsEarned(rows) {\n${body}\n  }`;
const PATCHES = {
  a: { what: "THE ITEM'S OWN — the registry is still asked and its answer DISCARDED, so both ops "
            + "publish the AUTHORED letter again, uncapped, beside a composition holding the same "
            + "letter. The fix removed, with the machinery left in place so the arm cannot be "
            + "mistaken for the resolver simply being absent.",
       expect: "the suite FAILS, and the headline names BOTH letters and BOTH ops",
       from: PRISTINE_METHOD,
       to: method(`    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const cap = targets.size
      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})
      : {};
    return rows.map((r) => {
      const res = bounded(r) ? Store.#capturedAt(r.grade, cap[r.target_id], r.target_id) : null;
      void res;
      return { ...r,
               grade: r ? r.grade : null,
               grade_authored: r ? r.grade : null,
               grade_why: null };
    });`) },

  c: { what: "THE MEMBER'S ACT ERASED — the letter caps correctly, but `grade_authored` and "
            + "`grade_why` are not published. This is the OTHER defensible answer to the doctrine "
            + "question, implemented: cap the letter and say nothing about what was authored.",
       expect: "the suite FAILS — and this is the arm that proves the COMPROMISE is load-bearing "
             + "rather than decorative, because `legs[] publishes the earned letter` passes under it",
       from: PRISTINE_METHOD,
       to: method(`    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const cap = targets.size
      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})
      : {};
    return rows.map((r) => {
      const res = bounded(r) ? Store.#capturedAt(r.grade, cap[r.target_id], r.target_id) : null;
      return { ...r, grade: res ? res.grade : (r ? r.grade : null) };
    });`) },

  d: { what: "THE AXIS IGNORED — the capture ceiling applied to every leg carrying a letter, "
            + "whatever axis it is on. Also the arm that catches the cheapest wrong answer to this "
            + "item: making the two halves agree by copying a single letter across every leg.",
       expect: "the suite FAILS on the leg that must NOT move",
       from: PRISTINE_METHOD,
       to: method(`    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const cap = targets.size
      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})
      : {};
    return rows.map((r) => {
      const res = bounded(r) ? Store.#capturedAt(r.grade, cap[r.target_id], r.target_id) : null;
      return { ...r,
               grade: res ? res.grade : (r ? r.grade : null),
               grade_authored: r ? r.grade : null,
               grade_why: res ? res.why : null };
    });`) },

  e: { what: "OVER-STRICTNESS — the SAME rule written as an explicit `for` loop with a named row "
            + "instead of a `.map`. Correct work in a spelling this item did not anticipate.",
       expect: "the suite PASSES, unchanged",
       from: PRISTINE_METHOD,
       to: method(`    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id
      && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const cap = targets.size
      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})
      : {};
    const out = [];
    for (const row of rows) {
      const res = bounded(row) ? Store.#capturedAt(row.grade, cap[row.target_id], row.target_id) : null;
      out.push({ ...row,
                 grade: res ? res.grade : (row ? row.grade : null),
                 grade_authored: row ? row.grade : null,
                 grade_why: res ? res.why : null });
    }
    return out;`) },

  /* ARM (b) PATCHES THE COMPOSITION BUILDER — the WRITE side, not the read. It is driven by its
     own two-phase scenario rather than by the suite, for the reason written at the head of
     `nc-rec119-freeze-phase.mjs`: a builder that caps is SELF-CONSISTENT under one code version,
     so no in-process suite can see it. */
  b: { what: "THE FROZEN BYTES CAPPED TOO — the composition builder emits the weaker letter, so a "
            + "version frozen BEFORE the change no longer matches what the builder computes AFTER "
            + "it. This is the half the freeze depends on and the arm this item exists to protect.",
       expect: "the FREEZE BREAKS — phase B is refused VERSION_FROZEN and an old case becomes "
             + "unratifiable",
       from: "...legs.map((l, k) => `leg\\t${k}\\t${c(l.target_id)}\\t${c(l.target_type)}\\t${c(l.role)}\\t${c(l.grade)}\\t`",
       /* THE COMPARISON DIRECTION IS THE ARM'S OWN FIRST CORRECTION, RECORDED AT THE ARM.
          Spelled `<` first, which armed the FILE and not the BEHAVIOUR: the patch applied on a
          unique anchor, phase B ran, and the stored letter came back unchanged — a control
          reporting NOT AS DECLARED while never having exercised its subject. `#GRADE_RANK` is
          `BASIS_GRADES.length - i`, so a STRONGER letter carries a HIGHER number, and capping is
          `rank > rank`. That is why `#capturedAt` itself reads `<=` to mean "no cap needed".
          The arm-that-did-not-arm class with the sign literally flipped, caught because the
          driver prints what phase B actually STORED rather than only whether it was refused. */
       to: "...legs.map((l, k) => `leg\\t${k}\\t${c(l.target_id)}\\t${c(l.target_type)}\\t${c(l.role)}\\t${c(Store.#GRADE_RANK[l.grade] > Store.#GRADE_RANK[\"C\"] ? \"C\" : l.grade)}\\t`" },
};

const arm = (name) => {
  const p = PATCHES[name];
  const src = readFileSync(STORE, "utf8");
  const n = src.split(p.from).length - 1;
  if (n !== 1) {
    restore();
    console.log(`\nARM (${name}) NEVER ARMED — anchor occurs ${n} time(s). THAT IS A FINDING, not a pass.`);
    process.exit(4);
  }
  writeFileSync(STORE, src.replace(p.from, p.to));
  console.log(`  armed: anchor was unique`);
};

const runSuite = () => {
  let out = "";
  try { out = execFileSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = /rec119-version-legs-earned: (\d+) pass, (\d+) fail/.exec(out);
  /* THE `want`/`got` LINES TRAVEL WITH THE HEADLINE, because the row requires the failure to NAME
     BOTH LETTERS AND BOTH OPS and those letters are in the want/got pair, not in the label. A
     control whose record shows only headlines cannot be checked against that requirement without
     re-running it. */
  const lines = out.split("\n");
  const failures = lines.flatMap((l, i) => l.includes("  FAIL  ")
    ? [l, ...lines.slice(i + 1, i + 3).filter((x) => /^\s+(want|got)\s/.test(x))] : []);
  return { pass: m ? +m[1] : null, fail: m ? +m[2] : null, failures, out };
};

console.log(`\n=== REC-119 NEGATIVE CONTROL — ARM (${ARM}) ===`);
if (ARM !== "none") console.log(`DECLARED: ${PATCHES[ARM].what}\nEXPECTED: ${PATCHES[ARM].expect}\n`);
else console.log(`DECLARED: BASELINE — nothing armed. It exists because a driver whose every arm\n`
               + `reports one number cannot tell three-arms-broken from three-arms-working.\n`);

let verdict = "";
if (ARM === "b") {
  /* TWO PHASES OVER ONE PERSISTED STORE. */
  const persist = mkdtempSync(join(tmpdir(), "nc-rec119-"));
  const runPhase = (ph, env) => {
    try {
      return execFileSync(process.execPath, [PHASE, ph, persist],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env } });
    } catch (e) { return `${e.stdout || ""}${e.stderr || ""}`; }
  };
  const aOut = runPhase("a", {});
  const aJson = (() => { try { return JSON.parse((aOut.trim().split("\n").pop() || "").trim()); } catch { return null; } })();
  console.log(`  phase A (PRISTINE code, writes the version): ${JSON.stringify(aJson)}`);
  if (!aJson || !aJson.wrote) { rmSync(persist, { recursive: true, force: true }); restore();
    console.log("\nARM (b) NEVER ARMED — phase A did not write. THAT IS A FINDING."); process.exit(4); }

  arm("b");
  const bOut = runPhase("b", { NC_REC119_ENTITY: JSON.stringify(aJson.entity) });
  const bJson = (() => { try { return JSON.parse((bOut.trim().split("\n").pop() || "").trim()); } catch { return null; } })();
  console.log(`  phase B (PATCHED code, re-promotes the SAME document): ${JSON.stringify(bJson)}`);
  rmSync(persist, { recursive: true, force: true });
  const broke = !!(bJson && bJson.version_frozen === true);
  verdict = broke
    ? `AS DECLARED — the freeze REFUSED the re-promotion with VERSION_FROZEN. The old case is now\n`
    + `  unratifiable, which is exactly the damage this item's ruling exists to prevent, and it is\n`
    + `  invisible to every assertion about legs[].`
    : `NOT AS DECLARED — the freeze did NOT refuse (${JSON.stringify(bJson)}). Investigate before\n`
    + `  trusting this arm; a control that does not fire is not evidence that the subject is safe.`;
} else {
  if (ARM !== "none") arm(ARM);
  const r = runSuite();
  console.log(`  suite: ${r.pass} pass, ${r.fail} fail`);
  for (const f of r.failures.slice(0, 4)) console.log(`    ${f.trim().slice(0, 240)}`);
  if (ARM === "none") verdict = r.fail === 0 ? "AS DECLARED — baseline green." : `NOT AS DECLARED — baseline is RED (${r.fail} fail).`;
  else if (ARM === "e") verdict = r.fail === 0 ? "AS DECLARED — correct work in an unanticipated spelling PASSES." : `NOT AS DECLARED — over-strictness: ${r.fail} arm(s) fired on correct work.`;
  else verdict = r.fail > 0 ? `AS DECLARED — ${r.fail} arm(s) fired.` : "NOT AS DECLARED — the suite stayed GREEN with the fix removed. That is a hole in the suite.";
}

const restored = restore();
console.log(`\nVERDICT: ${verdict}`);
if (!restored) { console.log("RESTORE FAILED — the tree is NOT pristine. Fix before doing anything else."); process.exit(5); }
process.exit(0);
