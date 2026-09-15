/* m041-instrument-census.control.mjs — THE NEGATIVE CONTROL FOR M0-41's CENSUS.
 *
 * **AN ALL-GREEN TABLE IS THE RESULT TO DISTRUST**, so this plants a KNOWN BYPASS
 * of an instrument and requires the census to find it — and, for the namespace the
 * census declares blind, requires the census to come back with a NEGATIVE and say
 * so. A census that cannot return a negative is a walk looking in the wrong place.
 *
 * NOT A `.test.mjs`, for `fleetbundles.control.mjs`'s reason: it EDITS REAL CORPUS
 * FILES and COMMITS while it runs, and neither the battery nor the fleet walk must
 * discover it. THE HARNESS AND ITS PRISTINE COPIES LIVE INSIDE THIS WORKTREE and
 * never in the shared scratchpad, which a concurrent worker overwrote between ARM
 * and RESTORE once already (PL-10).
 *
 * ======================================================== HOW THE ARMS ARE SAFE
 *
 * `tools/mintid.mjs --audit --base <ref>` reads `git diff -U0 <base>...HEAD` —
 * **COMMITTED WORK ONLY, which is itself a measured property of the instrument and
 * is in the published table**: an id sitting in the working tree is invisible to
 * it. So arms 2 and 3 must COMMIT to be seen.
 *
 * **THE COMMITTING ARMS REFUSE TO RUN ON A DIRTY TREE.** `git reset --hard` is how
 * they are undone, and `CLAUDE.md`'s receipt for the adjacent `git checkout --` is
 * a session losing a whole implementation it had not committed. So the precondition
 * is checked, not assumed: if `git status --porcelain` is non-empty the arm REFUSES
 * and says so rather than arming. The HEAD sha is recorded before and compared
 * after, and a mismatch is a FINDING printed by name.
 *
 * Arms 1 and 4 need no commit and are restored by `cp` from a UNIQUELY-NAMED
 * per-arm pristine copy, verified by sha256 AND by `cmp`, with a byte count
 * printed and a minimum guarded.
 *
 * ==================================================================== THE ARMS
 *
 * Each arm names what MUST fail and what MUST NOT, and each is armed ALONE with
 * the others held open. EVERY ANCHOR IS VALIDATED BEFORE ANYTHING IS EDITED
 * (D-331): an arm whose patch matches zero times, or more than once, is a FINDING
 * reported by name and never a silent pass — *an arm that did not arm is a
 * finding*, and this estate has caught three of them.
 *
 *   (1) BASELINE — no edit. The census reads its unmodified figures. **This row
 *       exists because a harness whose first run reported `null` for every arm
 *       INCLUDING the baseline is a real receipt here: only the baseline row
 *       distinguishes six-arms-broken from six-arms-working.**
 *
 *   (2) PLANTED BYPASS, GRADED NAMESPACE — a hand-picked `M0-` id the ledger never
 *       issued, written into `QUEUE.md` as a real item heading and COMMITTED.
 *         MUST FAIL:    the census's section C reports NOT HELD >= 1 and NAMES it.
 *         MUST NOT:     no ID arm of `plancheck --local` fires — and that half is
 *                       the FINDING, not the control. The loop every session is
 *                       told to run cannot see a bypass `mintid --audit --base`
 *                       sees immediately.
 *       **THIS ARM'S DECLARATION WAS CORRECTED AFTER ITS FIRST RUN, AND THE
 *       CORRECTION IS THE MORE USEFUL HALF.** It originally declared `plancheck`
 *       would read `0 fail`. It read `1 fail` — not because plancheck saw the
 *       planted id, but because EDITING A CORPUS FILE STALES `docs/DECIDED.md`
 *       and a different arm fired. A count cannot tell those apart, so the arm
 *       now classifies WHICH arms failed and asserts on the ID arms by name. An
 *       arm that trips a different arm of the instrument it is measuring proves
 *       nothing about the arm it was aimed at.
 *       **AND THE SAME RUN CAUGHT THIS CONTROL'S OWN MATCHER GRADING ONE
 *       SPELLING**: it reported `NOT HELD 1 · names M0-9001: false`, because
 *       `mintid` prints the tally as `NOT HELD` and LABELS the ids `QUESTION`
 *       ("ASK, do not fail"). The count was right and every id was invisible —
 *       this estate's most-repeated instrument defect, inside the instrument
 *       written to catalogue it.
 *
 *   (3) PLANTED BYPASS, UNGRADED NAMESPACE — the worked example this project
 *       already owns. A hand-picked `M-` id written into `MEASUREMENTS.md` and
 *       COMMITTED.
 *         MUST NOT FAIL: the census MUST NOT report it. `M` declares no allocation
 *                        site, so the diff arm cannot tell an allocation from a
 *                        mention. **A GREEN HERE IS THE DEFECT, NOT THE PASS.**
 *         MUST:          section B must NAME `M` as UNAUDITABLE with its reason.
 *                        The census's job is to return the NEGATIVE and say why.
 *
 *   (4) OVER-STRICTNESS — correct work in a spelling the matcher did not
 *       anticipate must PASS. `civicos-ui/check-semantics.mjs` is reached by
 *       `civicos-ui/test/run.mjs` through a SPAWN and never through an import;
 *       an edge reader that only followed imports would score it a GAP.
 *         MUST FAIL:    with `spawnEdges` neutered, `check-semantics.mjs` and
 *                       `check-refusal-codes.mjs` flip from USED to CONVENTION —
 *                       two FALSE GAPS, proving the arm can bite.
 *         MUST NOT:     the shipped reader must not produce them. A census that
 *                       calls a legitimately-composed instrument a defect produces
 *                       a list nobody can act on.
 */

import { readFileSync, writeFileSync, copyFileSync, statSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const DRIVER = join(HERE, "m041-instrument-census.mjs");

const sh = (args, opts = {}) =>
  execFileSync(args[0], args.slice(1), { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28, ...opts });
const shq = (args) => { try { return sh(args); } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); } };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => statSync(p).size;

const results = [];
const findings = [];
let armsNeverArmed = 0;

/* --------------------------------------------------------------- arming, safely
   A patch whose anchor does not occur EXACTLY ONCE is refused before the file is
   touched. The count is printed either way, because a silent "it matched" is the
   arm-never-armed defect wearing a pass. */
function armFile(rel, anchor, replacement, tag) {
  const abs = join(REPO, rel);
  const pristine = join(HERE, `.m041-pristine-${tag}-${rel.replace(/[\/.]/g, "_")}`);
  const src = readFileSync(abs, "utf8");
  const n = src.split(anchor).length - 1;
  if (n !== 1) {
    armsNeverArmed++;
    findings.push(`ARM ${tag}: anchor occurred ${n} time(s) in ${rel}, not 1 — THE ARM DID NOT ARM, and that is a finding, not a pass`);
    return null;
  }
  copyFileSync(abs, pristine);
  const before = { sha: sha(abs), bytes: bytes(abs) };
  if (before.bytes < 1000) {
    findings.push(`ARM ${tag}: ${rel} is ${before.bytes} B — below the guarded minimum; refusing to arm over a file this small`);
    unlinkSync(pristine);
    return null;
  }
  writeFileSync(abs, src.replace(anchor, replacement));
  return {
    rel, abs, pristine, before,
    restore() {
      copyFileSync(pristine, abs);
      const after = { sha: sha(abs), bytes: bytes(abs) };
      let cmpOk = true;
      try { sh(["cmp", pristine, abs]); } catch { cmpOk = false; }
      const ok = after.sha === before.sha && after.bytes === before.bytes && cmpOk;
      if (!ok) findings.push(`ARM ${tag}: RESTORE OF ${rel} NOT BYTE-IDENTICAL — sha ${before.sha.slice(0, 12)} -> ${after.sha.slice(0, 12)}, ${before.bytes} -> ${after.bytes} B, cmp ${cmpOk ? "ok" : "DIFFERS"}`);
      unlinkSync(pristine);
      return { ok, before, after, cmpOk };
    },
  };
}

function runCensus() {
  const out = shq([process.execPath, DRIVER]);
  const reach = (re) => { const m = out.match(re); return m ? m[1] : null; };
  return {
    out,
    used: Number(reach(/(\d+) used by a loop/)),
    testedOnly: Number(reach(/·\s+(\d+) TESTED ONLY/)),
    convention: Number(reach(/·\s+(\d+) convention-only/)),
    notHeld: Number(reach(/NOT HELD (\d+) ·/)),
    introduced: Number(reach(/introduced (\d+) ·/)),
    unauditable: (out.match(/UNAUDITABLE \((.+?)\)/) || [])[1] || null,
    namesSemantics: /USED\s+civicos-ui\/check-semantics\.mjs/.test(out),
    namesRefusal: /USED\s+civicos-ui\/check-refusal-codes\.mjs/.test(out),
    namesId: (id) => new RegExp(`NOT HELD\\s+${id}\\b`).test(out),
  };
}

/* **WHICH ARM OF plancheck FIRED IS THE WHOLE QUESTION, NOT A DETAIL.** The first
   run of this control declared that `plancheck --local` would still pass over a
   planted id and it FAILED — and a bare `1 fail` cannot tell "plancheck caught
   the id bypass" from "plancheck caught something else my arm also broke". It was
   the second: editing a corpus file staled `docs/DECIDED.md`, and plancheck's
   decided-index arm fired. An arm that trips a DIFFERENT arm of the instrument it
   is measuring proves nothing about the arm it was aimed at, so the failure TEXT
   is captured and classified here rather than counted. */
function plancheckLocal() {
  const out = shq([process.execPath, join(REPO, "tools/plancheck.mjs"), "--local"]);
  const m = out.match(/plancheck:\s*(\d+) fail,\s*(\d+) warn/);
  const fails = [...out.matchAll(/^\s*fail\s+([A-Z][A-Z \-]*[A-Z])/gm)].map((x) => x[1].trim());
  return {
    out, fail: m ? Number(m[1]) : -1, warn: m ? Number(m[2]) : -1,
    fails,
    /* the arms that would mean plancheck SAW the id bypass */
    sawId: fails.some((f) => /DUPLICATE ID|UNREGISTERED ID NAMESPACE/.test(f)),
  };
}

/* ------------------------------------------------------------------- the run */
console.log("M0-41 NEGATIVE CONTROL — the census must be able to come back with a NEGATIVE\n");

const head0 = sh(["git", "rev-parse", "HEAD"]).trim();
const dirty0 = sh(["git", "status", "--porcelain"]).trim();
console.log(`HEAD at start ${head0.slice(0, 12)} · working tree ${dirty0 ? "DIRTY" : "clean"}`);

/* ---- (1) BASELINE ------------------------------------------------------- */
const base = runCensus();
const basePlan = plancheckLocal();
results.push({
  arm: "(1) baseline", declared: "the census reads clean; plancheck --local 0 fail",
  actual: `used ${base.used} · TESTED ONLY ${base.testedOnly} · convention ${base.convention} · introduced ${base.introduced} · NOT HELD ${base.notHeld} · UNAUDITABLE ${base.unauditable} · plancheck ${basePlan.fail} fail`,
  pass: base.used > 0 && base.notHeld === 0 && basePlan.fail === 0,
});

/* ---- (4) OVER-STRICTNESS (no commit needed; run before the committing arms) */
{
  const a = armFile("bio-plane/test/m041-instrument-census.mjs",
    "  const call = /\\b(?:execSync|execFileSync|spawnSync|spawn|exec)\\s*\\(/g;",
    "  const call = /\\bNEVER_MATCHES_M041_OVERSTRICT_ARM\\s*\\(/g;",
    "overstrict");
  if (a) {
    const armed = runCensus();
    const r = a.restore();
    const flipped = !armed.namesSemantics && !armed.namesRefusal;
    results.push({
      arm: "(4) over-strictness: spawnEdges neutered",
      declared: "check-semantics AND check-refusal-codes flip USED -> CONVENTION (two FALSE gaps); the shipped reader must NOT produce them",
      actual: `armed: semantics USED=${armed.namesSemantics} refusal USED=${armed.namesRefusal} · convention ${base.convention} -> ${armed.convention} · restore byte-identical: ${r.ok ? "YES" : "NO"} (${r.before.bytes} B, sha ${r.before.sha.slice(0, 12)}, cmp ${r.cmpOk ? "ok" : "DIFFERS"})`,
      pass: flipped && base.namesSemantics && base.namesRefusal && r.ok,
    });
  }
}

/* ---- the committing arms ------------------------------------------------- */
function commitArm({ tag, rel, anchor, replacement, expectId, declared, judge }) {
  const dirty = sh(["git", "status", "--porcelain"]).trim();
  if (dirty) {
    findings.push(`ARM ${tag}: REFUSED — the working tree is dirty and this arm undoes itself with \`git reset --hard\`, which would discard it. Commit first.`);
    results.push({ arm: tag, declared, actual: "REFUSED — dirty tree; the arm was not run", pass: null });
    return;
  }
  const headBefore = sh(["git", "rev-parse", "HEAD"]).trim();
  const a = armFile(rel, anchor, replacement, tag.replace(/[^\w]/g, ""));
  if (!a) return;
  sh(["git", "add", rel]);
  sh(["git", "commit", "-q", "-m", `m041 control arm ${tag} — planted bypass, reverted in the same run`]);
  const armed = runCensus();
  const plan = plancheckLocal();
  /* undo: the arm is the only commit and everything else was committed first */
  sh(["git", "reset", "--hard", "-q", headBefore]);
  const headAfter = sh(["git", "rev-parse", "HEAD"]).trim();
  if (headAfter !== headBefore)
    findings.push(`ARM ${tag}: HEAD NOT RESTORED — ${headBefore.slice(0, 12)} -> ${headAfter.slice(0, 12)}`);
  if (existsSync(a.pristine)) unlinkSync(a.pristine);
  results.push({
    arm: tag, declared,
    actual: `introduced ${armed.introduced} · NOT HELD ${armed.notHeld} · names ${expectId}: ${armed.namesId(expectId)} · plancheck ${plan.fail} fail [${plan.fails.join("; ") || "none"}] · plancheck SAW the id bypass: ${plan.sawId ? "YES" : "NO"} · HEAD restored: ${headAfter === headBefore ? "YES" : "NO"}`,
    pass: judge(armed, plan) && headAfter === headBefore,
  });
}

commitArm({
  tag: "(2) planted bypass, GRADED namespace",
  rel: "docs/development/QUEUE.md",
  anchor: "### M0-41 · running",
  replacement: "### M0-9001 · queued — M0-41 CONTROL ARM, a hand-picked id the ledger never issued; reverted in the same run\nmilestone: M0\ndesign: `docs/development/VERIFICATION.md`\n\n### M0-41 · running",
  expectId: "M0-9001",
  declared: "census names M0-9001 NOT HELD; plancheck --local does NOT see the id bypass (no DUPLICATE ID / UNREGISTERED NAMESPACE arm fires) and that half is the finding. CORRECTED after the first run: the original declaration said plancheck would read 0 fail, which conflated 'plancheck cannot see the id' with 'my arm broke nothing else' — editing a corpus file stales docs/DECIDED.md and fires a DIFFERENT arm. The question is WHICH arm, never HOW MANY.",
  judge: (a, p) => a.notHeld >= 1 && a.namesId("M0-9001") && p.sawId === false,
});

commitArm({
  tag: "(3) planted bypass, UNGRADED namespace (M)",
  rel: "docs/development/MEASUREMENTS.md",
  anchor: "# Measurements",
  replacement: "# Measurements\n\n### M-9002 · M0-41 CONTROL ARM — a hand-picked measurement id the ledger never issued; reverted in the same run\n",
  expectId: "M-9002",
  declared: "the census MUST NOT find it — M declares no allocation site — and MUST name M as UNAUDITABLE. A GREEN HERE IS THE DEFECT, NOT THE PASS",
  judge: (a, p) => !a.namesId("M-9002") && /UNAUDITABLE\s+M\s/.test(a.out) && p.sawId === false,
});

/* ------------------------------------------------------------------- report */
console.log("\n--- ARMS, declared vs actual ---");
for (const r of results) {
  console.log(`\n  ${r.arm}`);
  console.log(`    DECLARED: ${r.declared}`);
  console.log(`    ACTUAL:   ${r.actual}`);
  console.log(`    ${r.pass === null ? "NOT RUN" : r.pass ? "AS DECLARED" : "*** NOT AS DECLARED — a finding about the ARM, recorded not smoothed ***"}`);
}

const headZ = sh(["git", "rev-parse", "HEAD"]).trim();
const dirtyZ = sh(["git", "status", "--porcelain"]).trim();
console.log(`\nHEAD at end ${headZ.slice(0, 12)} (${headZ === head0 ? "RESTORED" : "*** MOVED ***"}) · working tree ${dirtyZ ? "DIRTY:\n" + dirtyZ : "clean"}`);
console.log(`arms never armed: ${armsNeverArmed}`);
if (findings.length) { console.log("\nFINDINGS:"); for (const f of findings) console.log(`  ${f}`); }

const bad = results.filter((r) => r.pass === false).length;
console.log(`\ncontrol: ${results.length} arm(s) · ${results.filter((r) => r.pass).length} as declared · ${bad} NOT as declared · ${findings.length} finding(s)`);
process.exit(bad || findings.length ? 1 : 0);
